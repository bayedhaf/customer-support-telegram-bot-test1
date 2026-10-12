import { DatabaseSync } from "node:sqlite"; // built into Node 22.13+, no native build needed
import { config } from "./config.js";

export type Lang = "en" | "am" | "om";
export type TicketStatus = "open" | "pending" | "closed";
// open    = waiting for staff
// pending = staff replied, waiting for customer
// closed  = done

export interface User { tg_id: number; name: string; lang: Lang; created_at: string }
export interface Ticket {
  id: number; user_tg: number; category: string; description: string;
  photo_id: string | null; status: TicketStatus; staff_msg_id: number | null;
  agent_tg: number | null; agent_name: string | null; rating: number | null;
  created_at: string; closed_at: string | null;
}

const db = new DatabaseSync(config.DATABASE_PATH);
db.exec("PRAGMA journal_mode = WAL;");
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  tg_id INTEGER PRIMARY KEY, name TEXT NOT NULL, lang TEXT NOT NULL DEFAULT 'en',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_tg INTEGER NOT NULL, category TEXT NOT NULL,
  description TEXT NOT NULL, photo_id TEXT, status TEXT NOT NULL DEFAULT 'open',
  staff_msg_id INTEGER, agent_tg INTEGER, agent_name TEXT, rating INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')), closed_at TEXT
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT, ticket_id INTEGER NOT NULL,
  sender TEXT NOT NULL, text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- maps messages posted in the staff group -> ticket (so replies can be routed)
CREATE TABLE IF NOT EXISTS staff_msgs (staff_msg_id INTEGER PRIMARY KEY, ticket_id INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_tg, status);
`);

// ---- users ----
export function upsertUser(tgId: number, name: string, langCode?: string): User {
  const existing = getUser(tgId);
  if (existing) {
    if (existing.name !== name) db.prepare("UPDATE users SET name=? WHERE tg_id=?").run(name, tgId);
    return { ...existing, name };
  }
  const lang: Lang = langCode?.startsWith("am") ? "am" : langCode?.startsWith("om") ? "om" : "en";
  db.prepare("INSERT INTO users (tg_id, name, lang) VALUES (?,?,?)").run(tgId, name, lang);
  return getUser(tgId)!;
}
export const getUser = (tgId: number) =>
  db.prepare("SELECT * FROM users WHERE tg_id=?").get(tgId) as unknown as User | undefined;
export const setLang = (tgId: number, lang: Lang) =>
  void db.prepare("UPDATE users SET lang=? WHERE tg_id=?").run(lang, tgId);

// ---- tickets ----
export function createTicket(userTg: number, category: string, description: string, photoId: string | null): Ticket {
  const r = db.prepare("INSERT INTO tickets (user_tg, category, description, photo_id) VALUES (?,?,?,?)")
    .run(userTg, category, description, photoId);
  const id = Number(r.lastInsertRowid);
  addMessage(id, "customer", description);
  return getTicket(id)!;
}
export const getTicket = (id: number) =>
  db.prepare("SELECT * FROM tickets WHERE id=?").get(id) as unknown as Ticket | undefined;
export const getActiveTicket = (userTg: number) =>
  db.prepare("SELECT * FROM tickets WHERE user_tg=? AND status!='closed' ORDER BY id DESC LIMIT 1")
    .get(userTg) as unknown as Ticket | undefined;
export const listTickets = (userTg: number, limit = 5) =>
  db.prepare("SELECT * FROM tickets WHERE user_tg=? ORDER BY id DESC LIMIT ?").all(userTg, limit) as unknown as Ticket[];
export const setStatus = (id: number, status: TicketStatus) =>
  void db.prepare("UPDATE tickets SET status=? WHERE id=?").run(status, id);
export const claimTicket = (id: number, agentTg: number, agentName: string) =>
  void db.prepare("UPDATE tickets SET agent_tg=?, agent_name=?, status='pending' WHERE id=?").run(agentTg, agentName, id);
export const closeTicket = (id: number) =>
  void db.prepare("UPDATE tickets SET status='closed', closed_at=datetime('now') WHERE id=?").run(id);
export const rateTicket = (id: number, rating: number) =>
  void db.prepare("UPDATE tickets SET rating=? WHERE id=?").run(rating, id);

// ---- messages / staff mapping ----
export const addMessage = (ticketId: number, sender: "customer" | "agent" | "bot", text: string) =>
  void db.prepare("INSERT INTO messages (ticket_id, sender, text) VALUES (?,?,?)").run(ticketId, sender, text);
export const setStaffMsg = (ticketId: number, msgId: number) =>
  void db.prepare("UPDATE tickets SET staff_msg_id=? WHERE id=?").run(msgId, ticketId);
export const mapStaffMsg = (msgId: number, ticketId: number) =>
  void db.prepare("INSERT OR REPLACE INTO staff_msgs (staff_msg_id, ticket_id) VALUES (?,?)").run(msgId, ticketId);
export const ticketByStaffMsg = (msgId: number) => {
  const row = db.prepare("SELECT ticket_id FROM staff_msgs WHERE staff_msg_id=?").get(msgId) as unknown as { ticket_id: number } | undefined;
  return row ? getTicket(row.ticket_id) : undefined;
};

// ---- stats ----
export function stats() {
  const c = (where: string) =>
    (db.prepare(`SELECT COUNT(*) n FROM tickets ${where}`).get() as unknown as { n: number }).n;
  const avg = db.prepare("SELECT AVG(rating) a FROM tickets WHERE rating IS NOT NULL").get() as unknown as { a: number | null };
  return {
    total: c(""), open: c("WHERE status='open'"), pending: c("WHERE status='pending'"),
    closed: c("WHERE status='closed'"), today: c("WHERE date(created_at)=date('now')"),
    avgRating: avg.a,
  };
}

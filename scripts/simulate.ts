// Offline end-to-end test: feeds fake Telegram updates into the bot and prints
// every API call it makes. No token or network needed.  Run: npm run simulate
process.env.BOT_TOKEN = "123456:FAKE-TOKEN-FOR-SIMULATION";
process.env.STAFF_CHAT_ID = "-100999";
process.env.DATABASE_PATH = ":memory:";

import http from "node:http";

let msgId = 100, updateId = 1;
const calls: { method: string; payload: any }[] = [];

// Fake Telegram Bot API server (the conversations plugin makes its own HTTP
// calls, so a real local server is the most faithful way to intercept them).
const server = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    const method = req.url!.split("/").pop()!;
    const payload = body ? JSON.parse(body) : {};
    calls.push({ method, payload });
    let result: any = true;
    if (method === "sendMessage" || method === "sendPhoto") result = { message_id: ++msgId, date: 0, chat: { id: payload.chat_id, type: "private" } };
    if (method === "copyMessage") result = { message_id: ++msgId };
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, result }));
  });
});
await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
process.env.TELEGRAM_API_ROOT = `http://127.0.0.1:${(server.address() as any).port}`;

const { bot } = await import("../src/bot.js");
const db = await import("../src/db.js");

const CUSTOMER = { id: 42, is_bot: false, first_name: "Abebe", language_code: "en" };
const AGENT = { id: 7, is_bot: false, first_name: "Sara" };
const STAFF = -100999;

bot.botInfo = { id: 1, is_bot: true, first_name: "Bot", username: "support_bot", can_join_groups: true,
  can_read_all_group_messages: false, supports_inline_queries: false, can_connect_to_business: false,
  has_main_web_app: false } as any;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function send(from: any, chatId: number, text: string, extra: any = {}) {
  const entities = text.startsWith("/") ? [{ type: "bot_command", offset: 0, length: text.split(" ")[0].length }] : undefined;
  await bot.handleUpdate({ update_id: updateId++, message: { message_id: ++msgId, date: 0, from, chat: { id: chatId, type: chatId > 0 ? "private" : "supergroup" }, text, entities, ...extra } } as any);
  await sleep(600);
}
async function tap(from: any, chatId: number, data: string, messageId = 1) {
  await bot.handleUpdate({ update_id: updateId++, callback_query: { id: String(updateId), from, chat_instance: "x", data,
    message: { message_id: messageId, date: 0, chat: { id: chatId, type: chatId > 0 ? "private" : "supergroup" } } } } as any);
  await sleep(600);
}
const last = (method: string, chat?: number) => [...calls].reverse().find((c) => c.method === method && (chat === undefined || c.payload.chat_id === chat));
let failed = 0;
const check = (name: string, ok: boolean) => { console.log(`${ok ? "✅" : "❌"} ${name}`); if (!ok) failed++; };

// 1. customer opens menu
await send(CUSTOMER, CUSTOMER.id, "/start");
check("/start shows welcome menu", !!last("sendMessage", CUSTOMER.id)?.payload.text.includes("Welcome"));

// 2. FAQ keyword match for free text
await send(CUSTOMER, CUSTOMER.id, "do you deliver to my house?");
check("free-text FAQ match (delivery)", !!last("sendMessage", CUSTOMER.id)?.payload.text.includes("Do you deliver"));

// 3. ticket conversation
await tap(CUSTOMER, CUSTOMER.id, "menu:ticket");
await tap(CUSTOMER, CUSTOMER.id, "cat:billing");
await send(CUSTOMER, CUSTOMER.id, "I was charged twice for order 1234");
await tap(CUSTOMER, CUSTOMER.id, "skip");
const staffPost = last("sendMessage", STAFF);
check("ticket posted to staff group", !!staffPost?.payload.text.includes("Ticket #1"));
check("customer got confirmation", !!last("sendMessage", CUSTOMER.id)?.payload.text.includes("request #1"));
const ticket = db.getTicket(1)!;
check("ticket saved as open with staff msg id", ticket.status === "open" && !!ticket.staff_msg_id);

// 4. agent replies in staff group
await send(AGENT, STAFF, "Hi! Checking your payment now.", { reply_to_message: { message_id: ticket.staff_msg_id, date: 0, chat: { id: STAFF } } });
check("agent reply copied to customer", last("copyMessage")?.payload.chat_id === CUSTOMER.id);
check("ticket auto-claimed by agent", db.getTicket(1)!.agent_name === "Sara" && db.getTicket(1)!.status === "pending");

// 5. customer replies inside open ticket
await send(CUSTOMER, CUSTOMER.id, "Thanks, order number is 1234");
check("customer reply relayed to staff group", last("copyMessage")?.payload.chat_id === STAFF);
check("status back to open", db.getTicket(1)!.status === "open");

// 6. staff stats + close
await send(AGENT, STAFF, "/stats");
check("/stats works in staff group", !!last("sendMessage", STAFF)?.payload.text.includes("Support stats"));
await tap(AGENT, STAFF, "close:1");
check("ticket closed", db.getTicket(1)!.status === "closed");
check("customer asked for rating", !!last("sendMessage", CUSTOMER.id)?.payload.text.includes("How would you rate"));

// 7. rating
await tap(CUSTOMER, CUSTOMER.id, "rate:1:5");
check("rating saved", db.getTicket(1)!.rating === 5);

// 8. security: customer cannot use staff buttons / stats
await send(CUSTOMER, CUSTOMER.id, "/stats");
check("/stats ignored for customers", !calls.some((c) => c.method === "sendMessage" && c.payload.chat_id === CUSTOMER.id && String(c.payload.text).includes("Support stats")));

console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed 🎉");
server.close();
process.exit(failed ? 1 : 0);

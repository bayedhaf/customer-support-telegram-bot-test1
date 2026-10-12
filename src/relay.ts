import { type Api, type Context, InlineKeyboard } from "grammy";
import { config } from "./config.js";
import * as db from "./db.js";
import { t } from "./i18n.js";

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const STAFF = config.STAFF_CHAT_ID;
const langOf = (tg: number) => db.getUser(tg)?.lang ?? "en";

/** Post a new ticket into the staff group with Claim / Close buttons. */
export async function postTicketToStaff(api: Api, ticket: db.Ticket, userName: string) {
  const text =
    `🎫 <b>Ticket #${ticket.id}</b> — ${esc(t("en", `cat_${ticket.category}` as never))}\n` +
    `👤 ${esc(userName)} (<code>${ticket.user_tg}</code>)\n\n${esc(ticket.description)}\n\n` +
    `<i>Reply to this message to answer the customer.</i>`;
  const kb = new InlineKeyboard().text("🙋 Claim", `claim:${ticket.id}`).text("✅ Close", `close:${ticket.id}`);
  const sent = ticket.photo_id
    ? await api.sendPhoto(STAFF, ticket.photo_id, { caption: text, parse_mode: "HTML", reply_markup: kb })
    : await api.sendMessage(STAFF, text, { parse_mode: "HTML", reply_markup: kb });
  db.setStaffMsg(ticket.id, sent.message_id);
  db.mapStaffMsg(sent.message_id, ticket.id);
}

/** Customer wrote inside an active ticket -> copy into the staff group under the ticket. */
export async function relayCustomerToStaff(ctx: Context, ticket: db.Ticket) {
  const msg = ctx.msg!;
  if (!ticket.staff_msg_id) {
    // The ticket was never posted to the staff group (e.g. wrong STAFF_CHAT_ID earlier): post it now.
    await postTicketToStaff(ctx.api, ticket, db.getUser(ticket.user_tg)?.name ?? String(ticket.user_tg));
    ticket = db.getTicket(ticket.id)!;
  }
  const sent = await ctx.api.copyMessage(STAFF, ctx.chat!.id, msg.message_id, {
    reply_parameters: { message_id: ticket.staff_msg_id!, allow_sending_without_reply: true },
  });
  db.mapStaffMsg(sent.message_id, ticket.id);
  db.addMessage(ticket.id, "customer", msg.text ?? msg.caption ?? "[media]");
  if (ticket.status === "pending") db.setStatus(ticket.id, "open");
  await ctx.react("👌").catch(() => {});
}

/** Agent replied to a ticket message in the staff group -> copy to the customer. */
export async function relayAgentToCustomer(ctx: Context, ticket: db.Ticket) {
  const msg = ctx.msg!;
  const agentName = [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(" ");
  if (!ticket.agent_tg) {
    db.claimTicket(ticket.id, ctx.from!.id, agentName);
    await ctx.api.sendMessage(ticket.user_tg, t(langOf(ticket.user_tg), "agent_joined", { agent: agentName, id: ticket.id }));
  } else {
    db.setStatus(ticket.id, "pending");
  }
  await ctx.api.copyMessage(ticket.user_tg, ctx.chat!.id, msg.message_id);
  db.addMessage(ticket.id, "agent", msg.text ?? msg.caption ?? "[media]");
  await ctx.react("👍").catch(() => {});
}

/** Close a ticket, clean up staff buttons, ask the customer for a rating. */
export async function closeAndNotify(api: Api, ticket: db.Ticket, closedBy: string) {
  db.closeTicket(ticket.id);
  if (ticket.staff_msg_id) {
    await api.editMessageReplyMarkup(STAFF, ticket.staff_msg_id, { reply_markup: undefined }).catch(() => {});
    await api.sendMessage(STAFF, `✅ #${ticket.id} closed by ${esc(closedBy)}`, {
      reply_parameters: { message_id: ticket.staff_msg_id, allow_sending_without_reply: true },
    });
  }
  const lang = langOf(ticket.user_tg);
  const kb = new InlineKeyboard();
  for (let i = 1; i <= 5; i++) kb.text("⭐".repeat(i), `rate:${ticket.id}:${i}`);
  await api.sendMessage(
    ticket.user_tg,
    `${t(lang, "ticket_closed", { id: ticket.id })}\n${t(lang, "rate_prompt")}`,
    { reply_markup: kb.row() },
  ).catch(() => {});
}
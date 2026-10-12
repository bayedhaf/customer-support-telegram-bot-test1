import { Bot, InlineKeyboard, type Context } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import { autoRetry } from "@grammyjs/auto-retry";
import { limit } from "@grammyjs/ratelimiter";
import { sequentialize } from "@grammyjs/runner";
import { config } from "./config.js";
import * as db from "./db.js";
import { FAQ, searchFaq } from "./faq.js";
import { LANGS, t, type Key } from "./i18n.js";
import { closeAndNotify, esc, relayAgentToCustomer, relayCustomerToStaff } from "./relay.js";
import { createTicketFlow, type MyContext } from "./ticketFlow.js";

export const bot = new Bot<MyContext>(
  config.BOT_TOKEN,
  config.TELEGRAM_API_ROOT ? { client: { apiRoot: config.TELEGRAM_API_ROOT } } : undefined,
);
bot.api.config.use(autoRetry());

const inStaff = (ctx: Context) => ctx.chat?.id === config.STAFF_CHAT_ID;
const isPrivate = (ctx: Context) => ctx.chat?.type === "private";
const fullName = (u: { first_name: string; last_name?: string }) => [u.first_name, u.last_name].filter(Boolean).join(" ");
const langOf = (ctx: Context) => (ctx.from ? db.getUser(ctx.from.id)?.lang : undefined) ?? "en";
const T = (ctx: Context, key: Key, vars?: Record<string, string | number>) => t(langOf(ctx), key, vars);

// ---------- middleware ----------
bot.use(sequentialize((ctx) => ctx.chat?.id.toString()));
bot.use(limit({ timeFrame: 2000, limit: 4, onLimitExceeded: async () => {} }));
bot.use(async (ctx, next) => {
  if (ctx.from && isPrivate(ctx)) db.upsertUser(ctx.from.id, fullName(ctx.from), ctx.from.language_code);
  await next();
});
bot.use(conversations());
bot.use(createConversation(createTicketFlow, "createTicket"));

// ---------- keyboards ----------
function mainMenu(ctx: Context) {
  return new InlineKeyboard()
    .text(T(ctx, "btn_faq"), "menu:faq").text(T(ctx, "btn_ticket"), "menu:ticket").row()
    .text(T(ctx, "btn_mine"), "menu:mine").text(T(ctx, "btn_lang"), "menu:lang");
}
const backKb = (ctx: Context) => new InlineKeyboard().text(T(ctx, "btn_back"), "menu:home");

async function showHome(ctx: Context, edit = false) {
  const text = T(ctx, "welcome", { biz: config.BUSINESS_NAME });
  if (edit) await ctx.editMessageText(text, { reply_markup: mainMenu(ctx) }).catch(() => {});
  else await ctx.reply(text, { reply_markup: mainMenu(ctx) });
}

// ---------- customer: commands & menu ----------
bot.command("start", async (ctx) => {
  if (!isPrivate(ctx)) return;
  await ctx.conversation.exitAll();
  await showHome(ctx);
});
bot.command("help", (ctx) => isPrivate(ctx) ? showHome(ctx) : undefined);

bot.callbackQuery("menu:home", async (ctx) => { await ctx.answerCallbackQuery(); await showHome(ctx, true); });

bot.callbackQuery("menu:faq", async (ctx) => {
  await ctx.answerCallbackQuery();
  const lang = langOf(ctx);
  const kb = new InlineKeyboard();
  FAQ.forEach((f, i) => kb.text(f.q[lang], `faq:${i}`).row());
  kb.text(T(ctx, "btn_back"), "menu:home");
  await ctx.editMessageText(T(ctx, "faq_title"), { reply_markup: kb });
});

bot.callbackQuery(/^faq:(\d+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const item = FAQ[Number(ctx.match[1])];
  if (!item) return;
  const lang = langOf(ctx);
  const kb = new InlineKeyboard()
    .text(T(ctx, "btn_still_help"), "menu:ticket").row()
    .text(T(ctx, "btn_back"), "menu:faq");
  await ctx.editMessageText(`<b>${esc(item.q[lang])}</b>\n\n${esc(item.a[lang])}`, { parse_mode: "HTML", reply_markup: kb });
});

bot.callbackQuery("menu:ticket", async (ctx) => {
  await ctx.answerCallbackQuery();
  const active = db.getActiveTicket(ctx.from.id);
  if (active) return void (await ctx.reply(T(ctx, "ticket_has_open", { id: active.id })));
  await ctx.conversation.enter("createTicket");
});

bot.callbackQuery("menu:mine", async (ctx) => {
  await ctx.answerCallbackQuery();
  const list = db.listTickets(ctx.from.id);
  const text = list.length
    ? `${T(ctx, "mine_title")}\n\n` + list.map((x) => `#${x.id} — ${T(ctx, `status_${x.status}` as Key)}`).join("\n")
    : T(ctx, "no_tickets");
  await ctx.editMessageText(text, { reply_markup: backKb(ctx) });
});

bot.callbackQuery("menu:lang", async (ctx) => {
  await ctx.answerCallbackQuery();
  const kb = new InlineKeyboard();
  for (const [code, label] of Object.entries(LANGS)) kb.text(label, `lang:${code}`).row();
  await ctx.editMessageText(T(ctx, "choose_lang"), { reply_markup: kb });
});

bot.callbackQuery(/^lang:(en|am|om)$/, async (ctx) => {
  db.setLang(ctx.from.id, ctx.match[1] as db.Lang);
  await ctx.answerCallbackQuery(T(ctx, "lang_set"));
  await showHome(ctx, true);
});

bot.callbackQuery(/^rate:(\d+):([1-5])$/, async (ctx) => {
  const ticket = db.getTicket(Number(ctx.match[1]));
  if (!ticket || ticket.user_tg !== ctx.from.id) return void (await ctx.answerCallbackQuery());
  db.rateTicket(ticket.id, Number(ctx.match[2]));
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(T(ctx, "rate_thanks")).catch(() => {});
});

// ---------- staff group ----------
bot.callbackQuery(/^claim:(\d+)$/, async (ctx) => {
  if (ctx.chat?.id !== config.STAFF_CHAT_ID) return void (await ctx.answerCallbackQuery());
  const ticket = db.getTicket(Number(ctx.match[1]));
  if (!ticket || ticket.status === "closed") return void (await ctx.answerCallbackQuery("Closed"));
  if (ticket.agent_tg) return void (await ctx.answerCallbackQuery(`Already claimed by ${ticket.agent_name}`));
  const name = fullName(ctx.from);
  db.claimTicket(ticket.id, ctx.from.id, name);
  await ctx.answerCallbackQuery("Claimed ✅");
  await ctx.api.sendMessage(config.STAFF_CHAT_ID, `🙋 #${ticket.id} claimed by ${esc(name)}`, {
    reply_parameters: { message_id: ticket.staff_msg_id!, allow_sending_without_reply: true },
  });
  const lang = db.getUser(ticket.user_tg)?.lang ?? "en";
  await ctx.api.sendMessage(ticket.user_tg, t(lang, "agent_joined", { agent: name, id: ticket.id })).catch(() => {});
});

bot.callbackQuery(/^close:(\d+)$/, async (ctx) => {
  if (ctx.chat?.id !== config.STAFF_CHAT_ID) return void (await ctx.answerCallbackQuery());
  const ticket = db.getTicket(Number(ctx.match[1]));
  await ctx.answerCallbackQuery();
  if (ticket && ticket.status !== "closed") await closeAndNotify(ctx.api, ticket, fullName(ctx.from));
});

// /close (as a reply to any message of the ticket)
bot.command("close", async (ctx) => {
  if (!inStaff(ctx)) return;
  const replied = ctx.msg.reply_to_message;
  const ticket = replied && db.ticketByStaffMsg(replied.message_id);
  if (!ticket) return void (await ctx.reply("Reply to a ticket message with /close."));
  if (ticket.status === "closed") return void (await ctx.reply("Already closed."));
  await closeAndNotify(ctx.api, ticket, fullName(ctx.from!));
});

bot.command("stats", async (ctx) => {
  if (!inStaff(ctx)) return;
  const s = db.stats();
  await ctx.reply(
    `📊 <b>Support stats</b>\nTotal: ${s.total} (today: ${s.today})\n` +
    `Open: ${s.open} · Waiting customer: ${s.pending} · Closed: ${s.closed}\n` +
    `Avg rating: ${s.avgRating ? s.avgRating.toFixed(2) + " ⭐" : "—"}`,
    { parse_mode: "HTML" },
  );
});

// Agent replies in staff group -> customer
bot.on("message").filter(
  (ctx) => inStaff(ctx) && !!ctx.msg.reply_to_message && !ctx.msg.text?.startsWith("/"),
  async (ctx) => {
    const ticket = db.ticketByStaffMsg(ctx.msg.reply_to_message!.message_id);
    if (!ticket) return;
    if (ticket.status === "closed") return void (await ctx.reply(`#${ticket.id} is closed.`));
    await relayAgentToCustomer(ctx, ticket);
  },
);

// ---------- customer free messages ----------
const GREETING = /^(hi|hello|hey|selam|salam|akkam\w*|ሰላም|ሃይ|ሀሎ|good (morning|afternoon|evening))[\s!.,?]*$/i;
bot.on("message").filter(isPrivate, async (ctx) => {
  if (ctx.msg.text?.startsWith("/")) return; // unknown command
  const active = db.getActiveTicket(ctx.from.id);
  if (active) return void (await relayCustomerToStaff(ctx, active));

  // Greetings ("hi", "selam", "akkam"…) -> show the main menu
  if (ctx.msg.text && GREETING.test(ctx.msg.text.trim())) return void (await showHome(ctx));

  // No open ticket: try the FAQ, otherwise offer to contact support.
  const lang = langOf(ctx);
  const match = ctx.msg.text ? searchFaq(ctx.msg.text, lang) : undefined;
  const kb = new InlineKeyboard().text(T(ctx, "btn_still_help"), "menu:ticket");
  if (match) {
    await ctx.reply(`${T(ctx, "faq_match")}\n\n<b>${esc(match.q[lang])}</b>\n${esc(match.a[lang])}`, { parse_mode: "HTML", reply_markup: kb });
  } else {
    await ctx.reply(T(ctx, "faq_nomatch"), { reply_markup: kb });
  }
});

bot.catch((err) => console.error("Bot error:", err.error));
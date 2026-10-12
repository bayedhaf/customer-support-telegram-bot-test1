import { InlineKeyboard } from "grammy";
import type { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import type { Context } from "grammy";
import * as db from "./db.js";
import { t, type Key } from "./i18n.js";
import { postTicketToStaff } from "./relay.js";

export type MyContext = ConversationFlavor<Context>;
export type MyConversation = Conversation<MyContext, Context>;

const CATS = ["billing", "technical", "order", "other"] as const;

/** Multi-step ticket creation: category -> description -> optional photo. */
export async function createTicketFlow(conversation: MyConversation, ctx: Context) {
  const user = ctx.from!;
  const lang = await conversation.external(() => db.getUser(user.id)?.lang ?? "en");
  const T = (k: Key, v?: Record<string, string | number>) => t(lang, k, v);

  // 1) category
  const catKb = new InlineKeyboard();
  CATS.forEach((c, i) => { catKb.text(T(`cat_${c}` as Key), `cat:${c}`); if (i % 2) catKb.row(); });
  await ctx.reply(T("ask_category"), { reply_markup: catKb });

  let category = "";
  while (!category) {
    const r = await conversation.wait();
    if (r.message?.text === "/cancel") return void (await r.reply(T("cancelled")));
    const data = r.callbackQuery?.data;
    if (data?.startsWith("cat:")) { category = data.slice(4); await r.answerCallbackQuery(); }
    else if (r.callbackQuery) await r.answerCallbackQuery();
    else await r.reply(T("pick_button"));
  }

  // 2) description
  await ctx.reply(T("ask_description"));
  let description = "";
  while (!description) {
    const r = await conversation.wait();
    const text = r.message?.text;
    if (text === "/cancel") return void (await r.reply(T("cancelled")));
    if (text && !text.startsWith("/")) description = text.slice(0, 800);
    else if (r.callbackQuery) await r.answerCallbackQuery();
    else await r.reply(T("text_please"));
  }

  // 3) optional photo
  await ctx.reply(T("ask_photo"), { reply_markup: new InlineKeyboard().text(T("btn_skip"), "skip") });
  let photoId: string | null = null;
  while (true) {
    const r = await conversation.wait();
    if (r.message?.text === "/cancel") return void (await r.reply(T("cancelled")));
    if (r.callbackQuery?.data === "skip") { await r.answerCallbackQuery(); break; }
    if (r.message?.photo) { photoId = r.message.photo.at(-1)!.file_id; break; }
    if (r.callbackQuery) await r.answerCallbackQuery();
    else await r.reply(T("ask_photo"));
  }

  // 4) save + notify staff (external = not re-run when the conversation replays)
  const ticketId = await conversation.external(() => db.createTicket(user.id, category, description, photoId).id);
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
  await conversation.external(async () => {
    await postTicketToStaff(ctx.api, db.getTicket(ticketId)!, name);
  });
  await ctx.reply(T("ticket_created", { id: ticketId }));
}

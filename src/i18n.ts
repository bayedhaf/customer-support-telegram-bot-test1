import type { Lang } from "./db.js";

export const LANGS: Record<Lang, string> = { en: "English", am: "አማርኛ", om: "Afaan Oromoo" };

const en = {
  welcome: "✨ Welcome to {biz}! ✨\n\n🤖 I am Michuu Bot, your friendly shopping assistant.\n\nI can help you find answers, check an order, solve a delivery problem, or connect you with our support team.\n\n👇 Choose an option below to get started:",
  btn_faq: "❓ Quick answers", btn_ticket: "🎫 Get support", btn_mine: "📂 My tickets",
  btn_lang: "🌐 Language", btn_back: "⬅️ Back", btn_home: "🏠 Main menu", btn_skip: "Skip",
  btn_still_help: "Still need help? Contact support",
  faq_title: "Pick a question:", faq_nomatch: "I couldn't find an answer for that. Our team can help with your order, delivery, payment, return, or any other question.",
  faq_match: "Here's what I found:",
  choose_lang: "🌐 Choose your language:", lang_set: "✅ Language updated.",
  ticket_has_open: "You already have an open ticket (#{id}). Just write your message here and our team will see it.",
  ask_category: "What is your request about?",
  cat_billing: "💳 Billing", cat_technical: "🛠 Technical", cat_order: "📦 Order", cat_other: "💬 Other",
  pick_button: "Please tap one of the buttons.",
  ask_description: "Please describe your issue in one message. Include your order number if you have one. (Send /cancel to stop.)",
  ask_photo: "Want to add a photo or screenshot? Send it now, or tap Skip.",
  ticket_created: "✅ Your request #{id} is safely with our support team.\n\n⏱ We will reply here as soon as possible. You can send another message in this chat if you remember more details.",
  cancelled: "Cancelled.", text_please: "Please send text.",
  no_tickets: "You have no tickets yet.", mine_title: "🎫 Your recent tickets:",
  status_open: "Open", status_pending: "Waiting for your reply", status_closed: "Closed",
  agent_joined: "👤 {agent} from our team is now handling your ticket #{id}.",
  ticket_closed: "✅ Ticket #{id} is complete.\n\nThank you for choosing {biz}! We are always happy to help you again.",
  rate_prompt: "How would you rate our support?", rate_thanks: "Thank you for your feedback! ⭐",
  closed_hint: "This ticket is closed. Use /start to open a new one.",
} as const;

export type Key = keyof typeof en;

const am: Record<Key, string> = {
  welcome: "✨ እንኳን ወደ {biz} በደህና መጡ! ✨\n\n🤖 እኔ Michuu Bot ነኝ፣ የግዢ ረዳትዎ።\n\nመልስ ማግኘት፣ ትዕዛዝ መከታተል፣ የማድረስ ችግር መፍታት ወይም ከድጋፍ ቡድናችን ጋር ማገናኘት እችላለሁ።\n\n👇 ለመጀመር ከታች አንድ አማራጭ ይምረጡ፦",
  btn_faq: "❓ ፈጣን መልሶች", btn_ticket: "🎫 ድጋፍ ያግኙ", btn_mine: "📂 የእኔ ጥያቄዎች",
  btn_lang: "🌐 ቋንቋ", btn_back: "⬅️ ተመለስ", btn_home: "🏠 ዋና ገጽ", btn_skip: "ዝለል",
  btn_still_help: "አሁንም እርዳታ ይፈልጋሉ? ያግኙን",
  faq_title: "አንድ ጥያቄ ይምረጡ፦", faq_nomatch: "ለዚህ ጥያቄ መልስ አላገኘሁም። ቡድናችን ስለ ትዕዛዝ፣ ማድረስ፣ ክፍያ፣ መመለስ ወይም ሌላ ጥያቄ ሊረዳዎት ይችላል።",
  faq_match: "ያገኘሁት ይህ ነው፦",
  choose_lang: "🌐 ቋንቋዎን ይምረጡ፦", lang_set: "✅ ቋንቋ ተቀይሯል።",
  ticket_has_open: "ክፍት ጥያቄ (#{id}) አለዎት። መልዕክትዎን እዚህ ይጻፉ፤ ቡድናችን ያየዋል።",
  ask_category: "ጥያቄዎ ስለ ምንድን ነው?",
  cat_billing: "💳 ክፍያ", cat_technical: "🛠 ቴክኒካል", cat_order: "📦 ትዕዛዝ", cat_other: "💬 ሌላ",
  pick_button: "እባክዎ አንዱን ቁልፍ ይጫኑ።",
  ask_description: "እባክዎ ችግርዎን በአንድ መልዕክት ይግለጹ። ካለዎት የትዕዛዝ ቁጥር ይጨምሩ። (ለማቆም /cancel ይላኩ።)",
  ask_photo: "ፎቶ ወይም ስክሪንሾት ማከል ይፈልጋሉ? አሁን ይላኩ ወይም «ዝለል» ይጫኑ።",
  ticket_created: "✅ ጥያቄዎ #{id} በድጋፍ ቡድናችን ዘንድ ተመዝግቧል።\n\n⏱ በተቻለ ፍጥነት እዚህ እንመልሳለን። ተጨማሪ መረጃ ካስታወሱ በዚህ ውይይት መላክ ይችላሉ።",
  cancelled: "ተሰርዟል።", text_please: "እባክዎ ጽሑፍ ይላኩ።",
  no_tickets: "እስካሁን ምንም ጥያቄ የለዎትም።", mine_title: "🎫 የቅርብ ጊዜ ጥያቄዎችዎ፦",
  status_open: "ክፍት", status_pending: "መልስዎን በመጠበቅ ላይ", status_closed: "ተዘግቷል",
  agent_joined: "👤 {agent} ጥያቄዎን #{id} እየተከታተለ ነው።",
  ticket_closed: "✅ ጥያቄ #{id} ተጠናቋል።\n\n{biz}ን ስለመረጡ እናመሰግናለን! እንደገና ልንረዳዎት ደስ ይለናል።",
  rate_prompt: "ድጋፋችንን እንዴት ይገመግማሉ?", rate_thanks: "ለአስተያየትዎ እናመሰግናለን! ⭐",
  closed_hint: "ይህ ጥያቄ ተዘግቷል። አዲስ ለመክፈት /start ይጠቀሙ።",
};

const om: Record<Key, string> = {
  welcome: "✨ Baga nagaan gara {biz} dhuftan! ✨\n\n🤖 Ani Michuu Bot dha, gargaaraa bittaa keessanii.\n\nDeebii argachuu, ajaja hordofuu, rakkoo geechaa furu yookaan garee deeggarsaa keenya waliin isin wal qunnamsiisuu nan danda'a.\n\n👇 Jalqabuuf filannoo armaan gadii keessaa tokko filadhu:",
  btn_faq: "❓ Deebii saffisaa", btn_ticket: "🎫 Deeggarsa argadhu", btn_mine: "📂 Gaaffilee koo",
  btn_lang: "🌐 Afaan", btn_back: "⬅️ Duubatti", btn_home: "🏠 Fuula jalqabaa", btn_skip: "Irra darbi",
  btn_still_help: "Ammas gargaarsa barbaaddaa? Nu quunnamaa",
  faq_title: "Gaaffii tokko filadhu:", faq_nomatch: "Deebii gaaffii kanaaf hin arganne. Gareen keenya waa'ee ajajaa, geechaa, kaffaltii, deebisuu yookaan gaaffii biraa si gargaaruu danda'a.",
  faq_match: "Kan arganne kanaa dha:",
  choose_lang: "🌐 Afaan kee filadhu:", lang_set: "✅ Afaan jijjiirameera.",
  ticket_has_open: "Gaaffiin banaan (#{id}) qabda. Ergaa kee as barreessi, gareen keenya ni argata.",
  ask_category: "Gaaffiin kee waa'ee maalii?",
  cat_billing: "💳 Kaffaltii", cat_technical: "🛠 Teekinikaa", cat_order: "📦 Ajaja", cat_other: "💬 Kan biraa",
  pick_button: "Maaloo tokko cuqaasi.",
  ask_description: "Rakkoo kee ergaa tokko keessatti ibsi. Yoo qabaatte lakkoofsa ajajaa dabaladhu. (Dhaabuuf /cancel ergi.)",
  ask_photo: "Suuraa yookaan screenshot dabaluu barbaaddaa? Amma ergi, yookaan 'Irra darbi' cuqaasi.",
  ticket_created: "✅ Gaaffiin kee #{id} garee deeggarsaa keenya bira ga'eera.\n\n⏱ Saffisaan as irratti siif deebina. Odeeffannoo dabalataa yoo yaadatte, marii kana keessatti ergi.",
  cancelled: "Haqameera.", text_please: "Maaloo barreeffama ergi.",
  no_tickets: "Ammaaf gaaffiin hin qabdu.", mine_title: "🎫 Gaaffilee kee dhiyoo:",
  status_open: "Banaa", status_pending: "Deebii kee eegaa jira", status_closed: "Cufame",
  agent_joined: "👤 {agent} gaaffii kee #{id} ilaaluu eegaleera.",
  ticket_closed: "✅ Gaaffiin #{id} xumurameera.\n\n{biz} waan filatteef galatoomi! Ammas si gargaaruun nu gammachiisa.",
  rate_prompt: "Deeggarsa keenya akkamitti madaaltu?", rate_thanks: "Yaada kee galatoomi! ⭐",
  closed_hint: "Gaaffiin kun cufameera. Haaraa banuuf /start fayyadami.",
};

const dict: Record<Lang, Record<Key, string>> = { en, am, om };

export function t(lang: Lang, key: Key, vars: Record<string, string | number> = {}): string {
  let s = dict[lang][key] ?? en[key];
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

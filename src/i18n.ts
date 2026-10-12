import type { Lang } from "./db.js";

export const LANGS: Record<Lang, string> = { en: "English", am: "አማርኛ", om: "Afaan Oromoo" };

const en = {
  welcome: "👋 Welcome to {biz} Support!\nHow can I help you today?",
  btn_faq: "❓ FAQ", btn_ticket: "🎫 Contact support", btn_mine: "📂 My tickets",
  btn_lang: "🌐 Language", btn_back: "⬅️ Back", btn_skip: "Skip",
  btn_still_help: "Still need help? Contact support",
  faq_title: "Pick a question:", faq_nomatch: "I couldn't find an answer for that.",
  faq_match: "Here's what I found:",
  choose_lang: "🌐 Choose your language:", lang_set: "✅ Language updated.",
  ticket_has_open: "You already have an open ticket (#{id}). Just write your message here and our team will see it.",
  ask_category: "What is your request about?",
  cat_billing: "💳 Billing", cat_technical: "🛠 Technical", cat_order: "📦 Order", cat_other: "💬 Other",
  pick_button: "Please tap one of the buttons.",
  ask_description: "Please describe your issue in one message. (Send /cancel to stop.)",
  ask_photo: "Want to add a photo or screenshot? Send it now, or tap Skip.",
  ticket_created: "✅ Ticket #{id} created. Our team will reply here shortly.",
  cancelled: "Cancelled.", text_please: "Please send text.",
  no_tickets: "You have no tickets yet.", mine_title: "🎫 Your recent tickets:",
  status_open: "Open", status_pending: "Waiting for your reply", status_closed: "Closed",
  agent_joined: "👤 {agent} from our team is now handling your ticket #{id}.",
  ticket_closed: "✅ Ticket #{id} is closed.",
  rate_prompt: "How would you rate our support?", rate_thanks: "Thank you for your feedback! ⭐",
  closed_hint: "This ticket is closed. Use /start to open a new one.",
} as const;

export type Key = keyof typeof en;

const am: Record<Key, string> = {
  welcome: "👋 እንኳን ወደ {biz} ድጋፍ በደህና መጡ!\nዛሬ እንዴት ልረዳዎት እችላለሁ?",
  btn_faq: "❓ በተደጋጋሚ የሚጠየቁ", btn_ticket: "🎫 ድጋፍ ጠይቅ", btn_mine: "📂 የእኔ ጥያቄዎች",
  btn_lang: "🌐 ቋንቋ", btn_back: "⬅️ ተመለስ", btn_skip: "ዝለል",
  btn_still_help: "አሁንም እርዳታ ይፈልጋሉ? ያግኙን",
  faq_title: "አንድ ጥያቄ ይምረጡ፦", faq_nomatch: "ለዚህ ጥያቄ መልስ አላገኘሁም።",
  faq_match: "ያገኘሁት ይህ ነው፦",
  choose_lang: "🌐 ቋንቋዎን ይምረጡ፦", lang_set: "✅ ቋንቋ ተቀይሯል።",
  ticket_has_open: "ክፍት ጥያቄ (#{id}) አለዎት። መልዕክትዎን እዚህ ይጻፉ፤ ቡድናችን ያየዋል።",
  ask_category: "ጥያቄዎ ስለ ምንድን ነው?",
  cat_billing: "💳 ክፍያ", cat_technical: "🛠 ቴክኒካል", cat_order: "📦 ትዕዛዝ", cat_other: "💬 ሌላ",
  pick_button: "እባክዎ አንዱን ቁልፍ ይጫኑ።",
  ask_description: "ችግርዎን በአንድ መልዕክት ይግለጹ። (ለማቆም /cancel ይላኩ።)",
  ask_photo: "ፎቶ ወይም ስክሪንሾት ማከል ይፈልጋሉ? አሁን ይላኩ ወይም «ዝለል» ይጫኑ።",
  ticket_created: "✅ ጥያቄ #{id} ተመዝግቧል። ቡድናችን በቅርቡ እዚህ ይመልሳል።",
  cancelled: "ተሰርዟል።", text_please: "እባክዎ ጽሑፍ ይላኩ።",
  no_tickets: "እስካሁን ምንም ጥያቄ የለዎትም።", mine_title: "🎫 የቅርብ ጊዜ ጥያቄዎችዎ፦",
  status_open: "ክፍት", status_pending: "መልስዎን በመጠበቅ ላይ", status_closed: "ተዘግቷል",
  agent_joined: "👤 {agent} ጥያቄዎን #{id} እየተከታተለ ነው።",
  ticket_closed: "✅ ጥያቄ #{id} ተዘግቷል።",
  rate_prompt: "ድጋፋችንን እንዴት ይገመግማሉ?", rate_thanks: "ለአስተያየትዎ እናመሰግናለን! ⭐",
  closed_hint: "ይህ ጥያቄ ተዘግቷል። አዲስ ለመክፈት /start ይጠቀሙ።",
};

const om: Record<Key, string> = {
  welcome: "👋 Baga nagaan gara deeggarsa {biz} dhufte!\nHar'a akkamitti isin gargaaruu dandeenya?",
  btn_faq: "❓ Gaaffilee baay'ee", btn_ticket: "🎫 Deeggarsa gaafadhu", btn_mine: "📂 Gaaffilee koo",
  btn_lang: "🌐 Afaan", btn_back: "⬅️ Duubatti", btn_skip: "Irra darbi",
  btn_still_help: "Ammas gargaarsa barbaaddaa? Nu quunnamaa",
  faq_title: "Gaaffii tokko filadhu:", faq_nomatch: "Deebii gaaffii kanaaf hin arganne.",
  faq_match: "Kan arganne kanaa dha:",
  choose_lang: "🌐 Afaan kee filadhu:", lang_set: "✅ Afaan jijjiirameera.",
  ticket_has_open: "Gaaffiin banaan (#{id}) qabda. Ergaa kee as barreessi, gareen keenya ni argata.",
  ask_category: "Gaaffiin kee waa'ee maalii?",
  cat_billing: "💳 Kaffaltii", cat_technical: "🛠 Teekinikaa", cat_order: "📦 Ajaja", cat_other: "💬 Kan biraa",
  pick_button: "Maaloo tokko cuqaasi.",
  ask_description: "Rakkoo kee ergaa tokko keessatti ibsi. (Dhaabuuf /cancel ergi.)",
  ask_photo: "Suuraa yookaan screenshot dabaluu barbaaddaa? Amma ergi, yookaan 'Irra darbi' cuqaasi.",
  ticket_created: "✅ Gaaffiin #{id} banameera. Gareen keenya battaluma as irratti deebii ni kenna.",
  cancelled: "Haqameera.", text_please: "Maaloo barreeffama ergi.",
  no_tickets: "Ammaaf gaaffiin hin qabdu.", mine_title: "🎫 Gaaffilee kee dhiyoo:",
  status_open: "Banaa", status_pending: "Deebii kee eegaa jira", status_closed: "Cufame",
  agent_joined: "👤 {agent} gaaffii kee #{id} ilaaluu eegaleera.",
  ticket_closed: "✅ Gaaffiin #{id} cufameera.",
  rate_prompt: "Deeggarsa keenya akkamitti madaaltu?", rate_thanks: "Yaada kee galatoomi! ⭐",
  closed_hint: "Gaaffiin kun cufameera. Haaraa banuuf /start fayyadami.",
};

const dict: Record<Lang, Record<Key, string>> = { en, am, om };

export function t(lang: Lang, key: Key, vars: Record<string, string | number> = {}): string {
  let s = dict[lang][key] ?? en[key];
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

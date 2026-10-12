import type { Lang } from "./db.js";

type L10n = Record<Lang, string>;
export interface FaqItem { q: L10n; a: L10n; keywords: string[] }

// Edit this list for your own business.
export const FAQ: FaqItem[] = [
  {
    keywords: ["hours", "open", "close", "time", "when"],
    q: { en: "What are your opening hours?", am: "የሥራ ሰዓታችሁ መቼ ነው?", om: "Sa'aatiin hojii keessanii yoom?" },
    a: {
      en: "We are open Monday to Saturday, 08:00–18:00.",
      am: "ከሰኞ እስከ ቅዳሜ ከ08:00 እስከ 18:00 ክፍት ነን።",
      om: "Wiixata hanga Sanbata, sa'aatii 08:00–18:00 banaa dha.",
    },
  },
  {
    keywords: ["delivery", "deliver", "shipping", "ship"],
    q: { en: "Do you deliver?", am: "ዕቃ ታደርሳላችሁ?", om: "Oomishni ni geessitu?" },
    a: {
      en: "Yes. We deliver within the city in 24 hours. The fee depends on the area.",
      am: "አዎ፣ በከተማ ውስጥ በ24 ሰዓት ውስጥ እናደርሳለን። የክፍያ መጠኑ እንደ አካባቢው ይወሰናል።",
      om: "Eeyyee, magaalaa keessatti sa'aatii 24 keessatti geenyaa. Kaffaltiin bakka deemamuun ni jijjiirama.",
    },
  },
  {
    keywords: ["pay", "payment", "telebirr", "cash", "bank", "price"],
    q: { en: "Which payment methods do you accept?", am: "የትኞቹን የክፍያ አማራጮች ትቀበላላችሁ?", om: "Kaffaltii akkamii fudhattu?" },
    a: {
      en: "Cash, Telebirr, CBE Birr and bank transfer.",
      am: "ጥሬ ገንዘብ፣ ቴሌብር፣ CBE Birr እና የባንክ ዝውውር እንቀበላለን።",
      om: "Maallaqa harkaa, Telebirr, CBE Birr fi dabarsa baankii ni fudhanna.",
    },
  },
  {
    keywords: ["return", "refund", "exchange", "money back"],
    q: { en: "Can I return an item?", am: "ዕቃ መመለስ ይቻላል?", om: "Meeshaa deebisuun ni danda'amaa?" },
    a: {
      en: "Yes, within 7 days if the item is unopened and you have the receipt.",
      am: "ካልተከፈተ እና ደረሰኝ ካለ በ7 ቀናት ውስጥ መመለስ ይቻላል።",
      om: "Yoo hin banamne fi riisiitiin jiraate guyyaa 7 keessatti deebisuun ni danda'ama.",
    },
  },
];

/** Very simple keyword search. Replace with embeddings/RAG later. */
export function searchFaq(query: string, lang: Lang): FaqItem | undefined {
  const words = query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2);
  let best: FaqItem | undefined;
  let bestScore = 0;
  for (const item of FAQ) {
    const hay = (item.keywords.join(" ") + " " + item.q.en + " " + item.q[lang]).toLowerCase();
    const score = words.filter((w) => hay.includes(w)).length;
    if (score > bestScore) { best = item; bestScore = score; }
  }
  return best;
}

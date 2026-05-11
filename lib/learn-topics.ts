// Stable step IDs — never rename, they're persisted in customer_learning_progress.
// Adding new topics is fine; removing requires a migration to scrub old IDs.
export type LearnTopic = {
  id: string;
  icon: string;
  title: string;
  body: string;
};

export const LEARN_TOPICS: LearnTopic[] = [
  {
    id: "indica-sativa-hybrid",
    icon: "☀️🌙🍃",
    title: "Indica vs sativa vs hybrid",
    body:
      "Quick rule of thumb: indica = body-heavy, sativa = head-forward, hybrid = both. " +
      "It's a simplification — modern strains are mostly hybrids, and how a strain lands depends more " +
      "on the specific terpene profile than the indica/sativa label. But for shopping, the labels still " +
      "help: if people want couch + sleep, they lean indica. If they want focus + uplift, they lean " +
      "sativa. In-between, hybrid.",
  },
  {
    id: "edibles-dosing",
    icon: "🍬",
    title: "Edibles dosing for first-timers",
    body:
      "Start low. 2.5–5 mg THC is plenty for most first-timers. The full effect can take 60–90 minutes " +
      "to kick in (longer if you ate a heavy meal), and a misdosed edible can stretch into a long, " +
      "uncomfortable few hours. Common mistake: take 10 mg, feel nothing at 30 minutes, take another " +
      "10 mg — then the first one hits and you're way in over your head. Wait two full hours before " +
      "considering a second dose. Have a non-cannabis snack on hand.",
  },
  {
    id: "thc-percent-cannabinoids",
    icon: "📊",
    title: "How to read THC % and total cannabinoids",
    body:
      "THC% on flower is the percent of the flower's weight that's THC. 18% is mid; 22%+ is high; 28%+ " +
      "is very high. Higher isn't always better — terpene content and curing matter just as much for " +
      "the experience. On edibles, look at total mg per package AND per piece — a 100 mg gummy bag " +
      "with 10 pieces is 10 mg per gummy. CBD is the non-intoxicating cannabinoid; CBD-heavy products " +
      "don't get you high — people reach for them when they want the cannabinoid without the head change.",
  },
  {
    id: "terpenes-101",
    icon: "🌿",
    title: "Terpenes 101",
    body:
      "Terpenes are the aromatic compounds in cannabis (and in basically every plant). They're why one " +
      "strain smells citrusy and another smells like pine. Terpenes also shape how a strain lands: " +
      "myrcene shows up in strains people pick for a body-heavy session, limonene in ones they reach " +
      "for when they want a mood lift, pinene in daytime-leaning strains, linalool in ones folks pick " +
      "to wind down. If a strain smells right to you, it's a decent first signal that it'll " +
      "feel right too. Ask a budtender — we'll match by smell.",
  },
  {
    id: "first-visit",
    icon: "🪪",
    title: "What to expect on a first visit",
    body:
      "Bring a valid 21+ ID. We'll check at the door and again at the counter — required by Washington " +
      "law, no exceptions, no offense taken. Inside is just like a normal retail store, except a " +
      "budtender is at the counter to walk you through the menu. Feel free to ask anything: dosing, " +
      "what's new, what we've been smoking lately, what's a fair price. Cash only (ATM on site). " +
      "In and out in 10 minutes if you know what you want; longer if you want to chat.",
  },
  {
    id: "cash-only",
    icon: "💵",
    title: "Why are dispensaries cash-only?",
    body:
      "Cannabis is federally illegal, so the major card networks (Visa, Mastercard, Amex) won't " +
      "process payments at dispensaries. Some shops use workarounds like cashless ATM or pin-debit, " +
      "but these can be unstable and add fees you'd rather not pay. We keep it cash + ATM on-site, " +
      "which is faster, more reliable, and skips the surcharges. Bring a few extra dollars and you'll " +
      "be set.",
  },
  {
    id: "wa-law-basics",
    icon: "📜",
    title: "Washington law basics (the short version)",
    body:
      "21+ to purchase, with valid government ID. Daily purchase limits apply: 1 oz flower, 16 oz " +
      "infused-edible solid, 72 oz infused-edible liquid, 7 g concentrate. No public consumption " +
      "(streets, parks, vehicles, on the lake, etc.) — only on private property where the owner " +
      "allows it. Don't drive impaired; cannabis affects reaction time. WA also prohibits below-cost " +
      "sales, BOGO, and free cannabis giveaways — so any deal you see at a legitimate WA shop, " +
      "including ours, operates within those rules.",
  },
];

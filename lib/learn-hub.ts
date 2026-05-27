// Long-form `/learn/<slug>` hub-topic SoT — separate from the
// `lib/learn-topics.ts` Cannabis 101 microlearning surface (those are
// progress-tracked, 80-150-word quick reads; these are 400-600 word
// SEO-landing topics each pinned to a unique URL).
//
// Voice: WAC 314-55-155 STRICT — no effect/medical/promissory claims.
// Educational lane only: "describe how X works" / "explain what Y is".
// Unicode apostrophes (U+2019). No exclamation marks.
//
// Adding a new topic: append a row, add the slug to sitemap.ts manually
// (or via the LEARN_HUB_TOPICS.map() pattern there), bump version, push.
// Removing a topic requires a 410 redirect or a sitemap removal entry.

export type LearnHubTopic = {
  /** URL slug — stable forever once published; renaming = 301 + sitemap edit. */
  slug: string;
  /** Eyebrow label above the H1. */
  eyebrow: string;
  /** Page H1 — 50-70 chars ideal. */
  title: string;
  /** SERP description — ~150-160 chars. */
  description: string;
  /** Long-form body — sectioned with markdown-style H2 headers (## …) and
   * paragraphs separated by `\n\n`. Renderer splits + maps each section. */
  body: string;
  /** 3-5 FAQ Q&A pairs rendered as FAQPage JSON-LD + visible accordion. */
  faqs: Array<{ q: string; a: string }>;
  /** Hand-picked related topic slugs — renders as the "Related guides"
   *  cluster on each `/learn/<slug>` page (3 cards). Anchors PageRank
   *  flow between related-intent topics rather than letting the
   *  "other topics" grid blast generically across all 7 peers.
   *  Values must match a slug in this same array (compile-time
   *  enforcement via the resolver in the renderer). */
  relatedTopics: string[];
};

export const LEARN_HUB_TOPICS: LearnHubTopic[] = [
  {
    slug: "cannabis-tax-washington",
    eyebrow: "Washington cannabis tax",
    title: "How cannabis tax works in Washington State",
    description:
      "Washington taxes cannabis at 37% excise plus state and local sales tax. Here’s how the numbers break down at the counter and why the sticker price isn’t the final price.",
    body: `## The headline number — 37% state excise

Washington charges a 37% excise tax on every cannabis sale at the retail counter. That excise is on top of the sticker price you see on the shelf, and it’s on top of state and local sales tax. It’s the largest single line on your receipt.

The 37% rate has been in place since 2015, when the legislature consolidated three earlier producer/processor/retailer taxes into a single point-of-sale excise. The state collects it, then distributes it across the general fund, the Department of Health’s cannabis education and prevention work, the Liquor and Cannabis Board’s regulatory operations, and a few smaller dedicated buckets.

## Plus state + local sales tax

After the 37% excise, the running total gets state sales tax (6.5%) and local sales tax (varies by jurisdiction). Local rates depend on the city and county the store is in, and they’re the same rates that apply to any other retail purchase in that location. The combined effective rate on a cannabis purchase typically lands somewhere between 45% and 48% on top of the listed price.

## A worked example

A 1g pre-roll priced at $10 on the shelf:

- Subtotal: $10.00
- 37% excise: +$3.70
- State + local sales tax (call it 10% for a round number): +$1.37
- Total at the counter: about $15.07

The exact local rate at our store is published on the receipt every time, and our budtenders will read it back to you before you pay if you want the breakdown.

## Why the price feels high

Cannabis is a federally controlled substance, which means licensed retailers can’t deduct ordinary business expenses (rent, payroll, advertising) the way other small businesses can. That federal tax treatment (IRC §280E) compounds with the state excise to keep retail prices structurally above what you’d see for an equivalent product in an unregulated market. The tax line is the most visible piece; the §280E layer sits under the sticker price itself.

## What the tax pays for

The 37% excise funds, in rough order of dollars: the state general fund (which underwrites schools, public safety, and Medicaid match), the Department of Health’s cannabis education and prevention grants, basic health-plan trust account contributions, the Liquor and Cannabis Board’s licensing and enforcement work, and city and county allocations to jurisdictions that allow retail sales.

## What it doesn’t cover

The excise doesn’t pay for federal banking access (which is why dispensaries are cash-only) and it doesn’t fund any federal-level cannabis research or rescheduling work. Those are separate federal-policy questions. The state-level tax structure is closed inside Washington.`,
    faqs: [
      {
        q: "Is the 37% cannabis tax on top of sales tax, or instead of it?",
        a: "On top of sales tax. The 37% state excise is applied first, then state and local sales tax stack on top. Total tax burden at a Washington dispensary typically lands around 45-48% on top of the sticker price.",
      },
      {
        q: "Do medical cardholders pay less tax?",
        a: "Yes — qualifying medical patients with a recognition card from the state’s medical cannabis database are exempt from state and local sales tax on cannabis products at medically endorsed stores. The 37% state excise still applies. The total saving is roughly the local sales-tax rate (commonly 8-10%).",
      },
      {
        q: "Why is the tax so high compared to alcohol?",
        a: "Cannabis came online in Washington in 2014 with a tax structure built around three goals: fund prevention and enforcement, hold pricing high enough to discourage youth use, and undercut the illicit market. Alcohol’s tax structure was set decades earlier under different policy assumptions.",
      },
      {
        q: "Can I see the tax breakdown on my receipt?",
        a: "Yes. Washington requires the excise line, the sales-tax line, and the subtotal to print separately on every cannabis receipt. Ask at the counter if you want a budtender to walk through it.",
      },
    ],
    relatedTopics: ["cash-only-dispensaries", "medical-vs-recreational-wa", "first-time-visitor"],
  },
  {
    slug: "indica-sativa-hybrid",
    eyebrow: "Cannabis basics",
    title: "Indica vs sativa vs hybrid — what’s the difference?",
    description:
      "Indica, sativa, and hybrid are shorthand labels for how a cannabis strain tends to land. Modern science says terpenes drive the experience more than the label. Here’s what each term actually means.",
    body: `## The shorthand most shops still use

Walk into any Washington dispensary and you’ll see the menu sorted into three buckets: indica, sativa, and hybrid. The labels come from 18th- and 19th-century botanical taxonomy. Cannabis indica plants were described as short and bushy with broad leaves; cannabis sativa plants as tall and lanky with narrow leaves. Over time the labels migrated from describing the plant to describing the perceived experience: indica leans body-heavy and slow-landing, sativa leans head-forward and energetic, hybrid is somewhere between.

## What the labels actually predict (and what they don’t)

For shopping purposes, the labels still carry weight. People who want couch-and-blanket lean indica. People who want focus and uplift lean sativa. People who want something balanced ask for a hybrid. Budtenders use the categories as a starting point in a conversation, not as a final answer.

What the labels do not reliably predict is the specific chemical experience. Almost every commercial cultivar sold in Washington is a hybrid at the genetic level — pure indica or pure sativa lineage is rare in the modern market. The botanical line between the two has blurred over decades of crossbreeding.

## Terpenes do more of the work than the label

Terpenes are the aromatic compounds that give cannabis its smell (and that give pine its pine smell, lemons their lemon smell, lavender its lavender smell). Cannabis flowers carry dozens of terpenes in varying ratios, and that ratio shapes how the strain lands much more than the indica/sativa label does.

A few of the most commonly named terpenes and the general patterns associated with them:

- **Myrcene** — earthy, musky, herbal. Shows up in strains people pick for body-heavy sessions.
- **Limonene** — citrusy, bright. Shows up in strains people reach for to lift mood.
- **Pinene** — pine, rosemary. Daytime-leaning strains.
- **Linalool** — floral, lavender. Strains people pick to wind down.
- **Caryophyllene** — pepper, clove. Spicy, sometimes warming.

A strain labeled "sativa" that’s heavy in myrcene may land more like a classic indica. A strain labeled "indica" that’s heavy in limonene may land more like a head-forward sativa. The terpene panel on a lab sheet tells you more than the marketing label on the jar.

## How to shop with this in mind

Smell the jar. Most dispensaries (ours included) keep a sniff jar of every flower strain on the menu so customers can run their nose over the bud before buying. If a strain smells right to you — if you like the smell, find it interesting, want more of it — that’s a decent first signal that the chemistry suits you.

Ask the budtender. We work with these strains every day. Tell us what you’re looking for ("daytime focus," "winding down after work," "social with friends") and we’ll match by terpene profile, not just by the label on the lid.

## Edibles and concentrates blur it further

The indica/sativa label travels along with flower into edibles and concentrates, but the experience is mediated by the format. A 5mg indica gummy and a 5mg sativa gummy land more similarly than the same two strains smoked. Format, dose, and your own tolerance shape the experience as much as the strain category.`,
    faqs: [
      {
        q: "Is sativa really more head-forward than indica?",
        a: "The label tracks the general pattern, but terpenes drive the experience more than the indica/sativa category. A myrcene-heavy sativa can land like a classic indica; a limonene-heavy indica can land like a head-forward sativa.",
      },
      {
        q: "What does hybrid mean if everything is a hybrid?",
        a: "On a Washington menu, ‘hybrid’ means the cultivator picked a cross with characteristics from both lineages — usually balanced or leaning slightly one direction. The label is shorthand for ‘neither extreme.’",
      },
      {
        q: "How do I shop if the labels aren’t reliable?",
        a: "Three options: read the terpene panel on the lab sheet if the store posts it; smell the strain at the counter (most shops keep sniff jars); or describe what you want to a budtender and let them match by chemistry rather than category.",
      },
      {
        q: "Does the indica/sativa label matter for edibles?",
        a: "Less than it does for flower. Edibles get processed through the liver and the experience is mediated by dose, format, and metabolism — the strain label carries some signal but format and dose dominate.",
      },
    ],
    relatedTopics: ["lab-panel-coa", "first-time-visitor", "edibles-dosing-101"],
  },
  {
    slug: "lab-panel-coa",
    eyebrow: "Cannabis literacy",
    title: "How to read a cannabis lab panel (COA)",
    description:
      "Washington requires every cannabis product to ship with a Certificate of Analysis. Here’s what each number on the lab panel means and which ones actually matter for shopping.",
    body: `## What a COA is

A Certificate of Analysis (COA) is the lab report that accompanies every cannabis product sold legally in Washington. WAC 314-55-101 requires every batch of flower, edible, concentrate, and topical to be tested by a state-certified lab before it reaches a retail shelf. The COA is the public-facing summary of that testing.

The full panel covers cannabinoid potency, moisture and water activity, residual pesticides, residual solvents (for concentrates), heavy metals, and microbiology (yeast, mold, E. coli, Salmonella). Different product categories trigger different mandatory tests, but the cannabinoid potency panel runs on everything.

## How to find the COA

Every product sold in Washington carries a batch number printed on the label. That batch number is the key to its COA. Some processors post lab results directly on their website (searchable by batch number); some make them available at the retail counter on request. We can pull the COA for anything on our shelves — ask a budtender.

## Reading the cannabinoid panel

The cannabinoid panel is the headline. For flower, the lines that matter most:

- **Total THC** — the load-bearing number. This is THCA + delta-9 THC adjusted for the chemistry that happens when THCA decarboxylates (heats up and turns into active THC). Total THC of 18% is mid; 22%+ is high; 28%+ is very high. Higher isn’t automatically better — terpenes and curing matter at least as much for the experience.
- **THCA** — the non-intoxicating acid form of THC found in raw flower. When you smoke or vape it, heat converts THCA into active THC. THCA itself doesn’t get you high until it’s heated.
- **Delta-9 THC** — the active form. In raw flower, this number is usually small; the lab math rolls it up into Total THC.
- **CBD** — non-intoxicating cannabinoid. CBD-heavy products land differently than THC-heavy ones — many people reach for CBD when they want the cannabinoid without the head change.
- **CBG, CBN, CBC** — minor cannabinoids in small concentrations. Some products feature them; for most flower the numbers are <1%.

## Reading the terpene panel

If the lab tested for terpenes (not every Washington lab does this on every batch), the COA will list the top terpenes by weight. A typical flower might be 2-3% total terpenes; high-terp strains hit 4%+.

Look at the top three and reference them against the terpene primer (myrcene, limonene, pinene, linalool, caryophyllene). The terpene profile shapes the experience more than the indica/sativa label.

## The contamination panels

Washington labs test for:

- **Residual pesticides** — a fixed list of compounds; the COA shows "pass" or specific values. WAC sets the action limit; failing batches don’t reach the shelf.
- **Residual solvents** — for concentrates only. Butane, propane, ethanol, etc. The COA shows ppm values against the WAC action limits.
- **Heavy metals** — lead, arsenic, cadmium, mercury. Tested in concentrates and inhalables; values shown in ppm.
- **Microbiology** — total yeast and mold count, E. coli, Salmonella, Aspergillus. Pass/fail by category.

A "pass" stamp across these panels is the regulatory floor. If you ever want to see the actual values, the COA carries them.

## Edibles specifically

For edibles, the cannabinoid panel reports both per-package and per-piece milligrams. A 100mg gummy bag with 10 pieces is 10mg per gummy — read the per-piece line, not just the total. WAC caps recreational edibles at 100mg total THC per package and 10mg per piece.`,
    faqs: [
      {
        q: "Where do I find the COA for a product I already bought?",
        a: "Use the batch number printed on the label. Many processors post COAs on their websites searchable by batch; the rest provide them on request through the retailer. We can pull the COA for any product on our shelves.",
      },
      {
        q: "What’s the difference between THCA and Total THC?",
        a: "THCA is the raw acid form found in unheated flower; Total THC accounts for what THCA becomes when heated (decarboxylated) plus any active delta-9 THC already present. The Total THC number is the one to compare across products.",
      },
      {
        q: "What does it mean if the terpene panel is missing?",
        a: "Not every Washington lab runs a full terpene panel on every batch — it isn’t mandatory the way pesticide and microbiology panels are. The strain still has terpenes; the data just wasn’t included on this particular COA. Ask the budtender; we often know the terpene-dominant profile from prior batches.",
      },
      {
        q: "What does a pesticide or microbial failure mean?",
        a: "Batches that fail the action limits in WAC 314-55-101 cannot legally reach a retail shelf. By the time a product is in the store, it has passed every applicable panel.",
      },
    ],
    relatedTopics: ["indica-sativa-hybrid", "edibles-dosing-101", "first-time-visitor"],
  },
  {
    slug: "first-time-visitor",
    eyebrow: "First-time guide",
    title: "First-time visitor guide — what to expect at a dispensary",
    description:
      "Walking into a Washington cannabis dispensary for the first time? Here’s the layout, the rules, the ID check, and the conversation you’ll have with the budtender.",
    body: `## Before you walk in

Bring a valid government ID showing you’re 21 or over. Driver’s license, state ID card, passport, or military ID all work. Out-of-state IDs are fine in Washington as long as they’re unexpired and clearly legible. Without an acceptable ID, the store legally cannot let you in.

Bring cash. Most Washington dispensaries — including ours — are cash-only at the counter because the major card networks won’t process cannabis transactions while it remains federally controlled. There’s an ATM on site if you need one, but you’ll pay an ATM fee that you’d skip by bringing cash.

## The door check

Washington WAC requires every dispensary to verify ID at the door before letting anyone past the entryway, and again at the counter before completing a transaction. The door check is fast — staff scan the ID, confirm the date of birth, and wave you through. It’s a legal requirement, not a vibe check. No offense intended; it’s the same procedure for every customer every time.

## Inside the shop

The layout looks like a regular small retail store. Glass cases or wall menus display the flower, pre-rolls, edibles, concentrates, vape cartridges, and accessories on the menu. A budtender (the staff person behind the counter) is there to walk you through everything.

Most Washington shops post the full menu at a kiosk, on a screen, or in a printed binder. Prices are listed inclusive of the 37% state excise sometimes, exclusive of it other times — ask if it’s unclear. State and local sales tax stacks on top either way.

## The conversation with the budtender

Feel free to ask anything. Common first-visit questions we hear all the time:

- I haven’t tried cannabis in 10 years — where do I start?
- I want something for sleep, but I don’t want to feel groggy. What do you recommend?
- What’s the strongest edible you’d give to someone new?
- I just want to bring something nice to a dinner party. What’s easy?
- What’s the cheapest pre-roll on the menu?

There’s no wrong question. Budtenders deal in honest matchmaking, not upselling — we’d rather sell you the right $12 product than the wrong $40 one. If you tell us what you’re looking for, we’ll narrow the menu.

## What to expect to spend

For a first visit, plan on $20-50 total. That covers a single edible, a pre-roll, a low-volume eighth of flower, or a small starter cartridge — enough to try something without overcommitting. You can always come back. We’d rather have a returning customer than a one-time big basket.

## At the counter

Second ID check at the register before the transaction completes. You’ll see the subtotal, the excise line, the sales-tax line, and the total break out on the receipt. Pay in cash; the budtender bags the order in the opaque exit bag Washington requires; you walk out.

In and out in 10 minutes if you know what you want; longer if you want to chat.

## After you leave

Open the bag and consume responsibly. No public consumption in Washington — streets, parks, vehicles, sidewalks, the lake, sports venues all off-limits. Private property only, and only where the property owner allows it. Don’t drive impaired. If you have questions about a product after you’ve left, call the store; we’ll take the call.`,
    faqs: [
      {
        q: "Do I need a medical card to shop at a Washington dispensary?",
        a: "No. Recreational customers 21+ can shop at any licensed Washington dispensary with a valid ID. A medical recognition card is separate and provides sales-tax exemption at medically endorsed stores.",
      },
      {
        q: "Can I bring a friend who isn’t 21?",
        a: "No. WAC requires everyone in the licensed area of the store to be 21+ with valid ID. A friend under 21 can wait outside or in the car.",
      },
      {
        q: "What payment do you take?",
        a: "Cash only at the counter. ATM in-store if you need one. Federal banking restrictions mean most Washington dispensaries can’t accept credit cards.",
      },
      {
        q: "Can I return a product I didn’t like?",
        a: "Washington WAC prohibits returns of opened cannabis products. Unopened products can sometimes be exchanged within a short window — ask the store about its specific return policy. We work hard to match the right product up front so a return isn’t needed.",
      },
    ],
    relatedTopics: ["cash-only-dispensaries", "cannabis-tax-washington", "indica-sativa-hybrid"],
  },
  {
    slug: "cannabis-driving-wa",
    eyebrow: "Washington law",
    title: "Cannabis and driving in Washington (DUI + odor)",
    description:
      "Washington enforces a 5 ng/mL active-THC blood limit and treats cannabis-impaired driving the same as alcohol-impaired driving. Here’s how the law works.",
    body: `## The per se limit — 5 ng/mL active THC

Washington RCW 46.61.502 sets a per se blood limit of 5 nanograms of active (delta-9) THC per milliliter of blood. "Per se" means at or above that number, you’re legally impaired regardless of how you feel or perform on field tests. The number was set when Initiative 502 legalized recreational cannabis in 2012 and has stayed in place since.

The limit measures active THC only, not THC metabolites. Inactive metabolites (THC-COOH) can stay in your system for days or weeks after use; active delta-9 THC declines within hours of consumption. Roadside testing targets the active number.

## How enforcement actually works

A traffic stop doesn’t start with a blood draw — it starts the same way an alcohol stop does. An officer observes driving behavior, makes the stop, and looks for indicators of impairment: smell, demeanor, performance on standardized field sobriety tests, statements from the driver. If those indicators add up to probable cause, the officer can request a blood draw — typically by warrant or with consent.

The blood test happens at a state lab. Results come back days to weeks later. By that point the driver is usually already charged with DUI on the basis of the field observations; the blood number confirms or revises the prosecution’s case.

## The odor question

Smelling cannabis in or around a vehicle does not on its own give an officer probable cause to search the car in Washington. State v. Ladson and follow-on case law have narrowed the "plain smell" doctrine substantially. Odor can contribute to probable cause when combined with other indicators (admission, visible product, driving behavior), but the smell alone isn’t enough.

Practically: don’t consume in the car, don’t leave open packaging in the cabin, keep purchased cannabis sealed in the exit bag and stored where you’d store a bottle of wine driving home from a winery. The legal framing treats it the same way.

## Drug Recognition Experts (DREs)

Washington trains a subset of officers as Drug Recognition Experts — DREs are certified to do a 12-step impairment evaluation that goes beyond standard field sobriety tests. Cannabis cases often go to a DRE for evaluation. The DRE’s observations become part of the probable-cause record alongside the field tests.

## Penalties

A first-offense DUI in Washington carries a 90-day license suspension, mandatory ignition interlock for at least a year, fines, possible jail time, and ignition interlock device fees. Penalties escalate with priors and with aggravating factors (kids in the car, accident, high blood number). Cannabis DUI is treated the same as alcohol DUI for sentencing purposes.

## When you’ll be okay to drive

Active THC clears the blood within a few hours of inhaled cannabis use, but the exact timing varies by dose, tolerance, frequency of use, and individual metabolism. Edibles last longer in the body and the peak comes later. Conservative practice for occasional users:

- After a small inhaled dose: wait at least 4 hours before driving.
- After a moderate inhaled dose (a few hits of a high-potency strain): wait 6-8 hours.
- After an edible: wait at least 8 hours, longer for larger doses.
- After a heavy session: don’t drive that day.

Frequent users sit in a gray zone because their baseline active-THC level can hover near the 5 ng threshold even hours after the last dose. There’s no roadside breath test for cannabis the way there is for alcohol; if you’re unsure, don’t drive.

## A practical note

Washington dispensaries seal every purchase in the opaque exit bag that the state requires. The exit bag is the rough equivalent of an unopened wine bottle from a winery — fine to transport, not fine to open in the car. Keep it sealed until you’re home.`,
    faqs: [
      {
        q: "Can I get a DUI in Washington if I’m a daily user with cannabis in my system but I haven’t used today?",
        a: "Active delta-9 THC clears within hours of use, while inactive metabolites can stay in the body for weeks. The Washington 5 ng/mL limit applies only to active THC, not metabolites. That said, frequent users can hover near the threshold for longer than occasional users. If you’re a daily consumer and unsure, don’t drive.",
      },
      {
        q: "Can a police officer search my car because they smell cannabis?",
        a: "Not on smell alone. Washington case law has narrowed the plain-smell doctrine — odor can contribute to probable cause when combined with other indicators, but isn’t sufficient by itself. Keep purchased product sealed in the exit bag to avoid the question.",
      },
      {
        q: "Is the 5 ng limit the same as the alcohol 0.08 limit?",
        a: "It’s a per se limit the same way 0.08 BAC is — at or above the number you’re legally impaired regardless of observable performance. The science behind 5 ng is more contested than 0.08, but the legal effect is the same.",
      },
      {
        q: "Can a passenger smoke in a moving car?",
        a: "No. Washington prohibits open cannabis containers in a vehicle and prohibits cannabis consumption in any public place, which includes the cabin of a vehicle on a public road. Penalties apply to both driver and passenger.",
      },
    ],
    relatedTopics: ["medical-vs-recreational-wa", "first-time-visitor", "cash-only-dispensaries"],
  },
  {
    slug: "medical-vs-recreational-wa",
    eyebrow: "Washington cannabis programs",
    title: "Recreational vs medical cannabis in Washington",
    description:
      "Washington runs separate recreational and medical cannabis programs. Here’s what each one allows, who qualifies for medical, and what changes at the counter.",
    body: `## Two programs, one supply chain

Washington has two parallel cannabis programs administered by two different agencies. The recreational program — created by Initiative 502 in 2012 — is run by the Liquor and Cannabis Board (LCB). The medical program — older, restructured under SB 5052 in 2015 — is run by the Department of Health (DOH).

Both programs draw from the same regulated supply chain. The flower, edibles, and concentrates on a recreational shelf and a medical shelf come from the same licensed producers and processors, tested by the same state-certified labs, under the same WAC 314-55 framework. What differs is who can buy, what counter they buy at, what tax applies, and what dose ceilings are in play.

## The recreational lane

Anyone 21 or over with valid government ID can shop at any licensed Washington recreational dispensary. There’s no application, no card, no doctor’s note. The product is taxed at the full 37% state excise plus state and local sales tax. Daily purchase limits apply: 1 oz of flower, 16 oz of infused-edible solid, 72 oz of infused-edible liquid, 7 g of concentrate. Edibles are capped at 100 mg total THC per package and 10 mg per piece.

This is the lane most Washington adults use. It’s broad, accessible, and consistent across the state.

## The medical lane

The medical lane requires a qualifying patient designation. The process:

1. A qualifying patient sees a Washington-licensed health-care provider (MD, DO, PA, ND, ARNP).
2. The provider documents that the patient has a qualifying condition listed in RCW 69.51A.010 (intractable pain, cancer, MS, glaucoma, several others) and confirms that the patient may benefit from medical cannabis use.
3. The provider issues a medical cannabis authorization.
4. The patient enters their authorization into the state’s medical cannabis database via a medically endorsed dispensary, and the DOH issues a recognition card.

A recognition card holder can:

- Buy cannabis at a medically endorsed dispensary (most, but not all, licensed stores have the medical endorsement) tax-exempt from state and local sales tax. The 37% excise still applies.
- Access higher possession limits: 3 oz flower, 48 oz infused-edible solid, 216 oz infused-edible liquid, 21 g concentrate.
- Access higher-dose edibles where available (some products are formulated above the 10 mg/piece recreational cap for medical sale).
- Grow a limited number of plants at home if their provider authorizes it (specific plant counts in RCW 69.51A.260).

## What this means at the counter

At a medically endorsed store, the card-holding customer presents the recognition card alongside their ID. The system flags the transaction as medical. The sales-tax line drops off the receipt (state and local). The 37% excise stays on. If the customer is buying a high-dose product available only on the medical menu, that line opens up.

At a recreational-only store, the medical card has no effect — the store can only sell from its recreational menu at recreational tax.

## Who tends to go medical

The math favors medical for high-volume regular consumers — the sales-tax exemption stacks up across a year of purchases. It also matters for patients who need a higher dose per piece than the 10 mg recreational cap allows. For an occasional consumer buying a $20 edible every few weeks, the paperwork tends to outweigh the tax savings.

## What hasn’t changed

The medical program does not authorize use anywhere recreational cannabis is prohibited. No public consumption, no workplace policy exemption, no impaired driving exemption. Medical use is still cannabis use under state law for those purposes.

## Finding a medically endorsed store

The DOH publishes a list of medically endorsed retailers. Look for the medical endorsement decal at the door or call ahead before driving over.`,
    faqs: [
      {
        q: "Do I need a medical card to buy cannabis in Washington?",
        a: "No. Anyone 21+ with valid government ID can shop at any licensed recreational dispensary. The medical card is optional and provides sales-tax exemption plus higher possession limits.",
      },
      {
        q: "Can naturopaths authorize medical cannabis in Washington?",
        a: "Yes. RCW 69.51A.010 lists MDs, DOs, PAs, ARNPs, and NDs (naturopaths licensed under RCW 18.36A) as authorized health-care providers under the medical program.",
      },
      {
        q: "What conditions qualify for medical authorization?",
        a: "RCW 69.51A.010 lists intractable pain, cancer, multiple sclerosis, epilepsy, glaucoma, Crohn’s disease, hepatitis C, anorexia, traumatic brain injury, and PTSD among others. The provider makes the qualifying-condition determination.",
      },
      {
        q: "Does the medical card save me a lot of money?",
        a: "It depends on volume. The sales-tax exemption (typically 8-10% combined state and local) compounds with regular purchasing — a heavy regular consumer saves meaningfully across a year. An occasional buyer often doesn’t save enough to justify the paperwork.",
      },
    ],
    relatedTopics: ["cannabis-driving-wa", "cannabis-tax-washington", "first-time-visitor"],
  },
  {
    slug: "cash-only-dispensaries",
    eyebrow: "Cannabis banking",
    title: "Why Washington dispensaries are cash-only",
    description:
      "Cannabis is federally controlled, so credit-card networks won’t process dispensary transactions. Here’s why the cash-only norm exists and what the workarounds (and their limits) look like.",
    body: `## The short answer — federal scheduling

Cannabis remains a Schedule I controlled substance under the federal Controlled Substances Act. That single fact ripples through every part of the legal cannabis industry’s relationship with the financial system. Banks that hold federal charters or federal deposit insurance face regulatory exposure when they process cannabis-related transactions. Credit-card networks (Visa, Mastercard, Amex, Discover) have a flat policy: no cannabis transactions on the network. Period.

The networks’ policy isn’t about the dispensary’s legality under state law. It’s about federal exposure for the network and the issuing banks. Even a fully state-licensed Washington dispensary in good standing with the LCB cannot accept a Visa or Mastercard at the point of sale.

## What this means at the counter

Most Washington dispensaries — including ours — accept cash only. There’s usually an in-store ATM for customers who didn’t plan ahead. The ATM charges its own fee (typically $3-5 per withdrawal), so customers save money by bringing cash from home or hitting their own bank’s ATM beforehand.

A few shops have tried workarounds:

- **Cashless ATM** — a card transaction structured as an ATM withdrawal that gets paid out as merchandise rather than cash. These look like card payments to the customer. Card networks have been cracking down on them; they tend to be unstable and add $3-4 in fees per transaction.
- **PIN debit** — debit cards (which use the ATM networks instead of the Visa/Mastercard networks) sometimes work at dispensaries. Less reliable than cash; some banks block dispensary merchant codes.
- **Online prepay** — a few platforms let customers prepay online and then pick up cash-free. Adoption varies; most customers still default to cash at the counter.

We keep it simple: cash and ATM only. Faster, fewer fees, and the transaction doesn’t fail at the wrong moment.

## The banking side

Most Washington dispensaries bank with state-chartered credit unions and community banks that have opted in to serving the industry under FinCEN guidance from 2014. These institutions accept the regulatory burden in exchange for cannabis-industry deposits. They charge higher account fees than ordinary commercial banks (the compliance overhead is real), and the relationship can be precarious — some institutions have exited the space when their compliance costs spiked or when their examiners pushed back.

The lack of standard banking has practical consequences beyond the customer experience. Dispensaries pay employees, taxes, and vendors in larger volumes of cash than equivalently sized businesses in other industries. Tax payments to the state can be made via electronic transfer through the LCB; federal tax payments to the IRS often involve physically depositing cash at a Federal Reserve branch with armored-car transport.

## What might change

The SAFER Banking Act and its predecessors have moved through Congress repeatedly but have not passed. The act would create a federal safe harbor for banks and card networks to serve cannabis businesses without federal exposure. If it passes, the card-acceptance landscape would change quickly — most dispensaries would start taking Visa and Mastercard the next quarter.

Until that legislation lands, federal rescheduling could create a similar opening. The DEA proposed moving cannabis from Schedule I to Schedule III in 2024; that process is still working through administrative review and litigation as of 2026. Schedule III would not automatically authorize banking but would substantially reduce the federal exposure that motivates the current restrictions.

## Practical guidance

Bring more cash than you think you’ll need. A $50 bill covers most casual visits with room for tax. If you’re shopping for a heavier basket (an ounce of flower runs $100-300 depending on tier), plan accordingly. Round up rather than down; the ATM fee on a single mid-trip withdrawal usually exceeds what you would have left over.

If you’re visiting from out of state, the same federal rules apply nationally — every legal cannabis market in the U.S. runs largely on cash for the same reason.`,
    faqs: [
      {
        q: "Why won’t my Visa work at a dispensary?",
        a: "Visa and the other major card networks prohibit cannabis transactions on their networks because cannabis is federally controlled. The dispensary’s state license doesn’t change the network policy.",
      },
      {
        q: "Is the in-store ATM safe?",
        a: "Yes — it works the same way any commercial ATM works. It draws from your bank account using the ATM network and dispenses cash. It charges an ATM fee (commonly $3-5) on top of whatever your home bank charges for out-of-network withdrawals.",
      },
      {
        q: "Can I write a check?",
        a: "No. Personal and business checks aren’t accepted at Washington dispensaries because of the same federal banking exposure that blocks card acceptance.",
      },
      {
        q: "Will this ever change?",
        a: "Possibly. The SAFER Banking Act and federal cannabis rescheduling are both potential paths. Neither has landed as of 2026. Until one does, cash is the norm.",
      },
    ],
    relatedTopics: ["cannabis-tax-washington", "first-time-visitor", "medical-vs-recreational-wa"],
  },
  {
    slug: "edibles-dosing-101",
    eyebrow: "Edibles basics",
    title: "Edibles dosing 101 — patience, not portion size",
    description:
      "Edibles take 60-90 minutes to land and the experience is unforgiving of impatience. Here’s how to start, what to watch for, and how to recover if you’ve overshot.",
    body: `## Why edibles work differently than flower

When you smoke or vape cannabis, THC enters the bloodstream through the lungs within seconds and reaches peak blood levels within 15-30 minutes. You feel the effect quickly, you can titrate dose by stopping when you’ve had enough, and the experience tapers off within a few hours.

Edibles take a longer, less predictable path. THC enters the digestive tract, gets processed through the liver, and in the process gets converted to 11-hydroxy-THC — a metabolite with a longer half-life and (for many people) a noticeably stronger subjective effect than inhaled delta-9 THC. The whole sequence takes 60-90 minutes before peak effect, sometimes longer if you’ve eaten recently. The peak lasts 2-4 hours, and residual effect can run 6-8 hours total.

The result: edibles are easier to overshoot, harder to titrate, and longer to ride out than inhaled cannabis. The dose that delivers a pleasant experience is often surprisingly small.

## The Washington dose framework

WAC 314-55-105 caps recreational edibles at 10 mg total THC per piece and 100 mg total THC per package. A "piece" might be a single gummy, a single chocolate square, a single mint, a single hard candy. The package will tell you both numbers — read the per-piece line, not just the package total.

For a first-time or occasional consumer, a sensible starting dose is **2.5-5 mg of THC**. That’s often half a piece or even a quarter of a piece depending on the product. Many packages are scored to make halving easier. Some are not — a knife and a cutting board work fine.

Frequent consumers with built-up tolerance often start at 5-10 mg and work up. Tolerance to inhaled cannabis does not automatically translate to tolerance for the 11-hydroxy-THC delivered by edibles; even seasoned flower consumers commonly find edibles hit harder than expected.

## The cardinal mistake

The most common overshoot looks like this:

1. Customer takes 10 mg.
2. 30 minutes pass. They feel nothing.
3. Customer takes another 10 mg, reasoning that the first one didn’t work.
4. 30 minutes after the second dose (now 60 minutes after the first), the first dose lands.
5. Another 30 minutes later, the second dose lands on top of the first.
6. Customer is now well past the intended dose for the next 4-6 hours.

The fix is a single rule: **wait two full hours before considering a second dose**. Set a timer. Watch a movie. Do something other than scrutinize how you feel. Patience is the load-bearing skill with edibles.

## What overshoot feels like

An edible overshoot is uncomfortable rather than dangerous. Common symptoms: racing heart, anxiety or paranoia, dry mouth, dizziness on standing, intense focus on body sensations, distorted time perception, a strong urge to sleep that resists sleeping. The experience peaks for 1-3 hours and tapers over the next several hours.

If you’ve overshot:

- **Hydrate.** Water, juice, anything non-cannabis.
- **Eat something light.** Crackers, fruit, a sandwich. Food in the stomach helps.
- **Sit or lie somewhere safe.** Dim the lights. Put on calm music.
- **Don’t drive.** The 5 ng/mL active-THC blood limit applies the same way it does to flower (per Washington RCW 46.61.502).
- **Don’t add more cannabis** thinking you can "balance it out." More THC makes it more intense, not less.
- **Some people find that black pepper helps** — a few twists into a glass of water. The beta-caryophyllene in pepper is hypothesized to soften the experience for some consumers. Not a guarantee; it costs nothing to try.
- **Wait it out.** The peak passes. The experience always passes. You will be okay.

If symptoms ever escalate to chest pain, persistent vomiting, or anything that genuinely scares you, call a doctor or visit an ER. Cannabis is not lethal at any realistic dose, but a panicky overshoot can mask or coincide with an unrelated medical issue.

## Format matters

Different edible formats absorb at different rates:

- **Hard candies / lozenges** dissolved in the mouth absorb partly through the cheek tissue (faster onset, sometimes 30-60 minutes) in addition to digestive absorption.
- **Beverages** absorb faster than solid food (often 30-60 minutes to peak).
- **Gummies and chocolates** are the classic 60-90 minute curve.
- **Capsules** can be slower (90-120 minutes) because they have to dissolve before digestion starts.

The label on the package usually indicates expected onset. Treat it as a guide, not a stopwatch — individual metabolism varies.

## A practical first edible

Walk in. Tell the budtender it’s your first edible. They’ll point at a 10 mg-per-piece gummy. Cut one in half before you start. Take 5 mg. Set a 2-hour timer. Don’t eat the other half during those 2 hours regardless of how you feel. After 2 hours, decide whether you want the other half. If yes, take it. If no, save it for next time.

The other rule worth pinning: have a non-cannabis snack and water on hand before you start. Setup matters more than dose for a good first experience.`,
    faqs: [
      {
        q: "How long do edibles take to kick in?",
        a: "60-90 minutes for most gummies and chocolates. Hard candies dissolved in the mouth can be faster (30-60 minutes); capsules can be slower (90-120 minutes). Eating a heavy meal beforehand extends onset.",
      },
      {
        q: "What’s a safe first dose?",
        a: "2.5-5 mg of THC. Many 10 mg gummies can be cut in half. Wait two full hours before taking more.",
      },
      {
        q: "I took too much. Now what?",
        a: "Hydrate, eat something light, sit somewhere safe, don’t drive, don’t add more cannabis. The peak passes within 1-3 hours. If symptoms ever scare you, call a doctor.",
      },
      {
        q: "Why do edibles feel so much stronger than smoking?",
        a: "Edibles get processed through the liver and converted to 11-hydroxy-THC, a metabolite that for many people delivers a noticeably stronger subjective effect than the inhaled delta-9 THC from smoking. The path is slower, the peak is longer, and the dose-to-experience ratio shifts.",
      },
    ],
    relatedTopics: ["lab-panel-coa", "indica-sativa-hybrid", "first-time-visitor"],
  },
  {
    slug: "edibles-dosing",
    eyebrow: "Edibles, the honest version",
    title: "Edibles dosing, the honest version",
    description:
      "Edibles take 60-90 minutes to hit. Start at 2.5 mg THC and wait two full hours before considering a second dose. Honest dosing math from Green Life.",
    body: `Edibles are the easiest way to have a long, uncomfortable evening if you get the math wrong. They're also the easiest, most reliable way to have a good one if you get it right. Here's the math.

## The number to remember: 2.5 mg

For a first-time customer — or someone coming back after a long break — 2.5 milligrams of THC is plenty. Most edibles in Washington come in 5 mg or 10 mg pieces (the state caps a single piece at 10 mg and a whole package at 100 mg). Cut the 5 mg gummy in half. That's your starting dose.

Why so low? Because edible-THC is processed by the liver into a compound that's roughly four to five times more potent than the THC you'd get from smoking. The "I smoke regularly so I'll be fine on a 10 mg gummy" calculation almost never holds up. Different mechanism, different math.

## Wait 90 minutes — actually wait

Edibles take 60 to 90 minutes to fully come on. Longer if you ate a heavy meal first. Shorter if you took it on a near-empty stomach. The most common dosing mistake we hear about at the counter goes like this:

"I took a 10 mg gummy. Nothing happened for 30 minutes. So I took another. Then the first one hit and I was way past where I wanted to be."

If you don't feel anything at 30 minutes, that's normal. If you don't feel anything at 60 minutes, that's still normal. Two hours is the right window before you make any decision about a second dose.

## A starting menu

These are the dose levels we describe at the counter. Where you land depends on tolerance, body chemistry, what you ate, and what you're after.

- **2.5 mg** — first-timer, returning after a break, low-tolerance. Detectable, not overwhelming. A glass of wine equivalent for most people.
- **5 mg** — Washington's per-piece cap. Comfortable for occasional users. Noticeable.
- **10 mg** — regular consumer territory. New users should rarely start here.
- **20 mg+** — high-tolerance regulars. Not a starter dose. Ever.

Always read the package — the per-piece dose is on the front, and the per-package total is on the back. A 100 mg gummy bag with 10 pieces is 10 mg per piece. A 100 mg chocolate bar scored into 20 squares is 5 mg per square.

## What to do if you are too high

It happens. Here's what helps and what doesn't.

- **Helps:** sit down, drink water, eat something with protein or carbs, put on a familiar show, breathe.
- **Helps:** CBD. Some people reach for a 10 mg CBD tincture or gummy alongside the THC. Worth keeping a bottle around if you dose with edibles often.
- **Doesn't help:** caffeine, sugar alone, lying down in the dark with anxious thoughts running. The ride is going to last another two to four hours regardless. Set yourself up for it.

It's uncomfortable. It's not dangerous. There has never been a recorded fatal overdose from cannabis. The worst case is "I never want to do that again," not the ER.

## Pairings and form factors

Beyond gummies, edibles come in:

- **Chocolates** — usually scored into 5 or 10 mg squares; melt-in-mouth onset can be slightly faster.
- **Drinks and shots** — 10 mg micro-shots are increasingly common; onset is often the fastest of any edible because of liquid absorption.
- **Baked goods** — cookies, brownies, rice crispies. Usually 10 mg single-serve.
- **Tinctures** — drops under the tongue. Faster than swallowed edibles (15-45 minutes) because of sublingual absorption.

If you want predictability, gummies and chocolates are the best choices — uniform dosing per piece. Drinks and tinctures kick in faster but the lower-onset-time means timing matters more.

## What we do at the counter

When a first-time customer asks for an edibles recommendation, we walk through three things: tolerance, intent (sleep, social, mood, recovery), and how long the experience needs to last. We'll usually pull two or three options at different dose levels and walk you through which we'd start with. The 2.5 mg starting dose isn't us being conservative — it's the math.

Ask. We'd rather have you in here ten minutes longer at the counter than dosed wrong on the couch.

This information is general cannabis education for adults 21 and over. We're not making medical claims, and edibles affect every person differently. If you have questions about how cannabis interacts with prescription medications, that's a conversation for your doctor.`,
    faqs: [
      {
        q: "What's a safe first edibles dose?",
        a: "2.5 mg THC. Cut a 5 mg gummy in half. That's plenty for a first-time customer or someone coming back after a long break. Tolerance to smoking does not automatically translate to tolerance for edibles.",
      },
      {
        q: "How long do edibles take to kick in?",
        a: "60 to 90 minutes for most gummies and chocolates. Longer if you ate a heavy meal first; shorter on an empty stomach. Wait two full hours before considering a second dose.",
      },
      {
        q: "I took too much. What do I do?",
        a: "Sit down, drink water, eat something with protein or carbs, put on a familiar show, breathe. Some people reach for a CBD tincture or gummy. Don't drive. The peak passes in 1 to 3 hours; the whole experience runs 4 to 6 hours.",
      },
      {
        q: "Why are edibles stronger than smoking the same amount?",
        a: "Edibles get processed through the liver and converted to 11-hydroxy-THC, a metabolite that for many people delivers a noticeably stronger subjective effect than inhaled delta-9 THC. The path is slower, the peak is longer, and the dose-to-experience ratio shifts.",
      },
    ],
    relatedTopics: ["edibles-dosing-101", "microdosing", "first-time-visitor"],
  },
  {
    slug: "rso",
    eyebrow: "RSO explained",
    title: "What is RSO?",
    description:
      "RSO ('Rick Simpson Oil') is a thick whole-plant cannabis extract sold in Washington dispensaries as a syringe or capsule. What it is and how to read the label.",
    body: `RSO stands for "Rick Simpson Oil" — a whole-plant cannabis extract named after the Canadian who popularized the method in the early 2000s. In a Washington dispensary, RSO is one of the most concentrated products on the shelf, usually sold in a 1-gram syringe or in capsule form.

## What's actually in it

RSO is made by soaking cannabis flower or trim in a food-grade solvent (typically grain alcohol), then evaporating the solvent off. What's left is a thick, dark, tar-like oil that contains the full spectrum of cannabinoids and terpenes from the original plant — not just isolated THC.

Two things follow from that:

- **It's potent.** A typical RSO syringe is 60-90% total THC. For comparison, dispensary flower is 18-28% THC; vape cartridges run 60-90%. A "rice grain" amount of RSO — about a quarter of a 0.1 mL line — contains roughly 25 mg of THC. That's two and a half full edible servings.
- **It's whole-plant.** Distillate vape cartridges are usually THC isolated and re-suspended; RSO keeps the original cannabinoid and terpene profile. Some customers specifically prefer RSO for the "entourage effect" — the idea that cannabinoids and terpenes work together — though research on the entourage effect is still developing.

## How people commonly use it

RSO is dispensed with a graduated syringe so you can dose by volume. A tenth of a milliliter (0.1 mL) is the smallest reliable measurement.

The most common methods:

- **Sublingual** — dose under the tongue, hold for 30-60 seconds, then swallow. Onset is faster than a swallowed edible (15-45 minutes) because some absorbs through the mucosa directly.
- **Capsules** — pre-measured RSO inside a soft gel. Onset is the same as any swallowed edible (60-90 minutes). Easier dosing math.
- **Topical** — spread on skin. Doesn't cause a high; most of the cannabinoids stay in the local tissue.

Customers who ask about RSO at the counter usually fall into two groups: experienced consumers looking for the strongest delivery format the legal market sells, and people exploring whole-plant cannabis after talking to their doctor. We're not in the second conversation — we sell what's on the shelf, we describe what's on the label, and we don't make medical claims. If RSO is part of a treatment conversation, it's a conversation for your doctor.

## Reading the RSO label

Every RSO product in Washington has a Certificate of Analysis from a licensed lab. The numbers to look at:

- **Total THC %** — typically 60-90%. Higher isn't always "better" — the terpene profile and the strain it was extracted from matter for the experience.
- **Total CBD %** — RSO comes in THC-dominant, CBD-dominant, and 1:1 versions. CBD-dominant or 1:1 RSO has different effects than THC-dominant.
- **Strain or "blend"** — most RSO is a blend of trim from multiple harvests; some producers extract from a single strain (single-strain RSO is rarer, often more expensive).
- **Producer name** — the licensed Washington company that made it. We can tell you which producers we've stocked the longest if that's useful.

## What we will and won't say

We'll happily walk you through dosing math, label reading, and how RSO compares to other concentrates. We'll point you toward the producers we trust.

We won't tell you RSO will treat any specific condition. We can't — Washington's WAC 314-55-155 prohibits cannabis retailers from making efficacy claims, and even if it didn't, RSO is not a substitute for medical advice. If you're considering RSO as part of treating a condition, talk to your doctor first.

This information is general cannabis education for adults 21 and over. We're not making medical claims about RSO. If you're considering RSO as part of treating a medical condition, that's a conversation for your doctor.`,
    faqs: [
      {
        q: "Is RSO the same as FECO or QWET?",
        a: "Not exactly. FECO ('Full Extract Cannabis Oil') and QWET ('Quick Wash Ethanol') are similar whole-plant extraction methods. The output is broadly similar; the specifics of the wash time, the strain selection, and the post-processing vary. Most customers use the terms interchangeably.",
      },
      {
        q: "Can I cook with RSO?",
        a: "Yes. It's already decarboxylated (heat-activated) during extraction, so it works in recipes without baking. Mix into honey, oil, or a fatty food. The rice-grain dose still applies.",
      },
      {
        q: "How long does an RSO syringe last?",
        a: "A 1-gram syringe holds 1,000 mg of dose. At a beginner dose of 10 mg per use, that's 100 doses. Most customers spend a syringe over weeks or months, not days.",
      },
      {
        q: "Is RSO regulated the same way as flower or edibles?",
        a: "Yes. It's a Washington recreational cannabis product, sold only in licensed dispensaries to adults 21+. Same possession limits, same testing requirements, same purchase caps.",
      },
    ],
    relatedTopics: ["coa", "edibles-dosing", "medical-vs-recreational-wa"],
  },
  {
    slug: "coa",
    eyebrow: "Reading the lab panel",
    title: "How to read a Certificate of Analysis (COA)",
    description:
      "Every Washington cannabis product ships with a Certificate of Analysis. Plain-English walkthrough of cannabinoid panels, terpenes, and pesticide testing.",
    body: `Every cannabis product sold in a Washington dispensary has been tested by a state-licensed lab. The result of that testing is a Certificate of Analysis — a COA — that lists what's in the product and what isn't. We can pull a COA on most products on request. Here's what's on one and what each number is telling you.

## The five sections of a COA

A typical Washington cannabis COA has five panels of data plus a header. We'll walk through each.

## Header — who, what, when

The top of the COA names the producer (the licensed company that grew or made the product), the product (strain or formulation), the batch number, the harvest or production date, and the testing lab. The batch number is the trace-back ID — if the producer ever recalls a batch, that's the number that matches.

If you ever want to check whether a product on our shelf has a current COA, the batch number is what we'd look up.

## Cannabinoid panel — the headline numbers

This is the panel everyone looks at first. It lists the cannabinoids the lab tested for and the percentage by weight in the product. The two most common columns:

- **Total THC** — combined THC and THCA after decarboxylation. This is the "potency" number on the label.
- **Total CBD** — combined CBD and CBDA. CBD is non-intoxicating; CBD-heavy products have markedly different effects than THC-heavy ones.

Modern COAs increasingly list minor cannabinoids:

- **CBG** — often described as a focus-leaning, non-intoxicating cannabinoid. Common in low percentages.
- **CBN** — typically present in older flower and in sleep-marketed products. We say what's on the label, not what it does.
- **CBC** — even less common; non-intoxicating.

Some COAs split THC into "THCA" (the unactivated acid form, present in raw flower) and "Delta-9 THC" (the activated form, present after heat). When you smoke flower, the THCA converts to Delta-9 THC. Most product labels show "Total THC" as the headline.

## Terpene panel — the smell, the flavor, often the effect

Terpenes are aromatic compounds (cannabis has them; so do citrus, pine, lavender, basil — every plant). Most modern COAs test for 15-25 terpenes. The big ones:

- **Myrcene** — earthy, musky. Common dominant terpene in indica-leaning strains.
- **Limonene** — bright citrus. Often associated with uplift.
- **Pinene** — pine-forward. Often associated with focus and clear-headedness.
- **Linalool** — floral, lavender-like. Often associated with calm.
- **Caryophyllene** — peppery. Unusual among terpenes in that it directly binds CB2 receptors.
- **Terpinolene** — fruity-floral. Common in head-leaning sativas.

Total terpene percentage matters for the experience as much as THC percentage. A 20% THC flower with 3% total terpenes will usually outperform a 28% THC flower with 0.5% total terpenes for most consumers — terpene content is what gives the flower its smell and shapes how the high feels.

## Pesticide panel — pass/fail by analyte

Washington requires every batch to test below threshold for a list of pesticides. The COA lists each pesticide tested and either a numerical concentration (in parts per billion) or "ND" (not detected) or "Pass / Fail." Anything that fails is destroyed at the producer level — it never reaches a dispensary shelf.

Pesticides commonly tested for include myclobutanil, abamectin, bifenazate, imidacloprid, and ~40 others. Most COAs show a clean pass-line with all 40+ analytes at "ND" — that's what a clean test looks like.

## Microbiological panel — pass/fail for living contaminants

This panel tests for total yeast and mold, total aerobic bacteria, salmonella, E. coli, and aspergillus. Same pass/fail mechanic — anything that fails doesn't ship.

Aspergillus is the one most worth knowing about for medical-cannabis-curious customers — it's a mold whose spores can cause respiratory infection in immunocompromised people. WA tests for it and rejects on detection. That's a meaningful safety floor.

## Heavy metals + residual solvents — pass/fail again

Heavy metals (lead, cadmium, arsenic, mercury) can accumulate in cannabis from the soil. Tested every batch.

For concentrates and vape cartridges, there's an additional residual solvents panel — testing for leftover butane, propane, ethanol, hexane, and other solvents that were used during extraction. Pass/fail again.

## What "premium" looks like on a COA

When we describe a product as premium, here's what we're usually pointing at on the COA:

- **Total terpenes greater than 2%** — high terpene content correlates with full flavor and complete high.
- **Total cannabinoids greater than 22%** — strong but not hot-housed; mid-20s on flower is the sweet spot.
- **All pesticide / microbio / heavy-metal panels showing ND across the board** — clean baseline.
- **Single-strain extraction** — for concentrates, the COA shows the extract was made from a single strain, not blended trim.

Fail any of those and we'd describe it as "fine, gets the job done" rather than premium. We don't sell anything that fails the state-required panels — every product on our shelves passes those by definition. The "premium" call is the next tier above that floor.

## Asking us for a COA

Producer COAs sit on a shared portal. If you want to see one for a product you're considering, ask the budtender — we can usually pull it up in under a minute. Useful when you want to know the dominant terpene, the exact CBD level, or the batch date.

This information is general cannabis education for adults 21 and over. WAC 314-55-102 lays out Washington's required testing standards; the full list of analytes and thresholds is on the Washington State Liquor and Cannabis Board's website.`,
    faqs: [
      {
        q: "Where do I find the COA for a product I already bought?",
        a: "Use the batch number printed on the label. Many processors post COAs on their websites searchable by batch; the rest provide them on request through the retailer. We can pull the COA for any product on our shelves.",
      },
      {
        q: "What's the difference between THCA and Total THC?",
        a: "THCA is the raw acid form found in unheated flower; Total THC accounts for what THCA becomes when heated (decarboxylated) plus any active delta-9 THC already present. The Total THC number is the one to compare across products.",
      },
      {
        q: "What does it mean if the terpene panel is missing?",
        a: "Not every Washington lab runs a full terpene panel on every batch. The strain still has terpenes; the data just wasn't included on this particular COA. Ask a budtender; we often know the terpene-dominant profile from prior batches.",
      },
      {
        q: "What's the most important number on a COA?",
        a: "Depends on what you're shopping for. Total THC and CBD set baseline potency. Total terpenes (when listed) often predicts the experience better than THC alone. For concentrates and vapes, the residual solvents panel is the safety floor worth scanning.",
      },
    ],
    relatedTopics: ["lab-panel-coa", "indica-sativa-hybrid", "rso"],
  },
  {
    slug: "first-visit",
    eyebrow: "First visit, walked through",
    title: "Your first time at a dispensary, walked through",
    description:
      "Never been to a dispensary? Here's what happens, start to finish — from the door, to the ID check, to the budtender at the counter. Plain-English first-visit guide.",
    body: `First-time customers ask us the same three things at the door: "Do you check ID?" "How does the menu work?" "What do you recommend?" Here's what actually happens, start to finish, so the visit is not your first time figuring it out.

## At the door — ID check, no exceptions

You'll show your ID before you walk past the lobby. We're required by Washington State law to verify everyone's age every visit, even if you've been here a hundred times. Anyone under 21 cannot enter the retail floor — including kids in strollers. (We know. The law is the law.)

What works as ID: a Washington driver's license, an out-of-state driver's license, a US passport, a US passport card, a military ID, or a Tribal ID with a date of birth. What doesn't work: an expired ID, a photo of an ID, a temporary paper ID without a photo.

If your ID is vertical (i.e. issued to you when you were under 21) and you're now over 21, that still counts — but we'll look closely at the date of birth, because the state pays close attention to vertical-ID transactions and so do we.

## On the floor — what the menu looks like

A typical Washington dispensary menu is broken into seven or eight categories:

- **Flower** — the bud, sold by weight (eighth, quarter, half, ounce).
- **Pre-rolls** — joints, already rolled. Single or multi-pack.
- **Vapes** — cartridges and disposables.
- **Concentrates** — wax, shatter, live resin, rosin (used with a dab rig).
- **Edibles** — gummies, chocolates, drinks, baked goods.
- **Tinctures** — drops, sublingual.
- **Topicals** — lotions, balms (most don't get you high).
- **Accessories** — papers, lighters, batteries, dab tools.

You can browse the menu on your phone before you walk in (it's at /menu — same products you'll see in the case), or take it slow at the counter.

## At the counter — what to ask a budtender

The most useful thing a first-time customer can say is some version of:

"I haven't done this in a while," or "I'm new — what would you recommend?"

We're not going to push you toward the most expensive thing on the shelf. We're going to ask three questions:

1. **Tolerance.** Have you used cannabis before? When was the last time?
2. **Intent.** What are you hoping it does? Sleep, social, focus, recovery, just curious?
3. **Format.** Do you want to smoke, vape, eat, or drop something under your tongue?

From those three answers, we can usually narrow to two or three products. We'll tell you what we'd start with and why. We'll usually steer you toward a smaller-quantity / lower-dose product on a first visit — it's better to come back next week with a follow-up question than to dose wrong on day one.

The thing first-timers are most often surprised by: how willing we are to talk. Take 10 minutes. Ask the dumb-feeling question. We've heard it.

## At the till — cash, ATM, the math

We're cash-only — every Washington dispensary is, because cannabis is federally illegal and the major card networks won't process for our category. There's an ATM in the lobby; expect a $3 surcharge typical for a cannabis-store ATM. Bring extra and you'll be fine.

If you signed up for our customer system (we ask once at the counter — it's a phone number or email, not a "loyalty card") you'll see your visits add up over time and you'll get the email or text discount we run on your account.

You don't have to sign up. Plenty of customers don't. But when first-time customers ask, we usually pitch the signup with: "Sign up real quick — first visit's 30% off and you'll be in the system for next time."

## On the way out — what's in the bag

Your products go in an opaque exit bag — Washington requires it, no branded packaging visible. The receipt's in the bag. If you ordered online, your order is already staged with your name on it.

What's NOT in the bag: medical advice, dosing guarantees, anything we promised would treat or cure something. We don't make those claims. We can't, legally, and even if we could, every person's body chemistry is different. What's in the bag is what's on the label.

## In the parking lot — don't open it here

Washington law prohibits consuming cannabis in any public space, including dispensary parking lots, sidewalks, parks, and most outdoor areas. The product is sealed in the exit bag for a reason — it's labeled for transport, not for use on-site.

Some specific things we want first-timers to know:

- **Don't open the bag in the parking lot.** Even smelling the package can trigger a complaint. Wait til you're home.
- **Don't smoke or vape in the lot.** Same issue, more obvious.
- **Driving impaired is a DUI** under Washington law, same as alcohol. If you've consumed, get a ride.

## After your first visit

Most first-time customers come back within two weeks. The most common feedback we get on a second visit:

"I should have asked you sooner."

Right answer is to ask. Wrong answer is to guess.

If something didn't work the way you expected — wrong dose, wrong format, wrong strain feel — tell us when you come back. We can usually narrow to a better fit on the second try.

Welcome to the shop.`,
    faqs: [
      {
        q: "What ID do I need to bring?",
        a: "A valid 21+ government photo ID. Washington accepts in-state and out-of-state driver's licenses, US passports, US passport cards, military IDs, and Tribal IDs with date of birth. Expired IDs, photos of IDs, and paper temporary IDs do not work.",
      },
      {
        q: "Can I bring a friend who is under 21?",
        a: "No. Washington WAC requires every person on the retail floor to be 21+ with valid ID. That includes infants and children. Anyone under 21 has to wait outside or in the car.",
      },
      {
        q: "How much should I expect to spend on a first visit?",
        a: "Plan on $20-50 total. That covers a single edible, a pre-roll, a small eighth of flower, or a starter cartridge — enough to try something without overcommitting. You can always come back next week.",
      },
      {
        q: "Do I have to know what I want before I walk in?",
        a: "No. The most useful thing a first-time customer can say is 'I'm new — what would you recommend?' A budtender will ask about tolerance, intent, and format, then narrow to two or three options.",
      },
    ],
    relatedTopics: ["first-time-visitor", "edibles-dosing", "cash-only-dispensaries"],
  },
  {
    slug: "microdosing",
    eyebrow: "Microdosing edibles",
    title: "Microdosing edibles: what it is, what’s on the shelf",
    description:
      "Microdosing means using small doses (1-2.5 mg THC) to feel a subtle shift without getting high. What's on the Washington dispensary shelf and how to start.",
    body: `Microdosing means using a small enough cannabis dose that you don't actually get high — just a subtle shift you can carry through your day. The word borrows from the psychedelic-research community where it originated; in cannabis context it usually means 1 to 2.5 milligrams of THC at a time. Here's what's on the dispensary shelf if you want to try it, and what to know before you do.

## What microdose products look like

Washington dispensaries carry several edibles formats specifically for low-dose use:

- **2 mg or 2.5 mg gummies** — single-piece dose, no math required. Common formats: small fruit-flavored gummies in 20-piece bags.
- **5 mg gummies that score in half** — most 5 mg gummies will split cleanly into two 2.5 mg halves. Cheaper per mg than purpose-made 2.5 mg products.
- **1:1 CBD:THC chocolates** — a 5 mg THC + 5 mg CBD chocolate gives you a "softer" experience than 5 mg THC alone; the CBD takes some of the edge off.
- **Tinctures** — drops let you measure to the milligram. A typical tincture is 10 mg/mL, so 0.1 mL under the tongue is 1 mg. Useful for fine-tuning.
- **Mints + microdose lozenges** — pre-portioned at 2 to 2.5 mg per piece.

The two cleanest entry points for a microdoser: 2.5 mg gummies (no measuring) or a 10 mg/mL tincture (full control).

## A typical microdosing rhythm

Customers who microdose usually report doing it one of three ways:

- **Once-daily** — one 2.5 mg piece in the late afternoon. No math, no decision-making mid-day.
- **Twice-daily** — 1 mg or 2 mg morning + 2 mg evening, separated by 6+ hours. Tincture is easier for this.
- **As-needed** — a single low dose before a long walk, before bed, before social plans, etc.

Find your dose first, then find your rhythm. Almost everyone who tries microdosing for the first time underestimates how subtle the effect is — there's no high, just a shift. If you're hoping for a noticeable buzz, you're not looking for a microdose; you're looking for a regular edible (see our edibles dosing guide).

## What microdosing is and isn't

We can describe what's on the label and what customers commonly use it for. We can't make claims about what it treats. That said, here's a useful reframe:

- **Microdosing is:** a way to use cannabis with little or no perceptible high. Subtle. Consistent. Sometimes paired with daily life rather than a "session."
- **Microdosing isn't:** a substitute for medical advice, a guaranteed treatment for any condition, or a "cure" for anything. If you're considering microdosing as part of treating a specific health issue, that's a conversation for your doctor.

We don't know whether microdosing will work for you. We know what dose levels customers report success with. We know what products on our shelf are well-suited for it. Beyond that, it's an experiment of one — your body, your tolerance, your math.

## What to expect (and what not to)

If you take a 2.5 mg microdose:

- You will not feel "high" in the recreational-dose sense.
- You may notice a subtle mood shift — slightly more relaxed, slightly more focused, slightly less anxious — within 60-90 minutes.
- The effect lasts 2-4 hours, then fades cleanly.
- You can drive within an hour or two for most people, but the same DUI rule applies. If you're feeling anything, don't drive.

If you DO feel high on a 2.5 mg dose, you have unusually low tolerance. That's not bad news — it means a smaller dose works for you. Drop to 1 mg next time.

## Tolerance — the catch

The thing nobody mentions about microdosing: tolerance still builds. If you microdose every day for two weeks, the effect at week-three is dimmer than the effect on day-one. Most regular microdosers take a "tolerance break" — a few days off — every couple of weeks. Helps reset baseline.

## Asking us about it

If you want to start microdosing, the question to ask the budtender is some version of:

"What's the lowest-dose edible you carry?"

We can pull two or three products at the 2 mg / 2.5 mg level and walk you through the differences (full-spectrum vs. distillate, gummy vs. chocolate vs. tincture, indica- vs. sativa-leaning). The pick depends on what you're after. Ask.

This information is general cannabis education for adults 21 and over. We're not making medical claims about microdosing. If you're considering microdosing as part of treating a medical condition, talk to your doctor first.`,
    faqs: [
      {
        q: "What counts as a microdose of THC?",
        a: "Generally 1 to 2.5 milligrams of THC at a time. That's low enough that most people don't feel intoxicated — the shift is subtle, like a slight mood change or relaxation, rather than a recognizable high.",
      },
      {
        q: "What products are best for microdosing?",
        a: "Two clean entry points: pre-made 2.5 mg gummies (no measuring required) or a 10 mg/mL tincture (full control, easy to titrate). 1:1 CBD:THC chocolates are a softer alternative for people who notice 2.5 mg THC on its own.",
      },
      {
        q: "Does tolerance build with microdosing?",
        a: "Yes. Daily microdosing dims the effect over time. Most regular microdosers take a tolerance break — a few days off — every couple of weeks to reset baseline.",
      },
      {
        q: "Can I drive after a microdose?",
        a: "Washington's 5 ng/mL active-THC blood limit applies regardless of dose size. Most people are below threshold within an hour or two of a 2.5 mg dose, but if you're feeling anything, don't drive.",
      },
    ],
    relatedTopics: ["edibles-dosing", "edibles-dosing-101", "cannabis-driving-wa"],
  },
  {
    slug: "sleep",
    eyebrow: "Cannabis and sleep",
    title: "Cannabis and sleep: what’s on the shelf, what we won’t claim",
    description:
      "Customers ask about sleep more than any other use-case. Here's what's on the Washington dispensary shelf and what WAC 314-55-155 prevents us from claiming.",
    body: `"What do you have for sleep?" is the question we hear most. It's also the question we have to answer most carefully, because Washington's WAC 314-55-155 prohibits cannabis retailers from making medical or efficacy claims — including "this will help you sleep." We can't promise that. What we can do is describe what's on the shelf and what the labels say. Below is the honest version.

## What customers asking about sleep usually mean

When a customer asks about sleep, they usually mean one of three things:

1. **"I have trouble falling asleep"** — busy mind, racing thoughts, can't wind down.
2. **"I have trouble staying asleep"** — wake up at 3 AM, can't get back down.
3. **"I want to feel rested when I wake up"** — slept fine but morning is rough.

Different products tend to fit different patterns. We'll describe each below — but we're describing what's on the label and what customers commonly choose, not making promises about results.

## Indica-leaning flower

The "indica = body, sativa = head" rule of thumb is loose, but for sleep-curious customers we usually point at indica or indica-dominant hybrids with a high myrcene content. Myrcene is the dominant terpene in many sleep-marketed strains. Strains we'd typically pull for this question: Granddaddy Purple, Northern Lights, Bubba Kush, Wedding Cake. Whether any of them work for your sleep is your body's call, not ours.

## CBN edibles + tinctures

CBN (cannabinol) is a minor cannabinoid that increases as cannabis ages. It's often featured in sleep-marketed edibles — typically a 5 mg THC + 5 mg CBN gummy, sometimes with melatonin added.

Two things to know:

- The research base on CBN for sleep is small and the studies are mixed. Some people report a dim, body-heavy sedation; others notice no effect.
- "CBN for sleep" is in heavy marketing rotation at the moment; we carry the products, we describe them, we won't tell you they'll work.

## 1:1 or CBD-dominant tinctures and edibles

Some customers find that a CBD-heavy product without a strong THC dose helps wind down without the high. Common formats: 10 mg CBD + 2 mg THC, 1:1 tinctures, and 10 mg CBD-only capsules. CBD doesn't intoxicate; the experience is closer to a calmer baseline than a high.

## Lower-THC pre-rolls and small bowls

Some customers find a single small dose of inhaled cannabis 30 minutes before bed works better for them than an edible (faster onset, faster fade — easier to dial). Smoke or vape isn't for everyone, but it's worth mentioning as an option. THC effect on inhaled cannabis peaks at about 30 minutes and fades by 2-3 hours; edibles peak later and last longer.

## Topicals — generally not for sleep

Topicals don't cross the skin into the bloodstream meaningfully (most don't get you high; the cannabinoids stay in the local tissue). They're not the right category for sleep-related questions. If a topical is being marketed for sleep, the marketing's outpacing the chemistry.

## What we will NOT claim

We will not tell you any cannabis product:

- Will fix your sleep.
- Cures, prevents, or addresses any sleep disorder.
- Is "as good as" or "an alternative to" prescription sleep medication.
- Will work for your specific situation.

These are statements we're prohibited from making by Washington State retail-cannabis advertising rules (WAC 314-55-155), and they're statements we couldn't honestly make even if we were allowed to — sleep is complicated, biology is individual, and cannabis interacts with other medications and conditions in ways we are not your doctor.

## What we WILL say

- Customers ask us about sleep more than any other topic at the counter.
- Customers ask about CBN, indica-leaning strains, and 1:1 edibles most frequently.
- Customers tell us what worked for them on follow-up visits, which informs what we describe to the next customer asking.
- We carry products specifically marketed and labeled for sleep. We carry alternatives for customers whose first try didn't fit.

## If sleep is a real medical issue

Persistent sleep problems are worth a conversation with your doctor — they can have causes (apnea, anxiety, medication interactions) that cannabis won't address and might worsen. Cannabis is not a substitute for diagnosis. We're a retail dispensary; we sell what's on the shelf and describe what's on the label. Anything beyond that is a doctor conversation.

## Asking us at the counter

The honest question to ask a budtender if you're sleep-curious is some version of:

"What's been working for other customers asking about sleep?"

That gets you a description of what we've stocked and what regulars come back for. It doesn't get you a promise. That's the right shape of conversation.

This information is general cannabis education for adults 21 and over. We're not making medical claims about cannabis and sleep, and nothing here substitutes for medical advice from your doctor.`,
    faqs: [
      {
        q: "What products do customers ask about most for sleep?",
        a: "CBN edibles (often paired with THC and sometimes melatonin), indica-leaning flower high in myrcene, 1:1 CBD:THC tinctures or gummies, and lower-THC pre-rolls for inhaled use 30 minutes before bed. Different patterns fit different sleep complaints.",
      },
      {
        q: "Does CBN actually do anything for sleep?",
        a: "The research base is small and the studies are mixed. Some people report a body-heavy sedation; others notice no effect. We carry the products and describe what's on the label. We're prohibited by WAC 314-55-155 from telling you it will work for you.",
      },
      {
        q: "Why won't you just recommend something specific for sleep?",
        a: "Washington WAC 314-55-155 prohibits cannabis retailers from making medical or efficacy claims. We can describe what's on the shelf and what customers commonly choose. We can't tell you any product will treat or improve a specific condition, including sleep.",
      },
      {
        q: "Should I talk to my doctor before using cannabis for sleep?",
        a: "If sleep problems are persistent or disruptive, yes. They can have causes (apnea, anxiety, medication interactions) that cannabis won't address and might worsen. Cannabis is not a substitute for diagnosis. Use it after a doctor conversation, not instead of one.",
      },
    ],
    relatedTopics: ["edibles-dosing", "indica-sativa-hybrid", "medical-vs-recreational-wa"],
  },
  {
    slug: "pre-roll",
    eyebrow: "Cannabis basics",
    title: "What is a pre-roll?",
    description:
      "A pre-roll is a cannabis cigarette rolled and packaged by the producer. Here’s what’s inside one, how to read the label, and how the formats differ on a Washington dispensary shelf.",
    body: `## The one-sentence answer

A pre-roll is a cannabis cigarette — ground flower rolled inside a paper cone, finished with a small filter tip, and packaged ready to smoke. Producers do the rolling so the customer doesn’t have to.

## What’s inside one

The contents of a pre-roll vary by producer, and the label is the honest record. The three things worth checking before you buy:

- **What flower** — single-strain (one strain only) or blend (multiple strains, often labeled "house blend" or by lineage). Single-strain pre-rolls behave like the strain on the label; blends are designed to land somewhere in the middle.
- **What part of the plant** — top-shelf bud, trim (the leafy cuttings from harvesting bud), or shake (the loose flower that breaks off larger nuggets during packaging). Top-shelf rolls smoke smoother; trim and shake rolls cost less but tend to burn hotter or unevenly.
- **Whether it’s infused** — some pre-rolls are infused with kief, hash, distillate, or rosin to push the THC percentage higher. Infused pre-rolls hit harder and burn slower than standard ones. The label will say.

The COA (Certificate of Analysis — see the COA explainer) reports the total THC by weight. Standard pre-rolls land in the 18-28% range, the same as the flower they were made from. Infused pre-rolls can run 30-45%.

## Sizes on the shelf

Washington pre-rolls come in standard weights:

- **0.5 g** — the small format. Quick session, often sold as a single.
- **0.75 g** — middle weight. Common as a single or in 2-packs.
- **1 g** — the most common single size. About a 20-30 minute session for one person.
- **1.5 g and 2 g** — larger formats, marketed as "dogwalkers" or "blunts" depending on the paper. Usually shared.
- **Multi-packs** — five 0.5 g rolls in a tin is the classic pack; producers also sell 3-packs and 10-packs of smaller rolls.

The label states the weight per roll and the total package weight separately. Washington caps single-purchase flower (including pre-roll weight) at 28 g per transaction for recreational customers.

## How the paper changes the experience

Most pre-rolls use thin white rice paper or hemp paper. Some use unbleached paper (slightly hempier flavor). Blunts use tobacco-leaf or cannabis-leaf wraps and burn slower with a different mouthfeel. Cones with a glass tip or ceramic tip exist for customers who want a reusable mouthpiece.

The paper isn’t a tax line — it shapes how the smoke draws and how clean the burn runs. If a pre-roll keeps going out (called "canoeing" when one side burns faster than the other), the paper quality, the grind, or the moisture content is usually the cause.

## Infused pre-rolls — read the label

"Infused" can mean several things, and the label will spell out which:

- **Kief-rolled** — the outside of the cone is rolled in kief (the trichome dust that falls off flower). Quick to make; bumps potency modestly.
- **Hash-coated** — the outside is coated in hash (concentrated trichomes). Stronger bump than kief.
- **Distillate-infused** — refined THC oil added to the flower before rolling. Pushes total THC into the 30-40% range. The flavor leans cleaner but more neutral than the underlying strain.
- **Live-resin or rosin-infused** — full-spectrum concentrate added in. Keeps more of the original strain’s terpene profile than distillate does; typically more expensive.

## How to shop for one

Three questions cover most of it:

- **How long is your session?** A 0.5 g lands somewhere around 15-20 minutes; a 1 g around 30. Match the size to the time you’ve got.
- **Single-strain or blend?** Single-strain if you already know what you like. Blend if you want something balanced and the producer’s reputation does the legwork.
- **Standard or infused?** Standard for everyday. Infused when the goal is a strong session in a short window.

Ask a budtender. We open the jar, you smell, we tell you the dominant terpene and the strain’s pattern. That tends to tell you more than the THC number on the front of the package.`,
    faqs: [
      {
        q: "Are pre-rolls just leftover trim?",
        a: "Some are, some aren’t. Budget pre-rolls often use trim and shake (the loose flower that breaks off during packaging). Top-shelf pre-rolls use full bud from the same strain on the jar. The label and price tell you which tier you’re looking at.",
      },
      {
        q: "Why are infused pre-rolls so much stronger?",
        a: "An infused pre-roll adds kief, hash, distillate, or rosin to the rolled flower. That pushes the total THC by weight from a flower-typical 18-28% up to 30-45%. The result is a stronger session per gram. Onset and timing are still the same as inhaled cannabis (peak around 15-30 minutes, taper over a few hours).",
      },
      {
        q: "How long does an unsmoked pre-roll keep?",
        a: "Stored in its packaging in a cool dark place, a pre-roll keeps for several months without meaningful degradation. After about six months the flower starts to dry out and the smoke gets harsher. A small humidity pack in the storage tin extends shelf life.",
      },
      {
        q: "Can I bring my own paper and just buy flower?",
        a: "Yes. Most customers who roll their own buy whole flower in 1 g, 3.5 g, or 7 g formats from the menu and roll at home. Pre-rolls are convenience — the producer did the grinding, rolling, and tipping for you.",
      },
      {
        q: "Are pre-rolls more or less expensive than rolling your own?",
        a: "Per gram, pre-rolls usually cost slightly more than the equivalent flower — the price covers the rolling labor and the paper. Multi-pack pre-rolls close the gap and are often the best per-gram value if you smoke them regularly.",
      },
    ],
    relatedTopics: ["indica-sativa-hybrid", "lab-panel-coa", "first-time-visitor"],
  },
  {
    slug: "rosin-vs-resin",
    eyebrow: "Concentrates basics",
    title: "Rosin vs live resin — what’s the difference?",
    description:
      "Rosin and live resin are both full-spectrum cannabis concentrates, but they’re made differently and they taste different. Here’s what each one is and how to pick.",
    body: `## The short version

Rosin is made with heat and pressure — no solvent. Live resin is made by extracting fresh-frozen cannabis with a hydrocarbon solvent (typically butane), then purging the solvent off. Both end up as full-spectrum concentrates that keep the original strain’s terpene profile; the path each one takes to get there is different, and so is the price and the texture.

## How rosin is made

Rosin presses use a heated plate and a hydraulic ram. Cured flower (or hash) goes between two pieces of parchment paper, the plates close at around 180-220°F, the ram applies a few thousand pounds of pressure, and resin pushes out from inside the trichomes. The result is a translucent amber or golden material that holds the strain’s smell almost completely intact.

What this process gets you:

- **No residual solvent** — there was never a solvent. The COA shows ND across the residual solvent panel by default.
- **Full terpene retention** — heat and pressure are gentle compared to chemical extraction; volatile terpenes survive.
- **Higher price per gram** — pressing is slow, the yield is modest (10-20% of starting weight is typical), and the input flower has to be top-shelf for the output to be good.

Rosin grades on a Washington shelf are usually labeled:

- **Flower rosin** — pressed straight from cured flower.
- **Hash rosin** — pressed from ice-water hash. Cleaner, more terpene-dense, typically the highest tier.
- **Live rosin** — pressed from fresh-frozen flower that was first turned into ice-water hash, then pressed. The "live" means the starting plant was frozen at harvest instead of dried and cured. The top of the rosin category.

## How live resin is made

Live resin starts with cannabis that was flash-frozen at harvest instead of dried. The frozen plant material gets washed with a hydrocarbon solvent (butane is the most common, sometimes propane or a butane-propane blend) inside a closed-loop extraction system. The solvent dissolves the cannabinoids and terpenes; the plant matter gets filtered out; the solvent is purged off with heat and vacuum. What’s left is the live resin.

What this process gets you:

- **High terpene retention** — flash-freezing locks in the terpene profile before drying can off-gas them. Live resin smells closer to fresh cannabis than any other concentrate.
- **Higher yield, lower per-gram cost than rosin** — closed-loop extraction is efficient. Producers can charge less and still profit.
- **Trace residual solvent** — the COA will list ppm values for butane, propane, and any other solvents used. Washington sets action limits; anything passing the panel is below those limits. ND ("not detected") is common on quality producers.

## Texture and naming

Both rosin and live resin come in a range of consistencies. Producers and customers use a lot of texture words:

- **Badder / batter** — whipped to a soft, malleable consistency. Easy to scoop.
- **Sauce** — wet, syrupy, with terpene-rich liquid pooled around small THCA crystals (called diamonds).
- **Diamonds and sauce** — crystallized THCA in a terpene sauce. Strongest THC reading on the shelf.
- **Sugar** — granular, sandy texture.
- **Shatter** — glass-like, brittle. Less common in live resin (the moisture content usually keeps it softer) and rare in rosin.
- **Jam / jelly** — semi-fluid, runs slowly. Common live-resin texture.

Texture is mostly cosmetic — it affects how the concentrate handles on a dab tool, not how it hits.

## Which one to pick

The most common reasons customers pick one over the other:

- **You want zero solvent involved at all** → rosin.
- **You want the strongest possible terpene preservation per dollar** → live resin (or live rosin if budget allows).
- **You want maximum flavor and you don’t mind paying for it** → hash rosin or live rosin.
- **You want strong concentrate at the lowest reliable price** → live resin in a 1 g jar from a producer with good COAs.

Both categories pass the same WA testing requirements. Both are full-spectrum (they keep the strain’s terpene profile) — distillate is the category that strips it down and re-suspends, and that’s a different conversation.

## Use formats

Concentrates of either type get consumed three ways:

- **Dab rig** — torch and nail (or e-rig with electronic heat). Most flavor, steepest learning curve.
- **Vape cartridge** — live resin and rosin both come pre-loaded in carts. Faster onset than dabbing, less terpene depth.
- **Topped on flower** — a small amount added to a bowl or pre-roll. Boosts the session without buying a rig.

Onset is fast for inhaled concentrates (15-30 minutes to peak, full taper over 2-4 hours), the same as smoking flower. Dose is small — a piece the size of a grain of rice is a typical first dab. Concentrates run 60-90% THC by weight, so the dose-to-effect ratio is shifted compared to flower.`,
    faqs: [
      {
        q: "Is rosin or live resin stronger?",
        a: "Both run in the 60-90% total THC range. Diamonds-and-sauce live resin and live hash rosin both top out near the same numbers. Strain choice and terpene profile shape the experience more than the small potency difference between the two categories.",
      },
      {
        q: "Why is rosin so much more expensive than live resin?",
        a: "Rosin presses use top-shelf flower or hash as input and the yield is modest. A producer needs more starting material per gram of output, and the labor per press is higher. Live resin runs through a closed-loop extractor that processes more plant material per hour and gets a higher yield, so the per-gram cost is lower.",
      },
      {
        q: "Is live resin safe? Solvent extraction sounds risky.",
        a: "Washington licensed extractors run closed-loop systems and the finished product is tested for residual solvents before it reaches a shelf. The COA shows the exact ppm for any solvent the lab detected. Products that exceed WAC action limits don’t ship. The safety floor is the same as for any other Washington concentrate.",
      },
      {
        q: "What’s the difference between live resin and cured resin?",
        a: "Live resin starts with fresh-frozen plant material (frozen at harvest, before drying). Cured resin starts with dried and cured flower. Live resin keeps more of the terpene profile that off-gases during the drying process; cured resin tends to taste more like the flower you would have smoked.",
      },
      {
        q: "Can I dab rosin in a vape cartridge?",
        a: "Most pre-filled cartridges are designed for a specific oil viscosity. Rosin and live resin sold as vape carts are formulated to flow through the cart’s wick and coil — not all rosin works in every cart. The label on a rosin cart or live resin cart tells you it’s been prepared for that format.",
      },
    ],
    relatedTopics: ["lab-panel-coa", "vape-cartridges-explained", "rso"],
  },
  {
    slug: "vape-cartridges-explained",
    eyebrow: "Vape cartridges",
    title: "Vape cartridges explained: distillate, live resin, and rosin carts",
    description:
      "Vape cartridges look identical on the shelf but the oil inside can be three very different things. Distillate, live resin, and rosin — what’s the difference and how to pick.",
    body: `## What a vape cartridge is

A vape cartridge — a "cart" — is a small glass or plastic chamber filled with cannabis oil, sealed at the bottom with a heating coil and a 510-thread connector. It screws onto a battery (or a disposable pen has the battery built in), the battery heats the coil, the coil vaporizes the oil, and the user inhales the vapor.

On the shelf, two carts can look identical and contain very different oil. The label says which.

## The three main oil types

Most carts on a Washington dispensary shelf fall into one of three categories.

### Distillate carts

The most common and the cheapest. Distillate is THC isolated from the rest of the cannabis plant — refined down to 80-95% pure THC and almost no terpenes. To give the cart flavor, producers re-add terpenes after the fact: either cannabis-derived terpenes (CDT) recovered during extraction, or botanical terpenes from other plants (limonene from citrus, myrcene from hops, etc.).

- **Strong** — total THC runs 75-90%.
- **Cheap** — usually the lowest per-gram price in the cart case.
- **Flavor leans neutral** — the re-added terpenes carry the flavor; some carts taste close to a candy or a fruit, less like cannabis.
- **Effect leans flat** — without the full terpene profile, distillate tends to feel more uniformly "high" across strains. Less of the variation between an indica and a sativa carries through.

### Live resin carts

Live resin oil from fresh-frozen cannabis (see the rosin-vs-resin explainer) loaded into a cart. The oil is full-spectrum — the cannabinoid and terpene profile of the source strain is preserved.

- **Mid-strength** — total THC runs 70-85%, slightly lower than distillate because some weight is real terpenes instead of THC.
- **More expensive than distillate** — usually $5-15 more per cart.
- **Flavor matches the strain** — if it’s a Blue Dream live resin cart, it tastes like Blue Dream flower vaped.
- **Strain experience shows through** — the indica/sativa/hybrid pattern lands more recognizably than with distillate.

### Live rosin carts

The top tier and the most expensive. Live rosin (see the rosin-vs-resin explainer) loaded into a cart. Same full-spectrum profile as live resin, with no solvent ever involved in the extraction.

- **Mid-strength** — similar range to live resin, 65-80% total THC.
- **Top of the cart-price range** — often double the price of a distillate cart of the same size.
- **Strongest flavor preservation** — most accurate to the source strain.
- **Smallest market share** — yield economics keep volume low.

## Hardware: the cart and the battery

The cart side has two pieces worth knowing about:

- **510-thread connector** — the screw-thread standard most carts use. Any 510 battery fits any 510 cart.
- **Coil material** — ceramic coils are the current default. Cotton-wick coils still exist but burn faster and tend to taste burnt sooner. Ceramic is what we usually steer customers toward.

The battery side:

- **Variable voltage** — most batteries have three or four heat settings. Lower voltage gives a cleaner-tasting hit; higher voltage gives a bigger cloud but burns through oil faster.
- **Preheat function** — a soft pre-warm that helps cold or thick oil flow before a draw. Useful in winter or with rosin carts.
- **Battery life** — a full battery usually lasts a couple of days of moderate use.

Disposable vapes have the battery built in and discard when empty. Refillable batteries with a separate cart cost less over time and produce less e-waste.

## Reading the cart label

Three numbers and one name on every label tell you most of what you need:

- **Oil type** — Distillate, Live Resin, Live Rosin, or Cured Resin. The biggest single label-read.
- **Strain** — single-strain (Blue Dream, Wedding Cake) or blend (often "Indica Blend," "Sativa Blend").
- **Total THC %** — the potency. Higher isn’t always better; live resin and live rosin trade some THC % for terpenes.
- **Producer name** — the licensed Washington company. Some producers have a long track record on carts specifically; we can tell you who we’ve stocked the longest.

The COA carries everything else — terpene panel, residual solvents (especially relevant for live resin), heavy metals (matters for the cart hardware as much as the oil).

## What to pick when

The most common reasons customers pick one type over another:

- **You want the cheapest reliable cart** → distillate from a producer with a clean COA.
- **You want the strain on the label to actually taste and feel like that strain** → live resin.
- **You want maximum flavor and budget isn’t the constraint** → live rosin.
- **You want a discreet, portable format** with onset like smoking → any of the three; the format matters more than the oil type for portability.

## A note on cart safety

Cart safety is mostly about the COA — residual solvents (live resin), heavy metals (any cart, comes from the hardware), and the pesticide panel. The 2019 EVALI illness cluster traced to unlicensed-market carts cut with vitamin E acetate; regulated Washington carts are tested for it and ND on the panel is the safety floor. Buying carts from a licensed dispensary that pulls COAs on request is the cleanest safety move.`,
    faqs: [
      {
        q: "Why are distillate carts so much cheaper than live resin?",
        a: "Distillate is a refined, high-THC oil that producers can make from less expensive input material (often trim or shake-derived). Live resin requires fresh-frozen flower and a closed-loop extraction setup, which costs more per gram. The price gap reflects the inputs and the process.",
      },
      {
        q: "Do live resin carts get me higher than distillate carts?",
        a: "On total THC percentage, distillate is usually a few points higher. On subjective experience, customers often report live resin feels more recognizable as the source strain because the full terpene profile is intact. Different shape of experience, not strictly stronger or weaker.",
      },
      {
        q: "How long does one cart last?",
        a: "A 1 g cart typically lasts a regular user one to three weeks. Battery setting, draw length, and how often you hit it all factor in. The cart visually empties as you go; some have measurement lines on the side.",
      },
      {
        q: "Are the terpenes in a distillate cart natural or artificial?",
        a: "Both options exist. Cannabis-derived terpenes (CDT) are recovered from cannabis during extraction and re-added. Botanical terpenes are isolated from other plants (citrus for limonene, hops for myrcene). Both are real terpenes; the label often says which the producer used.",
      },
      {
        q: "What’s the difference between a cart and a disposable vape?",
        a: "A cart screws onto a separate, reusable 510-thread battery. A disposable has the battery built in and gets discarded when the oil runs out. Disposables are slightly cheaper up front but cost more over time; carts plus a battery are the standard setup for regular customers.",
      },
    ],
    relatedTopics: ["rosin-vs-resin", "lab-panel-coa", "indica-sativa-hybrid"],
  },
];

/** O(1) slug lookup. */
const BY_SLUG = new Map(LEARN_HUB_TOPICS.map((t) => [t.slug, t]));

export function getLearnHubTopic(slug: string): LearnHubTopic | undefined {
  return BY_SLUG.get(slug);
}

/** Resolve a topic's hand-picked `relatedTopics` slugs into full
 *  LearnHubTopic rows for rendering. Silently filters unknown slugs so
 *  a typo in the SSoT doesn't crash the page; cap at 3 cards (the
 *  designed-for visual layout). */
export function getRelatedLearnHubTopics(topic: LearnHubTopic): LearnHubTopic[] {
  return topic.relatedTopics
    .map((s) => BY_SLUG.get(s))
    .filter((t): t is LearnHubTopic => t !== undefined)
    .slice(0, 3);
}

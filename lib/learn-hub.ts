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

Walk into any Washington dispensary and you’ll see the menu sorted into three buckets: indica, sativa, and hybrid. The labels come from 18th- and 19th-century botanical taxonomy. Cannabis indica plants were described as short and bushy with broad leaves; cannabis sativa plants as tall and lanky with narrow leaves. Over time the labels migrated from describing the plant to describing the perceived experience: indica leans body-heavy and relaxing, sativa leans head-forward and energetic, hybrid is somewhere between.

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

A strain labeled "sativa" that’s heavy in myrcene may land more like a classic indica. A strain labeled "indica" that’s heavy in limonene may land more like an uplifting sativa. The terpene panel on a lab sheet tells you more than the marketing label on the jar.

## How to shop with this in mind

Smell the jar. Most dispensaries (ours included) keep a sniff jar of every flower strain on the menu so customers can run their nose over the bud before buying. If a strain smells right to you — if you like the smell, find it interesting, want more of it — that’s a decent first signal that the chemistry suits you.

Ask the budtender. We work with these strains every day. Tell us what you’re looking for ("daytime focus," "winding down after work," "social with friends") and we’ll match by terpene profile, not just by the label on the lid.

## Edibles and concentrates blur it further

The indica/sativa label travels along with flower into edibles and concentrates, but the experience is mediated by the format. A 5mg indica gummy and a 5mg sativa gummy land more similarly than the same two strains smoked. Format, dose, and your own tolerance shape the experience as much as the strain category.`,
    faqs: [
      {
        q: "Is sativa really more energizing than indica?",
        a: "The label tracks the general pattern, but terpenes drive the experience more than the indica/sativa category. A myrcene-heavy sativa can land like a classic indica; a limonene-heavy indica can land like an uplifting sativa.",
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
- **CBD** — non-intoxicating cannabinoid. CBD-heavy products land differently than THC-heavy ones — many people reach for CBD when they want a calming chemical without the head change.
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

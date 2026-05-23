import { STORE } from "./store.ts";
import { storeToday } from "./store-time.ts";

export type Post = {
  slug: string;
  title: string;
  description: string;
  category: "Guide" | "Vendor Spotlight" | "Education" | "Local";
  publishedAt: string; // ISO date
  updatedAt?: string;
  // Optional per-post author override. When unset, the Article JSON-LD on
  // /blog/[slug] defaults to the store-owner Person at /about#owner. Once
  // posts grow per-author metadata (multi-budtender contributions, guest
  // pieces), populate this and the JSON-LD picks it up automatically.
  author?: { name: string; url?: string };
  readingMinutes: number;
  // The body is intentionally a single MDX-ish string of markdown-with-headings.
  // We render it server-side via a small parser (see app/blog/[slug]/page.tsx).
  // Kept simple on purpose — pre-AST pipeline wouldn't earn its keep yet.
  body: string;
};

export const POSTS: Post[] = [
  {
    slug: "complete-guide-cannabis-wenatchee-valley",
    title: "The Complete Guide to Cannabis in Wenatchee Valley",
    description:
      "Everything you need to know about buying cannabis in Wenatchee, WA — laws, products, dispensaries, what to look for, and how to make sense of the menu.",
    category: "Guide",
    publishedAt: "2026-04-30",
    readingMinutes: 14,
    body: `## Cannabis in Washington State, in plain English

Recreational cannabis has been legal in Washington since 2012, when voters passed Initiative 502. Adults 21 and over can buy and possess up to 1 ounce of usable cannabis flower, 7 grams of concentrate, 16 ounces of solid cannabis-infused product (or 72 ounces in liquid form). Every retailer has to be licensed by the Washington State Liquor and Cannabis Board (WSLCB).

You'll need a valid government-issued photo ID every time. We can't sell to anyone under 21, and the law doesn't have a "but I forgot it" clause — bring the ID. Driver's licenses, state IDs, passports, and military IDs all work.

## Why Wenatchee Valley is a great cannabis market

The Wenatchee Valley sits in the rain shadow of the Cascades. Hot, dry summers; cold, dry winters; long sun hours. The same conditions that built the apple industry — Wenatchee is the Apple Capital of the World — make for healthy outdoor and greenhouse-grown cannabis. Several Washington producers operate east of the Cascades for exactly that reason. Local-ish flower often shows up on dispensary shelves with terpene profiles that taste like the climate they're grown in: bright, resinous, often citrus or pine forward.

## What dispensaries actually carry

A typical Washington dispensary menu has seven or eight categories. Here's what each one is for:

### Flower
The bud — dried cannabis flower, sold by weight. The categories you'll see:
- **Eighths** (3.5 grams) — the most common purchase size
- **Quarters** (7 g), **halves** (14 g), **ounces** (28 g) — better per-gram price, larger commitment
- **Smalls** or **shake** — smaller buds or trim, lower price per gram, same flower

You smoke flower, vape it in a dry-herb vape, or roll it into joints.

### Pre-rolls
Joints, already rolled. Singles or multi-packs. **Infused pre-rolls** add concentrate or kief on the inside or outside for a stronger experience — read the label for the THC %.

### Vapes
Cartridges (510-thread) that fit a battery, or all-in-one disposables. Vapes typically have higher THC percentages than flower (60–90%) and are more discreet. **Live resin** vapes preserve more of the terpene profile from the original plant; **distillate** is typically more potent but flatter in flavor.

### Concentrates
Pure cannabis extracts — wax, shatter, live resin, rosin, hash. Used with a dab rig, e-rig, or sometimes added to flower. THC percentages typically run 60–90%. **Live resin** and **rosin** are flash-frozen / solventless, respectively, and tend to keep more of the flavor.

### Edibles
Gummies, chocolates, baked goods, and beverages. Washington caps recreational edibles at 10mg THC per serving and 100mg per package. Onset is slower than smoking — give it 60 to 90 minutes before re-dosing. **First-timers should start at 2.5mg**.

### Tinctures, oils, capsules
Low-key, often unflavored, usually used sublingually (under the tongue) for faster onset than edibles. Common for sleep, recovery, or daytime micro-dosing.

### Topicals
Lotions, balms, transdermal patches. Most don't get you high — they're applied to the skin for localized relief.

## Reading a label

Every Washington cannabis product is required to show:

- **THC %** — the headline cannabinoid. 18–24% is typical for flower; 70–90% for concentrates and vape cartridges.
- **CBD %** — usually low in flower (under 1%) but featured in tinctures, topicals, and 1:1 products.
- **Strain type** — Indica (often described as body-heavy), Sativa (often described as head-forward), Hybrid (in between). The Indica/Sativa labels are looser than people think — terpene profile shapes how a strain lands more than the indica/sativa label.
- **Terpenes** — aromatic compounds that shape the flavor and how a strain reads. Limonene reads as citrus (common in strains people pick for daytime use); myrcene as earthy (common in body-heavy picks); pinene as pine-forward and clear-headed.
- **Producer / processor name** — the licensed Washington company that grew or made the product.
- **Lab test info** — every batch is tested for cannabinoids, pesticides, and microbiologicals. The certificate of analysis is on file with the WSLCB.

## How to pick something good

If you're new or unsure:

1. **Tell the budtender what you want from it.** "Help me sleep," "I want to stay focused," "I'm hiking tomorrow," "I want to feel social at a dinner party." Effects-driven recommendations beat strain-name guessing.
2. **Start low, go slow.** This is true for edibles especially. 2.5mg is plenty for a first dose. You can always have more; you can't have less.
3. **Don't chase THC %.** A 32% flower isn't necessarily better than a 22% flower — terpene profile and your own tolerance matter more than the headline number.
4. **Ask about freshness.** With flower especially, recently-cured product smokes better. Most Washington dispensaries label or rotate; ask if you don't see a date.
5. **Buy small first.** A pre-roll or eighth is a low-stakes way to try a new strain or producer before committing to a quarter or an ounce.

## Cash, ID, and what to expect at the door

Cannabis is federally illegal, which means most retail banks won't process card transactions for dispensaries. Bring cash. ${STORE.name} has an ATM on-site, like most Wenatchee dispensaries.

When you walk in, you'll be greeted by a check-in (we scan your ID — it's required by law and we don't store the photo or personal info). Then a budtender helps you pick. Browsing the cases is fine; asking questions is encouraged.

Consumption is **not** legal in retail stores, parking lots, or most public spaces. Take it home.

## Cannabis around Wenatchee Valley

The Wenatchee Valley has multiple licensed dispensaries — competition is healthy here. ${STORE.name} is at ${STORE.address.full}, with free parking out front and ${STORE.hours.find((h) => h.day === "Monday")?.open ?? "8 AM"} opens daily.

If you're driving in from out of town: we're about 25 minutes from Leavenworth, 45 minutes from Lake Chelan, an hour from Quincy, an hour and a half from Moses Lake. We see a lot of customers stopping in on the way through; come on by.

## Local tips, season by season

- **Spring** — Apple Blossom Festival weekend brings extra traffic; if you're a local, get your weekend stash early.
- **Summer** — Hot afternoons are rough on flower if you're driving. Don't leave product in a hot car. Tinctures, gummies, and vapes hold up better.
- **Fall** — Harvest season for outdoor producers. Ask about new outdoor flower drops in October–November; price-to-quality ratio tends to be excellent.
- **Winter** — Mission Ridge skiers and Leavenworth visitors tend to load up on edibles for evenings. Topicals are popular for sore legs.

## Finally: the responsible part

Cannabis affects everyone differently. Don't drive impaired. Don't combine it with alcohol if you're new — the interaction surprises people. Lock products away from children and pets — gummies in particular look like candy, and dogs respond very poorly to THC.

If you have questions we didn't cover, [come ask us](/contact) or [call us](tel:${STORE.phoneTel}). Our budtenders are happy to talk you through anything — first-timer or longtime enthusiast.
`,
  },
  {
    slug: "how-we-pick-our-producers",
    title: "How We Pick Our Producers — A Vendor Spotlight",
    description:
      "Behind the scenes on how we evaluate and choose the Washington cannabis producers we carry on our shelves.",
    category: "Vendor Spotlight",
    publishedAt: "2026-04-29",
    readingMinutes: 6,
    body: `## We're not a "carry everything" shop

A typical Washington dispensary can stock products from a hundred-plus licensed producers. We don't. We carry roughly ${"40–60"} active brands at any given time, and we curate that list aggressively. Here's how we decide what makes the shelf.

## Five filters, in order

### 1. Quality of cure (flower) or extraction (concentrates)

For flower, we open jars. We look at trichome density, smell the cure, check for stems and seeds, ask about moisture content and how the producer cures their bud. A fresh-looking bag tagged with a recent harvest and cure date beats a name-brand jar of dry, brittle flower from six months ago.

For concentrates, we look at color, consistency, and smell. Live resin should taste like the plant it came from. Distillate should be clean, not hazy or off-color. Rosin should be golden, not amber-tinged from heat damage.

### 2. Lab consistency

Every Washington cannabis batch is tested. We look at the **trend** across batches — does this producer hit consistent THC and terpene numbers, or is every batch wildly different? Consistency is a tell for production discipline. We'd rather carry a 22% flower that's always 22% than a 28%-labeled flower that swings between 18 and 28 batch-to-batch.

### 3. Customer reorder rate

A first-time order is interesting. A second order is the real signal. If our customers don't buy a producer's product twice, we don't keep stocking it — even if it tested well, even if the producer is well-regarded elsewhere. Sell-through tells us the truth.

### 4. Pricing relative to category

Cannabis is competitive here. We won't carry a $14 eighth that doesn't justify the $14 against a $9 eighth on the next shelf. The reverse is also true: we'll happily carry premium products at premium prices when the quality is there. It's the **value-to-price ratio** we judge, not the absolute number.

### 5. The relationship

We work with producers we can call. When something goes wrong — a label error, an inconsistent batch, a delivery issue — we want a phone number that picks up. Vendors who treat us like a partner get more of our shelf. Vendors who treat us like a transaction don't last on our menu.

## What this looks like for you

When you walk in and see a strain on the shelf, it's there because:

1. We tasted it.
2. The lab numbers stayed consistent across a few batches.
3. Customers came back for more after their first order.
4. The price made sense for the category.
5. The producer is someone we trust.

We don't always get it right. Sometimes a producer goes off, or a strain stops hitting like it used to. When that happens we drop it and move on — usually our customers tell us first.

## Want to know who we carry?

[Check the live menu](/menu) — every active SKU, with the producer + strain type + THC % on each card. If you want a deeper look at a specific producer we haven't profiled yet, [let us know](/contact) and we'll write one up.
`,
  },
  {
    slug: "terpenes-101",
    title: "Terpenes 101 — what makes weed smell different",
    description:
      "How to read terpenes off a cannabis label, and why a 22% terpy flower can hit harder than a 30% bland one. Quick guide for the curious.",
    category: "Education",
    publishedAt: "2026-05-08",
    readingMinutes: 8,
    body: `## What you're actually smelling

Walk into a dispensary and the first thing you notice is the smell. Pine. Citrus. Diesel. Pepper. Berry. That's not the THC — THC has barely any smell on its own. What you're smelling is **terpenes** — the aromatic oils every cannabis plant produces.

Terpenes aren't unique to cannabis. The same molecule that makes a lemon smell like a lemon (limonene) is in some cannabis strains. The molecule in pine needles (pinene) is in others. Lavender, hops, mango, black pepper, cloves — all the smells you know from non-cannabis plants — show up in cannabis too, in different combinations.

The interesting part: terpenes don't just smell. They shape how a strain *feels* when you use it. Two flowers can have the same THC percentage and feel completely different because their terpene profiles are different.

## The five terpenes worth knowing

You don't need to memorize the periodic table of terpenes. There are dozens, but five of them do most of the heavy lifting on the shelf:

### Myrcene — earthy, mango, herbal
The most common terpene in commercial cannabis. Carries a heavy-body reputation in cannabis folklore — the "couch-lock" association with classic indicas comes from here. Found in mangoes, hops, lemongrass.

If a strain is described as "heavy body" on the menu — myrcene is usually the headline.

### Limonene — citrus, sweet
Bright lemon-orange smell. The terpene that often shows up in strains people pick for daytime or social sessions. Found in citrus peels (it's literally the same compound).

If a strain smells like fruit punch or lemon zest, limonene is doing the talking.

### Pinene — pine, sharp, fresh
What you smell when you crack a pine cone. Often present in strains marketed for clear-headed sessions, though anyone telling you it's a "concentration aid" is overselling — call it a hopeful association, not a prescription.

Common in old-school strains and Northwest-grown flower (no surprise — same biome).

### Caryophyllene — peppery, spicy, woody
Smells like cracked black pepper. The unusual one in the bunch — it interacts with cannabinoid receptors directly, which is more typical of cannabinoids themselves. Often shows up in strains people pick for evening or grounding sessions.

Found in black pepper, cloves, hops, rosemary.

### Linalool — floral, lavender
Lavender's signature compound. Less common in cannabis than the others, but distinct when present. Often shows up in strains people pick for evening use.

If you've ever picked up a flower that smelled almost soapy-floral, that's linalool.

## How to read a terpene label

Most Washington dispensaries (us included) print the top terpene on case cards or product detail pages. You'll usually see:

- A **percentage** — total terpenes by mass. Anything above 2% is high; 1.5–2% is good; under 1% is faint.
- A **dominant terpene** — usually the one above 0.5% by itself.
- Sometimes a **terpene chart** — the top three or four with bars.

A 22% THC flower with 2.5% terpenes is going to feel more interesting than a 30% THC flower with 0.8% terpenes. The terpenes shape the experience; THC sets the intensity. Both matter.

## "The entourage effect"

You'll hear this phrase a lot. The idea: cannabinoids (THC, CBD, etc.) and terpenes work together — the combination produces effects that neither would alone. There's evidence supporting parts of this theory and lots of overstatement around the rest. The honest summary: yes, terpene profile matters; no, nobody can predict exactly how a specific terpene combination will hit you specifically.

What that means for you on the floor: the menu's "indica/sativa" label is a starting point. The terpene profile is what tells you how a specific strain might feel. Two indicas with very different terpene profiles will feel different.

## Three practical reads

**1. Don't chase THC percentage alone.** Highest-THC isn't best — it's just most concentrated. A 24% flower with rich terpenes often beats a 32% flower with stripped-down terpenes for actual experience. Budget-conscious shoppers can save by picking on terpene profile rather than THC headline.

**2. Notice what you like.** Next time you have a strain you really enjoy, look up its terpene profile (we have it in the product detail). Pattern-match across a few sessions. You'll start seeing "I like myrcene-dominant flowers in the evening, limonene-dominant during the day" — that kind of thing. Way more useful than "I like indica."

**3. Ask the budtender.** If you walk in and say "I had a Blue Dream last month, it was great — what's similar?" — we can match you on terpene profile, not just strain name. That's how we steer you toward something you'll like even when the specific strain isn't in stock.

## Limitations

Cannabis hits everyone differently — body chemistry, tolerance, mood, and what you ate matter as much as the chemistry of the flower. Terpenes are a useful organizing concept, not a personality test. Treat the descriptions here as starting points, not promises.

Nothing on this page is medical advice. Cannabis isn't FDA-approved for any condition. Talk to a healthcare provider for medical questions.

## Want to try this on the floor?

[Browse the live menu](/menu) — every flower we carry has the terpene profile in the product detail card. If you want a budtender's pick, [come visit](/visit) and tell us what you've liked before. That's the conversation we're best at.
`,
  },
  {
    slug: "edibles-dosing-honest-guide",
    title: "Edibles dosing — the honest first-time guide",
    description:
      "Most bad edible experiences come from one mistake: not waiting long enough. Here's how to dose, what to expect, and what to do if you went too far.",
    category: "Education",
    publishedAt: "2026-05-09",
    readingMinutes: 7,
    body: `## The single rule that prevents a bad edible night

**5 milligrams of THC. Wait two hours. Then decide.**

If you read nothing else on this page, that's it. The most common bad-edible experience in our store's twelve years of operation has the same shape every time: a customer ate something, didn't feel anything in 30 or 45 minutes, ate more, and got hit with the original dose plus the second dose ninety minutes later. By the time they realize they overdid it, the timeline isn't on their side.

Edibles are slow. They feel slow because they *are* slow.

## Why it takes so long

When you smoke or vape cannabis, the THC reaches your bloodstream in about three to ten seconds. That's why you feel it almost immediately. You can dose by feel — one hit, wait, decide.

Edibles go through your digestive system. Your stomach has to break down the food, your small intestine has to absorb the THC, your liver metabolizes it. Best case: 30 minutes if you're on an empty stomach. Average: 60 to 90 minutes. With a heavy meal: up to 2 hours, occasionally more. There's no way to speed this up.

Worse, the THC your liver produces from edibles (called 11-hydroxy-THC) tends to feel stronger and last longer than the THC you get from inhaling. So you wait an hour, you don't feel it, you have another — and now you've doubled your dose right before *both* doses peak. That's the textbook overdose-by-accident.

## Starting doses, by experience level

These are starting points. Everyone's body chemistry is different — what feels mild to one person can feel intense to another.

| You are… | Start with… | Wait | Then |
|---|---|---|---|
| **Brand new to cannabis** | 2.5 mg | 2 hours | Most people feel something around 60–90 min |
| **First-time edible, smoke regularly** | 5 mg | 2 hours | Inhaled tolerance ≠ edible tolerance |
| **Occasional edibles** | 5–10 mg | 2 hours | Whatever was your last comfortable dose |
| **Regular edibles** | Your usual | 90 min | You know your body |

Notice the wait time is **two hours** for everything in the "less experienced" rows. Not one hour. Two.

## Reading a Washington edible label

Every legal edible in Washington is required by WSLCB to be packaged so individual servings are 10 mg of THC or less, and the total package can't exceed 100 mg. So a 100 mg gummy package is 10 servings, not one big gummy.

What to look for:
- **Per serving** — usually shown clearly on the front (5 mg, 10 mg).
- **Total per package** — for budgeting + storage planning.
- **Servings per package** — confirms the math.
- **Onset time** — sometimes printed; usually 30–120 min, fast-acting can be 15–45 min.
- **Best by** — edibles last months but lose potency over time.

If a chocolate bar is 10 mg per square and you want a 5 mg starting dose, you eat half a square. Cut it before you cook anything yourself — that's how people accidentally take too much. Most modern edibles are made to be easily portioned this way.

## Faster-acting edibles

The newer category is "fast-acting" or "nano-emulsified" edibles — usually drinks, sometimes gummies. The cannabis is processed into smaller particles that absorb partially through your mouth and stomach lining instead of fully through your liver. Onset can be 15 to 45 minutes instead of 60 to 120.

The starting-dose rule still applies: 5 mg, wait — but the wait can be shorter (45 minutes instead of 2 hours). Don't let "fast-acting" trick you into not waiting.

## Common over-dose scenarios (and how to handle them)

If you took too much, you're not in medical danger — there are no documented fatal cannabis overdoses in adults. But the experience can be intensely uncomfortable: anxiety, racing heart, paranoia, occasionally nausea or dizziness. It will pass, usually in 4 to 8 hours.

What helps:
- **Stay somewhere safe and quiet.** No driving. Don't try to handle stressful tasks.
- **Hydrate.** Water, juice, anything non-caffeinated.
- **CBD if you have any handy.** Some people reach for it in this situation — the evidence on whether it helps is mixed, but it's non-intoxicating and harmless to try.
- **Black peppercorns.** Old folk remedy that has some informal support — chew a few peppercorns. Some people find the caryophyllene shifts how the THC feels.
- **Sleep through it.** If you can lie down, do.
- **Time.** This is the main one. The peak is 2 to 4 hours after ingestion; you'll feel the worst of it ease around hour 4.

When to actually call someone:
- If breathing or heart rate feels seriously off — call a doctor or 911. Cannabis itself isn't usually the cause, but if it triggered a panic attack severe enough to scare you, that's worth a phone call.
- If a child or pet ingested cannabis — that's an emergency room visit. Their bodies aren't built for adult doses.

## Things people get wrong

**"I have a high tolerance from smoking, I can take more edibles."**
Inhaled tolerance and edible tolerance are different metabolic pathways. People who smoke daily have been surprised by 10 mg edibles. Start at 5.

**"It's been an hour, I'll just take a little more."**
This is the most common mistake. Wait the full two hours. There's no harm in being early and patient; there's plenty of harm in being early and impatient.

**"I'll eat it on an empty stomach so it works faster."**
Mostly true — but the dose hits *harder* on an empty stomach, not just faster. If you're new to edibles, eat something light beforehand to mellow the curve.

**"More milligrams = better experience."**
No. Past a certain point, more THC mostly means more side effects (anxiety, faster heart rate, dry mouth) without proportionally more of what you actually want. Find your dose, stay there.

**"Edibles wear off in two hours."**
They peak around 2–4 hours and the body is still processing them up to 8 hours later. Plan accordingly — don't take an edible at 9pm if you have a 7am meeting.

## What we recommend on the floor

If you've never had an edible, walk in and tell us. We'll point you at a 5-mg gummy or a halvable 10-mg square, sell you the smallest available pack, and remind you of the 2-hour wait at checkout. That conversation has prevented a lot of bad nights.

For first-timers we usually steer toward:
- A balanced THC/CBD product (a 5:5 or 1:1 ratio softens the edge a bit)
- Fruit-flavored gummies at 5 mg (easy to dose, easy to read the label)
- Skip the high-dose 100 mg/serving products even if you "think" you need more

## A note on what this isn't

Nothing on this page is medical advice. Cannabis isn't FDA-approved for any medical condition. If you're taking medications — particularly anything with CYP3A4/CYP2D6 metabolism, blood thinners, or sedatives — talk to a pharmacist or doctor before adding edibles to your routine. They interact with more medications than people realize.

If you're pregnant, nursing, or trying to conceive, the WSLCB warning on every legal package applies: don't.

## The conversation we'd rather have

We'd rather you come in, ask which 5 mg gummy is good for a first edible, walk out spending $5, and have a great Saturday night — than overdo it, swear off edibles forever, and tell five friends edibles are awful. Most people who've had a bad edible night had it because nobody warned them. Now you know.

[Check the live menu](/menu) for current edibles + fast-acting drinks. If you want a budtender's pick, [come visit](/visit) and tell us your starting line. That's the right conversation to have at the counter, not in a parking lot reading a label.
`,
  },
  {
    slug: "indica-vs-sativa-mostly-marketing",
    title: "Indica vs sativa is mostly marketing — what actually matters",
    description:
      "The indica/sativa label is a useful shorthand and a misleading prediction at the same time. Here's what the labels actually tell you, what they don't, and how to read a strain so you know what you're getting.",
    category: "Education",
    publishedAt: "2026-05-12",
    readingMinutes: 9,
    body: `## The two-bucket story you've heard

Walk into any dispensary and you'll get the same elevator pitch:

- **Indica** — body high, relaxing, "in da couch," for nighttime
- **Sativa** — head high, energizing, social, for daytime
- **Hybrid** — somewhere in between

It's a useful shorthand. It's also wrong often enough that taking it as a guarantee will get you a strain that does the opposite of what you wanted. Here's the honest version.

## Where the indica/sativa labels actually come from

Originally, indica and sativa were botanical terms describing two regional cannabis subspecies — *Cannabis indica* (short, broad-leaf, mostly from south-central Asia) and *Cannabis sativa* (tall, narrow-leaf, mostly equatorial). The terms described the *plant*, not the *effect*.

Over decades of breeding — especially the last twenty years of intense indoor cultivation — almost everything on a Washington dispensary shelf is a hybrid of those two ancestors. The "pure indica" and "pure sativa" you see labeled today often share more genetics than the labels suggest.

What stuck around is the *experience association*. Old-school growers noticed indica-leaning genetics often produced relaxing, body-focused effects, while sativa-leaning genetics often produced more cerebral, energetic effects. That association became the marketing language. The chemistry it was based on, though — is mostly about *terpene profile*, not the indica/sativa label itself.

## What actually predicts the experience

Three things are doing the heavy lifting:

**1. THC and CBD content.** THC is the primary psychoactive cannabinoid; CBD is the non-intoxicating one. A 30% THC flower with no CBD will land differently than a 18% THC flower with 4% CBD even if the labels are flipped. CBD-dominant strains land almost completely different from THC-dominant ones regardless of indica/sativa labeling.

**2. Terpene profile.** The aromatic compounds (myrcene, limonene, pinene, caryophyllene, linalool — see [Terpenes 101](/blog/terpenes-101)) shape how a strain reads far more reliably than the indica/sativa label. A myrcene-dominant strain tends to show up in body-heavy menu picks regardless of whether it's labeled indica or sativa. A limonene-dominant one tends to show up in daytime-leaning picks either way.

**3. Your body chemistry, set, setting.** What you ate, your mood, your sleep last night, what you're doing while you use it. These matter more than people admit. Two friends sharing the same joint will report different experiences.

## Why the labels still work as a starting point

If terpenes do the actual work, why do indica/sativa labels still hold up at all?

Because the breeding tradition baked in correlations. **Most** indica-labeled strains are bred for myrcene-heavy profiles. **Most** sativa-labeled strains are bred for terpenes more common in daytime-leaning picks (limonene, pinene). Not always, but often enough that the label is a useful first filter.

What you should NOT do is treat the label as a guarantee. The label is "what category did the breeder pitch this as." The terpene profile is "what's actually in the jar."

## How to read a strain like a pro (in 30 seconds)

When you're standing at the case looking at a flower, here's the order of operations:

1. **THC %.** Is it where you want it? Higher isn't better — somewhere in the 18-26% range is plenty for most people. Above 28% you're trading flavor for intensity.
2. **Terpenes.** Do they list a top terpene or terpene chart? Match that to the kind of session you're picking for:
   - Body-heavy / evening → myrcene, linalool, caryophyllene
   - Daytime / social → limonene, pinene
3. **Indica/sativa label.** Treat it as confirmation, not the headline. If terpenes line up with body-heavy and the label says "indica" — likely matches the marketing pitch. If they conflict, trust the terpenes.
4. **Brand reputation.** Does this brand have a reputation for matching their labels to actual experience? Some are more careful than others. Your budtender can tell you.

## A few real-world examples

**"Wedding Cake" (typically labeled indica, hybrid in WA):** Often heavy myrcene + caryophyllene. Lives up to the body-heavy rep most of the time. Marketing aligns with chemistry.

**"Blue Dream" (typically labeled sativa-leaning hybrid):** Often myrcene-dominant despite the sativa lean. Many people find more body component than the sativa label suggests.

**"Sour Diesel" (typically labeled sativa):** Often limonene + caryophyllene profile. Tends to read as a daytime pick. Matches the label well.

**"Northern Lights" (typically labeled indica):** Often myrcene + caryophyllene. Classic body-heavy profile. Matches the label.

The takeaway: the label is right *most* of the time but you'll find counter-examples in any dispensary. Reading the terpene profile catches those.

## What to ask the budtender

Skip "do you have any good sativas?" — it's the wrong question. Try:

- "I want something for daytime that won't put me on the couch — what terpene profiles should I look at?"
- "I had Blue Dream last month and it was exactly right — what's similar?"
- "I'm new to cannabis, want a relaxing evening, prefer not to feel anxious — what would you recommend?"

Those questions get you to the answer faster because they describe the *outcome* you want, not the bucket you think predicts it.

## Where the labels DO matter (still)

Despite all the above, the indica/sativa label has practical uses:

- **Quick scanning of menus** — most dispensary websites filter by it. Useful for narrowing 200 SKUs to 30.
- **Brand consistency** — same brand's "indica" line tends to be similar across strains. Once you find a brand whose indica matches your preference, the label is more reliable within that brand.
- **Communicating with budtenders who don't know you** — saying "I want a sativa" is faster than explaining your terpene preferences. The conversation can deepen from there.

## Why dispensaries still print the label

Two reasons. First, customers expect it — pulling the label off the menu would confuse far more people than it would educate. Second, the WSLCB labeling rules implicitly accommodate it, and changing how cannabis is categorized industry-wide takes a long time.

A few brands and labs have started publishing terpene charts directly on the package. When you see those, that's the brand betting on terpene-literate customers. We carry several brands that do this; ask your budtender to point them out.

## Bottom line

The indica/sativa label is a useful starting filter and a misleading prediction. Treat it as the front door of the conversation, not the answer. The terpene profile, THC/CBD ratio, and your own experience over a few sessions will tell you more than the bucket name ever will.

Nothing on this page is medical advice. Cannabis isn't FDA-approved for any condition. Effects vary by person.

## Want the budtender version of this conversation?

[Come visit](/visit) and tell us a strain you've liked recently. We'll match the terpene profile, not just the label. That's where this conversation actually pays off — when you walk out with something that lines up with what you wanted instead of what the marketing said.

[Browse the live menu](/menu) — every flower we carry has terpene info in the product detail card.
`,
  },
  {
    // Restored from the archived 2014-09-25 WordPress post — Doug 2026-05-07:
    // "that was a old blog post, we should still have it up because it ranks
    // high." Wayback snapshot at https://web.archive.org/web/20191214022202/
    // https://www.greenlifecannabis.com/amazing-cannabis-plant-grows/. Slug
    // preserved verbatim so existing inbound links + Google index entries
    // resolve to a real page instead of the previous 308→/blog redirect.
    // Content is botanical / educational (photoperiod + flowering biology),
    // WAC-clean — no medical claims, no consumption-method promotion, no
    // advertising-style copy. Edited for clarity + apostrophe normalization
    // from the archived raw HTML; substance preserved.
    slug: "amazing-cannabis-plant-grows",
    title: "The amazing cannabis plant and how it grows",
    description:
      "How photoperiod — the length of day vs. night — controls flowering in cannabis. A plain-English look at the biology that turns a vegetative plant into a budding one.",
    category: "Education",
    publishedAt: "2014-09-25",
    updatedAt: "2026-05-07",
    readingMinutes: 6,
    body: `## Photoperiod and flowering

For the cannabis grower, the most important plant/environment interaction to understand is the influence of the photoperiod. The photoperiod is the daily number of hours of day (light) vs. night (dark). In nature, long nights signal the plant that winter is coming and that it's time to flower and produce seeds.

As long as the day-length is long, the plants continue vegetative growth. If female flowers do appear, there will only be a few. These flowers won't form the characteristic large clusters or buds. If the days are too short, the plants flower too soon, and remain small and underdeveloped.

## How the plant senses the dark

The plant "senses" the longer nights by a direct interaction with light. A flowering hormone is present during all stages of growth. This hormone is sensitive to light and is rendered inactive by even low levels of light. When the dark periods are long enough, the hormones increase to a critical level that triggers the reproductive cycle. Vegetative growth ends and flowering begins.

The natural photoperiod changes with the passing of seasons. In the Northern Hemisphere, the length of daylight is longest on June 21. Day-length gradually decreases until it reaches its shortest duration on December 22. The duration of daylight then begins to increase until the cycle is completed the following June 21.

## Latitude matters

Because the Earth is tilted on its axis to the sun, day-length also depends on position (or latitude) on Earth. As you move closer to the equator, changes in the photoperiod are less drastic over the course of a year. At the equator (0° latitude), day-length lasts about 12.5 hours on June 21 and 11.5 hours on December 22. In Maine (about 45° north), day-length varies between about 16 and 9 hours. Near the Arctic Circle on June 21 there is no night; on December 22 the whole day is dark.

The longer day-length toward the north prevents cannabis from flowering until later in the season. Over most of the northern half of the country, flowering is often so late that development can't be completed before the onset of cold weather and heavy frosts.

The actual length of day largely depends on local conditions: cloud cover, altitude, terrain. On a flat Midwest plain, the effective length of day is about 30 minutes longer than sunrise to sunset. In practical terms, it's little help to calculate the photoperiod precisely — what matters is realizing how it affects the plant and how you can use it to your advantage.

Cannabis generally needs about two weeks of successive long nights before the first flowers appear.

## Plants vs animals — different life strategies

Plants use a fundamentally different "life strategy" from animals. Animals are more or less self-contained units that grow and develop to predetermined forms. They use movement and choice of behavior to deal with changing environments.

Plants are organized more as open systems — the simple physical characteristics of the environment, such as sunlight, water, and temperature, directly control their growth, form, and life cycles. Once the seed sprouts, the plant is rooted in place and time. Since growth is regulated by the environment, development happens in accordance with the plant's immediate surroundings. When a balance is struck, the strategy is a success and life flourishes.

Behavior of a plant isn't a matter of choice; it's a fixed response. On a visible level the response, more often than not, is growth — either a new form of growth, or specialized growth. By directly responding, plants in effect "know" when to sprout, when to flower, when to drop leaves to prepare for winter.

Everyone has seen how a plant turns toward light, or how a plant can bend upward if its stem is bent down. The plant turns by growing cells of different length on opposite sides of the stem. The stimulus in the first case is light, in the second gravity, but in either case the plant responds by specialized growth. It's the same with almost all facets of a plant's life — growth is modified and controlled by the immediate environment. The influence of light, wind, rainfall, etc., interacts with the plant's genetic make-up (the genotype) to produce the individual plant (the phenotype).

## The full life cycle

The life cycle of *Cannabis* is usually complete in four to nine months. The actual time depends on variety, but it's regulated by local growing conditions — specifically the photoperiod (length of day vs. night).

Cannabis is a long-night (or short-day) plant. When exposed to a period of two weeks of long nights — that is, 13 or more hours of continuous darkness each night — the plants respond by flowering. This has important implications: it allows the grower to control the life cycle of the plant and adapt it to local growing conditions or unique situations. Since you can control flowering, you control maturation, and therefore the age of the plants at harvest.

---

*Originally published September 25, 2014. The science hasn't changed. We carry flower from Washington producers — both indoor and outdoor — with a wide range of strain types and terpene profiles. [Browse the live menu](/menu) for what's in stock right now, or [come visit us in Wenatchee](/visit) and we'll talk you through what's blooming.*
`,
  },
];

// --- Dynamic content from inv CMS ---
// Falls back to empty on any error so a momentary API hiccup never
// breaks the blog index or a /blog/[slug] render.

const INV_CONTENT_BASE = "https://brapp.greenlifecannabis.com";
const INV_CONTENT_STORE = "glw";

const VALID_POST_CATS = new Set<Post["category"]>(["Guide", "Vendor Spotlight", "Education", "Local"]);

type ApiPost = {
  slug: string;
  title: string;
  subtitle?: string | null;
  category?: string | null;
  bodyMd?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  authorName?: string | null;
  authorUrl?: string | null;
};

function apiPostToPost(p: ApiPost): Post {
  const words = p.bodyMd?.trim().split(/\s+/).length ?? 0;
  return {
    slug: p.slug,
    title: p.title,
    description: p.subtitle ?? "",
    category: VALID_POST_CATS.has(p.category as Post["category"])
      ? (p.category as Post["category"])
      : "Education",
    publishedAt: p.publishedAt ?? storeToday(),
    ...(p.updatedAt ? { updatedAt: p.updatedAt } : {}),
    ...(p.authorName
      ? { author: { name: p.authorName, ...(p.authorUrl ? { url: p.authorUrl } : {}) } }
      : {}),
    readingMinutes: words > 0 ? Math.max(1, Math.round(words / 200)) : 5,
    body: p.bodyMd ?? "",
  };
}

export async function fetchDynamicPosts(): Promise<Post[]> {
  try {
    const res = await fetch(
      `${INV_CONTENT_BASE}/api/public/content/list?store=${INV_CONTENT_STORE}`,
      {
        next: { revalidate: 300 },
        // 8s ceiling — inv-App content API typically responds <300ms.
        // A hang would silently consume the page's Vercel function budget
        // and turn into a 504. Bounded fetch → catch block → empty
        // array → page still renders (static fallback content).
        signal: AbortSignal.timeout(8_000),
      },
    );
    if (!res.ok) return [];
    const data: { items?: ApiPost[] } = await res.json().catch(() => ({}));
    return (data.items ?? [])
      .filter((p) => p.slug && p.title && p.publishedAt)
      .map(apiPostToPost)
      .filter((p) => isPublished(p));
  } catch {
    return [];
  }
}

export async function fetchDynamicPost(slug: string): Promise<Post | undefined> {
  try {
    const res = await fetch(
      `${INV_CONTENT_BASE}/api/public/content/${encodeURIComponent(slug)}?store=${INV_CONTENT_STORE}`,
      {
        next: { revalidate: 300 },
        // 8s ceiling — same rationale as the sister `fetchDynamicPosts`.
        signal: AbortSignal.timeout(8_000),
      },
    );
    if (!res.ok) return undefined;
    const p: ApiPost | null = await res.json().catch(() => null);
    if (!p?.slug || !p?.title) return undefined;
    const post = apiPostToPost(p);
    return isPublished(post) ? post : undefined;
  } catch {
    return undefined;
  }
}

// Stage-by-publishedAt — sister of scc same-day. Posts dated in the
// future are excluded from list + slug-lookup until their publishedAt
// arrives. Pre-fix future-dated posts (PLAN_WEEKLY_GUIDES staggered
// release) appeared in sitemap with future lastmod (Google flags as
// spammy) AND were reachable at /blog/[slug] before publish (reader
// sees "Published 2026-05-12" when reading on 2026-05-08).
function isPublished(p: Post, asOf: Date = new Date()): boolean {
  const today = storeToday(asOf);
  return p.publishedAt <= today;
}

export function getPost(slug: string): Post | undefined {
  const post = POSTS.find((p) => p.slug === slug);
  return post && isPublished(post) ? post : undefined;
}

export function getPosts(): Post[] {
  return [...POSTS]
    .filter((p) => isPublished(p))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

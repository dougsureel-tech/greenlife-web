import { STORE } from "./store";

export type Post = {
  slug: string;
  title: string;
  description: string;
  category: "Guide" | "Vendor Spotlight" | "Education" | "Local";
  publishedAt: string; // ISO date
  updatedAt?: string;
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
- **Strain type** — Indica (often described as relaxing or body-heavy), Sativa (often energizing), Hybrid (in between). The Indica/Sativa labels are looser than people think — terpene profile and individual chemistry matter more.
- **Terpenes** — aromatic compounds that shape the flavor and effect. Limonene reads as citrus and is often described as uplifting; myrcene as earthy and sedating; pinene as pine-forward and clear-headed.
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

If you have questions we didn't cover, [come ask us](/contact) or [give us a call](tel:${STORE.phoneTel}). Our budtenders are happy to talk you through anything — first-timer or longtime enthusiast.
`,
  },
  {
    slug: "vendor-spotlight-template",
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
      "Terpenes are the aromatic compounds that give every strain its smell, flavor, and a lot of its character. Here's how to read them off a label and why a 22% terpy flower can hit harder than a 30% bland one.",
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
The most common terpene in commercial cannabis. Carries a sedating reputation — the "couch-lock" feeling people associate with classic indicas. Found in mangoes, hops, lemongrass.

If a strain is described as "relaxing" or "heavy body" — myrcene is usually the headline.

### Limonene — citrus, sweet
Bright lemon-orange smell. Often described as uplifting, mood-elevating. Found in citrus peels (it's literally the same compound).

If a strain smells like fruit punch or lemon zest, limonene is doing the talking. Common in strains people use during the day or socially.

### Pinene — pine, sharp, fresh
What you smell when you crack a pine cone. There's some research suggesting pinene supports focus and clear-headedness, though anyone telling you it's a "concentration aid" is overselling — call it a hopeful association, not a prescription.

Common in old-school strains and Northwest-grown flower (no surprise — same biome).

### Caryophyllene — peppery, spicy, woody
Smells like cracked black pepper. The unusual one in the bunch — it interacts with cannabinoid receptors directly, which is more typical of cannabinoids themselves. Often associated with calming or grounding effects.

Found in black pepper, cloves, hops, rosemary.

### Linalool — floral, lavender
Lavender's signature compound. Less common in cannabis than the others, but distinct when present. Often associated with relaxation and evening use.

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
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getPosts(): Post[] {
  return [...POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

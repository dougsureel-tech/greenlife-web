// Loyalty arc — surfaces the relationship-based tier vocabulary
// (Visitor → Regular → Local → Family) on the public site so the
// language a customer sees on the homepage matches the language they'll
// see at the POS / on receipts / in /account once Clerk live keys land.
//
// Per `Inventory App/docs/brand-voice.md`: relationship arc, not metals.
// Never "Gold" / "Silver" / "VIP" — that's chain-vibe, not us. Tiers
// here are stripped of the lifetime-spend numbers (POS sees those) so
// the public-site copy reads as story, not ladder.
//
// Marketing-log finding 2026-05-02: tier vocab is half-deployed —
// wired to POS + /account but absent from public-site marketing
// surfaces. This component closes the gap on the highest-traffic
// surface (homepage). Brand pages + /deals + footer get the same
// language by reference, not by their own component.

const TIERS = [
  {
    name: "Visitor",
    body: "Welcomed, not yet known. First time in? Hand the budtender your phone — that's the start.",
  },
  {
    name: "Regular",
    body: "Coming back, we recognize you. The budtenders learn your usual; the deals start finding you.",
  },
  {
    name: "Local",
    body: "Part of the neighborhood. Bigger rotating perks, early access on new drops, the long arc of trust.",
  },
  {
    name: "Family",
    body: "The relationship is mutual. We owe you what we owe each other.",
  },
];

export function LoyaltyArc() {
  return (
    <section
      aria-labelledby="loyalty-arc-heading"
      className="bg-gradient-to-br from-emerald-50 via-white to-amber-50/40 border-y border-stone-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700 mb-2">
            How loyalty works here
          </p>
          <h2
            id="loyalty-arc-heading"
            className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight"
          >
            We&rsquo;re a relationship, not a points app.
          </h2>
          <p className="text-stone-600 mt-3 leading-relaxed">
            Four tiers — Visitor, Regular, Local, Family. You move through them by showing up.
            Loyalty stacks with every running deal at the counter.
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map((t, i) => (
            <li
              key={t.name}
              className="relative rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-base font-extrabold text-stone-900 tracking-tight">
                  {t.name}
                </h3>
                <span
                  aria-hidden
                  className="text-[10px] font-bold uppercase tracking-widest text-emerald-700/70 tabular-nums"
                >
                  Step {i + 1}
                </span>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">{t.body}</p>
            </li>
          ))}
        </ol>

        <p className="text-center text-xs text-stone-500 mt-6 max-w-xl mx-auto">
          Sign up at the counter or on your first online order. We never share your number, never
          spam, never sell the list. Stop in to ask a budtender how it works in plain language.
        </p>
      </div>
    </section>
  );
}

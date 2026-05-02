import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Accessibility & Health Information",
  description: `Accessibility statement, ADA accommodations, and Washington-state cannabis health information for ${STORE.name} in ${STORE.address.city}, WA.`,
  alternates: { canonical: "/accessibility" },
};

// Accessibility + informed-consent surface. Three jobs in one page:
//
// 1. ADA Title III — physical-store accommodations (parking, entrance,
//    service animals, accommodation contact)
// 2. WCAG 2.1 AA — web accessibility statement + how to request a fix
// 3. WAC 314-55-082 — Washington's statutory cannabis health warning,
//    plus the practical interactions (pregnancy/nursing, machinery, drug
//    interactions) every retailer should surface
//
// Lives off the footer rather than the primary nav. Customers don't browse
// here — they land here from a footer link, an email signature, or a search
// like "is cannabis safe while pregnant" + a local-pack pin to us.
//
// Voice: budtender + clinical-without-jargon. NOT advertising under WAC
// 314-55-155, so no efficacy claims and no "use this for X." Same boundary
// our /faq + brand pages already hold.

const PHYSICAL_AMENITIES = [
  {
    title: "Parking",
    body: "Free parking lot with a striped accessible space at the front. Curb cut to the entrance, no steps from the lot to the door.",
  },
  {
    title: "Entrance",
    body: "Single-leaf glass door, level threshold, ~36 inches clear width. The lobby ID-check counter is wheelchair-accessible.",
  },
  {
    title: "Inside the shop",
    body: "Wide aisles between cases. The point-of-sale counter has a lowered section. Staff will hand you product on request — you do not have to reach over a tall case to inspect it.",
  },
  {
    title: "Service animals",
    body: "Service animals are welcome. Per ADA, only two questions allowed: (1) is the animal required because of a disability, (2) what work or task is the animal trained to perform. We do not ask for documentation.",
  },
  {
    title: "Restrooms",
    body: "No public restroom on premises (compliance constraint, common across WA dispensaries). Closest accessible public restroom is at Pybus Public Market, ~10 minutes away.",
  },
  {
    title: "Communication accommodations",
    body: "Staff are happy to write product info on a notepad, repeat slowly, or step outside with you for a quieter conversation. We do not currently have an ASL interpreter on staff — call ahead at " +
      STORE.phone +
      " and we will arrange a video-relay session for your visit.",
  },
];

const WEB_A11Y_NOTES = [
  "Keyboard navigation: every interactive element is reachable via Tab and operable via Enter / Space.",
  "Screen reader: pages use semantic HTML, ARIA labels on icon-only buttons, and a skip-to-main link at the top of every page.",
  "Visual contrast: body copy is 4.5:1 or better against its background; large headings are 3:1 or better.",
  "Motion: animations respect prefers-reduced-motion. The home-page hero, /deals card hover, and pin pulses all dim or stop when the OS-level reduce-motion preference is set.",
  "Image alt text: product photos use descriptive alt; decorative imagery is marked aria-hidden so screen readers skip it.",
  "Forms: every input has an associated label; error messages reference the field by name.",
];

// Washington's statutory health warning, plus the practical interactions
// every retailer should be surfacing whether or not the law strictly
// requires it. Sourced from WAC 314-55-082 + WSLCB consumer guidance + the
// WA-DOH cannabis-and-pregnancy advisory.
const HEALTH_WARNINGS = [
  {
    heading: "Cannabis is for adults 21 and over.",
    body: "WSLCB-licensed retail in Washington is restricted to adults 21+ with a valid government-issued ID. We card every transaction, every time — no exceptions.",
  },
  {
    heading: "Do not drive or operate machinery.",
    body: "Cannabis can impair judgment, reaction time, and motor coordination. Effects can persist for hours after consumption. WA law treats cannabis-impaired driving as a DUI, with the same legal consequences as alcohol.",
  },
  {
    heading: "Pregnancy and nursing.",
    body: "Cannabis use during pregnancy is associated with risks to fetal development. THC and other cannabinoids transfer through breast milk. The Washington State Department of Health advises against any cannabis use during pregnancy, while attempting to become pregnant, or while breastfeeding.",
  },
  {
    heading: "Edibles take longer than you think.",
    body: "Onset can take 30 minutes to 2 hours, and effects last several hours. Start low (2.5–5 mg THC), go slow, and do not redose during the wait. Most over-consumption events are first-time edible users redosing too soon.",
  },
  {
    heading: "Medications and medical conditions.",
    body: "Cannabis can interact with prescription medications including blood thinners (warfarin), some antidepressants, and certain heart and blood-pressure medications. People with cardiovascular disease, schizophrenia, or psychotic disorders face elevated risk. If you have a medical condition or take prescription medication, talk to your healthcare provider before using cannabis.",
  },
  {
    heading: "Mental health.",
    body: "High-THC products can trigger or worsen anxiety, panic, and paranoia, especially in people with no prior cannabis experience. Higher doses do not produce stronger relief — they often produce the opposite. If you start to feel unwell, stop using, hydrate, and ride it out somewhere calm.",
  },
  {
    heading: "Storage and child safety.",
    body: "Store cannabis in a locked, child-proof container, away from food and children. Edibles in particular can look identical to non-cannabis snacks. Keep them in their original WA-WSLCB-compliant packaging.",
  },
  {
    heading: "If you over-consume.",
    body: "Cannabis is not associated with fatal overdose, but a difficult experience can feel medical. Stay calm, find a quiet space, hydrate, and let it pass — typically 2–6 hours. If symptoms include chest pain, sustained vomiting, or loss of consciousness, call 911 or the Washington Poison Center at 1-800-222-1222.",
  },
];

const STATUTORY_NOTICE = `WAC 314-55-082 health warning: Marijuana can impair concentration, coordination, and judgment. Do not operate a vehicle or machinery under the influence of this drug. There may be health risks associated with consumption of this product. For use only by adults twenty-one and older. Keep out of the reach of children.`;

export default function AccessibilityPage() {
  // FAQ schema lift the consent surface into AI-engine answer space —
  // someone searching "is cannabis safe while pregnant" or "ADA accessible
  // dispensary Wenatchee" gets cited from our copy. Same shape we use on
  // the dialed-in /brands/[slug] pages.
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HEALTH_WARNINGS.map((w) => ({
      "@type": "Question",
      name: w.heading,
      acceptedAnswer: { "@type": "Answer", text: w.body },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-stone-50">
        {/* Hero — calm, informational, not festive. Mirrors the /faq tone. */}
        <section className="relative bg-green-950 text-white overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <p className="text-green-300/80 text-[11px] font-bold uppercase tracking-[0.22em]">
              Customer Resources
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05]">
              Accessibility &amp; Health Information
            </h1>
            <p className="mt-4 max-w-2xl text-green-100/80 leading-relaxed">
              How we accommodate customers in our shop, how we work to keep this site usable for
              everyone, and what Washington-state law and the Department of Health want you to
              know before using cannabis.
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
          {/* Statutory notice — pinned at the top per WAC 314-55-082 framing.
              Plain card, high contrast, no decoration. */}
          <aside
            role="note"
            aria-label="Statutory cannabis health warning"
            className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 sm:p-6 text-stone-900"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-800">
              Washington State Health Warning · WAC 314-55-082
            </p>
            <p className="mt-2 text-sm sm:text-base leading-relaxed">{STATUTORY_NOTICE}</p>
          </aside>

          {/* ADA Title III — physical store accommodations */}
          <section className="space-y-5">
            <header>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                In our shop
              </h2>
              <p className="mt-1.5 text-stone-600 text-sm sm:text-base">
                ADA Title III accommodations for the physical store at {STORE.address.full}.
              </p>
            </header>
            <ul className="grid sm:grid-cols-2 gap-4">
              {PHYSICAL_AMENITIES.map((a) => (
                <li
                  key={a.title}
                  className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-sm font-extrabold text-stone-900">{a.title}</p>
                  <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">{a.body}</p>
                </li>
              ))}
            </ul>
            <p className="text-sm text-stone-600 leading-relaxed">
              Need an accommodation we have not listed? Email{" "}
              <a
                href={`mailto:${STORE.email}?subject=Accessibility%20accommodation`}
                className="font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-600"
              >
                {STORE.email}
              </a>{" "}
              or call{" "}
              <a
                href={`tel:${STORE.phoneTel}`}
                className="font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-600"
              >
                {STORE.phone}
              </a>
              . We will work with you on what fits the visit.
            </p>
          </section>

          {/* WCAG 2.1 AA — web accessibility statement */}
          <section className="space-y-5">
            <header>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                On this website
              </h2>
              <p className="mt-1.5 text-stone-600 text-sm sm:text-base">
                We aim for{" "}
                <a
                  href="https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_overview&amp;levels=aaa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-600"
                >
                  WCAG 2.1 Level AA
                </a>{" "}
                conformance across every page.
              </p>
            </header>
            <ul className="space-y-2.5">
              {WEB_A11Y_NOTES.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 text-sm text-stone-700 leading-relaxed"
                >
                  <span aria-hidden className="text-emerald-700 mt-0.5">
                    ✓
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-extrabold text-stone-900">Found a barrier?</p>
              <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">
                Email{" "}
                <a
                  href={`mailto:${STORE.email}?subject=Web%20accessibility%20issue`}
                  className="font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-600"
                >
                  {STORE.email}
                </a>{" "}
                with the page URL and what blocked you. We respond within two business days and
                fix verified issues on the next deploy.
              </p>
            </div>
          </section>

          {/* Health information — the nine warnings */}
          <section className="space-y-5">
            <header>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Cannabis health information
              </h2>
              <p className="mt-1.5 text-stone-600 text-sm sm:text-base">
                Practical guidance for adults using legal cannabis in Washington. Sourced from{" "}
                <a
                  href="https://doh.wa.gov/you-and-your-family/marijuana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-600"
                >
                  WA Department of Health
                </a>{" "}
                guidance and WSLCB consumer materials.
              </p>
            </header>
            <ul className="space-y-3.5">
              {HEALTH_WARNINGS.map((w) => (
                <li
                  key={w.heading}
                  className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-base font-extrabold text-stone-900">{w.heading}</p>
                  <p className="mt-1.5 text-sm text-stone-700 leading-relaxed">{w.body}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Resources strip */}
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-extrabold text-stone-900 tracking-tight">
              If you need help right now
            </h2>
            <ul className="text-sm text-stone-700 space-y-1.5">
              <li>
                <span className="font-semibold">Washington Poison Center:</span>{" "}
                <a href="tel:18002221222" className="text-emerald-800 underline underline-offset-2">
                  1-800-222-1222
                </a>{" "}
                · 24 hours a day
              </li>
              <li>
                <span className="font-semibold">988 Suicide &amp; Crisis Lifeline:</span>{" "}
                <a href="tel:988" className="text-emerald-800 underline underline-offset-2">
                  988
                </a>{" "}
                · call or text
              </li>
              <li>
                <span className="font-semibold">SAMHSA National Helpline:</span>{" "}
                <a href="tel:18006624357" className="text-emerald-800 underline underline-offset-2">
                  1-800-662-HELP (4357)
                </a>{" "}
                · free, confidential
              </li>
              <li>
                <span className="font-semibold">In a medical emergency:</span> 911
              </li>
            </ul>
          </section>

          <footer className="text-center pt-4 pb-2">
            <Link
              href="/"
              className="text-sm font-semibold text-emerald-800 hover:text-emerald-600 transition-colors"
            >
              ← Back to home
            </Link>
          </footer>
        </div>
      </div>
    </>
  );
}

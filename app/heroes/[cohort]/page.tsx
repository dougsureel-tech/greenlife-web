import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STORE } from "@/lib/store";

// Hack #7 — Heroes cohort SEO landing pages.
//
// Single dynamic route with generateStaticParams so each cohort gets:
//   - Its own canonical URL (/heroes/veterans, /heroes/teachers, etc.)
//   - Cohort-specific search-friendly title + description
//   - Hero copy that speaks to the cohort, not the program
//   - Eligibility table reduced to just the relevant rows
//   - FAQ overlay with cohort-targeted Q&A
//   - Sitemap-discoverable static prerender
//
// The mainline /heroes page still exists as the "all cohorts" overview;
// these are the long-tail SEO landings (veteran discount cannabis
// Wenatchee, teacher discount weed Washington, etc.) that capture the
// cohort-specific search before they ever see the program name.
//
// Per Doug's standing rule (feedback_budtender_signup_script): don't
// lead with the dollar value — pitch the SIGNUP. Each cohort page leads
// with belonging + recognition, not the percentage off.

export const revalidate = 86400; // ISR — cohort copy doesn't change often

type Cohort = {
  slug: string;
  label: string;
  // SEO
  metaTitle: string;
  metaDescription: string;
  // Hero
  heroEyebrow: string;
  heroH1: string;
  heroLead: string;
  // Recognition framing — lead with belonging not the discount
  recognitionLine: string;
  // Eligibility
  idRequired: string;
  idExamples: string[];
  // FAQs
  faqs: { q: string; a: string }[];
  // Schema.org keywords for search
  searchKeywords: string[];
};

const COHORTS: Record<string, Cohort> = {
  veterans: {
    slug: "veterans",
    label: "Veterans",
    metaTitle: `Veteran Cannabis Discount in Wenatchee, WA — ${STORE.name}`,
    metaDescription: `${STORE.name} thanks Wenatchee-area veterans with 20% off every visit. DD-214, VA card, or VHIC accepted. Any branch, any era.`,
    heroEyebrow: "For veterans",
    heroH1: "Thank you for your service.",
    heroLead:
      "Any branch, any era — once you've served, you're family here. Twenty percent off every visit, no expiration, no fine print. We verify your DD-214, VA card, or VHIC at the counter on your first visit and you're set going forward.",
    recognitionLine: "We see you, and we appreciate what you carried so the rest of us didn't have to.",
    idRequired: "Bring your 21+ ID plus one of:",
    idExamples: ["DD-214 (any era — original or copy)", "VA Health ID Card (VHIC)", "Veterans ID Card", "Honorable-discharge documentation"],
    faqs: [
      {
        q: "Does my era matter?",
        a: "No. Whether you served in Vietnam, the Gulf, post-9/11, or peacetime — if you served honorably, you qualify. Our entire team agreed on this: time in service is time in service.",
      },
      {
        q: "I lost my DD-214. What now?",
        a: "Request a replacement at vets.gov or via SF-180. Your VA card or VHIC also works in the meantime — both are tied to your veteran status and we accept either.",
      },
      {
        q: "Does my spouse get the discount?",
        a: "The Veterans discount is for the veteran themselves. Surviving spouses with a VA-issued ID also qualify. Family members visiting with you are welcome but pay the standard price.",
      },
      {
        q: "Can I combine with daily deals?",
        a: "We apply whichever discount is bigger — Heroes 20% wins over most daily deals. Loyalty points stack independently.",
      },
    ],
    searchKeywords: [
      "veteran cannabis discount",
      "veteran dispensary discount Wenatchee",
      "VA cannabis discount Washington",
      "DD-214 cannabis discount",
      "military veteran weed discount Wenatchee",
    ],
  },
  military: {
    slug: "military",
    label: "Active Military",
    metaTitle: `Active Military Cannabis Discount Wenatchee — ${STORE.name}`,
    metaDescription: `${STORE.name} offers active-duty service members 20% off every visit. CAC, military ID, or current orders accepted. National Guard + Reserves welcome.`,
    heroEyebrow: "For active duty",
    heroH1: "On post or off, we've got you.",
    heroLead:
      "Active duty, National Guard, Reserves — twenty percent off every visit when you show your CAC, military ID, or current orders. Recognized once at the counter, then it's automatic on every visit going forward.",
    recognitionLine: "Service is service. We're glad you stopped in.",
    idRequired: "Bring your 21+ ID plus one of:",
    idExamples: ["Common Access Card (CAC)", "Active military ID", "Current orders / TDY paperwork", "National Guard or Reserve ID"],
    faqs: [
      {
        q: "I'm on TDY and only have a copy of my orders. Does that work?",
        a: "Yes. Current TDY paperwork or PCS orders are valid credentials at the counter. We just need to verify it's current and reflects your service status.",
      },
      {
        q: "I'm a Reservist or National Guard. Do I qualify?",
        a: "Absolutely. National Guard and Reserves both qualify under the active-military category. Your unit ID or current drill paperwork works.",
      },
      {
        q: "Does the discount stack with daily deals?",
        a: "Heroes is 20%, daily deals usually run 10-15%. We apply whichever is bigger. Loyalty points stack on top of either.",
      },
    ],
    searchKeywords: [
      "active military cannabis discount",
      "CAC cannabis discount Wenatchee",
      "military weed discount Washington",
      "service member dispensary discount",
    ],
  },
  "first-responders": {
    slug: "first-responders",
    label: "First Responders",
    metaTitle: `First Responder Cannabis Discount Wenatchee — ${STORE.name}`,
    metaDescription: `${STORE.name} thanks Wenatchee-area first responders with 20% off every visit. Police, sheriff, fire, EMS, paramedics — show your badge or department ID.`,
    heroEyebrow: "For first responders",
    heroH1: "The shift is hard. We get it.",
    heroLead:
      "Police, sheriff, corrections, fire, EMS, paramedics — the work doesn't stop, and we want to make off-time a little easier. Twenty percent off every visit, badge or department ID at the counter on your first visit, then it's automatic.",
    recognitionLine: "What you carry to work matters. We're glad you have a place to set it down.",
    idRequired: "Bring your 21+ ID plus one of:",
    idExamples: [
      "Department ID badge",
      "Federal LE credentials",
      "Current EMT / paramedic certification",
      "Firefighter cert or department ID",
    ],
    faqs: [
      {
        q: "I'm a corrections officer / probation. Do I qualify?",
        a: "Yes. Sworn corrections, probation, parole — all qualify under the first-responder category. Your department ID is the credential.",
      },
      {
        q: "Volunteer firefighter — does that count?",
        a: "Yes, with your department ID showing active membership. Volunteer fire is fire.",
      },
      {
        q: "I'm retired LE. Does retiree status work?",
        a: "Retired LE qualifies. Your retirement ID or HR-218 credential works.",
      },
    ],
    searchKeywords: [
      "first responder cannabis discount",
      "police cannabis discount Wenatchee",
      "firefighter dispensary discount Washington",
      "EMT paramedic weed discount",
    ],
  },
  healthcare: {
    slug: "healthcare",
    label: "Healthcare Workers",
    metaTitle: `Healthcare Worker Cannabis Discount Wenatchee — ${STORE.name}`,
    metaDescription: `${STORE.name} offers nurses, doctors, hospital staff, and clinic workers 20% off every visit. Show your hospital, clinic, or department badge.`,
    heroEyebrow: "For healthcare",
    heroH1: "We see what you do.",
    heroLead:
      "Nurses, doctors, techs, hospital staff, clinic staff — twenty percent off every visit when you show your healthcare badge. Show it once at the counter and we tag your account for every visit going forward.",
    recognitionLine: "The care you give matters. After-shift should feel like care, too.",
    idRequired: "Bring your 21+ ID plus one of:",
    idExamples: [
      "Hospital or clinic badge",
      "Current professional license (RN, MD, etc.)",
      "Department ID",
      "Healthcare-system payroll badge",
    ],
    faqs: [
      {
        q: "I'm a CNA / MA / tech. Do I qualify?",
        a: "Yes. The healthcare cohort is broad — if you work in a clinical care environment with a badge, you qualify. CNAs, medical assistants, surgical techs, lab techs, pharmacy techs, hospital admin in clinical buildings — all in.",
      },
      {
        q: "Travel nurses without a permanent ID?",
        a: "Bring your active nursing license + current assignment paperwork. We can verify both at the counter.",
      },
      {
        q: "Mental-health and behavioral-health workers?",
        a: "Absolutely. Counselors, therapists, social workers, peer-support specialists — credential at the counter and you're in.",
      },
      {
        q: "Retired healthcare workers?",
        a: "We honor retired healthcare credentials too. Bring your retired license or last department badge.",
      },
    ],
    searchKeywords: [
      "nurse cannabis discount",
      "healthcare worker dispensary discount Wenatchee",
      "hospital staff weed discount Washington",
      "doctor cannabis discount Wenatchee",
    ],
  },
  teachers: {
    slug: "teachers",
    label: "K-12 Teachers",
    metaTitle: `Teacher Cannabis Discount Wenatchee, WA — ${STORE.name}`,
    metaDescription: `${STORE.name} offers Washington-state K-12 teachers 20% off every visit. Show your district ID or pay stub. Public, private, charter — all welcome.`,
    heroEyebrow: "For teachers",
    heroH1: "Thank you for shaping the next generation.",
    heroLead:
      "Currently teaching at any Washington-state K-12 school — public, private, or charter? Twenty percent off every visit. Bring your district ID or current pay stub on your first visit and we'll tag your account.",
    recognitionLine: "What you do in the classroom outlasts everything we sell here. We're grateful.",
    idRequired: "Bring your 21+ ID plus one of:",
    idExamples: [
      "District ID badge",
      "Current pay stub showing the school district",
      "OSPI certificate of teaching",
      "School-issued employment letter",
    ],
    faqs: [
      {
        q: "I'm a paraeducator / aide / counselor. Do I qualify?",
        a: "If you're employed by a K-12 school in any classroom-adjacent role — yes. Paraeducators, instructional aides, school counselors, librarians, special-ed staff. The badge is the credential.",
      },
      {
        q: "I teach at a community college or university. Does that count?",
        a: "The Heroes Teachers cohort is K-12 specifically. Higher-ed isn't currently in scope, but we're always open to feedback if Doug expands the program.",
      },
      {
        q: "Substitute teachers?",
        a: "Yes — current substitute-teaching credentials with active-on-call status qualify. Bring your sub-list paperwork or district ID.",
      },
      {
        q: "Summer break — does the discount pause?",
        a: "No. Once we've credentialed you for the school year, you're in for summer. Re-credential happens annually if your status changes.",
      },
    ],
    searchKeywords: [
      "teacher cannabis discount Wenatchee",
      "teacher dispensary discount Washington",
      "K-12 teacher weed discount",
      "school staff cannabis discount",
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(COHORTS).map((cohort) => ({ cohort }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cohort: string }>;
}): Promise<Metadata> {
  const { cohort } = await params;
  const c = COHORTS[cohort];
  if (!c) return { title: `Heroes · ${STORE.name}` };
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    keywords: c.searchKeywords,
    alternates: { canonical: `/heroes/${c.slug}` },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      url: `${STORE.website}/heroes/${c.slug}`,
    },
  };
}

export default async function HeroesCohortPage({
  params,
}: {
  params: Promise<{ cohort: string }>;
}) {
  const { cohort } = await params;
  const c = COHORTS[cohort];
  if (!c) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  // LocalBusiness + Offer schema for the cohort discount — gives Google
  // direct semantic signal of "20% discount available at this location
  // for this audience."
  const offerSchema = {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: `${c.label} Discount — ${STORE.name}`,
    description: c.metaDescription,
    discount: "20",
    discountCode: c.label,
    eligibleCustomerType: c.label,
    seller: {
      "@type": "LocalBusiness",
      name: STORE.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: STORE.address.street,
        addressLocality: STORE.address.city,
        addressRegion: STORE.address.state,
        postalCode: STORE.address.zip,
      },
    },
    url: `${STORE.website}/heroes/${c.slug}`,
  };

  return (
    <main className="min-h-[80vh] bg-stone-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-green-950 text-white">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 80% 50%, rgba(74,222,128,0.25), transparent), radial-gradient(ellipse 50% 60% at 15% 100%, rgba(251,191,36,0.18), transparent)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-amber-300 text-xs font-bold uppercase tracking-[0.18em] mb-3">
            {c.heroEyebrow}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">{c.heroH1}</h1>
          <p className="text-emerald-100/85 mt-4 text-base sm:text-lg leading-relaxed max-w-2xl">
            {c.heroLead}
          </p>
          <p className="text-amber-200 text-sm sm:text-base italic mt-3 max-w-2xl">
            {c.recognitionLine}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 text-green-950 text-sm font-bold">
              <span className="text-base">★</span> 20% off · every visit
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold">
              No expiration · stacks with loyalty
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12 sm:space-y-14">
        {/* What to bring */}
        <section className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
              What to bring
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              {c.idRequired}
            </h2>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {c.idExamples.map((ex) => (
              <li
                key={ex}
                className="rounded-xl bg-white border border-stone-200 p-4 flex items-start gap-3"
              >
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span className="text-stone-700 text-sm leading-relaxed">{ex}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className="rounded-2xl bg-green-50 border border-green-200 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-green-900 tracking-tight mb-4">
            How it works
          </h2>
          <ol className="space-y-3 text-stone-700 text-sm sm:text-base leading-relaxed">
            <li className="flex gap-3">
              <span className="font-extrabold text-green-700 shrink-0">1.</span>
              <span>
                Stop in. Bring your 21+ ID and the credential listed above.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-extrabold text-green-700 shrink-0">2.</span>
              <span>
                Tell our budtender you&rsquo;re here under the {c.label} program. They&rsquo;ll verify
                your credential at the counter — takes ~30 seconds.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-extrabold text-green-700 shrink-0">3.</span>
              <span>
                We&rsquo;ll get you signed up for our loyalty program at the same time so the discount
                AND your loyalty points stack on every future visit. <strong>One signup, lifetime benefit.</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-extrabold text-green-700 shrink-0">4.</span>
              <span>
                Every visit after that, the {c.label} discount is automatic. No re-credentialing, no
                fine print.
              </span>
            </li>
          </ol>
        </section>

        {/* FAQs */}
        <section className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
              Common questions
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              Quick answers before you stop in.
            </h2>
          </div>
          <div className="space-y-3">
            {c.faqs.map((f) => (
              <details
                key={f.q}
                className="rounded-xl bg-white border border-stone-200 overflow-hidden group"
              >
                <summary className="cursor-pointer p-4 sm:p-5 font-semibold text-stone-900 hover:bg-stone-50 list-none flex items-start justify-between gap-3">
                  <span>{f.q}</span>
                  <span className="text-green-600 group-open:rotate-180 transition-transform shrink-0">
                    ⌄
                  </span>
                </summary>
                <p className="px-4 sm:px-5 pb-5 text-stone-600 text-sm leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-stone-900 text-white p-6 sm:p-10 text-center">
          <p className="text-amber-300 text-xs font-bold uppercase tracking-[0.18em] mb-3">
            Ready when you are
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            See what&rsquo;s on the menu today.
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-6">
            Browse the live menu, then stop by — we&rsquo;ll handle credentialing at the counter.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/menu"
              className="px-6 py-3 rounded-full bg-amber-400 text-green-950 text-sm font-bold hover:bg-amber-300 transition-colors"
            >
              View menu →
            </Link>
            <Link
              href="/heroes"
              className="px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              Verify your eligibility →
            </Link>
            <Link
              href="/visit"
              className="px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              Hours + directions
            </Link>
          </div>
        </section>

        {/* Cross-link to other cohorts */}
        <section className="border-t border-stone-200 pt-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500 mb-3">
            Other Heroes cohorts
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.values(COHORTS)
              .filter((other) => other.slug !== c.slug)
              .map((other) => (
                <Link
                  key={other.slug}
                  href={`/heroes/${other.slug}`}
                  className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-green-100 text-stone-700 hover:text-green-800 text-xs font-semibold transition-colors"
                >
                  {other.label}
                </Link>
              ))}
            <Link
              href="/heroes"
              className="px-3 py-1.5 rounded-full bg-green-700 hover:bg-green-600 text-white text-xs font-semibold transition-colors"
            >
              All cohorts →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

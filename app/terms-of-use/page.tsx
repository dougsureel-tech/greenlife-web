import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms of use for the ${STORE.name} website. Cannabis is for adults 21 and over. WA residents only.`,
  alternates: { canonical: "/terms-of-use" },
};

const EFFECTIVE_DATE = "May 2, 2026";

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-stone-50">
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
            Terms of Use
          </h1>
          <p className="mt-4 max-w-2xl text-green-100/80 leading-relaxed">
            The rules for using this website. Short, plain, and binding when you keep using the
            site after reading them.
          </p>
          <p className="mt-3 text-xs text-green-300/60">Effective {EFFECTIVE_DATE}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {/* The three pinned clauses — the high-stakes ones, up top, in
            high-contrast cards so a casual reader cannot miss them. */}
        <aside
          role="note"
          aria-label="Federal law acknowledgement"
          className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 sm:p-6 text-stone-900"
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-800">
            Federal law acknowledgement
          </p>
          <p className="mt-2 text-sm sm:text-base leading-relaxed">
            YOU FURTHER ACKNOWLEDGE THAT UNDER FEDERAL LAW MARIJUANA IS ILLEGAL, AND CONDUCT
            INCLUDING, BUT NOT LIMITED TO, THE MANUFACTURING, DISTRIBUTING, DISPENSING, OR
            POSSESSION OF MARIJUANA CAN SUBJECT INDIVIDUALS TO ARREST AND/OR PROSECUTION FOR DOING
            SO.
          </p>
        </aside>

        <aside
          role="note"
          aria-label="Washington residents only"
          className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 sm:p-6 text-stone-900"
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
            Washington residents only
          </p>
          <p className="mt-2 text-sm sm:text-base leading-relaxed">
            The Site is only intended for residents of the State of Washington. If you are
            visiting from another state or country, the products and information on this site may
            not be lawful where you are. Cannabis cannot be shipped or transported across state
            lines under any circumstance.
          </p>
        </aside>

        <aside
          role="note"
          aria-label="Medical disclaimer"
          className="rounded-2xl border-2 border-stone-300 bg-stone-100 p-5 sm:p-6 text-stone-900"
        >
          <p className="text-[11px] font-bold uppercase tracking-widest text-stone-700">
            Medical disclaimer
          </p>
          <p className="mt-2 text-sm sm:text-base leading-relaxed">
            {STORE.name.toUpperCase()} DOES NOT OFFER MEDICAL ADVICE. ANY INFORMATION ACCESSED
            THROUGH THE SITE OR THROUGH ANY OF {STORE.name.toUpperCase()} ASSOCIATED SOCIAL MEDIA
            PAGES IS FOR INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY. Always consult a licensed
            healthcare provider about your medical condition or medications before using cannabis.
          </p>
        </aside>

        {/* Standard ToS sections, written at a 9th-grade reading level. */}
        <section className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            1. Acceptance
          </h2>
          <p className="text-stone-700 leading-relaxed">
            By using this website you agree to these Terms of Use. If you do not agree, please
            stop using the site. Your continued use after a change to these terms means you accept
            the change.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            2. You must be 21 or over
          </h2>
          <p className="text-stone-700 leading-relaxed">
            Washington-licensed cannabis retail is restricted to adults 21 and over with valid
            government-issued ID. By entering this site you represent that you are 21 or older.
            Misrepresenting your age is a violation of these terms and of Washington law (RCW
            69.50.357).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            3. Pickup only — no delivery, no shipping
          </h2>
          <p className="text-stone-700 leading-relaxed">
            All orders placed through this site are for in-store pickup at {STORE.address.full}.
            We do not deliver. We do not ship cannabis products by mail or courier. We do not ship
            to any address outside of Washington under any circumstance. The person picking up an
            order must be 21+ with valid ID matching the account holder.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            4. Cash only at the register
          </h2>
          <p className="text-stone-700 leading-relaxed">
            {STORE.name} is cash-only. We do not accept credit cards, debit cards, or digital
            wallets. There is an ATM on premises. Online order totals are estimates — final price
            with tax is calculated and paid at pickup, in cash.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            5. Site content
          </h2>
          <p className="text-stone-700 leading-relaxed">
            Product photos, descriptions, prices, and inventory levels on this site are
            best-effort and may not match the in-store reality at the moment you arrive. We try to
            keep the site fresh and we apologize for any frustration when stock or price differs.
            The price at the register controls the transaction. Brand logos and trademarks belong
            to their respective owners and appear here for product identification only.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            6. Acceptable use
          </h2>
          <p className="text-stone-700 leading-relaxed">You agree not to:</p>
          <ul className="space-y-1.5 text-sm text-stone-700">
            <li className="flex gap-2">
              <span aria-hidden className="text-emerald-700">
                ·
              </span>
              <span>Misrepresent your age, identity, or residency.</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="text-emerald-700">
                ·
              </span>
              <span>
                Attempt to access another customer&apos;s account, order history, or loyalty
                balance.
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="text-emerald-700">
                ·
              </span>
              <span>
                Scrape, mirror, or rebuild the site for a commercial purpose without written
                permission.
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="text-emerald-700">
                ·
              </span>
              <span>
                Place orders on behalf of someone under 21, or to be picked up by someone under
                21.
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="text-emerald-700">
                ·
              </span>
              <span>
                Use the site to harass our staff, our customers, or any specific community.
              </span>
            </li>
          </ul>
          <p className="text-stone-700 leading-relaxed">
            We may suspend or close an account that violates these rules.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            7. Intellectual property
          </h2>
          <p className="text-stone-700 leading-relaxed">
            The site design, copy, and original imagery are owned by {STORE.name}. You may share
            individual pages by link or screenshot for personal, non-commercial use. Do not copy
            substantial portions of the site for commercial use without written permission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            8. Disclaimers
          </h2>
          <p className="text-stone-700 leading-relaxed">
            The site is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; We do not
            warrant uninterrupted availability or that the site is free of errors. We do not make
            efficacy claims about cannabis products beyond manufacturer-supplied lab results. We
            do not promise that any product will produce a particular outcome for you.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            9. Limitation of liability
          </h2>
          <p className="text-stone-700 leading-relaxed">
            To the fullest extent permitted by Washington law, {STORE.name} is not liable for
            indirect, incidental, special, or consequential damages arising from your use of the
            site or from a product purchased through pickup. Our total liability for any claim
            relating to the site is limited to the amount you paid for the order in question.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            10. Governing law and disputes
          </h2>
          <p className="text-stone-700 leading-relaxed">
            These terms are governed by the laws of the State of Washington. Any dispute will be
            resolved in the state or federal courts located in Chelan County, Washington. You and
            we each waive the right to participate in a class action against the other arising out
            of these terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            11. Changes
          </h2>
          <p className="text-stone-700 leading-relaxed">
            We may update these terms from time to time. We will update the effective date at the
            top of this page when we do. Material changes will also be communicated to active
            account holders by email.
          </p>
        </section>

        {/* Contact strip */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-extrabold text-stone-900 tracking-tight">Contact</h2>
          <p className="text-sm text-stone-700 leading-relaxed">
            <strong>{STORE.name}</strong>
            <br />
            {STORE.address.full}
            <br />
            WSLCB License #{STORE.wslcbLicense}
          </p>
          <ul className="text-sm text-stone-700 space-y-1.5">
            <li>
              <span className="font-semibold">Email:</span>{" "}
              <a
                href={`mailto:${STORE.email}?subject=Terms%20of%20Use%20Question`}
                className="text-emerald-800 underline underline-offset-2 hover:text-emerald-600"
              >
                {STORE.email}
              </a>
            </li>
            <li>
              <span className="font-semibold">Phone:</span>{" "}
              <a
                href={`tel:${STORE.phoneTel}`}
                className="text-emerald-800 underline underline-offset-2 hover:text-emerald-600"
              >
                {STORE.phone}
              </a>
            </li>
          </ul>
        </section>

        <p className="text-xs text-stone-500 leading-relaxed text-center">
          See also our{" "}
          <Link
            href="/health-data-policy"
            className="font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-600"
          >
            Consumer Health Data Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/accessibility"
            className="font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-600"
          >
            Accessibility &amp; Health Information
          </Link>
          .
        </p>

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
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { CURRENT_TEAM, ALUMNI_TEAM, initialOf, type TeamMember } from "@/lib/team";

export const metadata: Metadata = {
  title: "Our Story",
  description: `The story of ${STORE.name} — a Wenatchee neighborhood dispensary built by everyone who's worked here. Veteran-owned, WSLCB licensed.`,
  alternates: { canonical: "/our-story" },
  openGraph: {
    title: `Our Story · ${STORE.name}`,
    description: `Built by everyone who's worked here. ${STORE.address.full}.`,
    url: `${STORE.website}/our-story`,
  },
};

export default function OurStoryPage() {
  return (
    <>
      {/* Hero — gradient bookend matching the rest of the site. */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-950 via-emerald-950 to-green-950 text-white py-12 sm:py-16">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 80% 50%, rgba(74,222,128,0.2), transparent), radial-gradient(ellipse 50% 60% at 15% 100%, rgba(251,191,36,0.12), transparent)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-emerald-300 text-xs font-bold uppercase tracking-[0.18em] mb-2">Our Story</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            A Wenatchee shop, built by the people who&apos;ve worked here.
          </h1>
          <p className="text-emerald-100/80 mt-4 text-base sm:text-lg leading-relaxed max-w-2xl">
            We&apos;re a small, veteran-owned cannabis shop on {STORE.address.street.split(",")[0]}.
            Open every day. Cash only with an ATM on site. WSLCB licensed.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-14 sm:space-y-16">
        {/* Story — three short paragraphs, conversational, no marketing voice. */}
        <section className="space-y-5 text-stone-700 leading-relaxed">
          <p>
            Green Life opened in Wenatchee because we wanted a real cannabis shop here — one staffed
            by people who actually know the products and treat every customer like a regular. Not a
            chain, not a tourist stop, not a dispensary that thinks &quot;cannabis&quot; is a brand
            unto itself. Just a good shop in a town we love.
          </p>
          <p>
            We&apos;re open every day of the year, including holidays. We&apos;re cash-only because
            cannabis is still federally illegal and banks won&apos;t process card payments — there&apos;s
            an ATM on site if you forgot. Walk-ins always welcome, and online orders save 15%.
          </p>
          <p>
            We don&apos;t try to be the loudest or the cheapest. We try to be the place you actually
            want to come back to.
          </p>
        </section>

        {/* Current team */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              The Team
            </h2>
            <p className="text-stone-500 text-sm mt-1.5">
              The people you&apos;ll see when you walk in.
            </p>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CURRENT_TEAM.map((m) => (
              <PersonCard key={m.name} member={m} />
            ))}
          </ul>
        </section>

        {/* Alumni */}
        {ALUMNI_TEAM.length > 0 && (
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                People Who Built This Place
              </h2>
              <p className="text-stone-500 text-sm mt-1.5">
                The shop is also made by everyone who&apos;s worked here over the years. If you&apos;re
                a regular, you probably remember a few of these faces.
              </p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ALUMNI_TEAM.map((m) => (
                <PersonCard key={m.name} member={m} muted />
              ))}
            </ul>
          </section>
        )}

        {/* Practical close — the only "CTA" on the page. Subtle. */}
        <section className="rounded-2xl border border-stone-200 bg-stone-50 px-6 py-6 space-y-3">
          <p className="text-stone-700 leading-relaxed">
            Stop in any day from 8am to 11pm. Bring an ID and cash (or use the ATM in the corner).
            We&apos;ll take care of the rest.
          </p>
          <div className="flex flex-wrap gap-3 pt-1 text-sm">
            <Link href="/visit" className="font-semibold text-emerald-700 hover:text-emerald-600 transition-colors">
              Hours + directions →
            </Link>
            <span className="text-stone-300">·</span>
            <Link href="/menu" className="font-semibold text-emerald-700 hover:text-emerald-600 transition-colors">
              Today&apos;s menu →
            </Link>
            <span className="text-stone-300">·</span>
            <span className="text-stone-500">WSLCB License #{STORE.wslcbLicense}</span>
          </div>
        </section>
      </div>
    </>
  );
}

function PersonCard({ member, muted = false }: { member: TeamMember; muted?: boolean }) {
  return (
    <li
      className={`flex items-start gap-4 rounded-2xl border px-5 py-4 ${
        muted
          ? "border-stone-100 bg-white"
          : "border-stone-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all"
      }`}
    >
      {member.photoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.photoSrc}
          alt={member.name}
          className={`shrink-0 w-14 h-14 rounded-full object-cover ${muted ? "grayscale-[20%]" : ""}`}
        />
      ) : (
        <div
          aria-hidden="true"
          className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${
            muted
              ? "bg-stone-100 text-stone-500 border border-stone-200"
              : "bg-gradient-to-br from-green-700 to-emerald-800 text-white"
          }`}
        >
          {initialOf(member.name)}
        </div>
      )}
      <div className="min-w-0">
        <p className="font-bold text-stone-900 text-sm">
          {member.name}{" "}
          <span className="font-medium text-stone-500">· {member.role}</span>
        </p>
        <p className="text-xs text-stone-600 leading-relaxed mt-1">{member.oneLine}</p>
      </div>
    </li>
  );
}

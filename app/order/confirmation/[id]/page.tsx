import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getOrCreatePortalUser, getOrder } from "@/lib/portal";
import { STORE } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order confirmed" };

const TZ = "America/Los_Angeles";

function fmtPickupTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
  });
}

function fmtPickupDay(iso: string): string {
  const d = new Date(iso);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
  const orderDay = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
  if (today === orderDay) return "today";
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  if (orderDay === new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(tomorrow)) return "tomorrow";
  return d.toLocaleDateString("en-US", { timeZone: TZ, weekday: "long", month: "short", day: "numeric" });
}

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=/order/confirmation/${id}`);

  const portalUser = await getOrCreatePortalUser(userId);
  const order = await getOrder(id, portalUser.id);
  if (!order) notFound();

  const pickupLabel = order.pickupTime ? fmtPickupTime(order.pickupTime) : null;
  const pickupDay = order.pickupTime ? fmtPickupDay(order.pickupTime) : null;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Hero confirmation */}
        <div className="rounded-3xl bg-gradient-to-br from-green-900 to-green-800 text-white p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-2xl">
              ✓
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-green-300/80 font-bold">Order placed</p>
              <h1 className="text-2xl font-extrabold tracking-tight">You&rsquo;re all set</h1>
            </div>
          </div>
          {pickupLabel && pickupDay && (
            <div className="rounded-2xl bg-white/10 px-5 py-4">
              <p className="text-xs text-green-300/80 font-bold uppercase tracking-widest">Ready for pickup</p>
              <p className="text-3xl font-black mt-1">{pickupLabel}</p>
              <p className="text-sm text-green-200/90 mt-0.5">{pickupDay}</p>
            </div>
          )}
          <p className="text-sm text-green-100/90 leading-relaxed">
            Bring your ID and cash. We&rsquo;ll have your order packed and waiting.
          </p>
        </div>

        {/* Items */}
        <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900">Your order</h2>
            <p className="text-xs text-stone-400 font-mono">#{order.id.slice(0, 8)}</p>
          </div>
          <ul className="divide-y divide-stone-100">
            {order.items.map((item) => (
              <li key={item.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-stone-900 truncate">{item.productName}</p>
                  {item.brand && <p className="text-xs text-stone-400">{item.brand}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-stone-500">×{item.quantity}</p>
                  <p className="text-sm font-bold text-stone-900 tabular-nums">${item.lineTotal.toFixed(2)}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-5 py-4 bg-stone-50 flex items-center justify-between">
            <p className="text-sm text-stone-500">Est. total &middot; cash in store</p>
            <p className="text-xl font-extrabold text-stone-900 tabular-nums">${order.subtotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Pickup details */}
        <div className="rounded-2xl bg-white border border-stone-200 px-5 py-4 space-y-3 text-sm">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">Pick up at</p>
            <p className="text-stone-900 font-semibold mt-0.5">{STORE.name}</p>
            <p className="text-stone-500 text-xs">{STORE.address.full}</p>
          </div>
          <div className="flex flex-wrap gap-3 pt-2 border-t border-stone-100">
            <a
              href={STORE.googleMapsUrl}
              target="_blank"
              rel="noopener"
              className="text-xs font-semibold text-green-700 hover:text-green-600"
            >
              Get directions →
            </a>
            <a href={`tel:${STORE.phoneTel}`} className="text-xs font-semibold text-green-700 hover:text-green-600">
              {STORE.phone}
            </a>
          </div>
        </div>

        {order.notes && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Your notes</p>
            <p className="text-sm text-amber-900 mt-1">{order.notes}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Link
            href="/account/orders"
            className="flex-1 text-center px-5 py-3 rounded-2xl border border-stone-200 bg-white text-stone-700 font-semibold text-sm hover:bg-stone-50 transition-colors"
          >
            All my orders
          </Link>
          <Link
            href="/menu"
            className="flex-1 text-center px-5 py-3 rounded-2xl bg-green-700 hover:bg-green-600 text-white font-bold text-sm transition-colors"
          >
            Order more
          </Link>
        </div>
      </div>
    </div>
  );
}

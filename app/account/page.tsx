import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreatePortalUser, getOrders } from "@/lib/portal";
import { STORE } from "@/lib/store";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Account", robots: { index: false } };

const STATUS_LABEL: Record<string, string> = {
  pending:    "Order Received",
  preparing:  "Being Prepared",
  ready:      "Ready for Pickup!",
  picked_up:  "Picked Up",
  cancelled:  "Cancelled",
};
const STATUS_COLOR: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-800 border-amber-200",
  preparing: "bg-blue-100 text-blue-800 border-blue-200",
  ready:     "bg-green-100 text-green-800 border-green-200",
  picked_up: "bg-stone-100 text-stone-500 border-stone-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};
const STATUS_ICON: Record<string, string> = {
  pending: "⏳", preparing: "👨‍🍳", ready: "✅", picked_up: "🎉", cancelled: "✕",
};

export default async function AccountPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const portalUser = await getOrCreatePortalUser(
    userId,
    user?.emailAddresses[0]?.emailAddress,
    user?.fullName
  );
  const orders = await getOrders(portalUser.id);
  const activeOrders = orders.filter((o) => !["picked_up", "cancelled"].includes(o.status));
  const pastOrders = orders.filter((o) => ["picked_up", "cancelled"].includes(o.status)).slice(0, 5);
  const firstName = portalUser.name?.split(" ")[0] ?? null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">
            {firstName ? `Hey, ${firstName} 👋` : "My Account"}
          </h1>
          <p className="text-stone-400 text-sm mt-0.5">{STORE.name}</p>
        </div>
        <Link href="/account/profile"
          className="flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-green-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </Link>
      </div>

      {/* Loyalty card */}
      <div className="rounded-3xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-emerald-700 to-green-900" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(ellipse at 80% 0%, #4ade80, transparent 60%)" }} />
        <div className="relative px-6 py-7 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-green-200 text-xs font-bold uppercase tracking-widest">Loyalty Points</div>
            <div className="text-6xl font-extrabold text-white leading-none">{portalUser.loyaltyPoints.toLocaleString()}</div>
            <div className="text-green-300 text-sm font-medium">points earned at {STORE.name}</div>
          </div>
          <div className="text-right space-y-1 shrink-0">
            <div className="text-5xl opacity-20 select-none">🌿</div>
            {portalUser.name && (
              <div className="text-green-300/80 text-xs font-medium">{portalUser.name}</div>
            )}
          </div>
        </div>
      </div>

      {/* Active orders */}
      {activeOrders.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold text-stone-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Active Orders
          </h2>
          {activeOrders.map((order) => {
            const isReady = order.status === "ready";
            return (
              <div key={order.id}
                className={`rounded-2xl border bg-white p-5 space-y-4 transition-all ${isReady ? "border-green-300 shadow-md shadow-green-100" : "border-stone-200"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${STATUS_COLOR[order.status] ?? "bg-stone-100 text-stone-600 border-stone-200"}`}>
                    <span>{STATUS_ICON[order.status]}</span>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <span className="text-xs text-stone-400">{new Date(order.placedAt).toLocaleString()}</span>
                </div>
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-stone-700">{item.quantity > 1 && `${item.quantity}× `}{item.productName}</span>
                      <span className="text-stone-400 font-medium">${item.lineTotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-stone-100 text-sm font-bold text-stone-900">
                  <span>Total</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                {isReady && (
                  <div className="rounded-xl bg-green-600 text-white px-4 py-3 text-sm font-bold text-center">
                    🎉 Your order is ready! Come in and pay cash at the counter.
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/order"
          className="group flex flex-col items-center gap-2.5 p-5 rounded-2xl bg-green-800 hover:bg-green-700 text-white transition-all text-center hover:-translate-y-0.5 shadow-md shadow-green-900/20">
          <span className="text-2xl">🛒</span>
          <span className="text-sm font-bold">Place Order</span>
        </Link>
        <Link href="/account/orders"
          className="group flex flex-col items-center gap-2.5 p-5 rounded-2xl border border-stone-200 bg-white hover:border-green-300 hover:shadow-sm transition-all text-center">
          <span className="text-2xl">📋</span>
          <span className="text-sm font-bold text-stone-700">Order History</span>
        </Link>
      </div>

      {/* Past orders */}
      {pastOrders.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-stone-800 text-sm">Recent Orders</h2>
            <Link href="/account/orders" className="text-xs text-green-700 hover:text-green-600 font-semibold">View all →</Link>
          </div>
          <div className="rounded-2xl border border-stone-100 bg-white overflow-hidden divide-y divide-stone-50">
            {pastOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-stone-50 transition-colors">
                <div className="text-stone-500">
                  {new Date(order.placedAt).toLocaleDateString()} · {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-stone-900 font-bold">${order.subtotal.toFixed(2)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLOR[order.status] ?? "bg-stone-100 text-stone-600 border-stone-200"}`}>
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {orders.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-stone-200 py-14 text-center space-y-4">
          <div className="text-4xl">🛒</div>
          <div>
            <p className="font-semibold text-stone-700">No orders yet</p>
            <p className="text-stone-400 text-sm mt-1">Browse our menu and place your first order</p>
          </div>
          <Link href="/order"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-green-700 hover:bg-green-600 text-white text-sm font-bold transition-all shadow-md hover:-translate-y-0.5">
            Shop Menu →
          </Link>
        </div>
      )}
    </div>
  );
}

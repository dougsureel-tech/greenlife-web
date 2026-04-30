import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreatePortalUser, getOrders } from "@/lib/portal";
import { STORE } from "@/lib/store";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Account", robots: { index: false } };

const STATUS_LABEL: Record<string, string> = {
  pending: "Received",
  preparing: "Preparing",
  ready: "Ready for Pickup!",
  picked_up: "Picked Up",
  cancelled: "Cancelled",
};
const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  preparing: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  picked_up: "bg-stone-100 text-stone-600",
  cancelled: "bg-red-100 text-red-700",
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

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {portalUser.name ? `Hey, ${portalUser.name.split(" ")[0]}` : "My Account"}
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">{STORE.name}</p>
        </div>
        <Link href="/account/profile" className="text-sm text-green-700 hover:text-green-600 font-medium">
          Profile →
        </Link>
      </div>

      {/* Points card */}
      <div className="rounded-2xl bg-gradient-to-br from-green-700 to-emerald-800 text-white p-6 flex items-center justify-between">
        <div>
          <div className="text-sm text-green-200 font-medium uppercase tracking-wide">Loyalty Points</div>
          <div className="text-5xl font-bold mt-1">{portalUser.loyaltyPoints}</div>
          <div className="text-green-200 text-sm mt-1">points earned</div>
        </div>
        <div className="text-6xl opacity-20">🌿</div>
      </div>

      {/* Active orders */}
      {activeOrders.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-stone-800">Active Orders</h2>
          {activeOrders.map((order) => (
            <div key={order.id} className="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status] ?? "bg-stone-100 text-stone-600"}`}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
                <span className="text-xs text-stone-400">{new Date(order.placedAt).toLocaleString()}</span>
              </div>
              <div className="space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-stone-700">
                    <span>{item.quantity > 1 && `${item.quantity}× `}{item.productName}</span>
                    <span className="text-stone-400">${item.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-stone-100 text-sm font-semibold text-stone-800">
                <span>Total</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.status === "ready" && (
                <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800 font-medium text-center">
                  🎉 Your order is ready! Come in to pick up and pay cash.
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-3">
        <Link href="/order"
          className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-stone-200 hover:border-green-400 hover:bg-green-50 transition-all text-center">
          <span className="text-2xl">🛒</span>
          <span className="text-sm font-medium text-stone-700">Place Order</span>
        </Link>
        <Link href="/account/orders"
          className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-stone-200 bg-white hover:border-green-300 transition-all text-center">
          <span className="text-2xl">📋</span>
          <span className="text-sm font-medium text-stone-700">Order History</span>
        </Link>
      </section>

      {/* Past orders preview */}
      {pastOrders.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-stone-800 text-sm">Recent Orders</h2>
            <Link href="/account/orders" className="text-xs text-green-700 hover:text-green-600">View all →</Link>
          </div>
          {pastOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between py-2 border-b border-stone-100 text-sm">
              <div className="text-stone-600">{new Date(order.placedAt).toLocaleDateString()} · {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}</div>
              <div className="flex items-center gap-2">
                <span className="text-stone-800 font-medium">${order.subtotal.toFixed(2)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status] ?? "bg-stone-100 text-stone-600"}`}>
                  {STATUS_LABEL[order.status]}
                </span>
              </div>
            </div>
          ))}
        </section>
      )}

      {orders.length === 0 && (
        <div className="text-center py-8 space-y-3">
          <p className="text-stone-400">No orders yet</p>
          <Link href="/order"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-medium transition-colors">
            Browse Menu & Order
          </Link>
        </div>
      )}
    </div>
  );
}

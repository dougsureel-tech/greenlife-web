import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreatePortalUser, getOrders } from "@/lib/portal";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order History", robots: { index: false } };

const STATUS_LABEL: Record<string, string> = {
  pending: "Received",
  preparing: "Preparing",
  ready: "Ready for Pickup!",
  picked_up: "Picked Up",
  cancelled: "Cancelled",
};
const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  preparing: "bg-blue-50 text-blue-700 border border-blue-200",
  ready: "bg-green-50 text-green-700 border border-green-200",
  picked_up: "bg-stone-100 text-stone-500 border border-stone-200",
  cancelled: "bg-red-50 text-red-600 border border-red-200",
};
const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-400",
  preparing: "bg-blue-400 animate-pulse",
  ready: "bg-green-400 animate-pulse",
  picked_up: "bg-stone-400",
  cancelled: "bg-red-400",
};

export default async function OrderHistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const portalUser = await getOrCreatePortalUser(userId, user?.emailAddresses[0]?.emailAddress, user?.fullName);
  const orders = await getOrders(portalUser.id);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/account" className="flex items-center gap-1.5 text-stone-400 hover:text-stone-600 text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Account
        </Link>
        <div className="h-4 w-px bg-stone-200" />
        <h1 className="text-xl font-bold text-stone-900">Order History</h1>
        {orders.length > 0 && (
          <span className="ml-auto text-xs text-stone-400">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white px-8 py-16 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-stone-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-stone-700">No orders yet</p>
            <p className="text-sm text-stone-400 mt-1">Your pickup order history will appear here</p>
          </div>
          <Link href="/order" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-green-700 text-white text-sm font-semibold hover:bg-green-600 transition-all hover:-translate-y-0.5 shadow-sm">
            Browse Menu →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
              {/* Order header row */}
              <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[order.status] ?? "bg-stone-400"}`} />
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status] ?? "bg-stone-100 text-stone-600 border border-stone-200"}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>
                <div className="text-xs text-stone-400 ml-auto">
                  {new Date(order.placedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  <span className="hidden sm:inline ml-1 text-stone-300">·</span>
                  <span className="hidden sm:inline ml-1">{new Date(order.placedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                </div>
              </div>

              {/* Line items */}
              <div className="px-5 py-4 space-y-2.5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-baseline justify-between gap-4 text-sm">
                    <div className="text-stone-700 min-w-0 truncate">
                      {item.quantity > 1 && <span className="text-stone-400 tabular-nums mr-1.5">{item.quantity}×</span>}
                      <span className="font-medium">{item.productName}</span>
                      {item.brand && <span className="text-stone-400 ml-1.5">· {item.brand}</span>}
                    </div>
                    <div className="text-stone-600 font-semibold tabular-nums shrink-0">${item.lineTotal.toFixed(2)}</div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                  <span className="text-sm text-stone-500">Cash at pickup</span>
                  <span className="text-base font-bold text-stone-900">${order.subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

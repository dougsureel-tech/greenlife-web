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
  ready: "Ready!",
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

export default async function OrderHistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const portalUser = await getOrCreatePortalUser(userId, user?.emailAddresses[0]?.emailAddress, user?.fullName);
  const orders = await getOrders(portalUser.id);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/account" className="text-stone-400 hover:text-stone-600 text-sm">← Account</Link>
        <h1 className="text-xl font-bold text-stone-900">Order History</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-stone-400">No orders yet</p>
          <Link href="/order" className="inline-flex px-5 py-2.5 rounded-xl bg-green-700 text-white text-sm font-medium hover:bg-green-600 transition-colors">
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-stone-200 bg-white overflow-hidden">
              <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <div className="text-xs text-stone-500">{new Date(order.placedAt).toLocaleString()}</div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status] ?? "bg-stone-100 text-stone-600"}`}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>
              <div className="p-4 space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="text-stone-700">
                      {item.quantity > 1 && <span className="text-stone-400 mr-1">{item.quantity}×</span>}
                      {item.productName}
                      {item.brand && <span className="text-stone-400 ml-1">· {item.brand}</span>}
                    </div>
                    <div className="text-stone-600 font-medium">${item.lineTotal.toFixed(2)}</div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-stone-100 text-sm font-bold text-stone-900">
                  <span>Total (cash at pickup)</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

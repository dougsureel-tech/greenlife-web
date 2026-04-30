import type { Metadata } from "next";
import { getMenuProducts } from "@/lib/db";
import { STORE } from "@/lib/store";
import { OrderMenu } from "./OrderMenu";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Order for Pickup",
  description: `Order cannabis online for pickup at ${STORE.name}. Browse flower, edibles, vapes, concentrates and more. Pay cash in store.`,
};

export default async function OrderPage() {
  const products = await getMenuProducts().catch(() => []);

  return (
    <>
      {/* Premium page header */}
      <div className="relative overflow-hidden bg-green-950 text-white py-10">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute inset-0 opacity-25"
          style={{ backgroundImage: "radial-gradient(ellipse 70% 80% at 20% 50%, #4ade80, transparent)" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1 space-y-2">
            <p className="text-green-400 text-xs font-bold uppercase tracking-widest">Pickup Menu</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Order for Pickup</h1>
            <p className="text-green-300/70 text-sm">Browse · Add to cart · Pick up &amp; pay cash · Earn points</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-green-300/60 sm:text-right">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_4px_#4ade80]" />
              Cash only · 21+ ID required
            </span>
          </div>
        </div>
      </div>
      <OrderMenu products={products} />
    </>
  );
}

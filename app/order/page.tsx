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
      <div className="bg-green-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl font-bold">Order for Pickup</h1>
          <p className="text-green-300 text-sm mt-1">Browse · Add to cart · Pick up & pay cash · Get points</p>
        </div>
      </div>
      <OrderMenu products={products} />
    </>
  );
}

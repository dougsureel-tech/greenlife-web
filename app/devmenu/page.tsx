import type { Metadata } from "next";
import { getMenuProducts } from "@/lib/db";
import { OrderMenu } from "../order/OrderMenu";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Dev Menu — In-Tree Preview",
  robots: { index: false, follow: false },
};

export default async function DevMenuPage() {
  const products = await getMenuProducts().catch(() => []);
  return (
    <>
      <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs px-4 py-2 text-center font-semibold">
        Dev preview · in-tree menu · not customer-facing
      </div>
      <OrderMenu products={products} />
    </>
  );
}

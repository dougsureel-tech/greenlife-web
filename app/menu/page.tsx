import type { Metadata } from "next";
import { STORE } from "@/lib/store";
import { JaneMenu } from "./JaneMenu";

export const metadata: Metadata = {
  title: "Menu",
  description: `Browse Green Life Cannabis's full menu — flower, edibles, vapes, concentrates, pre-rolls, and tinctures. Wenatchee, WA.`,
  alternates: { canonical: "/menu" },
};

export default function MenuPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-green-950 text-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">Live Menu</p>
          <h1 className="text-4xl font-extrabold tracking-tight">Our Menu</h1>
          <p className="text-green-300/70 mt-2 text-sm">
            {STORE.address.city}, WA · Updated daily · Must be 21+ to purchase
          </p>
        </div>
      </div>
      <JaneMenu storeId={STORE.iheartjaneStoreId} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
        <p className="text-stone-500 text-sm">
          Prices and availability subject to change. Call{" "}
          <a href={`tel:${STORE.phoneTel}`} className="text-green-700 hover:underline">{STORE.phone}</a>
          {" "}with questions.
        </p>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { STORE } from "@/lib/store";

export const metadata: Metadata = {
  title: "Menu",
  description: `Browse Green Life Cannabis's full menu — flower, edibles, vapes, concentrates, pre-rolls, and tinctures. Online ordering available at our Wenatchee, WA dispensary.`,
  alternates: { canonical: "/menu" },
};

export default function MenuPage() {
  return (
    <div className="min-h-screen">
      {/* Page header */}
      <div className="bg-green-950 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold">Our Menu</h1>
          <p className="text-green-300/80 mt-1 text-sm">
            {STORE.address.city}, WA · Updated daily · Must be 21+ to purchase
          </p>
        </div>
      </div>

      {/* iHeartJane embed */}
      <div className="w-full" style={{ minHeight: "80vh" }}>
        <iframe
          id="jane-menu"
          title={`${STORE.name} menu`}
          src={`https://api.iheartjane.com/v1/brands/embed/${STORE.iheartjaneStoreId}`}
          width="100%"
          style={{ border: 0, minHeight: "80vh", display: "block" }}
          loading="lazy"
          allowFullScreen
        />
      </div>

      {/* Note for users */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
        <p className="text-stone-500 text-sm">
          Prices and availability subject to change. For questions call{" "}
          <a href={`tel:${STORE.phoneTel}`} className="text-green-700 hover:underline">{STORE.phone}</a>
        </p>
      </div>
    </div>
  );
}

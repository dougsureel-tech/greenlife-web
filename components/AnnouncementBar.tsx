import Link from "next/link";
import { isOpenNow, nextOpenLabel, STORE } from "@/lib/store";

export function AnnouncementBar() {
  const open = isOpenNow();
  const status = nextOpenLabel();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Los_Angeles" });
  const todayHours = STORE.hours.find((h) => h.day === today);

  return (
    <div
      className={`text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center gap-3 flex-wrap ${open ? "bg-green-800 text-green-100" : "bg-stone-800 text-stone-300"}`}
    >
      <span className="flex items-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${open ? "bg-green-400 shadow-[0_0_4px_#4ade80]" : "bg-stone-500"}`}
        />
        {open
          ? `Open Now${todayHours ? ` · ${todayHours.open}–${todayHours.close}` : ""}`
          : `Closed · ${status}`}
      </span>
      <span className="hidden sm:block opacity-40">|</span>
      <Link
        href="/menu"
        className="opacity-75 hover:opacity-100 transition-opacity hidden sm:block font-semibold"
      >
        Order for Pickup →
      </Link>
      <span className="hidden sm:block opacity-40">|</span>
      <span className="opacity-75">Cash only · 21+ · Wenatchee</span>
    </div>
  );
}

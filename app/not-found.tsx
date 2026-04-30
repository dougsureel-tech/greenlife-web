import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
        <span className="text-4xl">🌿</span>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Page Not Found</h1>
        <p className="text-stone-500 mt-2 max-w-sm">
          That page doesn&apos;t exist. Browse our menu or head back home.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/" className="px-5 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-700 hover:border-green-300 hover:text-green-700 transition-colors">
          Home
        </Link>
        <Link href="/menu" className="px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-semibold transition-colors">
          Shop Menu
        </Link>
      </div>
    </div>
  );
}

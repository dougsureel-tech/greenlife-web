import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center space-y-8">
      <div>
        <div className="text-8xl font-extrabold text-stone-100 leading-none select-none">404</div>
        <div className="w-20 h-20 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto -mt-6">
          <span className="text-3xl">🌿</span>
        </div>
      </div>
      <div className="space-y-2 max-w-sm">
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Page Not Found</h1>
        <p className="text-stone-500 text-sm leading-relaxed">
          That page doesn&apos;t exist. Browse our menu or head back home.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/"
          className="px-5 py-2.5 rounded-xl border border-stone-200 hover:border-green-300 text-sm font-semibold text-stone-700 hover:text-green-700 transition-colors">
          Home
        </Link>
        <Link href="/menu"
          className="px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-bold transition-all shadow-md hover:-translate-y-0.5">
          Shop Menu
        </Link>
      </div>
    </div>
  );
}

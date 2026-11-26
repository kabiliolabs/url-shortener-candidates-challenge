import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-400 via-pink-500 to-cyan-300 py-12">
      <div className="bg-yellow-300 p-12 rounded-none border-8 border-dashed border-purple-600 w-full max-w-lg rotate-1 shadow-2xl shadow-red-500">
        <h1 className="text-4xl font-mono italic text-center mb-8 text-fuchsia-600 underline decoration-wavy decoration-green-500 tracking-widest">
          ~*~ 404 ~*~
        </h1>
        <p className="text-sm text-indigo-800 text-center font-bold bg-cyan-200 p-2 border-2 border-dotted border-orange-500">
          This page could not be found.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            to="/"
            prefetch="none"
            className="px-4 py-3 text-base bg-red-500 hover:bg-lime-500 text-yellow-200 border-4 border-teal-400 rounded-full skew-x-3 cursor-pointer"
          >
            ★ BACK HOME ★
          </Link>
        </div>
      </div>
    </main>
  );
}

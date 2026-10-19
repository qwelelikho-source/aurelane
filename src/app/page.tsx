import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-5xl font-serif text-amber-400 mb-4">Aurelane</h1>
        <p className="text-xl text-slate-400 mb-8">Private money tracking, in rand.</p>
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium py-3 px-6 rounded transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded transition-colors border border-slate-700"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

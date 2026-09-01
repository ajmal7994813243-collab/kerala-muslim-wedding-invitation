import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fcfaf8] text-[#3d171e] flex items-center justify-center px-5 py-16">

      <section className="w-full max-w-3xl text-center">

        {/* Decorative top */}
        <div className="flex items-center justify-center gap-5 mb-10">
          <div className="h-px w-20 bg-[#b9935a]" />
          <span className="text-[#b9935a] text-xl">✦</span>
          <div className="h-px w-20 bg-[#b9935a]" />
        </div>

        {/* Arabic */}
        <div className="arabic text-5xl md:text-7xl">
          السلام عليكم
        </div>

        {/* Heading */}
        <p className="mt-10 uppercase tracking-[0.45em] text-xs text-wine">
          A Beautiful Beginning
        </p>

        <h1 className="mt-5 text-5xl md:text-7xl font-serif text-wine">
          Wedding Invitation
        </h1>

        {/* Message */}
        <p className="mx-auto mt-7 max-w-xl text-lg leading-8 text-stone-600">
          With the blessings of Allah and the love of our families,
          we invite you to celebrate a beautiful new beginning with us.
        </p>

        {/* Couple */}
        <div className="mt-14">
          <p className="text-4xl md:text-6xl font-serif text-wine">
            AJMAL
          </p>

          <p className="my-3 text-2xl text-gold">
            &
          </p>

          <p className="text-4xl md:text-6xl font-serif text-wine">
            IRFANA
          </p>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-5 my-14">
          <div className="h-px w-20 bg-[#d9c5b7]" />
          <span className="text-[#b9935a]">✦</span>
          <div className="h-px w-20 bg-[#d9c5b7]" />
        </div>

        {/* Date */}
        <p className="text-lg">
          19/12/2026 · 10am
        </p>

        {/* Admin button */}
        <Link
          href="/admin/login"
          className="inline-block mt-10 rounded-full bg-wine px-8 py-3 text-white transition duration-300 hover:scale-105"
        >
          Admin Portal
        </Link>

      </section>

    </main>
  );
}
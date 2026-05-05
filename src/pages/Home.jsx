export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-taupe-500 via-olive-400 to-slate-400 px-10 py-10">
      <h1 className="text-5xl font-extrabold text-white text-center tracking-[0.25em] mb-10 mt-10">
          HOME
      </h1>

      <div className="flex items-center justify-center mb-16 px-20">
        <p className="text-center text-xl font-semibold text-white">
          Welcome to our furniture store! Explore our wide range of products and find the perfect pieces to enhance your living space.
        </p>
      </div>
    </main>
  );
}
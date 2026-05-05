import { useEffect, useState } from "react";
import ProductList from "../components/products/ProductList";
import { listenToFurniture } from "../services/furnitureService";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToFurniture((furnitureData) => {
      setProducts(furnitureData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f7f3] px-10 py-10">
      <section className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center tracking-[0.25em] mb-10">
          CATALOGUE
        </h1>

        <div className="flex items-center justify-center mb-16">
          <div className="w-full max-w-5xl border-t border-neutral-400 relative">
            <div className="absolute -top-[5px] left-0 right-0 flex justify-between">
              {Array.from({ length: 18 }).map((_, index) => (
                <span
                  key={index}
                  className="w-2 h-2 bg-[#f7f7f3] border border-neutral-400 rounded-full"
                ></span>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-xl font-semibold">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-xl font-semibold">
            No furniture products found.
          </p>
        ) : (
          <ProductList products={products} />
        )}
      </section>
    </main>
  );
}
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col items-center text-center text-black no-underline"
    >
      <div className="w-36 h-28 border-4 border-black bg-neutral-200 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full">
            <div className="absolute top-1/2 left-0 w-full h-[3px] bg-black rotate-45"></div>
            <div className="absolute top-1/2 left-0 w-full h-[3px] bg-black -rotate-45"></div>
          </div>
        )}
      </div>

      <h2 className="mt-3 text-lg font-extrabold leading-tight">
        {product.name}
      </h2>

      <p className="text-sm font-bold">Price: {product.price}€</p>
    </Link>
  );
}
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../firebase";
import {
  getUserSavedConfigurations,
  deleteSavedConfiguration,
} from "../services/configService";

export default function SavedConfigs() {
  const [user, setUser] = useState(null);
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const configs = await getUserSavedConfigurations(currentUser.uid);
        setSavedConfigs(configs);
      } else {
        setSavedConfigs([]);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function handleDeleteConfig(configId) {
    try {
      await deleteSavedConfiguration(configId);

      setSavedConfigs((currentConfigs) =>
        currentConfigs.filter((config) => config.id !== configId),
      );
    } catch (error) {
      console.error("Delete saved configuration error:", error);
      alert("Could not delete saved configuration.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7f3] px-12 py-12">
        <section className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-6">Saved Styles</h1>
          <p className="text-xl font-semibold">
            Loading saved configurations...
          </p>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f7f7f3] px-12 py-12">
        <section className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-6">Saved Styles</h1>

          <p className="text-xl mb-6">
            You need to sign in to view your saved styles.
          </p>

          <Link
            to="/login"
            className="inline-block bg-[#7f827a] text-white font-bold px-8 py-3 rounded-lg hover:bg-[#6f726b] transition"
          >
            Sign In
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f3] px-12 py-12">
      <section className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-10">Saved Styles</h1>

        {savedConfigs.length === 0 ? (
          <div>
            <p className="text-xl mb-6">
              You have not saved any furniture styles yet.
            </p>

            <Link
              to="/products"
              className="inline-block bg-[#7f827a] text-white font-bold px-8 py-3 rounded-lg hover:bg-[#6f726b] transition"
            >
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedConfigs.map((config) => (
              <article
                key={config.id}
                className="bg-white border border-neutral-300 rounded-2xl shadow-md p-6"
              >
                <div className="mb-5">
                  <h2 className="text-2xl font-extrabold mb-2">
                    {config.furnitureName}
                  </h2>

                  <p className="text-base text-neutral-700">
                    Category: {config.category}
                  </p>

                  <p className="text-base text-neutral-700">
                    Dimensions: {config.dimensions}
                  </p>

                  <p className="text-xl font-bold mt-3">
                    Price: {config.price}€
                  </p>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-12 h-12 rounded-full border border-black"
                    style={{
                      backgroundColor: config.selectedColor?.hex,
                    }}
                  ></div>

                  <div>
                    <p className="font-bold">Selected Colour</p>
                    <p className="text-neutral-700">
                      {config.selectedColor?.name}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    to={`/products/${config.furnitureId}?colorName=${encodeURIComponent(
                      config.selectedColor?.name || "",
                    )}&colorHex=${encodeURIComponent(config.selectedColor?.hex || "")}`}
                    className="flex-1 text-center bg-[#7f827a] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#6f726b] transition"
                  >
                    View
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDeleteConfig(config.id)}
                    className="flex-1 bg-red-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

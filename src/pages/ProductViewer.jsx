import { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../firebase";
import { getFurnitureById } from "../services/furnitureService";
import { saveConfiguration, checkSavedConfiguration } from "../services/configService";

import FurnitureCanvas from "../components/Scene/FurnitureCanvas";
import backBtn from "../assets/back.png";
import saveHeart from "../assets/saved.png";
import notHeart from "../assets/notSaved.png";
import stopSpin from "../assets/stopSpin.png";
import spin from "../assets/spin.png";

export default function ProductViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);

        const furnitureItem = await getFurnitureById(id);
        setProduct(furnitureItem);

        const savedColorName = searchParams.get("colorName");
        const savedColorHex = searchParams.get("colorHex");

        if (savedColorName && savedColorHex) {
          setSelectedColor({
            name: savedColorName,
            hex: savedColorHex,
          });
        } else if (furnitureItem?.colors?.length > 0) {
          setSelectedColor(furnitureItem.colors[0]);
        } else {
          setSelectedColor(null);
        }
      } catch (error) {
        console.error("Load product error:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id, searchParams]);

  useEffect(() => {
    async function checkIfAlreadySaved() {
      if (!user || !product || !selectedColor) {
        setIsSaved(false);
        return;
      }

      const alreadySaved = await checkSavedConfiguration(
        user.uid,
        product.id,
        selectedColor,
      );

      setIsSaved(alreadySaved);
    }

    checkIfAlreadySaved();
  }, [user, product, selectedColor]);

  async function handleSaveConfiguration() {
    try {
      if (!user) {
        navigate("/login");
        return;
      }

      if (!selectedColor) {
        alert("Please select a colour before saving this configuration.");
        return;
      }

      const alreadySaved = await checkSavedConfiguration(
        user.uid,
        product.id,
        selectedColor,
      );

      if (alreadySaved) {
        setIsSaved(true);
        alert("This configuration is already saved.");
        return;
      }

      await saveConfiguration(user, product, selectedColor);

      setIsSaved(true);
      alert("Configuration saved successfully.");
    } catch (error) {
      console.error("Save configuration error:", error);
      alert("Could not save configuration.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f7f3] p-10">
        <p className="text-xl font-semibold">Loading product...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#f7f7f3] p-10">
        <h1 className="text-2xl font-bold">Product not found</h1>

        <Link to="/products" className="underline">
          Back to catalogue
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f3] px-12 py-12">
      <section className="max-w-6xl mx-auto">
        <Link
          to="/products"
          className="inline-flex items-center justify-center w-12 h-12 relative -top-4"
        >
          <img src={backBtn} alt="Back" />
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h1 className="text-5xl font-light mb-8">{product.name}</h1>

            <div className="mb-8 max-w-md">
              <h2 className="text-lg font-extrabold">Description</h2>
              <p className="text-lg leading-snug">{product.description}</p>
            </div>

            <div className="mb-12">
              <h2 className="text-lg font-extrabold">Dimensions</h2>
              <p className="text-lg">{product.dimensions}</p>
            </div>

            <p className="text-4xl font-extrabold">Price: {product.price}€</p>
          </div>

          <div className="relative">
            <div className="relative w-full h-[360px] border-4 border-black bg-neutral-200">
              <FurnitureCanvas
                modelPath={product.modelPath}
                selectedColor={selectedColor?.hex}
                colorTarget={product.colorTarget}
                isRotating={isRotating}
              />

              <button
                type="button"
                onClick={handleSaveConfiguration}
                className="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-[#7d726f] flex items-center justify-center text-3xl shadow-md hover:scale-110 transition"
                title="Save configuration"
              >
                <img
                  src={isSaved ? saveHeart : notHeart}
                  alt={isSaved ? "Saved configuration" : "Save configuration"}
                  className="object-contain"
                />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsRotating((prev) => !prev)}
              className="absolute -left-16 top-[310px] w-12 h-12 rounded-full flex items-center justify-center transition hover:scale-110"
              title={isRotating ? "Stop rotation" : "Rotate model"}
            >
              <img
                src={isRotating ? stopSpin : spin}
                alt={isRotating ? "Stop rotation" : "Rotate model"}
                className="w-9 h-9 object-contain"
              />
            </button>

            <div className="flex justify-center gap-5 mt-8">
              {product.colors?.map((color) => (
                <button
                  key={color.name}
                  title={color.name}
                  onClick={() => {
                    setSelectedColor(color);
                  }}
                  className={`w-10 h-10 rounded-full hover:scale-110 transition-transform ${
                    selectedColor?.hex === color.hex
                      ? "border-4 border-[#a8a8ff]"
                      : "border border-black"
                  }`}
                  style={{ backgroundColor: color.hex }}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

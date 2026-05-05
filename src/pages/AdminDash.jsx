import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebase";
import {
  listenToFurniture,
  addFurniture,
  updateFurniture,
  deleteFurniture,
} from "../services/furnitureService";

const emptyForm = {
  name: "",
  category: "",
  description: "",
  dimensions: "",
  price: "",
  modelPath: "",
  imageUrl: "",
  colorTarget: "WOOD",
  isFeatured: false,
  colorsText: "",
};

export default function AdminDash() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(true);
  const [showProducts, setShowProducts] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setIsAdmin(false);
        setCheckingRole(false);
        navigate("/login");
        return;
      }

      const userRef = doc(db, "Users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        navigate("/");
      }

      setCheckingRole(false);
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribeFurniture = listenToFurniture((furnitureData) => {
      setProducts(furnitureData);
    });

    return () => unsubscribeFurniture();
  }, [isAdmin]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function convertColorsTextToArray(colorsText) {
    if (!colorsText.trim()) {
      return [];
    }

    return colorsText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const [name, hex] = line.split(",");

        return {
          name: name?.trim() || "",
          hex: hex?.trim() || "",
        };
      })
      .filter((color) => color.name && color.hex);
  }

  function convertColorsArrayToText(colors) {
    if (!colors || !Array.isArray(colors)) {
      return "";
    }

    return colors.map((color) => `${color.name}, ${color.hex}`).join("\n");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      if (!formData.name.trim()) {
        alert("Please enter a product name.");
        return;
      }

      if (!formData.category.trim()) {
        alert("Please enter a category.");
        return;
      }

      if (!formData.price) {
        alert("Please enter a price.");
        return;
      }

      if (!formData.modelPath.trim()) {
        alert("Please enter a model path.");
        return;
      }

      const productData = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        dimensions: formData.dimensions.trim(),
        price: Number(formData.price),
        modelPath: formData.modelPath.trim(),
        imageUrl: formData.imageUrl.trim(),
        colorTarget: formData.colorTarget.trim() || "WOOD",
        isFeatured: formData.isFeatured,
        colors: convertColorsTextToArray(formData.colorsText),
      };

      if (editingId) {
        await updateFurniture(editingId, productData);
        setMessage("Product updated successfully.");
      } else {
        await addFurniture(productData);
        setMessage("Product added successfully.");
      }

      setFormData(emptyForm);
      setEditingId(null);
    } catch (error) {
      console.error("Save product error:", error);
      alert("Could not save product.");
    }
  }

  function handleEdit(product) {
    setEditingId(product.id);

    setFormData({
      name: product.name || "",
      category: product.category || "",
      description: product.description || "",
      dimensions: product.dimensions || "",
      price: product.price || "",
      modelPath: product.modelPath || "",
      imageUrl: product.imageUrl || "",
      colorTarget: product.colorTarget || "WOOD",
      isFeatured: product.isFeatured || false,
      colorsText: convertColorsArrayToText(product.colors),
    });

    setMessage(`Editing ${product.name}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(productId, productName) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${productName}"?`,
    );

    if (!confirmed) return;

    try {
      await deleteFurniture(productId);
      setMessage("Product deleted successfully.");

      if (editingId === productId) {
        setEditingId(null);
        setFormData(emptyForm);
      }
    } catch (error) {
      console.error("Delete product error:", error);
      alert("Could not delete product.");
    }
  }

  function handleClearForm() {
    setFormData(emptyForm);
    setEditingId(null);
    setMessage("");
  }

  if (checkingRole) {
    return (
      <main className="min-h-screen bg-[#f7f7f3] p-12">
        <p className="text-xl font-bold">Checking admin access...</p>
      </main>
    );
  }

  if (!user || !isAdmin) {
    return (
      <main className="min-h-screen bg-[#f7f7f3] p-12">
        <h1 className="text-3xl font-bold">Access denied</h1>
        <p className="mt-3 text-lg">
          You must be signed in as an admin to view this page.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f3] px-12 py-12">
      <section className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold text-[#7d726f]">
            Admin Dashboard
          </h1>
        </div>

        {message && (
          <div className="mb-8 bg-white border border-neutral-300 rounded-xl p-4 font-semibold text-[#7d726f]">
            {message}
          </div>
        )}

        <div className="space-y-8">
          {/* Add/Edit Product collapsible section */}
          <section className="bg-white border border-neutral-300 rounded-2xl shadow-md overflow-hidden">
            <button
              type="button"
              onClick={() => setShowForm((prev) => !prev)}
              className="w-full flex items-center justify-between px-8 py-5 bg-[#7f827a] text-white"
            >
              <span className="text-2xl font-extrabold">
                {editingId ? "Edit Product" : "Add Product"}
              </span>

              <span className="text-3xl font-bold">{showForm ? "−" : "+"}</span>
            </button>

            {showForm && (
              <form onSubmit={handleSubmit} className="p-8">
                <h2 className="text-3xl font-extrabold mb-6 text-[#7d726f]">
                  {editingId ? "Edit Product" : "Add Product"}
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="block font-bold mb-1">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:border-[#7d726f]"
                      placeholder="Green Retro Chair"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:border-[#7d726f]"
                      placeholder="Chair"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:border-[#7d726f]"
                      placeholder="A matching retro chair with a green cushioned seat and wooden frame."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Dimensions</label>
                    <input
                      type="text"
                      name="dimensions"
                      value={formData.dimensions}
                      onChange={handleChange}
                      className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:border-[#7d726f]"
                      placeholder="55 x 55 x 85 cm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:border-[#7d726f]"
                      placeholder="160"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Model Path</label>
                    <input
                      type="text"
                      name="modelPath"
                      value={formData.modelPath}
                      onChange={handleChange}
                      className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:border-[#7d726f]"
                      placeholder="/models/retro_vintage_furniture_pack/retro-chair.glb"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Image URL</label>
                    <input
                      type="text"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:border-[#7d726f]"
                      placeholder="/images/retro-chair.jpg"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      Colour Target
                    </label>
                    <select
                      name="colorTarget"
                      value={formData.colorTarget}
                      onChange={handleChange}
                      className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:border-[#7d726f]"
                    >
                      <option value="WOOD">WOOD</option>
                      <option value="FABRIC">FABRIC</option>
                      <option value="METAL">METAL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Colours</label>
                    <p className="text-sm text-neutral-600 mb-2">
                      Write one colour per line using this format:
                      <br />
                      <strong>Name, #hexcode</strong>
                    </p>

                    <textarea
                      name="colorsText"
                      value={formData.colorsText}
                      onChange={handleChange}
                      rows="5"
                      className="w-full border border-neutral-300 rounded-lg px-4 py-3 outline-none focus:border-[#7d726f]"
                      placeholder={`Olive Green, #6f8a63\nDark Green, #3f5f3f\nLight Grey, #c8c8d8`}
                    ></textarea>
                  </div>

                  <label className="flex items-center gap-3 font-bold">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                    Featured Product
                  </label>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    type="submit"
                    className="flex-1 bg-[#7f827a] text-white font-bold px-6 py-3 rounded-lg hover:bg-[#6f726b] transition"
                  >
                    {editingId ? "Update Product" : "Add Product"}
                  </button>

                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="flex-1 bg-neutral-200 text-neutral-800 font-bold px-6 py-3 rounded-lg hover:bg-neutral-300 transition"
                  >
                    Clear
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Existing Products collapsible section */}
          <section className="bg-white border border-neutral-300 rounded-2xl shadow-md overflow-hidden">
            <button
              type="button"
              onClick={() => setShowProducts((prev) => !prev)}
              className="w-full flex items-center justify-between px-8 py-5 bg-[#7f827a] text-white"
            >
              <span className="text-2xl font-extrabold">Existing Products
                <span className="text-sm font-thin px-2">
                  {products.length} products
                </span>
              </span>

              

              <span className="text-3xl font-bold">
                {showProducts ? "−" : "+"}
              </span>
            </button>

            {showProducts && (
              <div className="p-8">
                {products.length === 0 ? (
                  <p className="text-lg">No furniture products found.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <article
                        key={product.id}
                        className="border border-neutral-300 rounded-xl p-5 bg-[#f7f7f3]"
                      >
                        <div className="mb-4">
                          <h3 className="text-2xl font-extrabold">
                            {product.name}
                          </h3>

                          <p className="text-neutral-700">
                            Category: {product.category}
                          </p>

                          <p className="text-neutral-700">
                            Price: {product.price}€
                          </p>

                          <p className="text-neutral-700 break-all text-sm mt-2">
                            Model: {product.modelPath}
                          </p>

                          <p className="text-neutral-700">
                            Target: {product.colorTarget}
                          </p>
                        </div>

                        <div className="flex gap-2 mb-4">
                          {product.colors?.map((color) => (
                            <div
                              key={`${product.id}-${color.name}`}
                              title={color.name}
                              className="w-8 h-8 rounded-full border border-black"
                              style={{ backgroundColor: color.hex }}
                            ></div>
                          ))}
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              handleEdit(product);
                              setShowForm(true);
                            }}
                            className="flex-1 bg-[#7f827a] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#6f726b] transition"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(product.id, product.name)
                            }
                            className="flex-1 bg-red-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

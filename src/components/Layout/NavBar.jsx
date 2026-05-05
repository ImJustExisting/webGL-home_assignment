import { NavLink, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

import logo from "../../assets/WebGL.png";
import searchIcon from "../../assets/search-icon.png";
import pfp from "../../assets/pfp.png";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, "Users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserRole(userSnap.data().role);
        } else {
          setUserRole("user");
        }
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      setProfileOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <header className="w-full h-28 bg-olive-400 flex items-center px-10 gap-12">
      {/* Logo */}
      <Link to="/" className="shrink-0">
        <img src={logo} alt="Logo" />
      </Link>

      {/* Navigation links */}
      <nav className="flex items-center gap-14">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `text-2xl font-bold tracking-wide no-underline ${
              isActive
                ? "text-taupe-500 border-b-4 border-taupe-500"
                : "text-taupe-500"
            }`
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `text-2xl font-bold tracking-wide no-underline ${
              isActive
                ? "text-taupe-500 border-b-4 border-taupe-500"
                : "text-taupe-500"
            }`
          }
        >
          Catalogue
        </NavLink>

        {userRole === "admin" && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `text-2xl font-bold tracking-wide no-underline ${
                isActive
                  ? "text-taupe-500 border-b-4 border-taupe-500"
                  : "text-taupe-500"
              }`
            }
          >
            Admin
          </NavLink>
        )}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-10">
        {/* Search bar */}
        <form className="relative">
          <input
            type="text"
            placeholder="Search furniture..."
            className="w-52 h-10 rounded-full bg-olive-600/50 px-5 pr-11 text-base text-white outline-none border border-neutral-400 focus:border-neutral-700"
          />

          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-black"
          >
            <img
              src={searchIcon}
              alt="Search"
              className="w-5 h-5"
            />
          </button>
        </form>

        {/* Profile dropdown */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-taupe-500"
          >
            <img
              src={pfp}
              alt="Profile"
              className="w-16 h-16 rounded-full cursor-pointer"
            />
          </button>

          {profileOpen && (
            <div className="absolute top-20 right-0 w-56 bg-white border border-neutral-300 rounded-xl shadow-lg p-4 z-50">
              {user ? (
                <div className="flex flex-col gap-3">
                  <NavLink
                    to="/saved-configs"
                    onClick={() => setProfileOpen(false)}
                    className="text-center bg-neutral-100 text-taupe-500 font-bold px-5 py-3 rounded-lg hover:bg-neutral-200 transition"
                  >
                    Saved Styles
                  </NavLink>

                  <button
                    onClick={handleLogout}
                    className="bg-[#7f827a] text-white font-bold px-5 py-3 rounded-lg tracking-wide hover:bg-[#6f726b] transition"
                  >
                    LOGOUT
                  </button>
                </div>
              ) : (
                <NavLink
                  to="/login"
                  onClick={() => setProfileOpen(false)}
                  className="block text-center bg-[#7f827a] text-white font-bold px-5 py-3 rounded-lg tracking-wide hover:bg-[#6f726b] transition"
                >
                  SIGN IN
                </NavLink>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

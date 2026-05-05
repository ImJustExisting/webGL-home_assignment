import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await loginUser(loginEmail, loginPassword);
      navigate("/products");
    } catch (err) {
      console.error(err);
      setError("Sign in failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (registerPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      await registerUser(registerEmail, registerPassword);
      setSuccess("Account created successfully. You are now signed in.");
      navigate("/products");
    } catch (err) {
      console.error(err);
      setError("Registration failed. This email may already be in use.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f3] px-10 py-16">
      <section className="max-w-6xl mx-auto">
        {(error || success) && (
          <div className="max-w-2xl mx-auto mb-8">
            {error && (
              <p className="bg-red-100 text-red-700 px-5 py-3 rounded-lg font-semibold">
                {error}
              </p>
            )}

            {success && (
              <p className="bg-green-100 text-green-700 px-5 py-3 rounded-lg font-semibold">
                {success}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-16 items-start">
          {/* Sign in side */}
          <section>
            <h1 className="text-3xl font-extrabold text-center mb-24">
              Sign In
            </h1>

            <form
              onSubmit={handleLogin}
              className="max-w-md mx-auto bg-[#dedede] p-10 space-y-6"
            >
              <div>
                <label className="block font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-neutral-400 outline-none focus:border-black"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-neutral-400 outline-none focus:border-black"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-800 text-white font-bold py-3 hover:bg-black transition disabled:bg-neutral-400"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </section>

          {/* Divider */}
          <div className="hidden lg:block w-1 bg-black min-h-[520px] mt-20"></div>

          {/* Register side */}
          <section>
            <h1 className="text-3xl font-extrabold text-center mb-24">
              Register
            </h1>

            <form
              onSubmit={handleRegister}
              className="max-w-md mx-auto bg-[#dedede] p-10 space-y-6"
            >
              <div>
                <label className="block font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-neutral-400 outline-none focus:border-black"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Password</label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-neutral-400 outline-none focus:border-black"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-800 text-white font-bold py-3 hover:bg-black transition disabled:bg-neutral-400"
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
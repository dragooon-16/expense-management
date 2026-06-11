"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#121212] px-4">
      <div className="w-full max-w-md rounded-xl bg-[#1e1e1e] p-8 border border-neutral-800 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white tracking-wide">TravelEx</h1>
          <p className="text-sm text-neutral-400 mt-1">Expense Portal Login</p>
        </div>

        {error && <div className="mb-4 text-xs bg-red-900/40 text-red-400 p-3 rounded-lg border border-red-800">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1">Corporate Email</label>
            <input 
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-[#262626] border border-neutral-700 p-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
              placeholder="name@company.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1">Password</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-[#262626] border border-neutral-700 p-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full rounded-lg bg-green-600 hover:bg-green-500 p-3 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

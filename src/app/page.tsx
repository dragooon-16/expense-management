"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. Session Safeguard: If a user lands here but is already logged in, route them to the dashboard automatically
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 2. Transmit credentials directly to your Firebase Auth pool
      await signInWithEmailAndPassword(auth, email, password);
      
      // 3. Explicitly forward the client to your main dashboard screen path
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Authentication fault caught:", err);
      // Strip Firebase formatting prefix to keep UI message presentation pristine
      const cleanMessage = err?.message ? err.message.replace("Firebase: ", "") : "An unexpected authentication error occurred.";
      setError(cleanMessage);
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

        {error && (
          <div className="mb-4 text-xs bg-red-900/40 text-red-400 p-3 rounded-lg border border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1">Corporate Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-[#262626] border border-neutral-700 p-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
              placeholder="name@company.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-400 block mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-[#262626] border border-neutral-700 p-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-lg bg-green-600 hover:bg-green-500 p-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

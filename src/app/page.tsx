"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to a dashboard after login
      router.push("/dashboard");
    } catch (error: any) {
      alert("Login failed: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleLogin} className="p-8 border rounded shadow-md w-80">
        <h1 className="text-xl mb-4 font-bold">Staff Login</h1>
        <input 
          type="email" placeholder="Email" className="border p-2 w-full mb-2" 
          onChange={(e) => setEmail(e.target.value)} required 
        />
        <input 
          type="password" placeholder="Password" className="border p-2 w-full mb-4" 
          onChange={(e) => setPassword(e.target.value)} required 
        />
        <button type="submit" className="bg-blue-600 text-white p-2 w-full rounded">
          Login
        </button>
      </form>
    </div>
  );
}

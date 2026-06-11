"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import LoginPage from "./page"; // Assuming your login component is here
import "../globals.css"; // Your Tailwind styles

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
   Ley;

  if (loading) {
    return (
      <html lang="en">
        <body className="bg-[#121212] text-white flex h-screen w-screen items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-green-500"></div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="bg-[#121212] text-gray-200 antialiased">
        {!user ? <LoginPage /> : children}
      </body>
    </html>
  );
}

"use client";
import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) setUser(user);
      else router.push("/"); // Redirect to login if not logged in
    });
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-10">
      <h1>Welcome, {user.email}</h1>
      <button onClick={() => signOut(auth)} className="bg-red-500 text-white p-2">
        Logout
      </button>
    </div>
  );
}

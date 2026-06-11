// src/app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import ClaimForm from "./ClaimForm";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) setRole(userDoc.data().role);
      } else {
        router.push("/");
      }
    });
  }, [router]);

  if (!user) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Sales Dashboard</h1>
        {role === 'admin' && (
          <Link href="/admin" className="bg-purple-600 text-white px-4 py-2 rounded mr-2">
            Admin Panel
          </Link>
        )}
        <button onClick={() => signOut(auth)} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>
      <ClaimForm userId={user.uid} />
    </div>
  );
}

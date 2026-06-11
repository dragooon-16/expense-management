"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import ClaimForm from "./ClaimForm"; // Ensure this file is in the same directory

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch claims for this specific user
        const q = query(collection(db, "claims"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        const userClaims = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClaims(userClaims);
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (!user) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
        <button onClick={() => signOut(auth)} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Submit New Claim</h2>
        <ClaimForm userId={user.uid} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Your Recent Claims</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id}>
                <td className="p-2 border">{claim.date}</td>
                <td className="p-2 border">{claim.type}</td>
                <td className="p-2 border">{claim.amount} {claim.currency}</td>
                <td className="p-2 border capitalize">{claim.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

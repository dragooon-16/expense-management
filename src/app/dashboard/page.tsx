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
  const [claims, setClaims] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user role
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) setRole(userDoc.data().role);

        // Fetch user's claims
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

  if (!user) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold">Sales Dashboard</h1>
        <div className="flex gap-2">
          {role === 'admin' && (
            <Link href="/admin" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Admin Panel
            </Link>
          )}
          <button onClick={() => signOut(auth)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Submit New Claim</h2>
        <div className="bg-gray-50 p-6 rounded-lg border">
          <ClaimForm userId={user.uid} />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Claim History</h2>
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Type</th>
                <th className="p-3 border">Amount</th>
                <th className="p-3 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {claims.length > 0 ? claims.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{c.date}</td>
                  <td className="p-3 border">{c.type}</td>
                  <td className="p-3 border">{c.amount} {c.currency}</td>
                  <td className="p-3 border capitalize font-medium">
                    <span className={`px-2 py-1 rounded text-sm ${c.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              )) : <tr><td colSpan={4} className="p-4 text-center">No claims found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

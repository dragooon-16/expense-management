// src/app/admin/page.tsx
"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<any[]>([]); // Added missing state
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }
      
      // Check if user is admin
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        setIsAdmin(true);
        // Fetch all claims if admin
        const querySnapshot = await getDocs(collection(db, "claims"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClaims(data);
      } else {
        router.push("/dashboard"); 
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "claims", id), { status: newStatus });
      setClaims(claims.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (error) {
      alert("Error updating status");
    }
  };

  if (loading) return <p className="p-10">Verifying access...</p>;
  if (!isAdmin) return null;

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3">User ID</th>
              <th className="border p-3">Amount</th>
              <th className="border p-3">Proof</th>
              <th className="border p-3">Status</th>
              <th className="border p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id} className="hover:bg-gray-50">
                <td className="border p-3 text-sm">{claim.userId}</td>
                <td className="border p-3">{claim.amount} {claim.currency}</td>
                <td className="border p-3">
                  <a href={claim.proofUrl} target="_blank" className="text-blue-600 underline">View Bill</a>
                </td>
                <td className="border p-3 font-bold capitalize">{claim.status}</td>
                <td className="border p-3 flex gap-2">
                  <button onClick={() => updateStatus(claim.id, "approved")} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Approve</button>
                  <button onClick={() => updateStatus(claim.id, "disbursed")} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Disburse</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

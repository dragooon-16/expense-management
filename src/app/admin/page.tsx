// src/app/admin/page.tsx
"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }
      // Check if user is admin
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        setIsAdmin(true);
      } else {
        router.push("/dashboard"); // Kick them out if not admin
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) return <p>Verifying access...</p>;
  if (!isAdmin) return null; // This will trigger the router.push

  

  useEffect(() => {
    const fetchAllClaims = async () => {
      const querySnapshot = await getDocs(collection(db, "claims"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClaims(data);
    };
    fetchAllClaims();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, "claims", id), { status: newStatus });
    setClaims(claims.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">User ID</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim) => (
            <tr key={claim.id}>
              <td className="border p-2">{claim.userId}</td>
              <td className="border p-2">{claim.amount} {claim.currency}</td>
              <td className="border p-2 font-bold">{claim.status}</td>
              <td className="border p-2">
                <button onClick={() => updateStatus(claim.id, "approved")} className="bg-green-500 text-white px-2 py-1 mr-2 rounded">Approve</button>
                <button onClick={() => updateStatus(claim.id, "disbursed")} className="bg-blue-500 text-white px-2 py-1 rounded">Disburse</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

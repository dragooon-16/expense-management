"use client";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export default function AdminDashboard() {
  const [claims, setClaims] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllClaims = async () => {
      const querySnapshot = await getDocs(collection(db, "claims"));
      setClaims(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchAllClaims();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, "claims", id), { status: newStatus });
    setClaims(claims.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Admin Panel - Manage Claims</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">User</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Proof</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim) => (
            <tr key={claim.id}>
              <td className="p-2 border">{claim.userId}</td>
              <td className="p-2 border">{claim.type}</td>
              <td className="p-2 border">{claim.amount}</td>
              <td className="p-2 border"><a href={claim.proofUrl} target="_blank" className="text-blue-500">View</a></td>
              <td className="p-2 border">{claim.status}</td>
              <td className="p-2 border">
                <button onClick={() => updateStatus(claim.id, "approved")} className="bg-green-500 text-white p-1 mr-2">Approve</button>
                <button onClick={() => updateStatus(claim.id, "disbursed")} className="bg-blue-500 text-white p-1">Disburse</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

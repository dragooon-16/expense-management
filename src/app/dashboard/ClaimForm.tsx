"use client";
import { useState } from "react";
import { db, storage } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ClaimForm({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const file = e.target.proof.files[0];

    // 1. Upload proof to Firebase Storage
    const storageRef = ref(storage, `proofs/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    // 2. Add document to Firestore
    await addDoc(collection(db, "claims"), {
      userId,
      date: e.target.date.value,
      type: e.target.type.value,
      amount: e.target.amount.value,
      currency: e.target.currency.value,
      proofUrl: url,
      status: "pending"
    });

    setLoading(false);
    alert("Claim submitted!");
  };

  return (
    <form onSubmit={handleSubmit} className="border p-4 mt-4 space-y-2">
      <input type="date" name="date" required className="border p-1 w-full" />
      <input type="text" name="type" placeholder="Expense Type" required className="border p-1 w-full" />
      <input type="number" name="amount" placeholder="Amount" required className="border p-1 w-full" />
      <select name="currency" className="border p-1 w-full">
        <option>USD</option> <option>INR</option>
      </select>
      <input type="file" name="proof" required className="border p-1 w-full" />
      <button disabled={loading} className="bg-green-500 text-white p-2 w-full">
        {loading ? "Uploading..." : "Submit Claim"}
      </button>
    </form>
  );
}

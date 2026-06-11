"use client";

import { useState } from "react";
import { db, storage } from "../../lib/firebase"; // Corrected path to line up from dashboard directory depth
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ClaimForm({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    
    const file = e.target.proof.files?.[0];
    if (!file) {
      alert("Please select a file first.");
      setLoading(false);
      return;
    }

    try {
      // 1. Upload proof to Firebase Storage
      const storageRef = ref(storage, `proofs/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // 2. Add document to Firestore
      await addDoc(collection(db, "claims"), {
        userId,
        date: e.target.date.value,
        type: e.target.type.value,
        amount: Number(e.target.amount.value), // Kept as a clean number format for summary stats loops
        currency: e.target.currency.value,
        proofUrl: url,
        status: "pending"
      });

      alert("Claim submitted successfully!");
      e.target.reset(); // Safely clear form values out on complete
    } catch (error: any) {
      console.error("Submission error:", error);
      alert(`Submission failed: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-bold tracking-wider text-neutral-400 block mb-1 uppercase">Expense Date</label>
          <input 
            type="date" 
            name="date" 
            required 
            className="w-full rounded-xl bg-[#242424] border border-neutral-800 p-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors" 
          />
        </div>
        <div>
          <label className="text-[11px] font-bold tracking-wider text-neutral-400 block mb-1 uppercase">Expense Type</label>
          <input 
            type="text" 
            name="type" 
            placeholder="e.g. Ground Transport" 
            required 
            className="w-full rounded-xl bg-[#242424] border border-neutral-800 p-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors placeholder-neutral-600" 
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="text-[11px] font-bold tracking-wider text-neutral-400 block mb-1 uppercase">Amount</label>
          <input 
            type="number" 
            name="amount" 
            placeholder="0.00" 
            required 
            className="w-full rounded-xl bg-[#242424] border border-neutral-800 p-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors placeholder-neutral-600" 
          />
        </div>
        <div>
          <label className="text-[11px] font-bold tracking-wider text-neutral-400 block mb-1 uppercase">Currency</label>
          <select 
            name="currency" 
            className="w-full rounded-xl bg-[#242424] border border-neutral-800 p-3 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-bold tracking-wider text-neutral-400 block mb-1 uppercase">Upload Receipt / Proof</label>
        <input 
          type="file" 
          name="proof" 
          required 
          className="w-full rounded-xl bg-[#242424] border border-neutral-800 p-2.5 text-xs text-neutral-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700 file:transition-colors focus:outline-none" 
        />
      </div>

      <button 
        disabled={loading} 
        className="w-full mt-2 rounded-xl bg-green-600 hover:bg-green-500 p-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center shadow-md shadow-green-900/10"
      >
        {loading ? "Uploading artifacts..." : "Submit Claim Details"}
      </button>
    </form>
  );
}

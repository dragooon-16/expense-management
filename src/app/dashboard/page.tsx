"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import ClaimForm from "./ClaimForm";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState({ total: 0, pending: 0, disbursed: 0, draft: 0 });
  const [componentError, setComponentError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const q = query(collection(db, "claims"), where("userId", "==", currentUser.uid));
          const querySnapshot = await getDocs(q);
          
          const userClaims: any[] = [];
          querySnapshot.forEach((doc) => {
            userClaims.push({ id: doc.id, ...doc.data() });
          });
          
          setClaims(userClaims);

          // Safe calculations loop guarding against unexpected data structures
          let totalVal = 0, pendingVal = 0, disbursedVal = 0, draftVal = 0;
          userClaims.forEach((c: any) => {
            const amt = Number(c?.amount) || 0;
            const status = String(c?.status || "").toLowerCase();
            
            if (status === "approved" || status === "disbursed") disbursedVal += amt;
            else if (status === "pending" || status === "submitted") pendingVal += amt;
            else if (status === "draft") draftVal += amt;
            totalVal += amt;
          });
          
          setSummaryStats({ total: totalVal, pending: pendingVal, disbursed: disbursedVal, draft: draftVal });
        } catch (err: any) {
          console.error("Firestore loading error:", err);
          setComponentError(err?.message || "Failed to fetch database items.");
        }
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return (
      <div className="p-10 text-center text-neutral-400 flex flex-col items-center justify-center space-y-2">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-green-500"></div>
        <span className="text-xs">Verifying Access Profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Error Output Indicator Board */}
      {componentError && (
        <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400">
          <strong>Database Sync Warn:</strong> {componentError}
        </div>
      )}

      {/* Title Header Section Row */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Sales Dashboard</h1>
      </div>

      {/* METRICS GRID ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] p-5 rounded-xl border border-neutral-800 shadow-sm">
          <span className="text-xs font-semibold text-neutral-400">Total Claimed</span>
          <span className="text-2xl font-bold text-white block mt-2">₹{(summaryStats.total).toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-neutral-500 mt-1 block">{claims.length} claims submitted</span>
        </div>
        <div className="bg-[#1a1a1a] p-5 rounded-xl border border-neutral-800 shadow-sm">
          <span className="text-xs font-semibold text-neutral-400">Pending Approval</span>
          <span className="text-2xl font-bold text-blue-400 block mt-2">₹{(summaryStats.pending).toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-[#1a1a1a] p-5 rounded-xl border border-neutral-800 shadow-sm">
          <span className="text-xs font-semibold text-neutral-400">Disbursed</span>
          <span className="text-2xl font-bold text-emerald-400 block mt-2">₹{(summaryStats.disbursed).toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-[#1a1a1a] p-5 rounded-xl border border-neutral-800 shadow-sm">
          <span className="text-xs font-semibold text-neutral-400">Draft</span>
          <span className="text-2xl font-bold text-neutral-400 block mt-2">₹{(summaryStats.draft).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* NEW CLAIM FORM SECTION */}
      <section className="bg-[#1a1a1a] p-6 rounded-xl border border-neutral-800">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4">Submit New Claim</h2>
        <ClaimForm userId={user.uid} />
      </section>

      {/* CLAIM HISTORY DATA SHEET */}
      <section className="bg-[#1a1a1a] rounded-xl border border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-800">
          <h2 className="text-sm font-bold text-white">Claim History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#151515]/50 text-[11px] uppercase tracking-wider font-bold text-neutral-500 border-b border-neutral-800">
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-neutral-300 divide-y divide-neutral-800/50">
              {claims && claims.length > 0 ? (
                claims.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-800/10 transition-colors">
                    <td className="p-3.5 text-neutral-400">{c.date || "N/A"}</td>
                    <td className="p-3.5 font-semibold text-white">{c.type || "Expense"}</td>
                    <td className="p-3.5">{(Number(c.amount) || 0).toLocaleString('en-IN')} {c.currency || "INR"}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold border capitalize ${
                        c.status === 'approved' || c.status === 'disbursed'
                          ? 'bg-green-950/40 text-green-400 border-green-900/50' 
                          : 'bg-yellow-950/40 text-yellow-400 border-yellow-900/50'
                      }`}>
                        {c.status || "Processing"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-neutral-500 text-xs">
                    No active expense records discovered in database context.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

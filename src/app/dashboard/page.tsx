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
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch live authenticated Firestore data claims
        const q = query(collection(db, "claims"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        const userClaims = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClaims(userClaims);

        // Calculate visual dynamic summary totals for matching design blocks
        let totalVal = 0, pendingVal = 0, disbursedVal = 0, draftVal = 0;
        userClaims.forEach((c: any) => {
          const amt = Number(c.amount) || 0;
          if (c.status === "approved" || c.status === "disbursed") disbursedVal += amt;
          else if (c.status === "pending" || c.status === "submitted") pendingVal += amt;
          else if (c.status === "draft") draftVal += amt;
          totalVal += amt;
        });
        setSummaryStats({ total: totalVal, pending: pendingVal, disbursed: disbursedVal, draft: draftVal });
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* Title Header Section Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Dashboard</h1>
          <p className="text-sm text-neutral-400 mt-0.5">Manage and track corporate spending reimbursements.</p>
        </div>
        <button className="py-2.5 px-4 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs rounded-xl transition-all shadow-sm">
          + New Claim
        </button>
      </div>

      {/* DYNAMIC DESIGN CARD STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-neutral-800 shadow-sm flex flex-col justify-between min-h-[120px]">
          <span className="text-xs font-semibold text-neutral-400 tracking-wide">Total Claimed</span>
          <div className="mt-2">
            <span className="text-2xl font-bold tracking-tight text-white">₹{summaryStats.total.toLocaleString('en-IN')}</span>
            <span className="text-[11px] text-neutral-500 block mt-0.5">{claims.length} claims total</span>
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-neutral-800 shadow-sm flex flex-col justify-between min-h-[120px]">
          <span className="text-xs font-semibold text-neutral-400 tracking-wide">Pending Approval</span>
          <div className="mt-2">
            <span className="text-2xl font-bold tracking-tight text-blue-400">₹{summaryStats.pending.toLocaleString('en-IN')}</span>
            <span className="text-[11px] text-neutral-500 block mt-0.5">Awaiting manager signoff</span>
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-neutral-800 shadow-sm flex flex-col justify-between min-h-[120px]">
          <span className="text-xs font-semibold text-neutral-400 tracking-wide">Disbursed</span>
          <div className="mt-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-400">₹{summaryStats.disbursed.toLocaleString('en-IN')}</span>
            <span className="text-[11px] text-neutral-500 block mt-0.5">Paid out this period</span>
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-neutral-800 shadow-sm flex flex-col justify-between min-h-[120px]">
          <span className="text-xs font-semibold text-neutral-400 tracking-wide">Draft</span>
          <div className="mt-2">
            <span className="text-2xl font-bold tracking-tight text-neutral-400">₹{summaryStats.draft.toLocaleString('en-IN')}</span>
            <span className="text-[11px] text-neutral-500 block mt-0.5">Unsent applications</span>
          </div>
        </div>
      </div>

      {/* ACTION BLOCK SUBMIT CONSOLE CONTAINER */}
      <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-neutral-800 shadow-sm">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Submit New Claim</h3>
        <div className="text-neutral-200">
          <ClaimForm userId={user.uid} />
        </div>
      </div>

      {/* LIVE CLAIMS HISTORICAL STREAM DATA TABLE */}
      <div className="bg-[#1a1a1a] rounded-2xl border border-neutral-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-neutral-800/70 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Recent Claims</h3>
          <button className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-700/50">
            View all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-[11px] font-bold uppercase tracking-wider text-neutral-500 bg-[#151515]/30">
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Type</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50 text-sm text-neutral-300">
              {claims.length > 0 ? (
                claims.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-800/10 transition-colors">
                    <td className="py-4 px-5 text-neutral-400">{c.date || "Recent"}</td>
                    <td className="py-4 px-5 font-semibold text-white">{c.type}</td>
                    <td className="py-4 px-5">{Number(c.amount).toLocaleString('en-IN')} {c.currency || "INR"}</td>
                    <td className="py-4 px-5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full capitalize border ${
                        c.status === 'approved' || c.status === 'disbursed'
                          ? 'bg-green-950/40 text-green-400 border-green-900/50' 
                          : c.status === 'draft'
                          ? 'bg-neutral-800 text-neutral-300 border-neutral-700/50'
                          : 'bg-blue-950/40 text-blue-400 border-blue-900/50'
                      }`}>
                        ● {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-neutral-500 font-medium">
                    No verified claims registered in this database profile.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

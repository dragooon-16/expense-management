"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState<string>("User");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [avatarInitials, setAvatarInitials] = useState<string>("U");

  useEffect(() => {
    // Isolated client-only side effect listener
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const name = data.name || "User Account";
            setUserName(name);
            setUserRole(data.role || "employee");
            
            const initials = name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            setAvatarInitials(initials || "U");
          }
        } catch (error) {
          console.error("Layout context background error:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex h-screen w-screen bg-[#121212] font-sans antialiased text-neutral-200 overflow-hidden">
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className="w-64 bg-[#1a1a1a] border-r border-neutral-800 flex flex-col justify-between p-6 shrink-0">
        <div>
          {/* Brand Logo Header */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white tracking-wide">TravelEx</h2>
            <p className="text-xs text-neutral-500">Expense Portal</p>
          </div>

          {/* User Meta Card Profile */}
          <div className="flex items-center space-x-3 bg-[#242424] p-3 rounded-xl mb-6 border border-neutral-800/40">
            <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
              {avatarInitials}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-white truncate">{userName}</h4>
              <p className="text-xs text-neutral-400 capitalize truncate">{userRole || "Team Member"}</p>
            </div>
          </div>

          {/* Action Context Toggles */}
          {userRole === "admin" && (
            <Link 
              href="/admin" 
              className="w-full py-2 px-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs text-white rounded-lg transition-colors font-medium mb-8 flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>⇄</span> <span>Switch to Admin view</span>
            </Link>
          )}

          {/* Navigational Item Elements */}
          <nav className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-neutral-500 block px-3 mb-2 uppercase">Navigation</span>
            <button className="w-full text-left py-2.5 px-3 bg-[#262626] text-white rounded-xl text-sm font-medium transition-all flex items-center space-x-2">
              <span>📊</span> <span>My Dashboard</span>
            </button>
            <button className="w-full text-left py-2.5 px-3 text-neutral-400 hover:text-white hover:bg-neutral-800/50 rounded-xl text-sm font-medium transition-all flex items-center space-x-2">
              <span>📄</span> <span>My Claims</span>
            </button>
            <button className="w-full text-left py-2.5 px-3 text-neutral-400 hover:text-white hover:bg-neutral-800/50 rounded-xl text-sm font-medium transition-all flex items-center space-x-2">
              <span>✚</span> <span>New Claim</span>
            </button>
          </nav>
        </div>

        {/* Exit Utility Actions */}
        <button 
          onClick={() => signOut(auth)}
          className="w-full py-2 text-left text-xs font-semibold text-neutral-500 hover:text-red-400 transition-colors border-t border-neutral-800/60 pt-4 flex items-center justify-between"
        >
          <span>Logout Session</span>
          <span>➔</span>
        </button>
      </aside>

      {/* RENDERED CORE VIEW AREA */}
      <main className="flex-1 overflow-y-auto p-8 bg-[#121212]">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

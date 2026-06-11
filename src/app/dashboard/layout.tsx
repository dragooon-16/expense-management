"use client";

import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen bg-[#121212] overflow-hidden">
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className="w-64 bg-[#1a1a1a] border-r border-neutral-800 flex flex-col justify-between p-6">
        <div>
          {/* Brand Logo Header */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white tracking-wide">TravelEx</h2>
            <p className="text-xs text-neutral-500">Expense Portal</p>
          </div>

          {/* User Meta Card Profile */}
          <div className="flex items-center space-x-3 bg-[#242424] p-3 rounded-xl mb-6">
            <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">PS</div>
            <div>
              <h4 className="text-sm font-semibold text-white">Priya Sharma</h4>
              <p className="text-xs text-neutral-400">Senior Sales Exec</p>
            </div>
          </div>

          {/* Action Context Toggles */}
          <button className="w-full py-2 px-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs text-white rounded-lg transition-colors font-medium mb-8">
            ⇄ Switch to Admin view
          </button>

          {/* Navigational Item Elements */}
          <nav className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-neutral-500 block px-3 mb-2 uppercase">Navigation</span>
            <button className="w-full text-left py-2.5 px-3 bg-[#262626] text-white rounded-xl text-sm font-medium transition-all">
              📊 My Dashboard
            </button>
            <button className="w-full text-left py-2.5 px-3 text-neutral-400 hover:text-white hover:bg-neutral-800/50 rounded-xl text-sm font-medium transition-all">
              📄 My Claims
            </button>
            <button className="w-full text-left py-2.5 px-3 text-neutral-400 hover:text-white hover:bg-neutral-800/50 rounded-xl text-sm font-medium transition-all">
              ✚ New Claim
            </button>
          </nav>
        </div>

        {/* Exit Utility Actions */}
        <button 
          onClick={() => signOut(auth)}
          className="w-full py-2 text-left text-xs font-semibold text-neutral-500 hover:text-red-400 transition-colors px-3"
        >
          Logout Session ➔
        </button>
      </aside>

      {/* RENDERED CORE VIEW AREA */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}

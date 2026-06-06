"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar({ user, onLogout, onAuthClick }) {
  const [localToken, setLocalToken] = useState(null);
  const [localUserName, setLocalUserName] = useState(null);

  useEffect(() => {
    if (!user) {
      const t = localStorage.getItem("token");
      const n = localStorage.getItem("userName");
      setLocalToken(t);
      setLocalUserName(n);
    }
  }, [user]);

  const token = user ? user.token : localToken;
  const userName = user ? user.name : localUserName;

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      setLocalToken(null);
      setLocalUserName(null);
    }
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow">

      <div className="max-w-6xl mx-auto flex justify-between items-center">

        <h1 className="text-2xl font-bold">
          MediMind AI
        </h1>

        <div className="flex gap-6 items-center">

          <Link
            href="/"
            className="hover:text-blue-200"
          >
            Home
          </Link>

          <a
            href="#knowledge-base"
            className="hover:text-blue-200"
          >
            Health Guide
          </a>

          <a
            href="#hospital-finder"
            className="hover:text-blue-200"
          >
            Hospitals
          </a>

          <Link
            href="/history"
            className="hover:text-blue-200"
          >
            History
          </Link>

          {token ? (
            <>
              <span className="text-blue-200 text-sm">
                {userName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-semibold hover:bg-blue-100"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={onAuthClick}
              className="bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-semibold hover:bg-blue-100"
            >
              Login
            </button>
          )}

        </div>

      </div>

    </nav>
  );
}
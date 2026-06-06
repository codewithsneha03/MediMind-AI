"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Features from "../components/Features";
import SymptomForm from "../components/SymptomForm";
import Chatbot from "../components/Chatbot";
import KnowledgeBase from "../components/KnowledgeBase";
import HospitalFinder from "../components/HospitalFinder";
import AuthForm from "../components/AuthForm";

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);
  const [authKey, setAuthKey] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("userName");
    if (token && name) {
      setUser({ token, name });
    } else {
      setUser(null);
    }
  }, [authKey]);

  const handleLoginSuccess = () => {
    setShowAuth(false);
    setAuthKey((k) => k + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    setUser(null);
    setAuthKey((k) => k + 1);
  };

  return (
    <main className="min-h-screen bg-blue-50">

      <Navbar user={user} onLogout={handleLogout} onAuthClick={() => setShowAuth(true)} />

      {showAuth && (
        <AuthForm
          onSuccess={handleLoginSuccess}
          onClose={() => setShowAuth(false)}
        />
      )}

      <section className="flex flex-col items-center justify-center text-center px-6 py-32">

        <h1 className="text-6xl font-bold text-blue-700 mb-6">
          MediMind AI
        </h1>

        <p className="text-xl text-gray-700 max-w-2xl mb-8">
          AI-powered medical symptom checker and healthcare assistant.
        </p>

      </section>

      <Features />

      <SymptomForm user={user} />

      <Chatbot key={authKey} />

      <KnowledgeBase />

      <HospitalFinder />

    </main>
  );
}
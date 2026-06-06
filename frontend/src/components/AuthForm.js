"use client";

import { useState } from "react";
import { registerUser, loginUser } from "../app/utils/api";

export default function AuthForm({ onSuccess, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const data = isLogin
      ? await loginUser({ email, password })
      : await registerUser({ name, email, password });

    if (data.detail) {
      setMsg(typeof data.detail === "string" ? data.detail : data.detail[0]?.msg || "Error");
    } else if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userEmail", data.email);
      setMsg("Logged in successfully");
      if (onSuccess) onSuccess();
    } else {
      setMsg(data.message || "Done");
      if (data.message === "User registered successfully") {
        setIsLogin(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-blue-50 p-8 rounded-2xl shadow-xl max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 text-xl hover:text-gray-800"
        >
          &times;
        </button>

        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          {isLogin ? "Login" : "Register"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-3 rounded-xl"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-3 rounded-xl"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-3 rounded-xl"
            required
          />

          <button
            type="submit"
            className="bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        {msg && <p className="mt-4 text-center text-gray-700">{msg}</p>}

        <p className="mt-4 text-center text-sm text-gray-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setIsLogin(!isLogin); setMsg(""); }}
            className="text-blue-600 underline"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
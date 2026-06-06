const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/* ---------------- TOKEN ---------------- */
export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

/* ---------------- AUTH ---------------- */
export const registerUser = async (data) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
};

export const loginUser = async (data) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
};

/* ---------------- PREDICT ---------------- */
export const predictDisease = async (symptoms) => {
  const res = await fetch(`${BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken(),
    },
    body: JSON.stringify({ symptoms }),
  });

  return res.json();
};

/* ---------------- CHAT AI ---------------- */
export const chatAI = async (symptoms) => {
  const res = await fetch(`${BASE_URL}/chat-ai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ symptoms }),
  });

  return res.json();
};

/* ---------------- HISTORY ---------------- */
export const getHistory = async () => {
  const res = await fetch(`${BASE_URL}/history`, {
    headers: {
      Authorization: "Bearer " + getToken(),
    },
  });
  return res.json();
};

export const deleteHistory = async (id) => {
  const res = await fetch(`${BASE_URL}/history/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + getToken(),
    },
  });

  return res.json();
};

/* ---------------- REPORT ---------------- */
export const generateReport = async (payload) => {
  const res = await fetch(`${BASE_URL}/generate-report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return res.blob();
};
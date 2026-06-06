"use client";

import { useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Chatbot() {
  const [chatInput, setChatInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const downloadReport = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/generate-report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symptoms: chatInput,
            disease: result.prediction,
            specialist: result.specialist,
            confidence: result.confidence,
          }),
        }
      );

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;
      a.download = "MediMind_Report.pdf";

      document.body.appendChild(a);
      a.click();

      a.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(error);
      alert("Failed to generate PDF");
    }
  };

  const askAI = async () => {
    if (!chatInput.trim()) return;

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await fetch(
        `${BASE_URL}/chat-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symptoms: chatInput,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error (${response.status})`);
      }

      const data = await response.json();

      setResult(data);

    } catch (error) {
      console.error(error);
      setError(
        error.message === "Failed to fetch"
          ? "Cannot connect to the server. Make sure the backend is running on port 8000."
          : error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-8 bg-white">

      <div className="max-w-5xl mx-auto">

        <h2 className="text-4xl font-bold text-center text-blue-600 mb-8">
          AI Health Assistant
        </h2>

        <textarea
          rows="4"
          className="w-full border rounded-xl p-4"
          placeholder="Describe your symptoms..."
          value={chatInput}
          onChange={(e) =>
            setChatInput(e.target.value)
          }
        />

        <button
          onClick={askAI}
          disabled={loading}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Ask AI"}
        </button>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div className="mt-10">

            {/* Cards */}

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

              <div className="bg-blue-100 p-6 rounded-xl shadow">
                <h3 className="font-bold text-gray-600">
                  Disease
                </h3>

                <p className="text-2xl font-bold text-blue-700">
                  {result.prediction}
                </p>
              </div>

              <div className="bg-green-100 p-6 rounded-xl shadow">
                <h3 className="font-bold text-gray-600">
                  Specialist
                </h3>

                <p className="text-xl font-bold text-green-700">
                  {result.specialist}
                </p>
              </div>

              <div className="bg-yellow-100 p-6 rounded-xl shadow">
                <h3 className="font-bold text-gray-600">
                  Confidence
                </h3>

                <p className="text-2xl font-bold text-yellow-700">
                  {result.confidence}%
                </p>
              </div>

              <div className="bg-purple-100 p-6 rounded-xl shadow">
                <h3 className="font-bold text-gray-600">
                  Medicines
                </h3>

                <ul className="mt-2">
                  {result.medicines?.map(
                    (medicine, index) => (
                      <li key={index}>
                        • {medicine}
                      </li>
                    )
                  )}
                </ul>
              </div>

            </div>

            {/* Recommended Doctors */}

<div className="mt-8">

  <h3 className="text-2xl font-bold text-blue-700 mb-4">
    Recommended Doctors
  </h3>

  <div className="grid md:grid-cols-2 gap-6">

    {result.doctors?.map((doctor, index) => (
      <div
        key={index}
        className="bg-white border rounded-xl p-6 shadow"
      >

        <h4 className="text-xl font-bold text-gray-800">
          {doctor.name}
        </h4>

        <p className="text-gray-600 mt-2">
          🏥 {doctor.hospital}
        </p>

        <p className="text-gray-600">
          👨‍⚕️ Experience: {doctor.experience}
        </p>

      </div>
    ))}

  </div>

</div>

<button
  onClick={downloadReport}
  className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl"
>
  Download Medical Report PDF
</button>

            {/* AI Advice */}

            <div className="mt-8 bg-gray-100 p-6 rounded-xl shadow">

              <h3 className="text-2xl font-bold mb-4 text-blue-700">
                AI Health Advice
              </h3>

              <div className="whitespace-pre-wrap text-gray-700">
                {result.response}
              </div>

            </div>

          </div>
        )}

      </div>

    </section>
  );
}
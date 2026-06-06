"use client";

import { useState } from "react";
import { predictDisease } from "../app/utils/api";

export default function SymptomForm({ user }) {

  const [symptoms, setSymptoms] = useState("");
  const [prediction, setPrediction] = useState("");
  const [specialist, setSpecialist] = useState("");
  const [confidence, setConfidence] = useState("");
  const [medicines, setMedicines] = useState([]);

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {
      const data = await predictDisease(symptoms);

      setPrediction(data.prediction);
      setSpecialist(data.specialist);
      setConfidence(data.confidence);
      setMedicines(data.medicines);

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="py-20 px-8 bg-blue-50">

      <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-lg">

        <h2 className="text-4xl font-bold text-center text-blue-700 mb-8">
          Symptom Checker
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          <textarea
            placeholder="Enter symptoms like fever, cough, headache..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="border border-gray-300 rounded-xl p-4 h-40 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-semibold transition"
          >
            Predict Disease
          </button>

        </form>

        {prediction && (
          <div className="mt-8 bg-blue-100 p-6 rounded-xl">

            {user ? (
              <div className="mb-4 bg-green-100 text-green-800 border border-green-200 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Report saved to your account: <strong>{user.name}</strong>
              </div>
            ) : (
              <div className="mb-4 bg-amber-100 text-amber-800 border border-amber-200 px-4 py-2 rounded-xl text-sm font-medium">
                ⚠️ You are checking symptoms as a Guest. <strong>Login</strong> to save reports to your history.
              </div>
            )}

            <h3 className="text-2xl font-bold text-blue-700 mb-4">
              Prediction Result
            </h3>

            <p className="text-lg text-gray-800 mb-2">
              <strong>Disease:</strong> {prediction}
            </p>

            <p className="text-lg text-gray-800">
              <strong>Recommended Specialist:</strong> {specialist}
            </p>

            <p className="text-lg text-gray-800">
              <strong>Confidence:</strong> {confidence}%
            </p>

            <div className="mt-4">
  <strong>Suggested OTC Medicines:</strong>

  <ul className="list-disc ml-6 mt-2">
    {medicines.map((medicine, index) => (
      <li key={index}>{medicine}</li>
    ))}
  </ul>

  <p className="text-sm text-red-600 mt-3">
    Consult a doctor before taking medications.
  </p>
</div>

          </div>
        )}

      </div>

    </section>
  );
}
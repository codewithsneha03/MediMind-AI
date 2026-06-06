"use client";

import Navbar from "../../components/Navbar";
import { useEffect, useState } from "react";
import { getHistory, deleteHistory } from "../utils/api";
import HistoryCharts from "../../components/HistoryCharts";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("userName");
    if (token && name) {
      setUser({ token, name });
      getHistory()
        .then((data) => {
          if (Array.isArray(data)) {
            setHistory(data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const deleteRecord = async (id) => {
    try {
      await deleteHistory(id);
      setHistory(
        history.filter(
          (item) => item.id !== id
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    setUser(null);
    window.location.href = "/";
  };

  const filteredHistory = history.filter((item) =>
    (item.symptoms || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    (item.disease || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    (item.specialist || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const totalRecords = history.length;

  const uniqueDiseases = new Set(
    history.map((item) => item.disease)
  ).size;

  const uniqueSpecialists = new Set(
    history.map((item) => item.specialist)
  ).size;

  const diseaseCounts = {};

  history.forEach((item) => {
    diseaseCounts[item.disease] =
      (diseaseCounts[item.disease] || 0) + 1;
  });

  let mostCommonDisease = "N/A";
  let highestCount = 0;

  for (const disease in diseaseCounts) {
    if (diseaseCounts[disease] > highestCount) {
      highestCount = diseaseCounts[disease];
      mostCommonDisease = disease;
    }
  }

  if (loading) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Loading history...</p>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar user={null} />
        <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              🔒
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              You must register or log in to view and maintain your symptom prediction history.
            </p>
            <a
              href="/?login=true"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-md shadow-blue-500/20"
            >
              Sign In / Register
            </a>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      <main className="min-h-screen p-8 bg-gray-100">

        <h1 className="text-4xl font-bold text-center mb-8">
          Prediction History
        </h1>

        <div className="max-w-xl mx-auto mb-6">
  <input
    type="text"
    placeholder="Search symptoms, disease, specialist..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full p-3 border rounded-lg shadow-sm"
  />
</div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

  <div className="bg-blue-500 text-white p-6 rounded-xl shadow">
    <h2 className="text-lg font-semibold">
      Total Records
    </h2>

    <p className="text-3xl font-bold mt-2">
      {totalRecords}
    </p>
  </div>

  <div className="bg-green-500 text-white p-6 rounded-xl shadow">
    <h2 className="text-lg font-semibold">
      Unique Diseases
    </h2>

    <p className="text-3xl font-bold mt-2">
      {uniqueDiseases}
    </p>
  </div>

  <div className="bg-purple-500 text-white p-6 rounded-xl shadow">
    <h2 className="text-lg font-semibold">
      Specialists
    </h2>

    <p className="text-3xl font-bold mt-2">
      {uniqueSpecialists}
    </p>
  </div>

  <div className="bg-orange-500 text-white p-6 rounded-xl shadow">
  <h2 className="text-lg font-semibold">
    Most Common Disease
  </h2>

  <p className="text-2xl font-bold mt-2">
    {mostCommonDisease}
  </p>

  <p className="mt-1">
    {highestCount} cases
  </p>
</div>

</div>

        <HistoryCharts data={history} />

        <div className="overflow-x-auto bg-white rounded-xl shadow">

          <table className="w-full border-collapse">

            <thead>
              <tr className="bg-blue-600 text-white">

                <th className="p-4 text-left">
                  Symptoms
                </th>

                <th className="p-4 text-left">
                  Disease
                </th>

                <th className="p-4 text-left">
                  Specialist
                </th>

                <th className="p-4 text-left">
                  Confidence
                </th>

                <th className="p-4 text-left">
                  Action
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredHistory.map((item) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-4">
                    {item.symptoms}
                  </td>

                  <td className="p-4">
                    {item.disease}
                  </td>

                  <td className="p-4">
                    {item.specialist}
                  </td>

                  <td className="p-4">
                    {item.confidence}%
                  </td>

                  <td className="p-4">

                    <button
                      onClick={() => deleteRecord(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </main>
    </>
  );
}
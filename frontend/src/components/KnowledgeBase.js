"use client";

import { useState, useEffect } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function KnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${BASE_URL}/knowledge-base`);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err) {
      console.error("Failed to load knowledge base:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = articles.filter((a) =>
    a.condition.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="knowledge-base" className="py-20 px-8 bg-blue-50">
      <div className="max-w-4xl mx-auto">

        <h2 className="text-4xl font-bold text-center text-blue-700 mb-3">
          Medical Knowledge Base
        </h2>
        <p className="text-center text-gray-500 mb-10">
          Browse verified health guides for common conditions
        </p>

        {/* Search */}
        <div className="relative mb-8">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            placeholder="Search conditions (e.g. Flu, Migraine, Diabetes)..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpenIndex(null); }}
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
        </div>

        {/* Articles */}
        {loading ? (
          <p className="text-center text-gray-400">Loading articles...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400">No conditions found matching &quot;{search}&quot;</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((article, i) => (
              <div key={article.condition} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all">

                {/* Header */}
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-blue-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg font-bold text-sm">
                      {article.condition.charAt(0)}
                    </span>
                    <span className="text-lg font-semibold text-gray-800">
                      {article.condition}
                    </span>
                  </div>
                  <span className={`text-gray-400 text-xl transition-transform ${openIndex === i ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>

                {/* Expanded Content */}
                {openIndex === i && (
                  <div className="px-6 pb-6 border-t border-gray-100">

                    {/* Description */}
                    <p className="text-gray-600 mt-4 mb-5 leading-relaxed">
                      {article.description}
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">

                      {/* Home Care */}
                      <div className="bg-green-50 rounded-xl p-5">
                        <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                          🏠 Home Care
                        </h4>
                        <ul className="space-y-2">
                          {article.home_care?.map((tip, j) => (
                            <li key={j} className="text-gray-700 text-sm flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">✓</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Warning Signs */}
                      <div className="bg-red-50 rounded-xl p-5">
                        <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                          ⚠️ Warning Signs
                        </h4>
                        <ul className="space-y-2">
                          {article.warning_signs?.map((sign, j) => (
                            <li key={j} className="text-gray-700 text-sm flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">!</span>
                              {sign}
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

"use client";

import { useState } from "react";

export default function HistoryCharts({ data }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) return null;

  // ----------------------------------------------------
  // 1. Calculations for Disease Distribution Chart
  // ----------------------------------------------------
  const diseaseCounts = {};
  data.forEach((item) => {
    if (item.disease) {
      diseaseCounts[item.disease] = (diseaseCounts[item.disease] || 0) + 1;
    }
  });

  const sortedDiseases = Object.entries(diseaseCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...sortedDiseases.map((d) => d.count), 1);

  // ----------------------------------------------------
  // 2. Calculations for Confidence Trend SVG Line Chart
  // ----------------------------------------------------
  // Sort data ascending by id (chronological order)
  const chronologicalData = [...data].sort((a, b) => a.id - b.id);

  // Chart dimensions
  const width = 500;
  const height = 200;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Map data to SVG points
  const points = chronologicalData.map((item, idx) => {
    const totalItems = chronologicalData.length;
    const x =
      totalItems > 1
        ? paddingLeft + (idx / (totalItems - 1)) * chartWidth
        : paddingLeft + chartWidth / 2;
    // Y maps 0-100% confidence to chart height
    const confidence = item.confidence || 0;
    const y = height - paddingBottom - (confidence / 100) * chartHeight;
    return { x, y, item, idx };
  });

  // Construct SVG Path for line
  let linePath = "";
  let areaPath = "";

  if (points.length > 0) {
    if (points.length === 1) {
      // Just a flat path if only one record
      linePath = `M ${points[0].x - 10} ${points[0].y} L ${points[0].x + 10} ${points[0].y}`;
      areaPath = `M ${points[0].x - 10} ${points[0].y} L ${points[0].x + 10} ${points[0].y} L ${points[0].x + 10} ${height - paddingBottom} L ${points[0].x - 10} ${height - paddingBottom} Z`;
    } else {
      linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");
      areaPath =
        linePath +
        ` L ${points[points.length - 1].x} ${height - paddingBottom}` +
        ` L ${points[0].x} ${height - paddingBottom} Z`;
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Disease Distribution Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Disease Frequency</h3>
          <p className="text-sm text-gray-500 mb-6">Distribution of predicted conditions</p>
          <div className="space-y-4">
            {sortedDiseases.slice(0, 5).map((disease, idx) => {
              const percentage = Math.round((disease.count / data.length) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm font-medium text-gray-700">
                    <span>{disease.name}</span>
                    <span className="text-gray-500">
                      {disease.count} {disease.count === 1 ? "case" : "cases"} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(disease.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Confidence Trend SVG Line Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Confidence Trend</h3>
        <p className="text-sm text-gray-500 mb-4">Accuracy levels over successive scans</p>

        <div className="relative w-full h-[200px]">
          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = height - paddingBottom - (val / 100) * chartHeight;
              return (
                <g key={val}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="#f3f4f6"
                    strokeWidth={1}
                  />
                  <text
                    x={paddingLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="#9ca3af"
                    fontSize="10"
                    className="select-none"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* Area under the line */}
            {areaPath && <path d={areaPath} fill="url(#areaGradient)" />}

            {/* The trend line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#2563eb"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data points */}
            {points.map((p) => (
              <circle
                key={p.idx}
                cx={p.x}
                cy={p.y}
                r={hoveredPoint?.idx === p.idx ? 7 : 4}
                fill={hoveredPoint?.idx === p.idx ? "#1e40af" : "#2563eb"}
                stroke="#ffffff"
                strokeWidth={2}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer transition-all duration-150"
              />
            ))}
          </svg>

          {/* Interactive Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute bg-gray-900/95 text-white text-xs p-3 rounded-lg shadow-lg pointer-events-none z-10 space-y-1 max-w-[180px] border border-gray-800"
              style={{
                left: `${(hoveredPoint.x / width) * 100}%`,
                top: `${(hoveredPoint.y / height) * 100 - 35}%`,
                transform: "translateX(-50%)",
              }}
            >
              <p className="font-bold border-b border-gray-700 pb-1 mb-1">
                Scan #{hoveredPoint.idx + 1}
              </p>
              <p className="truncate">
                <span className="text-gray-400">Result:</span> {hoveredPoint.item.disease}
              </p>
              <p>
                <span className="text-gray-400">Conf:</span> {hoveredPoint.item.confidence}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

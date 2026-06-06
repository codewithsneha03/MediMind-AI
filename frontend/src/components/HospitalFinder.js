"use client";

import { useState, useCallback } from "react";

export default function HospitalFinder() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mapUrl, setMapUrl] = useState("");

  const findHospitals = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });

        // Google Maps Embed URL for nearby hospitals
        const url = `https://www.google.com/maps/embed/v1/search?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=hospitals+near+me&center=${latitude},${longitude}&zoom=13`;
        setMapUrl(url);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Location access denied. Please enable location permissions in your browser settings.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case err.TIMEOUT:
            setError("Location request timed out. Please try again.");
            break;
          default:
            setError("An unknown error occurred.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return (
    <section id="hospital-finder" className="py-20 px-8 bg-white">
      <div className="max-w-5xl mx-auto">

        <h2 className="text-4xl font-bold text-center text-blue-700 mb-3">
          Find Nearby Hospitals
        </h2>
        <p className="text-center text-gray-500 mb-10">
          Locate hospitals and clinics near your current location
        </p>

        {/* Action Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={findHospitals}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-3"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Detecting Location...
              </>
            ) : (
              <>
                📍 Find Hospitals Near Me
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-lg mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Location Info */}
        {location && (
          <div className="text-center mb-6">
            <span className="inline-block bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-full text-sm font-medium">
              📍 Location detected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          </div>
        )}

        {/* Map */}
        {mapUrl && (
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <iframe
              src={mapUrl}
              width="100%"
              height="500"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Nearby Hospitals Map"
            ></iframe>
          </div>
        )}

        {/* Fallback: Direct link */}
        {location && (
          <div className="text-center mt-6">
            <a
              href={`https://www.google.com/maps/search/hospitals+near+me/@${location.lat},${location.lng},13z`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
            >
              Open in Google Maps →
            </a>
          </div>
        )}

        {/* Before search state */}
        {!mapUrl && !error && !loading && (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <span className="text-5xl mb-4 block">🏥</span>
            <p className="text-gray-400 text-lg">
              Click the button above to find hospitals near you
            </p>
          </div>
        )}

      </div>
    </section>
  );
}

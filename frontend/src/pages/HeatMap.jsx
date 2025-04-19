import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

const heatPointsA = [
  [12.2958, 76.6394, 0.6],
  [12.3033, 76.6450, 0.9],
];

const heatPointsB = [
  [12.2958, 76.6400, 0.4],
  [12.3100, 76.6550, 0.8],
];

const HeatLayer = ({ points, gradient, active }) => {
  const map = useMap();

  useEffect(() => {
    if (!active) return;

    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      gradient: gradient,
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, gradient, active]);

  return null;
};

const HeatMapMysore = () => {
  const [showA, setShowA] = useState(true);
  const [showB, setShowB] = useState(true);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-3xl font-bold text-center text-indigo-700">
        🔥 Mysuru Heatmap Dashboard
      </h1>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showA}
            onChange={() => setShowA(!showA)}
            className="accent-blue-500"
          />
          <span className="text-sm text-gray-700">Show Type A (Blue)</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showB}
            onChange={() => setShowB(!showB)}
            className="accent-red-500"
          />
          <span className="text-sm text-gray-700">Show Type B (Red)</span>
        </label>
      </div>

      <div className="w-full h-[80vh] rounded-xl overflow-hidden shadow-lg ring-1 ring-gray-300">
        <MapContainer
          center={[12.2958, 76.6394]}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {showA && (
            <HeatLayer
              points={heatPointsA}
              gradient={{ 0.4: "blue", 0.7: "cyan", 1: "lime" }}
              active={showA}
            />
          )}
          {showB && (
            <HeatLayer
              points={heatPointsB}
              gradient={{ 0.4: "red", 0.7: "orange", 1: "yellow" }}
              active={showB}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default HeatMapMysore;

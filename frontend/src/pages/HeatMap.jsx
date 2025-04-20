import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
  CircleMarker,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

const donorData = [
  { lat: 12.2958, lng: 76.6394, value: 120 },
  { lat: 12.3033, lng: 76.6450, value: 85 },
];

const receiverData = [
  { lat: 12.2958, lng: 76.6400, value: 95 },
  { lat: 12.3100, lng: 76.6550, value: 110 },
];

const HeatLayer = ({ points, gradient, active }) => {
  const map = useMap();

  useEffect(() => {
    if (!active) return;

    const heatPoints = points.map((p) => [p.lat, p.lng, p.value / 100]);
    const heatLayer = L.heatLayer(heatPoints, {
      radius: 30,
      blur: 20,
      gradient,
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, gradient, active]);

  return null;
};

const DonationMap = () => {
  const [showDonors, setShowDonors] = useState(true);
  const [showReceivers, setShowReceivers] = useState(true);

  return (
    <div className="p-4 flex flex-col gap-4 items-center">
      <h1 className="text-3xl font-bold text-emerald-700">🍛 Mysuru Donation Map</h1>

      {/* Filters */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showDonors}
            onChange={() => setShowDonors(!showDonors)}
            className="accent-blue-600"
          />
          <span className="text-blue-700">Show Donors (Zone A)</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showReceivers}
            onChange={() => setShowReceivers(!showReceivers)}
            className="accent-red-600"
          />
          <span className="text-red-700">Show Receivers (Zone B)</span>
        </label>
      </div>

      {/* Map */}
      <div className="w-full h-[80vh] rounded-lg shadow-md overflow-hidden">
        <MapContainer
          center={[12.2958, 76.6394]}
          zoom={13}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Heatmaps */}
          {showDonors && (
            <HeatLayer
              points={donorData}
              gradient={{
                0.4: "#001f5b",
                0.7: "#005eff",
                1.0: "#00ff66",
              }}
              active={showDonors}
            />
          )}
          {showReceivers && (
            <HeatLayer
              points={receiverData}
              gradient={{
                0.4: "#5b0000",
                0.7: "#ff3d00",
                1.0: "#ffcc00",
              }}
              active={showReceivers}
            />
          )}

          {/* Circle Markers */}
          {showDonors &&
            donorData.map((point, i) => (
              <CircleMarker
                key={i}
                center={[point.lat, point.lng]}
                radius={10}
                pathOptions={{
                  color: "#0077ff",
                  fillColor: "#0077ff",
                  fillOpacity: 0.6,
                }}
              >
                <Tooltip>{`Donated: ${point.value} meals`}</Tooltip>
              </CircleMarker>
            ))}

          {showReceivers &&
            receiverData.map((point, i) => (
              <CircleMarker
                key={i}
                center={[point.lat, point.lng]}
                radius={10}
                pathOptions={{
                  color: "#e60000",
                  fillColor: "#e60000",
                  fillOpacity: 0.6,
                }}
              >
                <Tooltip>{`Received: ${point.value} meals`}</Tooltip>
              </CircleMarker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default DonationMap;

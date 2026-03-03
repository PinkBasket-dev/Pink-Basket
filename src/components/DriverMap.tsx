"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons (Global run)
if (typeof window !== "undefined") {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

interface DriverMapProps {
  lat: number;
  lng: number;
  driverName: string;
}

export default function DriverMap({ lat, lng, driverName }: DriverMapProps) {
  // Ref to hold the map instance
  const mapRef = useRef<L.Map | null>(null);
  // Ref to hold the DOM element
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Initialization: Create the map only if the container exists and map doesn't exist yet
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([lat, lng], 14);

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add Marker
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<strong>${driverName}</strong><br />Approaching now!`)
        .openPopup();

      // Save map instance to ref
      mapRef.current = map;
    }

    // 2. Cleanup: Destroy the map when the component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Empty dependency array: Run once on mount

  // 3. Update Map: If coordinates change, move the view
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 14);

    }
  }, [lat, lng]);

   return (
    <div 
      ref={mapContainerRef} 
      className="h-64 w-full rounded-lg z-0 border border-gray-200 shadow-sm" 
      style={{ zIndex: 0, background: '#e5e7eb' }} // Fallback background if tiles are slow
    />
  );
}
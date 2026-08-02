'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MapMarkers from './MapMarkers';
import MapLegend from './MapLegend';

// Fix Leaflet default marker icon URL issues in Next.js bundler
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Map Controller to smoothly fly to focused location
function MapCameraController({ selectedLocation }) {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation && selectedLocation.latitude && selectedLocation.longitude) {
      map.flyTo([selectedLocation.latitude, selectedLocation.longitude], 12, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [selectedLocation, map]);

  return null;
}

export default function PerformanceMap({
  locations = [],
  totalLocations = 0,
  onairCount = 0,
  offairCount = 0,
  selectedLocation = null,
  selectedLocationId = null,
  onSelectLocation,
}) {
  const indonesiaCenter = [-2.5489, 118.0149];
  const initialZoom = 5;

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-pink-500/20 bg-white dark:bg-slate-900 z-0">
      <MapContainer
        center={indonesiaCenter}
        zoom={initialZoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0 font-sans"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={18}
          minZoom={4}
          subdomains={['a', 'b', 'c', 'd']}
        />

        <MapCameraController selectedLocation={selectedLocation} />

        <MapMarkers
          locations={locations}
          selectedLocationId={selectedLocationId || selectedLocation?.id}
          onSelectLocation={onSelectLocation}
        />
      </MapContainer>

      {/* Floating Legend Overlay */}
      <div className="absolute bottom-12 left-4 sm:bottom-6 sm:left-6 z-[1000] pointer-events-auto">
        <MapLegend
          totalLocations={totalLocations}
          onairCount={onairCount}
          offairCount={offairCount}
        />
      </div>
    </div>
  );
}

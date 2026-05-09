'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Circle } from 'react-leaflet'

interface UniversityLocationMapProps {
  latitude: number
  longitude: number
  radiusKm: number
}

export function UniversityLocationMap({
  latitude,
  longitude,
  radiusKm,
}: UniversityLocationMapProps) {
  // Leaflet expects [lat, lng] in numbers
  const center: [number, number] = [latitude, longitude]
  const radiusMeters = radiusKm * 1000

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle
          center={center}
          radius={radiusMeters}
          pathOptions={{
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.15,
          }}
        />
        {/* Small inner circle to highlight exact center */}
        <Circle
          center={center}
          radius={40}
          pathOptions={{
            color: '#16a34a',
            fillColor: '#22c55e',
            fillOpacity: 0.7,
          }}
        />
      </MapContainer>
    </div>
  )
}



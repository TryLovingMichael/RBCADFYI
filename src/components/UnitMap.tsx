import React from 'react';

interface UnitMapProps {
  location: {
    lat: number;
    lng: number;
  };
}

export default function UnitMap({ location }: UnitMapProps) {
  return (
    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
      <iframe
        title="Unit Location"
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng-0.01},${location.lat-0.01},${location.lng+0.01},${location.lat+0.01}&layer=mapnik&marker=${location.lat},${location.lng}`}
      />
    </div>
  );
}
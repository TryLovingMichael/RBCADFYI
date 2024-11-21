import React, { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, Wind } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: string;
  windSpeed: number;
  humidity: number;
}

interface WeatherWidgetProps {
  location: { lat: number; lng: number } | null;
}

export default function WeatherWidget({ location }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (location) {
      // Simulated weather data - in a real app, you'd call a weather API
      setWeather({
        temperature: Math.round(65 + Math.random() * 20),
        condition: ['Clear', 'Cloudy', 'Rain', 'Windy'][Math.floor(Math.random() * 4)],
        windSpeed: Math.round(5 + Math.random() * 15),
        humidity: Math.round(40 + Math.random() * 40)
      });
    }
  }, [location]);

  if (!weather) return null;

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'Clear':
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'Cloudy':
        return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'Rain':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'Windy':
        return <Wind className="h-8 w-8 text-blue-300" />;
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Current Weather</h2>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getWeatherIcon()}
          <div className="ml-4">
            <div className="text-3xl font-bold">{weather.temperature}°F</div>
            <div className="text-gray-500">{weather.condition}</div>
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>Wind: {weather.windSpeed} mph</div>
          <div>Humidity: {weather.humidity}%</div>
        </div>
      </div>
    </div>
  );
}
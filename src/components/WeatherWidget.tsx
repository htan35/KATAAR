'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Cloud, CloudRain, CloudFog, CloudLightning, Loader2 } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: string;
  iconCode: number;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const lat = 30.34;
  const lon = 76.38;

  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
        );
        if (!response.ok) throw new Error();
        
        const data = await response.json();
        const temp = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;
        
        setWeather({
          temperature: temp,
          condition: getWeatherCondition(code),
          iconCode: code
        });
        setError(false);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setWeather({
          temperature: 22,
          condition: 'Partly Cloudy',
          iconCode: 3
        });
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherCondition = (code: number): string => {
    if (code === 0) return 'Clear';
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    if (code === 45 || code === 48) return 'Foggy';
    if (code >= 51 && code <= 67) return 'Rainy';
    if (code >= 80 && code <= 82) return 'Showers';
    if (code >= 95) return 'Stormy';
    return 'Cloudy';
  };

  const renderWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" size={44} />;
    if (code >= 1 && code <= 3) {
      return (
        <div className="relative w-12 h-12">
          <Sun className="text-amber-500 absolute top-1 right-1 z-1" size={24} />
          <Cloud className="text-blue-300 absolute bottom-1 left-1 z-2 drop-shadow-md" size={36} />
        </div>
      );
    }
    if (code === 45 || code === 48) return <CloudFog className="text-slate-400" size={40} />;
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain className="text-blue-400" size={40} />;
    if (code >= 95) return <CloudLightning className="text-purple-400" size={40} />;
    return <Cloud className="text-slate-300" size={40} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-5 gap-3 bg-white/[0.03] border border-border-glass rounded-2xl h-[100px] text-xs text-text-secondary">
        <Loader2 className="animate-spin text-accent-purple" size={20} />
        <span>Loading Weather...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center p-5 gap-5 bg-white/[0.03] border border-border-glass rounded-2xl relative overflow-hidden shadow-md">
      <div className="w-12 h-12 flex items-center justify-center relative shrink-0">
        {weather && renderWeatherIcon(weather.iconCode)}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-text-primary tracking-wide">Weather</span>
        <h3 className="text-3xl font-extrabold line-height-1 text-yellow-500">{weather?.temperature}°C</h3>
        <span className="text-[10px] text-text-secondary">Patiala</span>
      </div>
    </div>
  );
}

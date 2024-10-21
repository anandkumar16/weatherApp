'use client'

import { WeatherDashboard } from '@/components/weather-dashboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4">
      <WeatherDashboard />
    </main>
  )
}
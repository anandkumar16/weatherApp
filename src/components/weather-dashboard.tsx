"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  CloudRain,
  Sun,
  Thermometer,
  Wind,
  Droplets,
  AlertTriangle,
  Calendar,
} from 'lucide-react'

import { env } from '@/config/env'



interface City {
  name: string
  lat: number
  lon: number
}

interface WeatherData {
  temp: string
  feels_like: string
  humidity: number
  wind_speed: number
  condition: string
  timestamp: string
}

interface WeatherSummary {
  date: string
  avgTemp: string
  maxTemp: string
  minTemp: string
  dominantCondition: string
  readings: number
}

interface AlertData {
  message: string
  timestamp: string
}

interface Reading {
  time: string
  temperature: string
}

const CITIES: City[] = [
  { name: 'Delhi', lat: 28.6139, lon: 77.209 },
  { name: 'Mumbai', lat: 19.076, lon: 72.8777 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Hyderabad', lat: 17.385, lon: 78.4867 },
]

// Database mock using localStorage
const WeatherDB = {
  saveWeatherData: (cityName: string, data: WeatherData) => {
    const key = `weather_${cityName}_${new Date().toISOString().split('T')[0]}`
    const existingData: WeatherData[] = JSON.parse(localStorage.getItem(key) || '[]')
    existingData.push(data)
    localStorage.setItem(key, JSON.stringify(existingData))
  },

  getDailySummary: (cityName: string, date: string): WeatherSummary | null => {
    const key = `weather_${cityName}_${date}`
    const data: WeatherData[] = JSON.parse(localStorage.getItem(key) || '[]')

    if (data.length === 0) return null

    const temperatures = data.map((d: WeatherData) => parseFloat(d.temp))
    const conditions = data.map((d: WeatherData) => d.condition)

    // Calculate dominant weather condition
    const conditionCounts = conditions.reduce((acc: Record<string, number>, curr: string) => {
      acc[curr] = (acc[curr] || 0) + 1
      return acc
    }, {})

    const dominantCondition = Object.entries(conditionCounts).sort(
      (a: [string, number], b: [string, number]) => b[1] - a[1],
    )[0][0]

    return {
      date,
      avgTemp: (
        temperatures.reduce((a, b) => a + b, 0) / temperatures.length
      ).toFixed(1),
      maxTemp: Math.max(...temperatures).toFixed(1),
      minTemp: Math.min(...temperatures).toFixed(1),
      dominantCondition,
      readings: data.length,
    }
  },

  getWeekSummaries: (cityName: string): WeatherSummary[] => {
    const summaries: WeatherSummary[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const summary = WeatherDB.getDailySummary(cityName, dateStr)
      if (summary) {
        summaries.push(summary)
      }
    }
    return summaries
  },
}

export function WeatherDashboard() {
  const [selectedCity, setSelectedCity] = useState<City>(CITIES[0])
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)
  const [recentReadings, setRecentReadings] = useState<Reading[]>([])
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [threshold, setThreshold] = useState<number>(35)
  const [weeklySummaries, setWeeklySummaries] = useState<WeatherSummary[]>([])

  const kelvinToCelsius = (kelvin: number) => (kelvin - 273.15).toFixed(1)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${selectedCity.lat}&lon=${selectedCity.lon}&appid=${env.OPENWEATHER_API_KEY}`,
        )
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const processedData: WeatherData = {
          temp: kelvinToCelsius(data.main.temp),
          feels_like: kelvinToCelsius(data.main.feels_like),
          humidity: data.main.humidity,
          wind_speed: data.wind.speed,
          condition: data.weather[0].main,
          timestamp: new Date().toLocaleTimeString(),
        }

        setCurrentWeather(processedData)

        // Save to database
        WeatherDB.saveWeatherData(selectedCity.name, processedData)

        // Update recent readings
        setRecentReadings((prev) =>
          [
            ...prev,
            {
              time: processedData.timestamp,
              temperature: processedData.temp,
            },
          ].slice(-24),
        )

        // Check for alerts
        if (parseFloat(processedData.temp) > threshold) {
          setAlerts((prev) => [
            ...prev,
            {
              message: `Temperature exceeds ${threshold}°C in ${selectedCity.name}`,
              timestamp: new Date().toLocaleTimeString(),
            },
          ])
        }

        // Update weekly summaries
        const summaries = WeatherDB.getWeekSummaries(selectedCity.name)
        setWeeklySummaries(summaries)
      } catch (error) {
        const typedError = error as Error
        console.error('Error fetching weather data:', typedError.message)
      }
    }

    fetchWeather()
    const interval = setInterval(fetchWeather, 300000) // 5 minutes

    return () => clearInterval(interval)
  }, [selectedCity, threshold])

  const WeatherIcon = ({ condition }: { condition?: string }) => {
    switch (condition?.toLowerCase()) {
      case 'rain':
        return <CloudRain className="h-8 w-8 text-blue-500" />
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Weather Monitoring System</h1>
        <select
          className="rounded border p-2"
          value={selectedCity.name}
          onChange={(e) => {
            const city = CITIES.find((city) => city.name === e.target.value)
            if (city) {
              setSelectedCity(city)
            }
          }}
        >
          {CITIES.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Current Weather</TabsTrigger>
          <TabsTrigger value="summaries">Daily Summaries</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          {currentWeather && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <WeatherIcon condition={currentWeather.condition} />
                    Current Weather
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5" />
                      <span>Temperature: {currentWeather.temp}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5" />
                      <span>Feels like: {currentWeather.feels_like}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="h-5 w-5" />
                      <span>Humidity: {currentWeather.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-5 w-5" />
                      <span>Wind: {currentWeather.wind_speed} m/s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Temperature Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={recentReadings}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="temperature"
                          stroke="#8884d8"
                          name="Temperature °C"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Recent Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alerts.slice(-3).map((alert, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertTitle>Temperature Alert</AlertTitle>
                        <AlertDescription>
                          {alert.message}
                          <div className="text-sm text-gray-500">
                            {alert.timestamp}
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="summaries">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Weather Summaries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklySummaries.map((summary, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                        <div>
                          <div className="text-sm text-gray-500">Date</div>
                          <div>{new Date(summary.date).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Average Temp</div>
                          <div>{summary.avgTemp}°C</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Max Temp</div>
                          <div>{summary.maxTemp}°C</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Min Temp</div>
                          <div>{summary.minTemp}°C</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Weather</div>
                          <div className="flex items-center gap-2">
                            <WeatherIcon condition={summary.dominantCondition} />
                            {summary.dominantCondition}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label>Temperature Alert Threshold (°C):</label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="rounded border p-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

# Weather Monitoring System

A real-time weather monitoring dashboard built with Next.js that provides current weather data, temperature trends, and alerts for major Indian cities. The system features a responsive design, interactive charts, and configurable temperature alerts.

![Weather Dashboard Preview](/api/placeholder/800/400)

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Development](#development)
- [Design Choices](#design-choices)
- [API Documentation](#api-documentation)
- [Performance Considerations](#performance-considerations)
- [Security Considerations](#security-considerations)

## Features

- Real-time weather monitoring for major Indian cities.
- Interactive temperature trend visualization.
- Configurable temperature alerts.
- Historical weather data summaries.
- Responsive design for all devices.
- Dark/Light mode support.
- Local storage for offline capabilities.

## Technology Stack

- **Frontend Framework:** Next.js 14
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **API:** OpenWeather API
- **State Management:** React Hooks
- **Type Checking:** TypeScript
- **Containerization:** Docker
- **Development Environment:** Node.js 18+


## Prerequisites
Node.js 18.0 or higher.
npm 9.0 or higher.
OpenWeather API key.

## Installation
Clone the repository:


git clone https://github.com/anandkumar16/weatherapp.git

cd project directory


## Install dependencies:

npm install
Configure environment variables:

cp .env.example .env.local
Edit .env.local and add your OpenWeather API key:

NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here





## Development
Start the development server:


npm run dev

## Build for production:


npm run build



## Design Choices

***1. Frontend Architecture***
Next.js: Chosen for its server-side rendering capabilities and optimized performance.
TypeScript: Ensures type safety and better developer experience.
shadcn/ui: Provides accessible, customizable components that follow best practices.
Tailwind CSS: Enables rapid UI development with a utility-first approach.


***2. State Management***
Used React's built-in hooks for state management instead of external libraries.
Local storage for persisting user preferences and historical data.
Implemented custom hooks for data fetching and state updates.


***3. Performance Optimizations***
Implemented debouncing for API calls.
Used Next.js image optimization.
Implemented proper error boundaries.
Lazy loading for heavy components.
Memoization for expensive calculations.


***4. Responsive Design***
Mobile-first approach.
Flexible grid system.
Adaptive charts and visualizations.
Touch-friendly interface.

***API Documentation***
OpenWeather API Integration
Base URL: https://api.openweathermap.org/data/2.5

***Endpoints used:***

/weather: Current weather data
Parameters:
lat: Latitude
lon: Longitude
appid: API key


***Response format:***


{
  "main": {
    "temp": number,
    "feels_like": number,
    "humidity": number
  },
  "wind": {
    "speed": number
  },
  "weather": [{
    "main": string,
    "description": string
  }]
}

***Performance Considerations***
Data Fetching

Implemented caching strategy.
Rate limiting for API calls.
Data persistence in localStorage.
Rendering

Used React.memo for component optimization.
Implemented proper loading states.
Optimized re-renders using useMemo and useCallback.

***Security Considerations***
API Key Protection

***Environment variables for sensitive data.***
API key validation.
Rate limiting implementation.
Data Safety

Input validation.
XSS protection.
CORS configuration.
Error Handling

Graceful error fallbacks.
User-friendly error messages.
Logging and monitoring.

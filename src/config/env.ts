export const env = {
    OPENWEATHER_API_KEY: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
    
  }

  if (!env.OPENWEATHER_API_KEY) {
    throw new Error('NEXT_PUBLIC_OPENWEATHER_API_KEY is not defined in environment variables')
  }
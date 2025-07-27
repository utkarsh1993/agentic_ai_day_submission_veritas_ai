import { useState, useEffect } from "react";
import axios from "axios";
import useGeolocation from "./useGeolocation";
import {
  WEATHER_API_KEY,
  WEATHER_API_URL,
  AGENT_APP_NAME,
  AGENT_USER_ID,
  AGENT_SESSION_ID,
} from "../config";

const CACHE_KEY = "weatherDataCache";
const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const useWeatherData = () => {
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [allAgentWeather, setAllAgentWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const { location, error: locationError } = useGeolocation();

  useEffect(() => {
    const controller = new AbortController(); // ✅ For canceling requests

    const fetchWeatherData = async () => {
      if (locationError) {
        setLoading(false);
        return;
      }
      if (!location) return;

      const cachedDataJSON = localStorage.getItem(CACHE_KEY);
      if (cachedDataJSON) {
        try {
          const cachedData = JSON.parse(cachedDataJSON);
          const isCacheValid =
            new Date().getTime() - cachedData.timestamp < CACHE_EXPIRY_MS &&
            Math.abs(cachedData.location.latitude - location.latitude) < 0.01 &&
            Math.abs(cachedData.location.longitude - location.longitude) < 0.01;

          if (isCacheValid) {
            console.log("Using cached weather data");
            setWeather(cachedData.weather);
            setLocationName(cachedData.locationName);
            setAllAgentWeather(cachedData.allAgentWeather);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to parse cached data, removing it.", e);
          localStorage.removeItem(CACHE_KEY);
        }
      }

      setLoading(true);
      const { latitude, longitude } = location;

      const [weatherResult, geoResult, agentResult] = await Promise.allSettled([
        axios.get("https://api.openweathermap.org/data/2.5/weather", {
          signal: controller.signal,
          params: {
            lat: latitude,
            lon: longitude,
            units: "metric",
            appid: WEATHER_API_KEY,
          },
        }),
        axios.get("https://api.openweathermap.org/geo/1.0/reverse", {
          signal: controller.signal,
          params: {
            lat: latitude,
            lon: longitude,
            limit: 1,
            appid: WEATHER_API_KEY,
          },
        }),
        axios.post(
          WEATHER_API_URL,
          {
            appName: AGENT_APP_NAME,
            userId: AGENT_USER_ID,
            sessionId: AGENT_SESSION_ID,
            newMessage: {
              role: "user",
              parts: [{
                text: `My location is latitude: ${latitude} and longitude: ${longitude}. Provide the warning alerts for weather.`
              }],
            },
          },
          {
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
            },
          }
        ),
      ]);

      let newWeather = null;
      let newLocationName = "";
      let newAllAgentWeather = null;

      if (weatherResult.status === "fulfilled" && geoResult.status === "fulfilled") {
        const weatherData = weatherResult.value.data;
        newWeather = {
          temperature: `${Math.round(weatherData.main.temp)}°C`,
          condition: weatherData.weather[0].description,
          humidity: `${weatherData.main.humidity}%`,
          pressure: `${weatherData.main.pressure} hPa`,
          sea_level: weatherData.main.sea_level ? `${weatherData.main.sea_level} hPa` : "N/A",
          temp_max: `${Math.round(weatherData.main.temp_max)}°C`,
          temp_min: `${Math.round(weatherData.main.temp_min)}°C`,
          wind: {
            speed: `${weatherData.wind.speed} m/s`,
            deg: `${weatherData.wind.deg}°`,
            gust: weatherData.wind.gust ? `${weatherData.wind.gust} m/s` : null,
          },
        };

        const geoData = geoResult.value.data;
        if (geoData?.length > 0 && geoData[0].name && geoData[0].state) {
          newLocationName = `${weatherData.name}, ${geoData[0].name}, ${geoData[0].state}`;
        } else {
          newLocationName = weatherData.name || "Unknown location";
        }
      } else {
        console.error("Weather/Geo fetch failed:", weatherResult.reason || geoResult.reason);
      }

      if (agentResult.status === "fulfilled") {
        const agentData = agentResult.value.data.weather_alert;
        if (agentData) {
          try {
            newAllAgentWeather = JSON.parse(agentData);
          } catch (e) {
            console.error("Failed to parse agent weather data", e);
          }
        }
      } else {
        console.error("Agent weather fetch failed:", agentResult.reason);
      }

      setWeather(newWeather);
      setLocationName(newLocationName);
      setAllAgentWeather(newAllAgentWeather);

      if (newWeather && newLocationName && newAllAgentWeather) {
        const dataToCache = {
          timestamp: new Date().getTime(),
          location,
          weather: newWeather,
          locationName: newLocationName,
          allAgentWeather: newAllAgentWeather,
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));
      }

      setLoading(false);
    };

    fetchWeatherData();

    return () => {
      controller.abort(); // ✅ Cancel any ongoing API calls
    };
  }, [location, locationError]);

  return { weather, locationName, allAgentWeather, loading, locationError };
};

export default useWeatherData;

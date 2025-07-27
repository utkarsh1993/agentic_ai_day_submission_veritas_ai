import React, { useState } from "react";
import useWeatherData from "../hooks/useWeatherData";

const WeatherInfo = () => {
  // 1. FIX: Changed function to produce DD-MM-YYYY format
  const getDDMMYYYY = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const { weather, locationName, allAgentWeather, loading, locationError } =
    useWeatherData();
  const [selectedDate, setSelectedDate] = useState(getDDMMYYYY(0));

  // 2. FIX: Removed unnecessary useEffect and agentWeatherInfo state.
  // We will calculate what to display directly in the return statement.

  const getFormattedDate = (offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  
  // Helper function to render the forecast
  const renderForecast = () => {
    if (locationError) return <p>Could not fetch weather summary.</p>;
    if (!allAgentWeather) return <p>Weather summary is unavailable.</p>;

    const forecast = allAgentWeather[selectedDate];
    
    if (Array.isArray(forecast) && forecast.length > 0) {
      return (
        <ul>
          {forecast.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }
    return <p>No forecast available for this day.</p>;
  };

  return (
    <div className="weather-info" style={{ display: 'flex', padding: '2rem' }}>
      <div className="weather-info-left" style={{ paddingRight: '1rem' }}>
        <strong>Location:</strong>
        <br />
        {locationError || locationName || "Fetching location..."}
        <br />
        <br />
        <strong>Current Weather:</strong>
        <br />
        {weather
          ? (
            <>
              {weather.temperature}, {weather.condition}
              <br />
              <strong>Humidity:</strong> {weather.humidity} | <strong>Pressure:</strong> {weather.pressure}
              <br />
              <strong>Wind:</strong> {weather.wind.speed} from {weather.wind.deg}{weather.wind.gust && ` (gusts: ${weather.wind.gust})`} 
            </>
          )
          : (loading ? "Loading weather..." : "Weather data unavailable.")}
      </div>
      <div className="weather-info-divider"></div>
      <div className="weather-info-right" style={{ paddingLeft: "1rem", textAlign: "left" }}>
        <select
          name="date-select"
          id="date-select"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          <option value={getDDMMYYYY(0)}>Today</option>
          <option value={getDDMMYYYY(1)}>{`Tomorrow, ${getFormattedDate(1)}`}</option>
          <option value={getDDMMYYYY(2)}>{`Next Day, ${getFormattedDate(2)}`}</option>
        </select>
        <div className="static-text">
          {/* 3. FIX: Display content directly based on loading state */}
          {loading ? "Fetching weather summary..." : renderForecast()}
        </div>
      </div>
    </div>
  );
};

export default WeatherInfo;
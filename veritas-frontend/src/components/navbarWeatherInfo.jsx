import React, { useState } from "react";
import useWeatherData from "../hooks/useWeatherData";

const NavbarWeatherInfo = () => {
  // FIX 1: The date format function now correctly produces DD-MM-YYYY.
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

  // FIX 2: Removed agentWeatherInfo state and the corresponding useEffect.

  const getFormattedDate = (offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // This helper function determines what to display for the forecast.
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
    <div className="weather-info" style={{ width: "100%", display: 'flex' }}>
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
          {/* FIX 3: Display is now derived directly from the loading state and the renderForecast function. */}
          {loading ? "Fetching weather summary..." : renderForecast()}
        </div>
      </div>
    </div>
  );
};

export default NavbarWeatherInfo;
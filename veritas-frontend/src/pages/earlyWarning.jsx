import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import BackWeather from "../components/backWeather";
import GoogleTranslate from "../components/googleTranslate";
import Ask from "./ask";
import Loader from "../components/loader";
import MainHeader from "../components/mainHeader";
import useGeolocation from "../hooks/useGeolocation";
import {
  EARLY_WARNING_API_URL,
  AGENT_APP_NAME,
  AGENT_USER_ID,
  AGENT_SESSION_ID,
} from "../config";
import "../style/earlyWarning.css";
import chatIcon from "../assets/chatIcon.jpeg";

const EarlyWarning = () => {
  const [loading, setLoading] = useState(false);
  const [isAskModalOpen, setAskModalOpen] = useState(false);
  const [responseLocal, setResponseLocal] = useState(null);
  const [responseWeather, setResponseWeather] = useState(null);
  const [responseDaily, setResponseDaily] = useState(null);
  const { location } = useGeolocation();

  const handleOpenAskModal = () => setAskModalOpen(true);
  const handleCloseAskModal = () => setAskModalOpen(false);

  const handleSubmit = async () => {
    if (!location) {
      alert("No location found.");
      return;
    }

    setLoading(true);
    setResponseLocal(null);
    setResponseWeather(null);
    setResponseDaily(null);

    const payload_weather = {
      appName: AGENT_APP_NAME,
      userId: AGENT_USER_ID,
      sessionId: AGENT_SESSION_ID,
      newMessage: {
        role: "user",
        parts: [{
          text: `My location is latitude: ${location.latitude} and longitude: ${location.longitude}. Give seasonal forecast.`
        },],
      },
    };

    const payload_local_alerts = {
      appName: AGENT_APP_NAME,
      userId: AGENT_USER_ID,
      sessionId: AGENT_SESSION_ID,
      newMessage: {
        role: "user",
        parts: [{
          text: `My location is latitude: ${location.latitude} and longitude: ${location.longitude}. Give local alerts.`
        },],
      },
    };

    const payload_daily = {
      appName: AGENT_APP_NAME,
      userId: AGENT_USER_ID,
      sessionId: AGENT_SESSION_ID,
      newMessage: {
        role: "user",
        parts: [{
          text: `My location is latitude: ${location.latitude} and longitude: ${location.longitude}. Give a 10-day weather risk.`
        },],
      },
    };

    try {
      const [res_local, res_weather, res_daily] = await Promise.all([
        axios.post(EARLY_WARNING_API_URL, payload_local_alerts),
        axios.post(EARLY_WARNING_API_URL, payload_weather),
        axios.post(EARLY_WARNING_API_URL, payload_daily),
      ]);

      setResponseLocal(res_local.data);
      setResponseWeather(res_weather.data);
      setResponseDaily(res_daily.data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      setResponseLocal({ error: errorMessage });
      setResponseWeather({ error: errorMessage });
      setResponseDaily({ error: errorMessage });
      console.error("API Error:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (location) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // --- PARSING LOGIC ---
  // Each piece of data is parsed safely using the useMemo hook.

  const localAlerts = useMemo(() => {
    if (!responseLocal?.local_alerts) return [];
    try {
      const data = JSON.parse(responseLocal.local_alerts);
      return Array.isArray(data.alerts) ? data.alerts : [];
    } catch (e) {
      return []; // Return empty array if parsing fails
    }
  }, [responseLocal]);

  const forecastAlerts = useMemo(() => {
    if (!responseDaily?.weather_forecast) return [];
    try {
      const data = JSON.parse(responseDaily.weather_forecast);
      return Array.isArray(data.alerts) ? data.alerts : [];
    } catch (e) {
      return []; // Return empty array if parsing fails
    }
  }, [responseDaily]);

  const seasonalForecast = useMemo(() => {
    if (!responseWeather?.seasonal_weather_forecast) return null;
    try {
      return JSON.parse(responseWeather.seasonal_weather_forecast);
    } catch (e) {
      console.error("Failed to parse seasonal weather forecast:", e);
      return null;
    }
  }, [responseWeather]);

  return (
    <>
      <GoogleTranslate />
      <div className="container main-back" style={{ paddingBottom: "1rem" }}>
        <BackWeather />
        <MainHeader />
        <h2 style={{ color: "white", textAlign: "center" }}>EARLY WARNING</h2>

        <div className="glass-background" style={{ minHeight: '200px' }}>
          {loading && <Loader />}
          <div
            className="early-warning-container"
            style={{ display: "flex", flexDirection: "row", alignItems: 'flex-start' }}
          >
            {!loading && responseDaily && (
              <div className="warning-section forecast-alerts" style={{ flex: 1, padding: "0 1rem" }}>
                <h4 style={{ color: "darkblue" }}>🌞 Short Term Weather Forecast</h4>
                {forecastAlerts.length > 0 ? (
                  forecastAlerts.map((alert, index) => (
                    <div key={index} className="alert-card" style={{ color: "black" }}>
                      <h5>{alert.type} ({alert.severity_level})</h5>
                      <p><strong>Description:</strong> {alert.description}</p>
                      <p><strong>Action:</strong> {alert.recommended_action}</p>
                      <p><strong>Period:</strong> {alert.forecast_date_range?.start_date} to {alert.forecast_date_range?.end_date}</p>
                      <p><strong>Confidence:</strong> {Math.round(alert.confidence_score * 100)}%</p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "black" }}>No forecast alerts found.</p>
                )}
              </div>
            )}


            {/* Divider */}
            {!loading && responseLocal && (responseWeather || responseDaily) && (
              <div className="divider" style={{ borderLeft: "2px solid #ccc", alignSelf: "stretch" }} />
            )}

            {/* UPDATED: Seasonal Forecast Section */}
            {!loading && responseWeather && (
              <div className="warning-section weather-alerts" style={{ flex: 1, padding: "0 1rem" }}>
                <h4 style={{ color: "darkblue" }}>🌦️ Long Term Climatic Conditions</h4>
                {seasonalForecast ? (
                  <div className="alert-card" style={{ color: "black" }}>
                    <h5>Seasonal Warnings</h5>
                    <p><strong>Heat Wave Months: </strong>{seasonalForecast.seasonal_warnings?.heat_wave_months || 'N/A'}</p>
                    <p><strong>Cold Wave Months: </strong>{seasonalForecast.seasonal_warnings?.cold_wave_months || 'N/A'}</p>
                    <p><strong>Flood Risk Months: </strong>{seasonalForecast.seasonal_warnings?.riverine_flood_risk_months || 'N/A'}</p>

                    <h5 style={{ marginTop: '1rem' }}>Monsoon Forecast</h5>
                    <p><strong>Start Date: </strong>{seasonalForecast.monsoon_forecast?.start_date || 'N/A'}</p>
                    <p><strong>End Date: </strong>{seasonalForecast.monsoon_forecast?.end_date || 'N/A'}</p>
                    <p><strong>Confidence: </strong>{seasonalForecast.monsoon_forecast?.confidence || 'N/A'}</p>

                    <h5 style={{ marginTop: '1rem' }}>Canal Water Release</h5>
                    {seasonalForecast.canal_water_release_schedule?.map((item, index) => (
                      <p key={index}><strong>{item.season} Window: </strong>{item.release_window}</p>
                    )) || <p>N/A</p>}

                    <p style={{ marginTop: '1rem', fontSize: '0.8em', fontStyle: 'italic' }}>
                      <strong>Last Updated: </strong>{seasonalForecast.last_updated || 'N/A'}
                    </p>
                  </div>
                ) : (
                  <p style={{ color: "black" }}>No seasonal forecast found.</p>
                )}
              </div>
            )}

            {!loading && responseWeather && responseDaily && (
              <div className="divider" style={{ borderLeft: "2px solid #ccc", alignSelf: "stretch" }} />
            )}
            {/* Local Alerts Section */}
            {!loading && responseLocal && (
              <div className="warning-section local-alerts" style={{ flex: 1, padding: "0 1rem" }}>
                <h4 style={{ color: "darkblue" }}>📍 Local Alerts</h4>
                {localAlerts.length > 0 ? (
                  localAlerts.map((alert, index) => (
                    <div key={index} className="alert-card" style={{ color: "black" }}>
                      <h5>{alert.type}</h5>
                      <p><strong>Description:</strong> {alert.description}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "black" }}>No local alerts found.</p>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      <button className="chat-button" onClick={handleOpenAskModal}>
        <img src={chatIcon} alt="Chat Icon" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </button>

      <Ask isOpen={isAskModalOpen} onClose={handleCloseAskModal} />
    </>
  );
};

export default EarlyWarning;
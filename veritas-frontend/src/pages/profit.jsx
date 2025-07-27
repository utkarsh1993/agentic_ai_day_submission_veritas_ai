import React, { useState } from "react";
import axios from "axios";
import BackWeather from "../components/backWeather";
import GoogleTranslate from "../components/googleTranslate";
import Ask from "./ask";
import Loader from "../components/loader";
import {
  PROFIT_API_URL,
  AGENT_APP_NAME,
  AGENT_USER_ID,
  AGENT_SESSION_ID,
} from "../config";
import MainHeader from "../components/mainHeader";
import useGeolocation from "../hooks/useGeolocation";
import chatIcon from "../assets/chatIcon.jpeg";

const Profit = () => {
  const [loading, setLoading] = useState(false);
  const [isAskModalOpen, setAskModalOpen] = useState(false);
  const [commodity, setCommodity] = useState("potato");
  const [response, setResponse] = useState(null);
  const { location } = useGeolocation();

  const handleOpenAskModal = () => setAskModalOpen(true);
  const handleCloseAskModal = () => setAskModalOpen(false);

  const handleCommodityChange = (e) => {
    setCommodity(e.target.value);
  };

  const handleSubmit = async () => {
    if(!location){
      alert('No location found.')
      return;
    }
    
    setLoading(true);
    setResponse(null);

    const payload = {
      appName: AGENT_APP_NAME,
      userId: AGENT_USER_ID,
      sessionId: AGENT_SESSION_ID,
      newMessage: {
        role: "user",
        parts: [
          {
            text: `My location is latitude: ${location.latitude} and longitude: ${location.longitude}. Provide the profit details for commodity - ${commodity}`,
          },
        ],
      },
    };

    try {
      const res = await axios.post(PROFIT_API_URL, payload, {
        headers: { "Content-Type": "application/json" },
      });
      setResponse(res.data);
    } catch (error) {
      setResponse({ error: error.response?.data?.message || error.message });
    }

    setLoading(false);
  };

  return (
    <>
      <GoogleTranslate />
      <div className="container main-back" style={{paddingBottom:'1rem'}}>
        <BackWeather />
        <MainHeader />
        <h2 style={{ color: "white", textAlign: "center" }}>IMPROVE PROFITABILITY</h2>
        <div className="glass-background">
          <div style={{ padding: "1rem" }}>
            <label htmlFor="commodity-select">Select Commodity: </label>
            <select id="commodity-select" value={commodity} onChange={handleCommodityChange}>
              <option value="potato">Potato</option>
              <option value="tomato">Tomato</option>
              <option value="corn">Corn</option>
            </select>
            <button style={{ marginLeft: "1rem" }} onClick={handleSubmit} disabled={loading}>
              {loading ? "Loading..." : "Get Profit Info"}
            </button>
          </div>

          {loading && <Loader />}

          {response && (
            <div style={{ padding: "1rem", backgroundColor: "rgba(255, 255, 255, 0.5)", marginTop: "1rem", borderRadius: "8px" }}>
              {response.error ? (
                <p style={{ color: "red" }}>Error: {response.error}</p>
              ) : (
                <>
                  {/* Forecasted Prices */}
                  <div style={{ marginBottom: "1rem" }}>
                    <h4>📈 Forecasted Prices</h4>
                    <ul>
                      <li>Month 1: {response.forecasted_prices?.month_1}</li>
                      <li>Month 2: {response.forecasted_prices?.month_2}</li>
                      <li>Month 3: {response.forecasted_prices?.month_3}</li>
                    </ul>
                  </div>

                  {/* Option A: Store */}
                  <div style={{ marginBottom: "1rem" }}>
                    <h4>🏬 Option A: Store in Cold Storage</h4>
                    <strong>Storage Locations:</strong>
                    <ul>
                      {response.option_a_store?.storage_location.map((loc, idx) => (
                        <li key={idx}>{loc}</li>
                      ))}
                    </ul>
                    <p>Estimated Future Revenue: <strong>{response.option_a_store?.estimated_future_revenue}</strong></p>
                    <p>Estimated Net Revenue after Storage Cost: <strong>{response.option_a_store?.estimated_net_revenue}</strong></p>
                  </div>

                  {/* Option B: Sell */}
                  <div style={{ marginBottom: "1rem" }}>
                    <h4>🛒 Option B: Sell Now</h4>
                    <p>Current Price at Nearest Market: <strong>{response.option_b_sell?.current_market_price_at_nearest_market}</strong></p>
                    <p>Best Market: <strong>{response.option_b_sell?.best_market?.market_name}</strong> ({response.option_b_sell?.best_market?.city})</p>
                    <p>Price at Best Market: <strong>{response.option_b_sell?.current_market_price_at_best_market}</strong></p>
                    <p>Transportation Cost: <strong>{response.option_b_sell?.best_market?.transportation_cost}</strong></p>
                    <p>Net Revenue After Transport: <strong>{response.option_b_sell?.best_market?.net_revenue}</strong></p>
                  </div>

                  {/* Recommendation */}
                  <div style={{ padding: "1rem", backgroundColor: "#e6ffe6", borderRadius: "6px" }}>
                    <h4>✅ Recommendation</h4>
                    <p><strong>Action:</strong> {response.recommendation?.action?.toUpperCase()}</p>
                    <p><strong>Reason:</strong> Based on {response.recommendation?.based_on}</p>
                    <p><strong>Location:</strong> {response.recommendation?.location}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <button className="chat-button" onClick={() => setAskModalOpen(true)}>
                <img
                  src={chatIcon}
                  alt="Chat Icon"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
      
              </button>

      <Ask isOpen={isAskModalOpen} onClose={handleCloseAskModal} />
    </>
  );
};

export default Profit;

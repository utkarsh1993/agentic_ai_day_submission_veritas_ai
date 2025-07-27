import React, { useState, useEffect } from "react";
import axios from "axios";
import "../style/growerService.css";
import {
  GROWER_RECOMMEN_API_URL,
  AGENT_APP_NAME,
  AGENT_USER_ID,
  AGENT_SESSION_ID,
} from "../config";
import useGeolocation from "../hooks/useGeolocation";
import growerServiceIcon from "../assets/growerService.png";

const ExpandableItem = ({ title, description }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!description) {
    return <p style={{ whiteSpace: "pre-wrap" }}>{title}</p>;
  }

  return (
    <div className="expandable-item">
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "none",
          padding: "0.25rem 0",
          margin: 0,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          textAlign: "left",
          fontSize: "1em",
        }}
      >
        <strong>{title}</strong>
        <span
          style={{
            fontSize: "1em",
            marginLeft: "0.5rem",
            color: "black",
            fontWeight: "bold",
          }}
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && (
        <div style={{ marginTop: "0.5rem", paddingLeft: "1rem" }}>
          {typeof description === "string" ? (
            <p style={{ whiteSpace: "pre-wrap" }}>{description}</p>
          ) : (
            description
          )}
        </div>
      )}
    </div>
  );
};

const GrowerService = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { location, error: geoError } = useGeolocation();

  const cropParser = (text) => {
    const parts = text.split(/:(.*)/s);
    return {
      title: parts[0],
      description: parts.length > 1 ? parts[1].trim() : "",
    };
  };

  const renderRecommendations = (data, level = 0) => {
    return Object.entries(data).map(([key, value], index, array) => {
      const isLastItem = index === array.length - 1;
      const isNumericKey = /^\d+$/.test(key);
      const formattedKey = key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      return (
        <div key={key}>
          <div className="recommendation-section">
            {!isNumericKey && (
              <strong style={{ color: "black", fontWeight: "bold" }}>
                {formattedKey}
              </strong>
            )}
            {typeof value === "string" ? (
              (() => {
                const { title, description } = cropParser(value);
                return <ExpandableItem title={title} description={description} />;
              })()
            ) : (
              <div style={{ paddingLeft: isNumericKey ? "0" : "1rem" }}>
                {renderRecommendations(value, level + 1)}
              </div>
            )}
          </div>
          {!isLastItem && !isNumericKey && <hr className="recommendation-divider" />}
        </div>
      );
    });
  };

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);

      if (!location && geoError) {
        console.error("Could not get location", geoError);
        setLoading(false);
        return;
      }

      if (!location) return;

      const { latitude, longitude } = location;
      const locationText = `My location is latitude: ${latitude} and longitude: ${longitude}.`;

      const basePayload = {
        appName: AGENT_APP_NAME,
        userId: AGENT_USER_ID,
        sessionId: AGENT_SESSION_ID,
      };

      const createPayload = (prompt) => ({
        ...basePayload,
        newMessage: {
          role: "user",
          parts: [{ text: `${prompt} ${locationText}` }],
        },
      });

      const soilPayload = createPayload(
        "Provide a brief soil analysis, key services and government schemes based on my location."
      );
      const cropPayload = createPayload(
        "Provide crop recommendation for large and small scale farmers, and general considerations based on my location."
      );
      const fertilizerPayload = createPayload(
        "Provide fertilizer recommendations, local suppliers, and monitoring grower recommendations based on my location."
      );

      try {
        const [soilResult, growerResult, fertilizerResult] = await Promise.allSettled([
          axios.post(GROWER_RECOMMEN_API_URL, soilPayload, {
            headers: { "Content-Type": "application/json" },
          }),
          axios.post(GROWER_RECOMMEN_API_URL, cropPayload, {
            headers: { "Content-Type": "application/json" },
          }),
          axios.post(GROWER_RECOMMEN_API_URL, fertilizerPayload, {
            headers: { "Content-Type": "application/json" },
          }),
        ]);

        console.log(soilResult)
        console.log(growerResult)
        console.log(fertilizerResult)


        // Process Soil Analysis Response
        let soilContent;

        if (soilResult.status === "fulfilled" && soilResult.value.data.soil_alert) {
          const soilAgentResponse = soilResult.value.data.soil_alert;

          try {
            const parsedSoilData =
              typeof soilAgentResponse === "string"
                ? JSON.parse(soilAgentResponse)
                : soilAgentResponse;

            const {
              location_output,
              soil_Health_card,
              key_grower_services,
              government_schemes,
            } = parsedSoilData;

            const soilHealthTable = soil_Health_card?.soil_health_card_table;
            const tableHeaders =
              soilHealthTable && soilHealthTable.length > 0
                ? Object.keys(soilHealthTable[0])
                : [];

            soilContent = (
              <div>
                {location_output && (
                  <p>
                    <strong>Location:</strong> {location_output}
                  </p>
                )}
                {soil_Health_card?.soil_type_detected && (
                  <p>
                    <strong>Soil Type:</strong> {soil_Health_card.soil_type_detected}
                  </p>
                )}
                {tableHeaders.length > 0 && (
                  <table className="soil-health-table">
                    <thead>
                      <tr>
                        {tableHeaders.map((header) => (
                          <th key={header}>
                            {header.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {soilHealthTable.map((row, index) => (
                        <tr key={index}>
                          {tableHeaders.map((header) => (
                            <td key={header}>{row[header]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {key_grower_services && (
                  <div className="key-services-section">
                    <h4>Key Grower Services</h4>
                    {Object.values(key_grower_services).map((serviceText, index) => {
                      const [title, description] = serviceText.split(/:(.*)/s);
                      return (
                        <div className="key-service" key={index}>
                          <strong style={{ color: "black" }}>{title}</strong>
                          {description && <p style={{ whiteSpace: "pre-wrap" }}>{description.trim()}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
                {government_schemes && (
                  <div className="key-services-section">
                    <h4>Government Schemes</h4>
                    {government_schemes.map((serviceText, index) => {
                      const [title, description] = serviceText.split(/:(.*)/s);
                      return (
                        <div className="key-service" key={index}>
                          <strong style={{ color: "black" }}>{title}</strong>
                          {description && <p style={{ whiteSpace: "pre-wrap" }}>{description.trim()}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          } catch (e) {
            console.error("Error parsing soil data:", e);
            soilContent = <p style={{ whiteSpace: "pre-wrap" }}>{String(soilAgentResponse)}</p>;
          }
        } else {
          if (soilResult.status === "rejected") {
            console.error("Failed to fetch soil data:", soilResult.reason);
          }
          soilContent = <p>Could not retrieve soil analysis data.</p>;
        }

        // Process Grower Recommendation Response
        let growerContent;

        if (growerResult.status === "fulfilled" && growerResult.value.data.crop_alert) {
          const growerAgentResponse = growerResult.value.data.crop_alert;

          try {
            const parsedData =
              typeof growerAgentResponse === "string"
                ? JSON.parse(growerAgentResponse)
                : growerAgentResponse;

            growerContent = renderRecommendations(parsedData, 0);
          } catch (e) {
            console.error("Error parsing grower data:", e);
            growerContent = <p style={{ whiteSpace: "pre-wrap" }}>{String(growerAgentResponse)}</p>;
          }
        } else {
          if (growerResult.status === "rejected") {
            console.error("Failed to fetch grower data:", growerResult.reason);
          }
          growerContent = <p>Could not retrieve crop recommendation data.</p>;
        }
        // Process Fertilizer Recommendation Response
        let fertilizerContent;

        if (
          fertilizerResult.status === "fulfilled" &&
          fertilizerResult.value.data.fertilizer_alert
        ) {
          const fertilizerAgentResponse = fertilizerResult.value.data.fertilizer_alert;

          try {
            const parsedData =
              typeof fertilizerAgentResponse === "string"
                ? JSON.parse(fertilizerAgentResponse)
                : fertilizerAgentResponse;

            const formatKey = (key) =>
              key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

            const renderObjectDetails = (obj) =>
              Object.entries(obj).map(([key, value]) => (
                <p key={key} style={{ margin: "0.25rem 0" }}>
                  <strong>{formatKey(key)}:</strong> {String(value)}
                </p>
              ));

            fertilizerContent = Object.entries(parsedData).map(
              ([sectionKey, sectionValue]) => (
                <div key={sectionKey} style={{ marginBottom: "1rem" }}>
                  <h4>{formatKey(sectionKey)}</h4>
                  {(() => {
                    if (
                      sectionKey === "fertilizer_recommendations" &&
                      sectionValue.primary_fertilizers
                    ) {
                      return sectionValue.primary_fertilizers.map((item, index) => (
                        <ExpandableItem
                          key={index}
                          title={`${item.fertilizer_name} (${item.application_rate_per_acre})`}
                          description={renderObjectDetails({
                            application_timing: item.application_timing,
                            application_method: item.application_method,
                            estimated_cost_per_acre: item.estimated_cost_per_acre,
                            benefits_for_recommended_crops: item.benefits_for_recommended_crops,
                          })}
                        />
                      ));
                    }

                    if (sectionKey === "local_suppliers") {
                      return Object.entries(sectionValue).map(([type, items]) => (
                        <div key={type}>
                          <h5>{formatKey(type)}</h5>
                          {items.map((item, index) => {
                            const { outlet_type, dealer_type, platform, ...details } = item;
                            const title = outlet_type || dealer_type || platform;

                            return (
                              <ExpandableItem
                                key={index}
                                title={title}
                                description={renderObjectDetails(details)}
                              />
                            );
                          })}
                        </div>
                      ));
                    }

                    if (sectionKey === "monitoring_recommendations") {
                      return renderObjectDetails(sectionValue);
                    }

                    return null;
                  })()}
                </div>
              )
            );
          } catch (e) {
            console.error("Error parsing fertilizer data:", e);
            fertilizerContent = (
              <p style={{ whiteSpace: "pre-wrap" }}>{String(fertilizerAgentResponse)}</p>
            );
          }
        } else {
          if (fertilizerResult.status === "rejected") {
            console.error("Failed to fetch fertilizer data:", fertilizerResult.reason);
          }

          fertilizerContent = <p>Could not retrieve fertilizer recommendation data.</p>;
        }

        // Combine All Service Cards
        const soilCard = { title: "Soil Analysis", content: soilContent };
        const growerCard = { title: "Grower Crop Recommendation", content: growerContent };
        const fertilizerCard = { title: "Fertilizer Recommendation", content: fertilizerContent };

        setServices([soilCard, growerCard, fertilizerCard]);
      } catch (error) {
        console.error("An error occurred while processing service data:", error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    // Trigger Data Fetch on Location or Error
    if (location || geoError) {
      fetchServices();
    }
  }, [location, geoError]);

  // Final Render Block
  return (
    <div className="glass-background">
      <div style={{display:'flex'}}><img
        src={growerServiceIcon}
        alt="Icon"
        style={{
          width: "200px",
          height: "100%",
          marginRight: "8px",
          borderRadius: '10px',
          paddingRight: '20px',
          objectFit: 'contain'
        }}
      /><h2>Grower Service</h2></div>
      <div className="grower-services-grid" style={{ width: "90%", margin: "0 auto" }}>
        {loading ? (
          [...Array(3)].map((_, index) => (
            <div className="grower-service-card" key={index}>
              <div className="card-loader"></div>
            </div>
          ))
        ) : services.length > 0 ? (
          services.map((service, index) => (
            <div
              className={`grower-service-card ${service.title === "Fertilizer Recommendation" ? "fertilizer-card" : ""
                }`}
              key={index}
            >
              <h3
                className={
                  service.title === "Fertilizer Recommendation" ? "fertilizer-title" : ""
                }
              >
                {service.title}
              </h3>
              <div className="service-content">{service.content}</div>
            </div>
          ))
        ) : (
          <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>
            Could not load grower services.
          </p>
        )}
      </div>
    </div>
  );
}

export default GrowerService;
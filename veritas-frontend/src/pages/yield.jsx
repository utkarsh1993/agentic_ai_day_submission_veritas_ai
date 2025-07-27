import React, { useState } from "react";
import axios from "axios";
import "../App.css";
import BackWeather from "../components/backWeather";
import Loader from "../components/loader";
import GoogleTranslate from "../components/googleTranslate";
import Ask from "./ask";
import MapComponent from "../components/map";
import GrowerService from "../components/growerService";
import useGeolocation from "../hooks/useGeolocation";
import {
  YIELD_API_URL,
  AGENT_APP_NAME,
  AGENT_USER_ID,
  AGENT_SESSION_ID,
} from "../config";
import MainHeader from "../components/mainHeader";
import cropDiagnosisIcon from "../assets/cropDiagnosis.png";
import chatIcon from "../assets/chatIcon.jpeg";

const Yield = () => {
  const [plant, setPlant] = useState("Potato");
  const [images, setImages] = useState([]);
  const [base64Images, setBase64Images] = useState([]);
  const [diagnosis, setDiagnosis] = useState("");
  const [allRemedies, setAllRemedies] = useState(null);
  const [remedy, setRemedy] = useState("");
  const [uploadDisabled, setUploadDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAskModalOpen, setAskModalOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isYieldOpen, setIsYieldOpen] = useState(true);
  const [isGrowerOpen, setIsGrowerOpen] = useState(false);
  const { location, error: geoError } = useGeolocation();

  const toggleYield = () => {
    setIsYieldOpen(true);
    setIsGrowerOpen(false);
  };

  const toggleGrower = () => {
    setIsYieldOpen(false);
    setIsGrowerOpen(true);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length !== 3) {
      alert("Please upload exactly 3 images.");
      return;
    }

    const promises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then((base64s) => {
      setImages(files);
      setBase64Images(base64s);
      setUploadDisabled(true);
    });
  };

  const handleDiagnose = async () => {
    setLoading(true);
    const payload = {
      appName: AGENT_APP_NAME,
      userId: AGENT_USER_ID,
      sessionId: AGENT_SESSION_ID,
      newMessage: {
        role: "user",
        parts: [
          {
            text: "Identify the disease for the crop - " + plant,
            images: base64Images,
          },
        ],
      },
    };

    try {
      const response = await axios.post(YIELD_API_URL, payload, {
        headers: { "Content-Type": "application/json" },
      });

      const summary = response.data.summary || "No summary found";
      setDiagnosis(summary);
    } catch (error) {
      console.error("Diagnosis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiagnoseResponse = async (userResponse) => {
    setLoading(true);
    setShowMap(userResponse === "Pesticide" || userResponse === "Fertilizer");

    if (userResponse === "Pesticide") {
      setSearchKeyword("Farming pesticide shops");
    } else if (userResponse === "Fertilizer") {
      setSearchKeyword("Farming fertilizer shops");
    }

    const remedyKey = userResponse === "HomeRemedy" ? "Home Remedy" : userResponse;

    if (allRemedies) {
      const remedyContent = allRemedies[remedyKey];
      const remedyText = remedyContent
        ? `${remedyKey}: ${remedyContent}`
        : `No information found for ${remedyKey}.`;
      setRemedy(remedyText);
      setLoading(false);
      return;
    }

    const payload = {
      appName: AGENT_APP_NAME,
      userId: AGENT_USER_ID,
      sessionId: AGENT_SESSION_ID,
      newMessage: {
        role: "user",
        parts: [
          {
            text: "Give disease diagnosis for the mentioned disease.",
          },
        ],
      },
    };

    try {
      const response = await axios.post(YIELD_API_URL, payload, {
        headers: { "Content-Type": "application/json" },
      });

      const summary = response.data.summary;
      let remedyText;

      if (!summary) {
        remedyText = "No summary found";
      } else {
        // --- MODIFICATION START ---
        try {
          const parsedData = JSON.parse(summary);
          // Check if the parsed data has the 'diagnosis' object
          if (parsedData && parsedData.diagnosis && typeof parsedData.diagnosis === 'object') {
            const remedies = parsedData.diagnosis;
            setAllRemedies(remedies); // Store the full set of remedies

            const remedyContent = remedies[remedyKey];
            if (remedyContent) {
              remedyText = `${remedyKey}: ${remedyContent}`;
            } else {
              remedyText = `No information found for ${remedyKey}.`;
            }
          } else {
            // If the JSON doesn't have the expected structure, display the raw summary
            remedyText = summary;
          }
        } catch (e) {
          // If the summary is not a valid JSON string, display it as is
          remedyText = summary;
        }
        // --- MODIFICATION END ---
      }
      setRemedy(remedyText);
    } catch (error) {
      console.error("Diagnosis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAskModal = () => setAskModalOpen(true);
  const handleCloseAskModal = () => setAskModalOpen(false);

  return (
    <>
      <GoogleTranslate />
      <div className="container main-back">
        {loading && <Loader />}
        <BackWeather />
        <MainHeader />

        {/* Expand/collapse for Improve Yield */}
        <div style={{ backgroundColor: "darkblue", padding: "10px", color: "#fff", marginBottom: "10px", marginTop: "10px" }}>
          <h2 style={{ margin: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>IMPROVE YIELD</span>
            {!isYieldOpen && <button onClick={toggleYield} style={{ padding: '12px', fontSize: '20px' }}>+ Expand</button>}
          </h2>
        </div>

        {isYieldOpen && (
          <div className="glass-background" style={{ display: "flex", flexDirection: 'row', padding: '0', justifyContent: 'left', alignItems: '' }}>
            <img
              src={cropDiagnosisIcon}
              alt="Icon"
              style={{
                width: "200px",
                height: "100%",
                marginRight: "8px",
                borderTopLeftRadius: '10px',
                borderBottomLeftRadius: '10px',
                paddingRight: '20px',
                objectFit: 'contain'
              }}
            />
            <div style={{ marginTop: '5px', marginBottom: '5px' }}><h2>Disease Identification</h2>

              <div className="selector">
                <label>Choose a plant: </label>
                <select value={plant} onChange={(e) => setPlant(e.target.value)}>
                  <option>Potato</option>
                  <option>Tomato</option>
                  <option>Corn</option>
                </select>
              </div>

              <div className="image-upload">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  multiple
                  disabled={uploadDisabled}
                  onChange={handleImageUpload}
                />
                {uploadDisabled && (
                  <button
                    onClick={() => {
                      setImages([]);
                      setBase64Images([]);
                      setUploadDisabled(false);
                      setDiagnosis("");
                      setRemedy("");
                      setShowMap(false);
                      setAllRemedies(null);
                    }}
                  >
                    Reload the Images
                  </button>
                )}
              </div>

              {images.length === 3 && (
                <div className="image-preview">
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(img)}
                      alt={`Image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

              {uploadDisabled && (
                <button className="diagnose-button" onClick={handleDiagnose}>
                  Diagnose
                </button>
              )}

              {diagnosis && (
                <div className="diagnosis-box">
                  <h4>{diagnosis}</h4>
                  {diagnosis.toLowerCase().includes("would you like") && (
                    <div>
                      <button onClick={() => handleDiagnoseResponse("HomeRemedy")} className="select-button">Home Remedy</button>
                      <button onClick={() => handleDiagnoseResponse("Pesticide")} className="select-button">Pesticide</button>
                      <button onClick={() => handleDiagnoseResponse("Fertilizer")} className="select-button">Fertilizer</button>
                    </div>
                  )}
                  {remedy && <h4>{remedy}</h4>}
                  {showMap &&
                    (location ? (
                      <MapComponent location={location} searchKeyword={searchKeyword} />
                    ) : (
                      <p>{geoError || "Fetching location for map..."}</p>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expand/collapse for Grower Service */}
        <div style={{ backgroundColor: "darkblue", padding: "10px", color: "#fff", marginTop: "20px" }}>
          <h2 style={{ margin: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>GROWER SERVICE</span>
            {!isGrowerOpen && <button onClick={toggleGrower} style={{ padding: '12px', fontSize: '20px' }}>+ Expand</button>}
          </h2>
        </div>

        <div style={{ display: isGrowerOpen ? "block" : "none" }}>
          <GrowerService />
        </div>

        <div style={{ height: '120px' }}></div>

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
      </div>
      <Ask isOpen={isAskModalOpen} onClose={handleCloseAskModal} />
    </>
  );
};

export default Yield;
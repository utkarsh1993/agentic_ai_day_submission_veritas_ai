import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import GoogleTranslate from "../components/googleTranslate";
import Ask from "./ask";
import "../App.css";
import yieldIcon from "../assets/yield.png";
import farmerIcon from "../assets/farmer.png";
import transportIcon from "../assets/transport.png";
import govtIcon from "../assets/govtInfo.png";
import profitIcon from "../assets/profit.png";
import earlyWarningIcon from "../assets/earlyWarning.png";
import MainHeader from "../components/mainHeader";
import chatIcon from "../assets/chatIcon.jpeg";
function Home() {
  const navigate = useNavigate();
  const [isAskModalOpen, setAskModalOpen] = useState(false);

  const handleOpenAskModal = () => setAskModalOpen(true);
  const handleCloseAskModal = () => setAskModalOpen(false);
  return (
    <>
      <div className="container main-back">
        <Navbar />

        <div>
          <MainHeader />

          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className="button-grid">
              <button onClick={() => navigate("/yield")}><div className="buttonDiv"><img
                src={yieldIcon}
                alt="Yield Icon"
                style={{
                  width: "50px",
                  height: "50px",
                  marginRight: "8px",
                }}
              />Improve yield</div></button>
              <button onClick={() => navigate("/profit")}>
                <div className="buttonDiv"><img
                  src={profitIcon}
                  alt="Profit Icon"
                  style={{
                    width: "50px",
                    height: "50px",
                    marginRight: "8px",
                  }}
                />Improve profitability</div></button>
              <button onClick={() => navigate("/earlyWarning")}>
                <div className="buttonDiv"><img
                  src={earlyWarningIcon}
                  alt="Early Warning Icon"
                  style={{
                    width: "50px",
                    height: "50px",
                    marginRight: "8px",
                  }}
                />Early Warning</div>
              </button>
              <button onClick={() => { alert("Feature in development.") }} style={{ backgroundColor: "#c3c3c3" }}>
                <div className="buttonDiv"><img
                  src={transportIcon}
                  alt="Transport Icon"
                  style={{
                    width: "50px",
                    height: "50px",
                    marginRight: "8px",
                  }}
                />Transport & Storage</div>
              </button>
              <button onClick={() => { alert("Feature in development.") }} style={{ backgroundColor: "#c3c3c3" }}>
                <div className="buttonDiv"><img
                  src={farmerIcon}
                  alt="Farmer Icon"
                  style={{
                    width: "50px",
                    height: "50px",
                    marginRight: "8px",
                  }}
                />Farmer Community</div>
              </button>
              <button onClick={() => navigate("/govtInfo")}>
                <div className="buttonDiv"><img
                  src={govtIcon}
                  alt="Govt Icon"
                  style={{
                    width: "50px",
                    height: "50px",
                    marginRight: "8px",
                  }}
                />Government Information</div>
              </button>
            </div>
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
      </div>

      <GoogleTranslate />
    </>
  );
}

export default Home;

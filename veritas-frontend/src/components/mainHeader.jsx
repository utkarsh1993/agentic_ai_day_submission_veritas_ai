import React from "react";
import WeatherInfo from "../components/weatherInfo";
import { useNavigate } from "react-router-dom";
import headerIcon from "../assets/headerIcon.png";

const MainHeader = () => {
    const navigate = useNavigate();
    return (
        <>
            <div style={
                {
                    display: "flex", flexDirection: "row", backgroundColor: "#f5f4ef", justifyContent: 'center', alignItems: 'center'
                }
            }><img
                    src={headerIcon}
                    alt="Header Icon"
                    style={{
                        width: "30%",
                        height: "100%",
                        marginRight: "8px",
                    }}
                /><header>
                    <h1>
                        Cultivating India's Future with Agentic AI - Powered by Veritas AI
                    </h1>
                </header></div>
        </>
    );
};

export default MainHeader;

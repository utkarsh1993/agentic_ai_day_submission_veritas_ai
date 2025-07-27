import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import useGeolocation from "../hooks/useGeolocation";
import GoogleTranslate from "../components/googleTranslate";
import axios from "axios";
import {
  ASK_API_URL,
  AGENT_APP_NAME,
  AGENT_USER_ID,
  AGENT_SESSION_ID,
} from "../config";
import Loader from "../components/loader";
import "../style/ask.css";

const Ask = ({ isOpen, onClose }) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const { location } = useGeolocation();
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const conversationEndRef = useRef(null);
  const [voices, setVoices] = useState([]);
  const [speakingIndex, setSpeakingIndex] = useState(null); // New state

  useEffect(() => {
    const getVoices = () => {
      if ("speechSynthesis" in window) {
        setVoices(window.speechSynthesis.getVoices());
      }
    };

    if ("speechSynthesis" in window) {
      getVoices();
      window.speechSynthesis.onvoiceschanged = getVoices;
    }

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          role: "bot",
          content: "Hello, I am your Veritas Buddy! How can I help you today?",
        },
      ]);
    } else {
      SpeechRecognition.stopListening();
      resetTranscript();
      setInputValue("");
      setMessages([]);
      setIsLoading(false);
    }
  }, [isOpen, resetTranscript]);

  useEffect(() => {
    setInputValue(transcript);
  }, [transcript]);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSpeak = (text, index) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const lang = document.documentElement.lang || "en-US";
      utterance.lang = lang;

      let voice = voices.find((v) => v.lang === lang);
      if (!voice) {
        const langPart = lang.split("-")[0];
        voice = voices.find((v) => v.lang.startsWith(langPart));
      }

      if (voice) {
        utterance.voice = voice;
      }

      setSpeakingIndex(index);

      utterance.onend = () => {
        setSpeakingIndex(null);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, your browser does not support text-to-speech.");
    }
  };

  const handleStopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
    }
  };

  const handleSendMessage = async () => {
    const userMessage = inputValue.trim();
    if (!userMessage || isLoading) return;

    if (listening) stopListening();

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInputValue("");
    resetTranscript();
    setIsLoading(true);

    let messageText = userMessage;
    if (location?.latitude && location?.longitude) {
      messageText = `${userMessage}. My location is latitude: ${location.latitude} and longitude: ${location.longitude}. Askmeanything`;
    }

    const payload = {
      appName: AGENT_APP_NAME,
      userId: AGENT_USER_ID,
      sessionId: AGENT_SESSION_ID,
      newMessage: {
        role: "user",
        parts: [{ text: messageText }],
      },
    };

    try {
      const response = await axios.post(ASK_API_URL, payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log(response);
      const botMessage =
        response.data.answer || "Sorry, I couldn't get a response.";
      setMessages((prev) => [...prev, { role: "bot", content: botMessage }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Sorry, something went wrong." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    SpeechRecognition.stopListening();
    resetTranscript();
    setInputValue("");
    setMessages([
      {
        role: "bot",
        content: "Hello, I am Veritas Buddy! How can I help you today?",
      },
    ]);
    setIsLoading(false);
    setSpeakingIndex(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startListening = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => console.log("Mic permission granted"))
      .catch((err) => console.error("Mic access denied:", err));

    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  return (
    <>
      <GoogleTranslate />
      <div className="ask-modal-overlay" onClick={onClose}>
        <div className="ask-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="ask-modal-close" onClick={onClose}>
            &times;
          </button>
          <h2 className="ask-header">Ask Me Anything</h2>

          <div className="ask-conversation-area">
            {messages.map((msg, index) => (
              <div key={index} className={`ask-message-wrapper ${msg.role}`}>
                <div className={`ask-message ${msg.role}`}>
                  {msg.content}
                  {msg.role === "bot" && (
                    <button
                      className="speaker-button"
                      onClick={() =>
                        speakingIndex === index
                          ? handleStopSpeaking()
                          : handleSpeak(msg.content, index)
                      }
                      title={
                        speakingIndex === index
                          ? "Stop speaking"
                          : "Read aloud"
                      }
                    >
                      {speakingIndex === index ? "⏹️" : "🔊"}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="ask-message-wrapper bot">
                <Loader />
              </div>
            )}
            <div ref={conversationEndRef} />
          </div>

          <div className="ask-input-area">
            <textarea
              className="ask-text-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyUp={handleKeyPress}
              placeholder={listening ? "Listening..." : "Type your message..."}
              rows="2"
              disabled={isLoading}
            />
            <div className="ask-buttons">
              {browserSupportsSpeechRecognition && (
                <>
                  <button
                    onClick={startListening}
                    disabled={listening || isLoading}
                    title="Start Listening"
                  >
                    🎙️
                  </button>
                  <button
                    onClick={stopListening}
                    disabled={!listening || isLoading}
                    title="Stop Listening"
                  >
                    ⏹️
                  </button>
                </>
              )}
              <button
                onClick={handleReset}
                disabled={isLoading}
                title="Reset Chat"
              >
                🔄
              </button>
              <button
                className="send-button"
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
              >
                Send
              </button>
            </div>
          </div>
          {!browserSupportsSpeechRecognition && (
            <p className="ask-warning">
              Your browser does not support speech recognition.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Ask;

# In Cultivating India's Future with Agentic AI
### 🔍 Project Kisan — Powered by Veritas AI

> Empowering India's farmers with an intelligent, voice-first, AI-powered assistant.

---

## 🌾 Problem Statement: Help Rohan, Help Millions

Rohan, a young farmer in rural Karnataka, inspects his tomato crop and notices yellow spots on the leaves.  
Is it a pest? A fungus? A fertilizer issue?

He also wonders **when to sell** — but mandi prices swing wildly.  
He has a smartphone, but expert help is scattered, complex, and not in Kannada.

He doesn’t need more data.  
> ❗ He needs **an expert in his pocket** who speaks **his language**, understands **his soil**, and helps him **act quickly**.

---

## 🎯 Objective

Build **Project Kisan** — an intelligent, multilingual, agent-powered assistant that helps small-scale farmers:

- 🌿 Diagnose crop diseases with a photo  
- 📈 Monitor real-time mandi prices  
- 🏛️ Navigate government schemes in local languages  
- 🗣️ Interact entirely through voice in native dialects

---

## 🌟 Key Features and Agents

Our solution uses **specialized agents**, each solving a core farming problem:

### 🧫 Disease Detector Agent
Analyzes crop leaf images to detect visible signs of plant diseases using AI pathology. Given up to 3 images and the crop name, it identifies common diseases, confirms healthy leaves, or flags unclear cases — helping farmers take timely, targeted action.

### 🌿 Disease Diagnosis Agent
Provides practical remedies for crop diseases specific to Indian conditions. Given a disease name, it suggests effective home treatments, fertilizers, and pesticides commonly available in India. Helps farmers act quickly with locally accessible solutions.

### 🧪 Soil Analysis Agent
This agent pinpoints a farmer's exact location using latitude and longitude, identifies the nearby region, district, and state, and detects the soil type in that area. It then generates a detailed soil health card and explains the report in simple, farmer-friendly language. The goal is to help farmers understand their soil’s condition and make better crop and fertilizer decisions.

### 🧮 Fertilizer Recommender
This agent provides precise, location-based fertilizer advice by analyzing GPS coordinates, local weather, and soil health. It generates tailored recommendations on fertilizer type, dosage, timing, and method based on crop needs and nutrient deficiencies. It also suggests nearby suppliers and pricing to help farmers make informed, cost-effective decisions.

### 🌱 Crop Recommendation Agent
Suggests the most suitable crop to sow or harvest based on soil health, weather patterns, and market trends for a given location and month. Designed to maximize farmer profits while factoring in subsidies, MSP, and ease of selling, the recommendations are practical, seasonal, and easy for Indian farmers to follow.

### 📈 Commodity Profitability Agent
This agent predicts commodity prices and guides farmers on whether to sell or store produce. Using location and commodity input, it fetches current mandi rates, forecasts future prices, checks local storage options, and recommends the most profitable strategy based on market trends and regional conditions.

### ⚠️ Early Warning System
Forecasts and delivers up to 3 critical daily weather alerts for Indian farmers based on location-specific data. It prioritizes severe events like storms, floods, or hail to help farmers make timely decisions for the next 3 days.

### 🌦️ Weather Risk Agents
- 📢 **Local Alerts Agent:** Delivers real-time location-based warnings on protests, bandhs, pest outbreaks, and disruptions to help Indian farmers stay prepared.
- 🌦️ **Seasonal Weather Risk Agent:** Provides 10-day advance alerts on extreme weather events like hailstorms, floods, and heatwaves to help Indian farmers prepare proactively.
- 📅 **Seasonal Forecast Agent:** Delivers long-term weather and irrigation predictions with trend-based insights to support strategic farming decisions across seasons in India.

### 🧑‍🏫 Ask-Me-Anything (AMA) Agent
🤖 Veritas Buddy: A multilingual agricultural assistant that answers farm-related questions with localized insights—covering crops, soil, pests, irrigation, weather, and government schemes.

### 🏛️ Government Scheme Analyzer
📜 Simplifies central and state agricultural schemes in plain English for Indian farmers—covering eligibility, benefits, application steps, deadlines, and local support.

---

## 🏗️ Architecture

Our system consists of a **React frontend** and a **Python backend**. The user interacts with the frontend, which sends API requests to the FastAPI backend. The backend's router then directs the query to the appropriate specialized agent for processing.

### 📁 Folder Structure

```text
agentic_ai_day/
├── agent_backend/           # All backend Python files and logic
│   ├── agent.py
│   ├── __main__.py
│   ├── task_manager.py
│   ├── agents/
│   │   ├── ... (all agent subfolders)
│   └── requirements.txt
│
├── veritas-ai-frontend/                # User Interface (Vite + React)
│   ├── public/
│   ├── src/
│   │   ├── ... (all component and source files)
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md                # This documentation file
````

---

## 🔧 Technology Stack

| Component                   | Purpose                                           |
| :-------------------------- | :------------------------------------------------ |
| **Vertex AI (Gemini)**      | Multimodal LLMs, image/text understanding         |
| **Vertex AI Agent Builder** | Orchestration of conversational agents            |
| **React + Vite**            | Frontend user interface and interaction           |
| **Speech-to-Text APIs**     | Voice-first interaction                           |
| **Python + FastAPI**        | Backend server, core execution, and routing logic |
| **Google Cloud Platform**   | Deployment, API access, compute                   |
| **LangChain (optional)**    | Agent memory, planning, tool use (optional layer) |

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/utkarsh1993/agentic_ai_day.git
cd agentic_ai_day
```

### 2. Setup the Backend

Navigate into the `agent_backend` directory and install the required Python packages.

```bash
cd agent_backend
pip install -r requirements.txt
```

### 3. Setup the Frontend

Open a **new terminal**, then install the frontend dependencies.

```bash
cd frontend
npm install
```

### 4. Run the Application

Run both the backend and frontend servers in separate terminals.

* **Backend (inside `agent_backend`)**:

```bash
python __main__.py
```

* **Frontend (inside `frontend`)**:

```bash
npm run dev
```

The app will run at `http://localhost:5173` and interact with your local API server.

---

## 🧪 Example Use Cases

| 💬 User Query                                 | 🤖 Routed Agent               |
| :-------------------------------------------- | :---------------------------- |
| "Why are my tomato leaves turning yellow?"    | Disease Detector              |
| "What should I grow in this soil?"            | Crop Recommendation Agent     |
| "Fertilizer for sugarcane in red soil?"       | Fertilizer Recommender        |
| "What is the price of onions in Hubli today?" | Commodity Profitability Agent |
| "Will it rain this weekend?"                  | Weather Risk Agent            |
| "Any subsidy for drip irrigation?"            | Government Scheme Analyzer    |
| "Tell me what’s happening in my taluk"        | Local Alerts Agent            |

---

## 🤝 Contributing

If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request. We welcome community contributions to make this project better for everyone.

---

## 📄 License

This project is licensed under the [MIT License](https://www.google.com/search?q=LICENSE).
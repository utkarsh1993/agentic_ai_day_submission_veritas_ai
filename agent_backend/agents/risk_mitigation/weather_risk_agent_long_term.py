from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from agents.common import weather_parameters
from google.adk.tools import google_search

import vertexai
import os

os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "TRUE"
os.environ["GOOGLE_CLOUD_PROJECT"] = "shikhafileconnect"
os.environ["GOOGLE_CLOUD_LOCATION"] = "us-central1"
os.environ["GEMINI_API_KEY"] = ""
os.environ["GOOGLE_API_KEY"] = ""


vertexai.init(project='shikhafileconnect', location='us-central1') 


safety_settings = [
    types.SafetySetting(
        category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold=types.HarmBlockThreshold.OFF,
    ),
]

generate_content_config = types.GenerateContentConfig(
   safety_settings=safety_settings,
   temperature=0.2
)

seasonal_weather_forecast_agent = Agent(name="weather_forecast_agent",
    model="gemini-2.5-flash",
    description="Seasonal weather forecast agent for farmers based on their location",
    generate_content_config=generate_content_config,
    instruction="""**Role:** Seasonal weather forecast Agent

"task": "Generate seasonal weather and irrigation forecasts for farming decisions. Describe the reason and historical trend analysis which is done to reach the conclusion.",
  "input": {
    "latitude": 12.9716,
    "longitude": 77.5946
  },
  "output_format": "JSON",
  "requirements": [
    "heat_wave_months",
    "cold_wave_months",
    "riverine_flood_risk_months",
    "monsoon_date_range",
    "canal_water_release_schedule"
  ],
  "output_description": "Predict agricultural alerts and support planning across seasons. Describe the reason and historical trend analysis which is done to reach the conclusion. "
}

Provide the output in below format:

{
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "region": "South India"
  },
  "seasonal_warnings": {
    "heat_wave_months": "April,May <Provide historical trend and reason behind this>",
    "cold_wave_months": "December <Provide historical trend and reason behind this>",
    "riverine_flood_risk_months": "August, September <Provide historical trend and reason behind this>"
  },
  "monsoon_forecast": {
    "start_date": "June <Provide historical trend and reason behind this>" ,
    "end_date": "September <Provide historical trend and reason behind this>",
    "confidence": "High  <Provide historical trend and reason behind this>
  },
  "canal_water_release_schedule": [
    {
      "season": "Kharif",
      "release_window": "June to July <Provide historical trend and reason behind this>"
    },
    {
      "season": "Rabi",
      "release_window": "December <Provide historical trend and reason behind this>"
    }
  ],
  "last_updated": "2025-07-27" as per which government body
}
  "required": ["location", "forecast_window_time_period", "information"]
}

** IMPORTANT: DO not deviate from above format at any cost.

!!! IMPORTANT: Make sure to NOT provide references/citations links in results, only provide text in English as final output. ENSURE THIS AT ANY COST

!!! Important: Ignore `<,>` in values, these are place holders to fill the values
""", tools=[google_search]
)

session_service = InMemorySessionService()
runner = Runner(
    agent=seasonal_weather_forecast_agent,
    app_name="seasonal_weather_forecast_app",
    session_service=session_service
)

USER_ID = "user_host"
SESSION_ID = "session_host"

async def execute(request):
    # Ensure session exists
    await session_service.create_session(
        app_name="seasonal_weather_forecast_app",
        user_id=USER_ID,
        session_id=SESSION_ID
    )

    new_message_part = request["newMessage"]["parts"][0]
    
    if "text" in new_message_part and new_message_part["text"]:

        parts = []
        parts.append(types.Part(text=new_message_part["text"]))

        message = types.Content(role="user", parts=parts)

        async for event in runner.run_async(user_id=USER_ID, session_id=SESSION_ID, new_message=message):
            if event.is_final_response():
                seasonal_weather_forecast = event.content.parts[0].text
                print(seasonal_weather_forecast)
        return {"seasonal_weather_forecast": seasonal_weather_forecast.replace("json",'').replace("`","")}
    else:
        return {"seasonal_weather_forecast": "Please provide correct location for weather alerts."}

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

weather_forecast_agent = Agent(name="weather_forecast_agent",
    model="gemini-2.5-flash",
    description="weather forecast agent for farmers based on their location",
    generate_content_config=generate_content_config,
    instruction="""**Role:** weather forecast Agent

Generate early warnings for severe weather and environmental conditions over the next 10 days for a given Indian farmer's location. You will be provided with the latitude and longitude of the location in format 'My latitude is <value> and longitude is <value>'


Identify the location using coordinates and include alerts for the following categories:
- Hailstorm
- Heavy Rain
- Flood (localized and riverine)
- Wildfire risk
- Lightning within 40 km
- Temperature spike/dip
- Heatwave
- Cold wave
Each warning should contain:
- Type of alert
- Description
- Severity level
- Forecast date range
- Confidence score
- Recommended action
The output must be returned in JSON format, including all detected warnings. Do not omit any relevant alerts. Take dates according to indian time zone.

Provide the output in below format:

{
  "description": "Schema for agent's output of early warnings for severe weather conditions",
  "properties": {
    "location": {
      "type": "object",
      "properties": {
        "latitude": {
          "type": "number"
        },
        "longitude": {
          "type": "number"
        }
      },
      "required": ["latitude", "longitude"]
    },
    "forecast_window_days": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10
    },
    "alerts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "description": "Type of weather or environmental alert"
          },
          "description": {
            "type": "string",
            "description": "Brief explanation of the alert"
          },
          "severity_level": {
            "type": "string",
            "enum": ["Low", "Moderate", "High", "Severe"],
            "description": "Alert severity rating"
          },
          "forecast_date_range": {
            "type": "object",
            "properties": {
              "start_date": {
                "type": "string",
                "format": "date"
              },
              "end_date": {
                "type": "string",
                "format": "date"
              }
            },
            "required": ["start_date", "end_date"]
          },
          "confidence_score": {
            "type": "number",
            "minimum": 0,
            "maximum": 1,
            "description": "Confidence level of forecast between 0 and 1"
          },
          "recommended_action": {
            "type": "string",
            "description": "Suggested mitigation or precaution"
          }
        },
        "required": ["type", "description", "severity_level", "forecast_date_range", "confidence_score", "recommended_action"]
      }
    }
  },
  "required": ["location", "forecast_window_days", "alerts"]
}

** IMPORTANT: DO not deviate from above format at any cost.

!!! IMPORTANT: Make sure to not provide references/citations links in results, only provide text in English as final output. ENSURE THIS AT ANY COST
""", tools=[google_search]
)

session_service = InMemorySessionService()
runner = Runner(
    agent=weather_forecast_agent,
    app_name="weather_forecast_app",
    session_service=session_service
)

USER_ID = "user_host"
SESSION_ID = "session_host"

async def execute(request):
    # Ensure session exists
    await session_service.create_session(
        app_name="weather_forecast_app",
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
                weather_forecast = event.content.parts[0].text
                print(weather_forecast)
        return {"weather_forecast": weather_forecast.replace("json",'').replace("`","")}
    else:
        return {"weather_forecast": "Please provide correct location for weather alerts."}
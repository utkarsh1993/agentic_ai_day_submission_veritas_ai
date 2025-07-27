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

local_alerts_agent = Agent(name="local_alerts_agent",
    model="gemini-2.5-flash",
    description="Local alerts agent such as spread of pest, protest, bandhs, riots etc. for farmers based on their location",
    generate_content_config=generate_content_config,
    instruction="""**Role:** local alerts agent

Generate early warnings: Local alerts such as spread of pest, protest, bandhs, riots etc. for farmers based on their location. You will be provided with the latitude and longitude of the location in format 'My latitude is <value> and longitude is <value>'


Local Event Alerts:
- Scheduled or spontaneous protests, riots, or bandhs
- Road blockages, supply chain disruptions, or access restrictions
- Community-based alerts affecting safety or logistics
For each alert, include:
- Type of alert
- Description
- Severity level (Low, Moderate, High, Critical)
- Forecast or expected date range
- Confidence score (0 to 1)
- Recommended action for farmers
Output Requirement:
Your response must be in valid JSON format, structured for automated downstream processing. Include all relevant warnings—none should be omitted.

Provide the output in below format:

{
  "location": {
    "latitude": 15.3173,
    "longitude": 75.7139
  },
  "forecast_window_days": 10,
  "alerts": [
    {
      "type": "Pest Outbreak",
      "description": "Rapid spread of whitefly infestation detected in nearby cotton fields.",
      "severity_level": "High",
      "forecast_date_range": {
        "start_date": "2025-07-27",
        "end_date": "2025-08-02"
      },
      "confidence_score": 0.88,
      "recommended_action": "Monitor crops daily and apply recommended pesticide. Consult local extension officer."
    },
    {
      "type": "Bandh",
      "description": "District-wide bandh planned by local farmer unions on July 29, may affect market access and transport.",
      "severity_level": "Moderate",
      "forecast_date_range": {
        "start_date": "2025-07-29",
        "end_date": "2025-07-29"
      },
      "confidence_score": 0.9,
      "recommended_action": "Reschedule produce transport to avoid delays. Stay updated via local news."
    }
    }
  ]
}

** IMPORTANT: DO not deviate from above format at any cost.

!!! IMPORTANT: Make sure to not provide references/citations links in results, only provide text in English as final output. Reomve theENSURE THIS AT ANY COST
""",
    tools=[google_search]
)

session_service = InMemorySessionService()
runner = Runner(
    agent=local_alerts_agent,
    app_name="local_alerts_app",
    session_service=session_service
)

USER_ID = "user_host"
SESSION_ID = "session_host"

async def execute(request):
    # Ensure session exists
    await session_service.create_session(
        app_name="local_alerts_app",
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
                local_alerts = event.content.parts[0].text
                print(local_alerts)
        return {"local_alerts": local_alerts.replace("json",'').replace("`","")}
    else:
        return {"local_alerts": "Please provide correct location for local news and alerts."}
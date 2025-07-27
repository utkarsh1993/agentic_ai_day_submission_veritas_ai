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

soil_analyzer_agent = Agent(
    name="soil_analyzer",
    model="gemini-2.5-flash",
    description="Soli analysis for farmers using location",
    generate_content_config=generate_content_config,
    instruction="""**Role:** Soil Analyzer agent

You will receive latitude and longitude as input in following format:

My location is latitude: `latitude value` and longitude: `longitude value`

Extract the values of latitude, longitude and perform following task.

**Task**

Based on the give latitude and longitude, first pinpoint the exact location with name of district, mandal and then perform below tasks:

Location Output : Near by region name, district, state, India (all information in one line)

    - Detect the types of soil present in that location

    - Considering the type of soil and surrounding area, generate a detailed soil health card in form of table for farmers.

    - Explain report card sin simple words so that an Indian farmer can understand the details

** Output **

Provide the results in JSON format as shown below with keys:

{
"location_output": <value>,
"soil_Health_card": {
"soil_type_detected": <value and soil details>,
"soil_health_card_table": [{"parameter":<value>, "value_range":<value>, "rating":<value>, "remarks_for_farmer":<value in 5 to 7 words>}]
},
"key_grower_services": <values> based on soil health card, generate top 5 recommendations.
"government_schemes": <values> Top 5 recommended government schemes based on key grower services.
""
}

** IMPORTANT: DO not deviate from above format at any cost.

** General Instructions **

- No need to generate citations/references separately. Return only text results. Return results in English

- Do not provide any additional explanation or text beyond the specified output. 

- !!! IMPORTANT: Ensure to not provide references/citations links in results, only provide text as final output.  ENSURE THIS AT ANY COST

- Do no generate the output in bold or heading format.

""",
tools = [ google_search]
)

# **Instructions for the Agent:**


session_service = InMemorySessionService()
runner = Runner(
    agent=soil_analyzer_agent,
    app_name="soil_analyzer_app",
    session_service=session_service
)

USER_ID = "user_host"
SESSION_ID = "session_host"

async def execute(request):
    # Ensure session exists
    await session_service.create_session(
        app_name="soil_analyzer_app",
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
                soil_alert = event.content.parts[0].text
                print(soil_alert)
        return {"soil_alert": soil_alert.replace("json",'').replace("`","")}
    else:
        return {"soil_alert": "Please provide correct location for soil analysis."}
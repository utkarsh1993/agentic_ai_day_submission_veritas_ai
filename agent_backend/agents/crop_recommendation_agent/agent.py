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
   temperature=0.1
)

crop_recommendation_agent = Agent(
    name="crop_recommendation_agent",
    model="gemini-2.5-flash",
    description="Crop recommendation for farmers.",
    generate_content_config=generate_content_config,
    instruction="""**Role:** Crop Recommender agent

You will receive latitude, longitude as input in following format:

My location is latitude: `latitude value` and longitude: `longitude value` in month `month value`

If month details are not provided, Use current month as default.

Using this information, find out the following values:

1) soil type and soil health in the region.
2) Prevailing weather conditions in the Month provided
3) Market trend and prices for the Month provided for various crops

Do not show above information in output. Using this information following task for Indian farmer

**Task**

Based on the above extracted information:

Recommend the type of crop which indian farmer can sow/harvest to maximize their profits and easy to sell in the market. 

Consider the factors but not limited to government subsidy, MSP, weather condition, soil type etc. The recommendation should be easy for farmer to understand andlogical in nature.

** Output **

Only provide crop recommendation in output.

Provide the results in JSON format as show below:
{
 {"General Considerations for all Farmers": <value> },
 {"Crop Recommendation": 
 {"For Large Scale Farmers": <value> Generate 3 bullet points, 
 "For Small-Scale Farmers: <value>" Generate 3 bullet points}
 }
 }

** IMPORTANT: DO not deviate from above format at any cost.
 
** General Instructions **

- It should cover response farmers with large land availability and small scale farmers as well

- No need to generate citations/references separately. Return only text results. Return results in English

- Do not provide any additional explanation or text beyond the specified output. 

- !!! Do not provide references/citations links in results, only provide text as final output.  ENSURE THIS AT ANY COST

- Do no generate the output in bold or heading format.

""",
tools = [ google_search]
)

# **Instructions for the Agent:**


session_service = InMemorySessionService()
runner = Runner(
    agent=crop_recommendation_agent,
    app_name="crop_recommendation_app",
    session_service=session_service
)

USER_ID = "user_host"
SESSION_ID = "session_host"

async def execute(request):
    # Ensure session exists
    await session_service.create_session(
        app_name="crop_recommendation_app",
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
                crop_alert = event.content.parts[0].text
                print(crop_alert)
        return {"crop_alert": crop_alert.replace("json",'').replace("`","")}
    else:
        return {"crop_alert": "Please provide correct location for crop recommendation."}
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
async def execute(request):
    
    safety_settings = [
    types.SafetySetting(
        category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold=types.HarmBlockThreshold.OFF
    ),
]

    generate_content_config = types.GenerateContentConfig(
       safety_settings=safety_settings,
       temperature=0.2
    )

    weather_alert_agent = Agent(
        name="weather_alert_agent",
        model="gemini-2.5-pro",
        description="Weather alert agent for Farmers",
        generate_content_config=generate_content_config,
        instruction="""**Role:** Weather Prediction Agent

    **Input for tool**

    You will receive latitude and longitude as input and pass it to the tool to get the weather parameter values. 

    My location is latitude: `latitude value` and longitude: `longitude value`

    **Objective:**
    Predict and generate severe weather alerts in India for farmers only based on the results of tool. The agent must adhere to a strict limit of a maximum of 3 alerts for each day. It should forecast for next 3 days keeping in mind that it's going to be used by farmers.

    **Capabilities:**
    - Analyze input weather data
    - Identify patterns and conditions that indicate a high probability of severe weather events such as thunderstorms, tornadoes, hurricanes, blizzards, rainfall, high wind speed, hailstorms, snowfall, floods etc.
    - Generate a concise and clear weather alert for each predicted severe event.
    - Prioritize the most critical weather events if more than five potential alerts are identified in a single day.

    **Constraints:**
    - **Maximum of 3 alerts per day.** This is a critical constraint. If multiple severe weather events are possible, the agent must select the 3 most severe or impactful events for farmers to report.
    - Alerts should be fact-based and derived directly from the tool.
    - The tone of the alerts should be informative and urgent, without being alarmist.

    **Output Format:**
    The agent should generate a list of alerts within json, with each alert being a string. The list should contain a maximum of 3 strings for each date as per Indian Standard Time.

    Example output:
    {
      "27-07-2025": [
        "alert 1",
        "alert 2",
        "alert 3" 
      ],
      
      "28-07-2025": [
        "alert 1",
        "alert 2",
        "alert 3" 
      ],
      
      "29-07-2025": [
        "alert 1",
        "alert 2",
        "alert 3" 
      ],
    }

    !!!VERY IMPORTANT: ENSURE TO LINK THE ALERTS TO FARMING

    Do not provide any additional explanation or text beyond the specified output. 
    
    !!! Do not provide references/citations links in results, only provide text.  ENSURE THIS AT ANY COST.

    **Instructions for the Agent:**
    1.  Analyze the data to identify all potential severe weather events.
    3.  If more than five potential events are identified, rank them by severity and select the five most severe. The severity should be calculate based on events which can impact farmers most.
    4.  Select the top five most severe events.
    5.  For each selected event, generate a clear and concise alert message.
    6.  If no severe weather is predicted or receive an error from tool, return "No alerts for today. Weather looks pleasant".
    7.  Output the alerts in the specified JSON format.

    """,
    tools = [ google_search]
    )


    session_service = InMemorySessionService()
    runner = Runner(
        agent=weather_alert_agent,
        app_name="weather_alert_app",
        session_service=session_service
    )

    USER_ID = "user_host"
    SESSION_ID = "session_host"

    # Ensure session exists
    await session_service.create_session(
        app_name="weather_alert_app",
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
                weather_alert = event.content.parts[0].text
                print(weather_alert)
        return {"weather_alert": weather_alert.replace("json",'').replace("`","")}
    else:
        return {"weather_alert": "Please provide correct location for weather alerts."}
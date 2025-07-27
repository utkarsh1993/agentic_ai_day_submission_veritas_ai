from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from google.adk.tools import google_search

import vertexai
import os

os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "TRUE"
os.environ["GOOGLE_CLOUD_PROJECT"] = "shikhafileconnect"
os.environ["GOOGLE_CLOUD_LOCATION"] = "us-central1"
os.environ["GEMINI_API_KEY"] = ""
os.environ["GOOGLE_API_KEY"] = ""

    
vertexai.init(project='shikhafileconnect', location='us-central1') 


ama_agent = Agent(
    name="AMA_agent",
    model="gemini-2.5-pro",
    description="An AMA (Ask Me Anything) agent for farmers, providing answers to agriculture-related questions.",
    instruction="""Role: Agricultural AMA Agent, named Veritas Buddy.

Objective:
To act as an "Ask Me Anything" (AMA) agent for farmers. Your purpose is to provide accurate, helpful, and summarized answers strictly related to agricultural topics.

Language Detection and Response:
- You MUST detect the language of the user's question.
- You MUST respond in the same language as the user's question.
- The initial greeting and all subsequent responses should be in the detected language.

Input:
You will receive the user's location (latitude and longitude) along with their question. The location will be provided in the format: "My location is latitude: [latitude] and longitude: [longitude]." Use this information to provide location-specific answers, especially for weather-related queries.

Scope of Expertise:
You can answer questions about:
- Crop management (planting, harvesting, etc.)
- Soil health and fertilizers
- Pest and disease control
- Irrigation techniques
- Government schemes for farmers
- Weather information relevant to farming

Response Style:
- Your replies MUST be short, crisp, and contain only the necessary information.
- Use proper spacing and formatting for readability. Do not use bold text.
- Keep answers summarized. Avoid long, detailed explanations unless specifically asked.
- Use bullet points for lists or steps.

Constraints:
- You MUST only answer questions within your scope of expertise.
- If a question is outside of this scope (e.g., sports, politics, general trivia), you MUST respond with: "This question is out of bounds. I can only answer questions related to farming." This response should also be in the user's language.

Example:
- User Input: "What is the best fertilizer for rice crops?"
- Your Output: "For rice, a balanced NPK fertilizer is recommended.
- Urea (for Nitrogen)
- DAP (for Phosphorus)
- MOP (for Potassium)
Apply in split doses based on soil test results."

- User Input: "What is the capital of France?"
- Your Output: "This question is out of bounds. I can only answer questions related to farming."
""",
tools = [ google_search]
)

session_service = InMemorySessionService()
runner = Runner(
    agent=ama_agent,
    app_name="ama_agent_app",
    session_service=session_service
)

USER_ID = "user_host"
SESSION_ID = "session_host"

async def execute(request):
    # Ensure session exists
    print(request)
    await session_service.create_session(
        app_name="ama_agent_app",
        user_id=USER_ID,
        session_id=SESSION_ID
    )

    new_message_part = request["newMessage"]["parts"][0]

    parts = []
    message_text = ""

    if "text" in new_message_part and new_message_part["text"]:
        message_text = new_message_part["text"]

    if "location" in new_message_part and new_message_part["location"]:
        lat = new_message_part["location"]["latitude"]
        lon = new_message_part["location"]["longitude"]
        location_text = f"My location is latitude: {lat} and longitude: {lon}."
        
        if message_text:
            message_text = f"{message_text}\n{location_text}"
        else:
            message_text = location_text

    if message_text:
        parts.append(types.Part(text=message_text))
        message = types.Content(role="user", parts=parts)

        async for event in runner.run_async(user_id=USER_ID, session_id=SESSION_ID, new_message=message):
            if event.is_final_response():
                ama_response = event.content.parts[0].text
              
        return {"answer": ama_response}
    else:
        return {"answer": "Please ask a question."}
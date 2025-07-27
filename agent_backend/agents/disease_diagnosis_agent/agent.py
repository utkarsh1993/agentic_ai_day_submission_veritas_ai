from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from google.adk.tools import google_search
import base64


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


disease_diagnosis_agent = Agent(
    name="disease_diagnosis_agent",
    model="gemini-2.5-flash",
    description="Plant disease diagnosis agent for India",
    generate_content_config=generate_content_config,
    instruction="""You are a specialized AI model trained as a plant pathologist. Your task is to provide home remedies or fertilizer or pesticides for a given plant disease, with a focus on solutions available in India.

**Input Format:**
 
**Instructions:**

1.  You will be given the name of a crop disease as input.
2.  Based on the user input, generate the following results:
      - HomeRemedy: Provide a home remedy for the disease, using ingredients commonly found in India if required.
      - Fertilizer: Recommend a suitable fertilizer available in the Indian market if required.
      - Pesticide :Suggest an effective pesticide available in the Indian market if required.
3.  If the disease name is not recognized, respond with "Unknown disease."

**Output Format:**
    
    For a recognized disease, Provide information all of the following for the disease and Result should be in JSON format as shown below.
    
    Sample Output:
    
        {
        "diagnosis": 
        {
        "Home Remedy": "A common and effective home remedy for mealybugs is rubbing alcohol, specifically isopropyl alcohol (70% or less)",
        "Fertilizer": "Urea",
        "Pesticide": "DDT"
        }
        }
        
    Make sure the final response is in JSON format and follows format of above sample output


** IMPORTANT: DO not deviate from above format at any cost.

** General Instructions **

- It should cover response farmers with large land availability and small scale farmers as well

- No need to generate citations/references separately. Return only text results. Return results in English

- Do not provide any additional explanation or text beyond the specified output. 

!!! IMPORTANT: Do not provide references/citations links in results, only provide text as final output. ENSURE THIS AT ANY COST

""",
tools = [google_search]
)


session_service = InMemorySessionService()
runner = Runner(
    agent=disease_diagnosis_agent,
    app_name="disease_diagnosis_app",
    session_service=session_service
)

USER_ID = "user_host"
SESSION_ID = "session_host"

async def execute(request):
    # Ensure session exists
    await session_service.create_session(
        app_name="disease_diagnosis_app",
        user_id=USER_ID,
        session_id=SESSION_ID
    )

    disease_name = request.get("text", "")
    
    if not disease_name:
        return {"summary": "Error: No disease name provided."}
        
    message = types.Content(role="user", parts=[types.Part(text=disease_name)])

    async for event in runner.run_async(user_id=USER_ID, session_id=SESSION_ID, new_message=message):
        if event.is_final_response():
            return {"summary": event.content.parts[0].text.replace("json", "").replace("`","")}
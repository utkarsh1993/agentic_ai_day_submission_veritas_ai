from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from google.adk.tools import google_search
import base64
from agents.disease_diagnosis_agent.agent import execute as execute_diagnosis


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


disease_detector_agent = Agent(
    name="disease_detector_agent",
    model="gemini-2.5-pro",
    description="Plant disease detector agent",
    generate_content_config=generate_content_config,
    instruction="""You are a specialized AI model trained as a plant pathologist. Your task is to identify the disease present on a plant leaf from an image.

**Instructions:**

1.  You will be given 3 images of a crop leaf along with the crop name.
2.  Analyze the image to identify visual symptoms of any diseases. This includes, but is not limited to, discoloration, spots, lesions, mold, or pests.
3.  If a disease is detected, provide the common name of the disease.
4.  If the leaf appears healthy, respond with "Healthy."
5.  If the image is unclear or you cannot determine the disease with high confidence, respond with "Unable to determine" and provide the reason why you are not able to identify the disease.

**Output Format:**

*   **For a diseased leaf:** `[Disease Name]` (e.g., "Powdery Mildew")
*   **For a healthy leaf:** `Healthy`
*   **If unable to determine:** `Unable to determine`

Do not provide any additional explanation or text beyond the specified output.""",

tools = [google_search]
)


session_service = InMemorySessionService()
runner = Runner(
    agent=disease_detector_agent,
    app_name="disease_detector_app",
    session_service=session_service
)

USER_ID = "user_host"
SESSION_ID = "session_host"

# In-memory store for session data
session_data = {}

async def execute(request):
    # Ensure session exists
    await session_service.create_session(
        app_name="disease_detector_app",
        user_id=USER_ID,
        session_id=SESSION_ID
    )

    new_message_part = request["newMessage"]["parts"][0]
    
    if "images" in new_message_part:
        base64_images = new_message_part["images"]
        parts = []
        if "text" in new_message_part and new_message_part["text"]:
            parts.append(types.Part(text=new_message_part["text"]))

        for b64_image in base64_images:
            image_data = base64.b64decode(b64_image)
            parts.append(
                types.Part(
                    inline_data=types.Blob(mime_type="image/png", data=image_data)
                )
            )
        message = types.Content(role="user", parts=parts)

        async for event in runner.run_async(user_id=USER_ID, session_id=SESSION_ID, new_message=message):
            if event.is_final_response():
                disease_name = event.content.parts[0].text
                if disease_name not in ["Healthy", "Unable to determine"]:
                    session_data[SESSION_ID] = disease_name
                    return {"summary": f"Disease detected: {disease_name}. Would you like recommendations for home remedy, fertilizer, and pesticides?"}
                else:
                    return {"summary": disease_name}
    elif "text" in new_message_part:
        disease_name = session_data.get(SESSION_ID)
        if disease_name:
            return await execute_diagnosis({"text": disease_name,"requirement":new_message_part["text"]})
        else:
            return {"summary": "No disease detected in the current session."}
    else:
        return {"summary": "Please provide an image for disease detection."}
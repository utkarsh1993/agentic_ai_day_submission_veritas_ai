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

govt_schemes_agent = Agent(name="govt_schemes_agent",
    model="gemini-2.5-flash",
    description="Provide detailed information about government scheme",
    generate_content_config=generate_content_config,
    instruction="""**Role:** Government schemes analyzer agent

You will be given name of Government Scheme, latitude and longitude of user location.

Identify the user location and provide a detailed analysis of scheme using google search tool.

** Important: Summarize the results in such a way that an India farmer can understand. Use very simple langugae.

Your results should cover below topics but not limited to:

- Eligibility Criteria
Each scheme has specific requirements—landholding size, income level, crop type, or region. For example, PM-KISAN is for small and marginal farmers with cultivable land.
- Benefits Offered
Whether it's financial aid (like ₹6,000/year under PM-KISAN), crop insurance (PMFBY), subsidized machinery (SMAM), or organic farming support (PKVY), knowing the exact benefit helps farmers plan better.
- Application Process
Many schemes now support online registration. Farmers should know how to complete e-KYC, link Aadhaar to bank accounts, and track application status. Platforms like myScheme simplify this.
- Deadlines & Installments
Some schemes disburse funds in phases. Missing a deadline or installment window can delay benefits.
- Local Support Channels
Farmers can visit Krishi Vigyan Kendras (KVKs), Rythu Seva Kendras, or district agriculture offices for help. Legal aid programs also exist to explain rights and resolve disputes.
- Common Pitfalls
- Inactive bank accounts or missing Aadhaar-bank linkage can block payments
- Misunderstanding scheme terms may lead to missed opportunities
- Not keeping records of applications or receipts


** Important: Also provide any similar schemes running by the state government of the user location.

Return the output in plain English in bullet points Without Making Text Bold.

** IMPORTANT: Do not deviate from above format at any cost.

** IMPORTANT: Do not deviate from above format at any cost.

!!! IMPORTANT: Make sure to not provide references/citations links in results, only provide text in English as final output.  ENSURE THIS AT ANY COST
""",
    tools=[google_search]
)

session_service = InMemorySessionService()
runner = Runner(
    agent=govt_schemes_agent,
    app_name="govt_schemes_agent_app",
    session_service=session_service
)

USER_ID = "user_host"
SESSION_ID = "session_host"

async def execute(request):
    # Ensure session exists
    await session_service.create_session(
        app_name="govt_schemes_agent_app",
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
                govt_scheme = event.content.parts[0].text
                print(govt_scheme)
        return {"govt_scheme": govt_scheme.replace("json",'').replace("`","")}
    else:
        return {"govt_scheme": "Please provide correct location for more detailed information."}

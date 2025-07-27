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

fertilizer_recommendation_agent = Agent(
    name="fertilizer_recommendation_agent",
    model="gemini-2.5-flash",
    description="Fertilizer recommendation agent for farmers based on soil analysis and crop recommendations",
    generate_content_config=generate_content_config,
    instruction="""**Role:** Fertilizer Recommendation Agent

You are an expert agricultural fertilizer consultant specializing in providing precise, science-based fertilizer recommendations and sourcing information for Indian farmers.

**Input Processing:**

1) identify the exact location based on latitude and longitude

2) Analyze the weather conditions for the running month and season for crops

3) Based on location analyze the type of soil present in the location and generate its health card

**Task:**

Based on the soil analysis results and crop recommendations for the current season, provide comprehensive fertilizer recommendations that address:
- Soil nutrient deficiencies identified in the soil health card
- Specific nutrient requirements for the recommended crops
- Application timing and methods suitable for Indian farming conditions
- Local supplier information and pricing

**Output Format:**

Provide results in JSON format as shown below:

```json
{
  "fertilizer_recommendations": {
    "primary_fertilizers": [
      {
        "fertilizer_name": "specific product name (e.g., DAP, Urea, NPK 19:19:19)",
        "application_rate_per_acre": "kg/acre or bags/acre",
        "application_timing": "pre-sowing/post-sowing/flowering stage",
        "application_method": "broadcast/side-dress/foliar spray",
        "estimated_cost_per_acre": "₹ amount",
        "benefits_for_recommended_crops": "how it helps the suggested crops"
      }
    ]
  },
  "local_suppliers": {
    "government_outlets": [
      {
        "outlet_type": "Primary Agricultural Credit Society (PACS)/Krishi Vigyan Kendra",
        "availability": "subsidized fertilizers available",
        "contact_info": "how to locate nearest center",
        "subsidy_benefits": "percentage of subsidy available"
      }
    ],
    "private_dealers": [
      {
        "dealer_type": "agricultural input dealers/cooperative societies",
        "product_availability": "brands and products typically available",
        "price_range": "market price range",
        "location_guidance": "how to find in the specified district"
      }
    ],
    "online_options": [
      {
        "platform": "e-commerce/agricultural portals",
        "delivery_feasibility": "rural delivery availability",
        "minimum_order": "bulk purchase requirements",
        "price_comparison": "online vs offline pricing"
      }
    ]
  },
  "monitoring_recommendations": {
    "soil_testing_frequency": "when to retest soil",
    "crop_response_indicators": "signs of successful fertilization",
    "adjustment_guidelines": "when and how to modify fertilizer program"
  }
}
```
** IMPORTANT: DO not deviate from above format at any cost.

**Key Requirements:**

1. **Integration Focus:** Directly address soil deficiencies identified in the soil health card
2. **Crop-Specific:** Tailor recommendations to the specific crops suggested by the crop recommendation agent
3. **Scale-Appropriate:** Provide different recommendations for large-scale vs small-scale farmers as identified in crop recommendations
4. **Location-Specific:** Consider the specific district/region mentioned in the location output
5. **Cost-Conscious:** Provide budget-friendly alternatives and government subsidy information
6. **Practical Application:** Include timing, methods, and safety considerations suitable for Indian farming practices

**General Instructions:**

- Provide only top 3 results for all of above
- Prioritize fertilizers that address the most critical soil deficiencies first
- Consider the specific crops recommended and their growth stages
- Include both organic and synthetic options where appropriate
- Provide realistic cost estimates in Indian Rupees (₹)
- Focus on locally available products and suppliers
- Consider seasonal timing and weather patterns
- Include government subsidy schemes and cooperative purchasing options
- Ensure recommendations are practical for the farmer's scale of operation
- No need to generate citations/references separately
- Return results in English
- Do not provide additional explanation beyond the specified JSON output
- Ensure all cost estimates and product recommendations are realistic for Indian agricultural markets

**Important:** Base all recommendations on the actual soil parameters and crop suggestions provided in the input data. Ensure fertilizer recommendations directly address the soil deficiencies identified and support the growth requirements of the recommended crops.

- Do not provide any additional explanation or text beyond the specified output. 

- !!! IMPORTANT: Make sure to not provide references/citations links in results, only provide text in English as final output.  ENSURE THIS AT ANY COST.



""",
    tools=[google_search]
)

session_service = InMemorySessionService()
runner = Runner(
    agent=fertilizer_recommendation_agent,
    app_name="fertilizer_recommendation_app",
    session_service=session_service
)

USER_ID = "user_host"
SESSION_ID = "session_host"

async def execute(request):
    # Ensure session exists
    await session_service.create_session(
        app_name="fertilizer_recommendation_app",
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
                fertilizer_alert = event.content.parts[0].text
                print(fertilizer_alert)
        return {"fertilizer_alert": fertilizer_alert.replace("json",'').replace("`","")}
    else:
        return {"fertilizer_alert": "Please provide correct location for fertilizer recommendation."}
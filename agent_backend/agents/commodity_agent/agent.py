from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.tools import google_search
from google.genai import types
import base64
# from datetime import datetime
# import calendar
# import pandas as pd
import json

import vertexai
import os

os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "TRUE"
os.environ["GOOGLE_CLOUD_PROJECT"] = "shikhafileconnect"
os.environ["GOOGLE_CLOUD_LOCATION"] = "us-central1"
os.environ["GEMINI_API_KEY"] = ""
os.environ["GOOGLE_API_KEY"] = ""

    
vertexai.init(project='shikhafileconnect', location='us-central1') 

storage_decision_agent = Agent(
    name="storage_decision_agent",
    model="gemini-2.5-pro",
    description="An agent that forecasts commodity prices, analyzes storage options, and recommends the optimal selling strategy.",
    instruction="""You are a forecasting assistant. You will receive latitude, longitude and comodity name as input and pass it to the tool to get the location and commodity name for the further analysis.

My location is latitude: `latitude value` and longitude: `longitude value` and commodity name `commodity_name`.
    

You can get the historical price data for commodity in in Rs/Qtl from by the tool. Tool can use the historical data for the provided `commodity` from 'agmarknet.ceda.ashoka.edu.in' if you can get that data.

Pass these values to the tool to get desired parameters.
---

### **Objective:**
1. Forecast the next 3 months of the time series data.
2. Fetch current market price and cold storage availability near the given coordinates with location name.
3. Analyze whether to store or sell the produce based on forecasted trends and **current market conditions at the specified location**.
4. Estimate potential profit for both options and recommend the optimal one.


Use ARIMA or another suitable time series model to forecast the price of `commodity_name` for the next 3 months: {', '.join(forecast_months)}.

---

**Output Format:**

Provide results in JSON format as shown below:
    ```json
    {
      "forecasted_prices": {
        "month_1": "XX Rs/Qtl",
        "month_2": "XX Rs/Qtl",
        "month_3": "XX Rs/Qtl"
      },
      "option_a_store": {
        "storage_location": ["Name1", "Name2", "Name3", "Name4", "Name5"],
        "estimated_future_revenue": "XX Rs/Qtl",
        "estimated_net_revenue": "XX Rs/Qtl"
      },
      "option_b_sell": {
        "current_market_price_at_nearest_market": "XX Rs/Qtl",
        "current_market_price_at_best_market": "XX Rs/Qtl",
        "best_market": {
          "market_name": "Best Market Name",
          "city": "City Name",
          "transportation_cost": "XX Rs/Qtl",
          "net_revenue": "XX Rs/Qtl"
        }
      },
      "recommendation": {
        "based_on": "forecasted prices and current market conditions",
        "location": location_name,
        "action": "store or sell"
      }
    }
    ```
    

** IMPORTANT: DO not deviate from above format at any cost.

- **Preserves your structure exactly**.
- **Includes both options** with detailed outputs.
- **Select the Best Market Name and City Name based on the current market price of `commodity_name` across the Indian market with the objective of maximize the Net Revenue Rs/Qtl by considering the transportation cost to the suggested market from the current location based on the latitude and longitude.   
- **Anchors the recommendation** to the current market near the coordinates.
- ** Do not provide any additional explanation or text beyond the specified output.

 
** General Instructions **

- It should cover response farmers with large land availability and small scale farmers as well

- No need to generate citations/references separately. Return only text results. Return results in English.

- Do not provide any additional explanation or text beyond the specified output. 

- !!! Do not provide references/citations links in results, only provide text as final output.  ENSURE THIS AT ANY COST

""",
    tools = [google_search]
)


session_service = InMemorySessionService()
runner = Runner(
    agent=storage_decision_agent,
    app_name="storage_decision_app",
    session_service=session_service
)

USER_ID = "user_host"
SESSION_ID = "session_host"

# In-memory store for session data
session_data = {}

async def execute(request):
    # Ensure session exists
    await session_service.create_session(
        app_name="storage_decision_app",
        user_id=USER_ID,
        session_id=SESSION_ID
    )
        
    new_message_part = request["newMessage"]["parts"][0]
    print(request)
    if "text" in new_message_part and new_message_part["text"]:
        
        parts = [types.Part(text=new_message_part["text"])]

        message = types.Content(role="user", parts=parts)

        async for event in runner.run_async(user_id=USER_ID, session_id=SESSION_ID, new_message=message):
            if event.is_final_response():
                agent_response = event.content.parts[0].text
                print(agent_response)
                try:
                    # Attempt to parse the agent's response as JSON
                    response_data = json.loads(agent_response.replace("json",'').replace("`",""))
                    return response_data
                except json.JSONDecodeError:
                    # If parsing fails, return a default error message
                    return {
                        "error": "Failed to parse agent response. Ensure the agent returns valid JSON."
                    }
        return {"error": "No final response from agent."}  # Handle no final response
    else:
        return {"error": "Please provide the necessary input for storage decision."}
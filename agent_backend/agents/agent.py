import json
import os
from agents.fertilizer_recommendation.agent import execute as execute_fertilizer_recommender
from agents.disease_detector.agent import execute as execute_disease_detector
from agents.soil_analysis_agent.agent import execute as execute_soil_analysis
from agents.crop_recommendation_agent.agent import execute as execute_crop_recommender
from agents.early_warning_system.agent import execute as execute_warning
from agents.ask_me_anything_agent.agent import execute as execute_ama
from agents.commodity_agent.agent import execute as execute_for_profitability
from agents.risk_mitigation.local_alerts_agent import execute as execute_for_local_alerts
from agents.risk_mitigation.weather_risk_agent import execute as execute_for_weather_risk
from agents.risk_mitigation.weather_risk_agent_long_term import execute as execute_for_seasonal_weather_risk
from agents.government_schemes.government_scheme import execute as execute_govt_scheme_analyzer
import vertexai


os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "TRUE"
os.environ["GOOGLE_CLOUD_PROJECT"] = "shikhafileconnect"
os.environ["GOOGLE_CLOUD_LOCATION"] = "us-central1"
os.environ["GEMINI_API_KEY"] = ""
os.environ["GOOGLE_API_KEY"] = ""


    
vertexai.init(project='shikhafileconnect', location='us-central1') 

# async def call_agent(agent_name, request):
#     """Calls the specified agent and returns the result."""
#     client = a2a_client()
#     response = await client.send_request(agent_name, request)
#     return response

async def execute(request):
    """
    Orchestrates the flow of calling the appropriate agent based on the user's request.
    """
    user_query = request["newMessage"]["parts"][0]["text"]

    # Simple routing logic based on keywords in the user's query
    if "grower" in user_query.lower():
        print("grower")
        agent_response = await execute_fertilizer_recommender(request)
    elif "commodity" in user_query.lower():
        agent_to_call = "commodtiy_agent"
        print("commodity")
        agent_response = await execute_for_profitability(request)
    elif "crop recommendation" in user_query.lower():
        agent_to_call = "crop_recommendation_agent"
        print(agent_to_call)
        agent_response = await execute_crop_recommender( request)
    elif "soil analysis" in user_query.lower():
        agent_to_call = "soil_analysis_agent"
        agent_response = await execute_soil_analysis(request)
    elif "disease" in user_query.lower():
        agent_to_call = "disease_detector"
        print(agent_to_call)
        agent_response = await execute_disease_detector(request)
    elif "warning" in user_query.lower():
        agent_to_call = "early_warning_system"
        print(agent_to_call)
        agent_response = await execute_warning(request)
    elif "seasonal forecast" in user_query.lower():
        agent_to_call = "seasonal_weather_risk_agent"
        print(agent_to_call)
        agent_response = await execute_for_seasonal_weather_risk(request)
    elif "weather risk" in user_query.lower():
        agent_to_call = "weather_risk_agent"
        print(agent_to_call)
        agent_response = await execute_for_weather_risk(request)
    elif "local alerts" in user_query.lower():
        agent_to_call = "local_news_alerts"
        print(agent_to_call)
        agent_response = await execute_for_local_alerts(request)    
    elif "ask me anything" in user_query.lower():
        agent_to_call = "ask_me_anything_agent"
        print(agent_to_call)
        agent_response = await execute_ama(request)
    elif "government scheme" in user_query.lower():
        agent_to_call = "Government Scheme Analyzer agent"
        print(agent_to_call)
        agent_response = await execute_govt_scheme_analyzer(request)
    else:
        agent_to_call = "ask_me_anything_agent"
        print(agent_to_call)
        agent_response = await execute_ama(request)

    return agent_response

class OrchestratorAgent:
    def __init__(self):
        pass

    def run(self):
        # In a real scenario, this would involve setting up a server
        # to listen for incoming requests and call the execute function.
        print("OrchestratorAgent is running...")

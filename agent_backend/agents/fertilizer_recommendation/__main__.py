import asyncio
from .orchestrator_grower_service import run_fertilizer_recommendation_flow
import os
from fastapi.middleware.cors import CORSMiddleware
from agents.common.a2a_server import create_app

# Set environment variables
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "TRUE"
os.environ["GOOGLE_CLOUD_PROJECT"] = "gdw-dev-intellisense"
os.environ["GOOGLE_CLOUD_LOCATION"] = "us-west1"

# Create FastAPI app
app = create_app(agent=type("Agent", (), {"execute": run_fertilizer_recommendation_flow}))

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or use ["http://10.8.8.76:5173"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    # Create a dummy request object for now. In a real application, this would come from the user.
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9020)
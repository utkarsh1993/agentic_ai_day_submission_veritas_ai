import asyncio
from .agent import execute
import os
from fastapi.middleware.cors import CORSMiddleware
from .common.a2a_server import create_app
from .task_manager import run

import vertexai
    
    
    
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "TRUE"
os.environ["GOOGLE_CLOUD_PROJECT"] = "shikhafileconnect"
os.environ["GOOGLE_CLOUD_LOCATION"] = "us-central1"
os.environ["GEMINI_API_KEY"] = "AIzaSyDus0CZWh1P8OVRkRJ9G7bjfYnThc-zrRs"
os.environ["GOOGLE_API_KEY"] = "AIzaSyDus0CZWh1P8OVRkRJ9G7bjfYnThc-zrRs"

vertexai.init(project='shikhafileconnect', location='us-central1') 




# Create FastAPI app
app = create_app(agent=type("Agent", (), {"execute": run}))

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
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))

import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx
from pydantic import BaseModel
from dotenv import load_dotenv
import urllib3

# Désactiver les avertissements InsecureRequestWarning si SSL est ignoré
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Charger les variables d'environnement
load_dotenv()

app = FastAPI(title="Ticketing Admin Dashboard API")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REDMINE_URL = os.getenv("REDMINE_URL", "https://maintenance.medianet.tn/").rstrip("/")
REDMINE_API_KEY = os.getenv("REDMINE_API_KEY")

@app.get("/")
async def root():
    return {"status": "ok", "message": "Redmine Proxy API is running"}

@app.get("/api/redmine/tickets")
async def get_tickets(
    tracker_id: Optional[str] = None,
    status_id: Optional[str] = None,
    project_id: Optional[str] = None,
    created_on: Optional[str] = None,
    limit: int = 1000,
    offset: int = 0
):
    if not REDMINE_API_KEY:
        raise HTTPException(status_code=500, detail="REDMINE_API_KEY is missing")

    params = {
        "limit": limit,
        "offset": offset,
        "include": "journals,attachments"
    }
    
    if tracker_id: params["tracker_id"] = tracker_id
    if status_id: params["status_id"] = status_id
    if project_id: params["project_id"] = project_id
    if created_on: params["created_on"] = created_on

    headers = {"X-Redmine-API-Key": REDMINE_API_KEY}

    async with httpx.AsyncClient(verify=False) as client:
        try:
            response = await client.get(
                f"{REDMINE_URL}/issues.json", 
                params=params, 
                headers=headers, 
                follow_redirects=True
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            print(f"Redmine API Error: {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail="Error fetching from Redmine")
        except Exception as e:
            print(f"Internal Error: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/redmine/tickets/{issue_id}")
async def get_ticket_detail(issue_id: int):
    if not REDMINE_API_KEY:
        raise HTTPException(status_code=500, detail="REDMINE_API_KEY is missing")

    headers = {"X-Redmine-API-Key": REDMINE_API_KEY}
    params = {"include": "journals,attachments"}

    async with httpx.AsyncClient(verify=False) as client:
        try:
            response = await client.get(
                f"{REDMINE_URL}/issues/{issue_id}.json", 
                params=params,
                headers=headers, 
                follow_redirects=True
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise HTTPException(status_code=404, detail="Ticket not found")
            raise HTTPException(status_code=e.response.status_code, detail="Error fetching ticket detail")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

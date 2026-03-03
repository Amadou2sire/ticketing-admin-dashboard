# Intégration Dynamique avec Python FastAPI

Si vous souhaitez remplacer le serveur Node.js actuel par un backend Python FastAPI, voici la marche à suivre.

## 1. Structure du Backend FastAPI

Créez un fichier `main.py` :

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Configuration CORS pour permettre au frontend React de communiquer avec FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REDMINE_URL = os.getenv("REDMINE_URL")
REDMINE_API_KEY = os.getenv("REDMINE_API_KEY")

@app.get("/api/redmine/tickets")
async def get_tickets(project_id: str = None, limit: int = 100):
    params = {
        "key": REDMINE_API_KEY,
        "limit": limit,
    }
    if project_id:
        params["project_id"] = project_id
        
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{REDMINE_URL}/issues.json", params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Erreur Redmine")
        return response.json()

@app.get("/api/redmine/tickets/{issue_id}")
async def get_ticket_detail(issue_id: int):
    params = {"key": REDMINE_API_KEY}
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{REDMINE_URL}/issues/{issue_id}.json", params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Ticket non trouvé")
        return response.json()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## 2. Adaptation du Frontend

Dans `src/App.tsx`, modifiez les URLs des appels `fetch` pour pointer vers votre serveur FastAPI (par exemple `http://localhost:8000/api/...`).

## 3. Variables d'Environnement

Assurez-vous d'avoir un fichier `.env` avec :
```env
REDMINE_URL=https://maintenance.medianet.tn/
REDMINE_API_KEY=votre_cle_api_ici
```

## 4. Installation des dépendances Python

```bash
pip install fastapi uvicorn httpx python-dotenv
```

# Intégration Dynamique avec Python FastAPI

Ce document explique comment transformer cette interface statique en une application dynamique utilisant un backend Python FastAPI.

## 1. Structure de l'API (FastAPI)

Voici un exemple de structure pour votre backend Python :

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configuration CORS pour permettre au frontend React de communiquer avec l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # À restreindre en production
    allow_methods=["*"],
    allow_headers=["*"],
)

class Ticket(BaseModel):
    id: int
    title: string
    tracker: str
    status: str
    priority: str
    date_start: str
    date_end: str
    total_interventions: int
    # Ajoutez d'autres champs selon vos besoins (stats, typologies, etc.)

# Mock Data
tickets_db = [
    {
        "id": 1,
        "title": "Rapport Mensuel Octobre",
        "tracker": "Documentation et reporting",
        "status": "Clôturé",
        "priority": "Moyenne",
        "date_start": "2025-10-01",
        "date_end": "2025-10-31",
        "total_interventions": 53
    },
    # ... autres tickets
]

@app.get("/api/tickets", response_model=List[Ticket])
async def get_tickets(tracker: Optional[str] = None):
    if tracker:
        return [t for t in tickets_db if t["tracker"] == tracker]
    return tickets_db

@app.get("/api/tickets/{ticket_id}")
async def get_ticket_details(ticket_id: int):
    ticket = next((t for t in tickets_db if t["id"] == ticket_id), None)
    if not ticket:
        raise HTTPException(status_code=44, detail="Ticket non trouvé")
    return ticket
```

## 2. Adaptation du Frontend (React)

### Étape A : Service d'API
Créez un fichier `src/services/api.ts` pour gérer les appels :

```typescript
const API_URL = "http://localhost:8000/api";

export const fetchTicketsByTracker = async (tracker: string) => {
  const response = await fetch(`${API_URL}/tickets?tracker=${encodeURIComponent(tracker)}`);
  return response.json();
};

export const fetchTicketDetails = async (id: string) => {
  const response = await fetch(`${API_URL}/tickets/${id}`);
  return response.json();
};
```

### Étape B : Utilisation des Hooks
Dans vos composants React, utilisez `useEffect` pour charger les données :

```typescript
const [ticketData, setTicketData] = useState(null);
const { id } = useParams();

useEffect(() => {
  fetchTicketDetails(id).then(data => setTicketData(data));
}, [id]);
```

## 3. Flux de l'Application
1. **Page Home** : Appelle `/api/tickets?tracker=Documentation et reporting`.
2. **Clic sur un lien** : Redirige vers `/report/{id}`.
3. **Page Report** : Appelle `/api/tickets/{id}` et injecte les données dans les graphiques et les compteurs.

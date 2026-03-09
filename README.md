# Ticketing Admin Dashboard 📊

Un tableau de bord moderne et dynamique pour la gestion et le reporting des tickets Redmine. Ce projet permet de visualiser l'état d'avancement des interventions, d'analyser les priorités et de générer des rapports d'activité professionnels.

## 🚀 Fonctionnalités Clés

### 🏠 Portail Home
- **Vue d'Ensemble** : Visualisation des derniers tickets Redmine.
- **Alertes d'Échéance** : Affichage de la date d'échéance avec un indicateur rouge si le ticket est en retard (hors tickets clôturés).
- **Cartes de Statuts** : État d'avancement clair pour chaque ticket.

### 📈 Module de Reporting Dynamique
- **Période Personnalisable** : Sélection dynamique des dates (Du/Au) avec rafraîchissement automatique des données depuis Redmine.
- **Analyse de Données** : 
  - Répartition par statut (Recharts).
  - Analyse intelligente des priorités (texte dynamique basé sur la concentration des tickets).
  - Typologie des interventions.
- **Personnalisation** : Upload de logos personnalisés (Client / Interne) directement depuis l'interface pour les exports.

### 📥 Multi-Export Export
Exportation du rapport d'activité en un clic dans plusieurs formats professionnels :
- 🟠 **PowerPoint (.pptx)** : Présentation 16:9 avec couverture et slides de données.
- 🔴 **PDF Paysage (.pdf)** : Mise en page optimisée avec en-tête ardoise/orange.
- 🔵 **Word Paysage (.docx)** : Document structuré pour l'édition.

## 🛠️ Stack Technique

- **Frontend** : [React](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling** : [Tailwind CSS](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/)
- **Visualisation** : [Recharts](https://recharts.org/) + [Motion](https://motion.dev/)
- **Backend Proxy** : [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Librairies d'Export** :
  - `PptxGenJS` pour PowerPoint.
  - `jsPDF` pour le PDF.
  - `docx` pour Microsoft Word.
  - `html-to-image` pour la capture des composants UI.

## ⚙️ Installation

### Pré-requis
- Node.js (v18+)
- Python 3.10+
- Un accès à une instance Redmine (API Key)

### 1. Configuration du Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Sur Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
Créez un fichier `.env` dans le dossier `backend` :
```env
REDMINE_URL=https://votre-redmine.com
REDMINE_API_KEY=votre_cle_api
```

### 2. Configuration du Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📝 Utilisation
1. Accédez au dashboard sur `http://localhost:5173`.
2. Cliquez sur un ticket pour générer son rapport d'activité.
3. Ajustez les dates de reporting en haut de page.
4. Ajoutez vos logos via les zones de drag & drop.
5. Utilisez le bouton **"Exporter"** pour choisir votre format de sortie.

---
*Projet développé pour optimiser le suivi et le reporting contractuel des services de run.*

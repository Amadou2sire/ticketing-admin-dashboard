import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

const REDMINE_URL = process.env.REDMINE_URL || "https://maintenance.medianet.tn/";
const REDMINE_API_KEY = process.env.REDMINE_API_KEY;

// API routes
app.get("/api/redmine/tickets", async (req, res) => {
  try {
    if (!REDMINE_API_KEY) {
      return res.status(500).json({ error: "REDMINE_API_KEY is not configured" });
    }

    const { tracker_id, status_id, limit = 100 } = req.query;

    const response = await axios.get(`${REDMINE_URL}/issues.json`, {
      params: {
        tracker_id,
        status_id,
        limit,
        include: "journals,attachments"
      },
      headers: {
        "X-Redmine-API-Key": REDMINE_API_KEY
      }
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("Redmine API Error:", error.message);
    res.status(error.response?.status || 500).json({ 
      error: "Failed to fetch from Redmine",
      details: error.message 
    });
  }
});

app.get("/api/redmine/tickets/:id", async (req, res) => {
  try {
    if (!REDMINE_API_KEY) {
      return res.status(500).json({ error: "REDMINE_API_KEY is not configured" });
    }

    const { id } = req.params;

    const response = await axios.get(`${REDMINE_URL}/issues/${id}.json`, {
      params: {
        include: "journals,attachments"
      },
      headers: {
        "X-Redmine-API-Key": REDMINE_API_KEY
      }
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("Redmine API Error:", error.message);
    res.status(error.response?.status || 500).json({ 
      error: "Failed to fetch issue details from Redmine",
      details: error.message 
    });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static("dist"));
  app.get("*", (req, res) => {
    res.sendFile("dist/index.html", { root: "." });
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

import axios from "axios";

// Get the API base URL from the environment or default to local FastAPI server port (8000)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://64.177.120.243:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  // Fail fast instead of hanging forever so a dead/unreachable server surfaces as a timeout.
  timeout: 60000,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

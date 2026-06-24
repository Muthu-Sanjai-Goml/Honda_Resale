import axios from "axios";

// Get the API base URL from the environment or default to local FastAPI server port (8000)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://8j5x9bpn-8000.inc1.devtunnels.ms";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

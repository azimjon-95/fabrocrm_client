import axios from "axios";

const mainURL = axios.create({
  // baseURL: "http://localhost:5000/api",
  baseURL: "https://mebelx-server-production.up.railway.app/api",
});

export default mainURL;

import axios from "axios";

const mainURL = axios.create({
  baseURL: "https://mebelx-server-theta.vercel.app/api",
  // baseURL: "https://mebelx-server.vercel.app/api",
});

export default mainURL;

import axios from "axios";

const mainURL = axios.create({
  // baseURL: "http://localhost:5000/api",
  baseURL: "https://mebelx.abdujabborov.uz/api",
});

export default mainURL;

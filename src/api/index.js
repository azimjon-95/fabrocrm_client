import axios from "axios";

const mainURL = axios.create({
  baseURL: "https://mebelx-server-three.vercel.app/api/",
});

export default mainURL;

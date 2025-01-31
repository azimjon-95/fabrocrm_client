import axios from "axios";

const mainURL = axios.create({
    // baseURL: "http://localhost:5000",
    baseURL: "https://mebelx-server.vercel.app/api",
});

export default mainURL;

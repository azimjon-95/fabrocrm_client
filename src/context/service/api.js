import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";

// const baseQuery = fetchBaseQuery({
//   baseURL: "https://mebelx-server-three.vercel.app/api",
//   // baseUrl: "http://localhost:5000/api",

//   prepareHeaders: (headers) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       headers.set("Authorization", `Bearer ${token}`);
//     }
//     return headers;
//   },
// });

const baseQuery = fetchBaseQuery({
  // baseUrl: "https://mebelx-server-three.vercel.app/api",
  baseUrl: "http://localhost:5000/api",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Cache-Control", "no-cache"); // Keshni chetlab o'tish uchun
    return headers;
  },
});

const baseQueryWithRetry = retry(baseQuery, { maxRetries: 2 });

export const api = createApi({
  reducerPath: "splitApi",
  baseQuery: baseQueryWithRetry,
  tagTypes: ["Workers"],
  endpoints: () => ({}),
});

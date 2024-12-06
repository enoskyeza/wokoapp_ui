// import axios from "axios";
// import { getToken, refreshAccessToken } from "@/lib/auth";
//
// const axiosInstance = axios.create({
//   baseURL: process.env.DJANGO_API_URL, // Set your base URL here
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
//   proxy: false,
// });
//
// // Request Interceptor
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = getToken();
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }
//     console.log({baseURL: config.baseURL, url: config.url})
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );
//
// // Response Interceptor
// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;
//     // Handle global errors here, e.g., logging or redirecting to login
//     if (
//       error.response &&
//       error.response.status === 401 &&
//       !originalRequest._retry
//     ) {
//       //  refresh token
//       originalRequest._retry = true; // Mark the request as retried
//
//       const newAccessToken = await refreshAccessToken();
//
//       if (newAccessToken) {
//         originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
//         // Retry the original request with the new token
//         return axiosInstance(originalRequest);
//       }
//     }
//     return Promise.reject(error);
//   }
// );
//
// export default axiosInstance;

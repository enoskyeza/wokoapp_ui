// import axiosInstance from "@/lib/axios-config";
// import axios, {
//   AxiosHeaderValue,
//   AxiosHeaders,
//   HeadersDefaults,
//   RawAxiosRequestHeaders,
// } from "axios";
// import { getToken } from "./auth";
//
// export default class ApiProxy {
//   static async handleRequest(
//     method: string,
//     endpoint: string,
//     data?: any,
//     headers?: RawAxiosRequestHeaders | AxiosHeaders | Partial<HeadersDefaults>
//   ) {
//     let response;
//     let status = 500;
//     let responseData = {};
//
//     let instance = axiosInstance;
//
//     if (headers) {
//       // create a new instance and use this instead
//       instance = axios.create({
//         baseURL: process.env.DJANGO_API_URL,
//         headers: { ...axiosInstance.defaults.headers, ...headers },
//         proxy: false,
//       });
//
//       // Request Interceptor
//       instance.interceptors.request.use(
//         (config) => {
//           const token = getToken();
//           if (token) {
//             config.headers["Authorization"] = `Bearer ${token}`;
//           }
//
//           return config;
//         },
//         (error) => {
//           return Promise.reject(error);
//         }
//       );
//     }
//
//     try {
//       response = await instance({
//         method,
//         url: endpoint,
//         data,
//       });
//
//       status = response.status;
//       responseData = response.data;
//     } catch (error: any) {
//       if (error.response) {
//         status = error.response.status;
//         responseData = error.response.data;
//       } else {
//         responseData = {
//           message: "Cannot reach API server",
//           error: error.message,
//         };
//       }
//     }
//
//     return { data: responseData, status };
//   }
//
//   static async put(
//     endpoint: string,
//     object: any,
//     headers?: RawAxiosRequestHeaders | AxiosHeaders | Partial<HeadersDefaults>
//   ) {
//     return await ApiProxy.handleRequest("PUT", endpoint, object, headers);
//   }
//
//   static async patch(
//     endpoint: string,
//     object: any,
//     headers?: RawAxiosRequestHeaders | AxiosHeaders | Partial<HeadersDefaults>
//   ) {
//     return await ApiProxy.handleRequest("PATCH", endpoint, object, headers);
//   }
//
//   static async delete(
//     endpoint: string,
//     headers?: RawAxiosRequestHeaders | AxiosHeaders | Partial<HeadersDefaults>
//   ) {
//     return await ApiProxy.handleRequest("DELETE", endpoint, headers);
//   }
//
//   static async post(
//     endpoint: string,
//     object: any,
//     headers?: RawAxiosRequestHeaders | AxiosHeaders | Partial<HeadersDefaults>
//   ) {
//     return await ApiProxy.handleRequest("POST", endpoint, object, headers);
//   }
//
//   static async get(
//     endpoint: string,
//     headers?: RawAxiosRequestHeaders | AxiosHeaders | Partial<HeadersDefaults>
//   ) {
//     return await ApiProxy.handleRequest("GET", endpoint, headers);
//   }
// }

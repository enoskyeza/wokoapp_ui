// src/config.ts

export const API_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://kyeza.pythonanywhere.com/'
    : 'http://127.0.0.1:8000/';

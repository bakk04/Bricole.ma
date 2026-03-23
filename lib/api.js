import axios from 'axios';

/**
 * Global API Utility
 * Optimized for Next.js with Authentication support
 */
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // CRITIQUE: Permet d'envoyer les cookies de session
});

// GET Request
export const getData = (url) => api.get(url).then(res => res.data);

// POST Request
export const postData = (url, data) => api.post(url, data).then(res => res.data);

// PUT Request
export const putData = (url, data) => api.put(url, data).then(res => res.data);

// DELETE Request
export const deleteData = (url) => api.delete(url).then(res => res.data);

export default api;

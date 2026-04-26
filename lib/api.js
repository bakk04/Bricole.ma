import axios from 'axios';
import { getSession } from "next-auth/react";

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

// Intercepteur pour ajouter le token JWT de la session dans les headers
api.interceptors.request.use(async (config) => {
    try {
        const session = await getSession();
        // Priorité au bricoleToken de la session NextAuth (Google)
        if (session?.user?.bricoleToken) {
            config.headers.Authorization = `Bearer ${session.user.bricoleToken}`;
        }
    } catch (e) {
        console.error("Erreur intercepteur API:", e);
    }
    return config;
});

// GET Request
export const getData = (url) => api.get(url).then(res => res.data);

// POST Request
export const postData = (url, data) => {
    const config = {};
    if (data instanceof FormData) {
        config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    return api.post(url, data, config).then(res => res.data);
};

// PUT Request
export const putData = (url, data, config = {}) => api.put(url, data, config).then(res => res.data);

// PATCH Request
export const patchData = (url, data, config = {}) => api.patch(url, data, config).then(res => res.data);

// DELETE Request
export const deleteData = (url) => api.delete(url).then(res => res.data);

export default api;

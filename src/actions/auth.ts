'use server'
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production'
    ? 'https://kyeza.pythonanywhere.com/login/'
    : 'http://127.0.0.1:8000/login/';

export const loginUser = async (
    username: string,
    password: string
): Promise<{ token: string; user: { id: number; username: string; email: string; role: string } }> => {
    try {
        const response = await axios.post(API_URL, {username, password});

        const { token, user } = await response.data;

        // Return token and user data to client for client-side storage
        // Client will store in localStorage for cross-origin compatibility
        return { token, user };
    } catch (error: unknown) {
        return handleServerError(error);
    }
};


export async function handleServerError(error: unknown): Promise<never> {
    if (axios.isAxiosError(error)) {
        const response = error.response;

        // Handle unauthorized errors
        if (response?.status === 401 || response?.data?.detail === 'Unauthorized') {
            throw new Error('Invalid username or password.');
        }

        // Handle validation errors
        if (response?.status === 400) {
            const message = response?.data?.username?.[0] || response?.data?.password?.[0] || 'Bad Request';
            throw new Error(message);
        }

        // Connection issues
        if (error.code === 'ECONNREFUSED') {
            throw new Error('Connection refused. Please try again later.');
        }

        // Generic server error
        if (response) {
            const message = response.data?.detail || response.data?.message || 'Server error.';
            throw new Error(message);
        }
    }

    // Unknown error
    throw new Error('An unexpected error occurred. Please try again.');
}
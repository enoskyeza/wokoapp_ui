'use server'
import axios from 'axios';
import { cookies } from 'next/headers';

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

        const cookieStore = await cookies();

        cookieStore.set('authToken', token, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });

        cookieStore.set('userData', JSON.stringify(user), {
            path: '/',
            httpOnly: false, // Allows client-side access if needed
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });


        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.detail || 'Login failed. Please try again.');
        }
        throw new Error('An unexpected error occurred. Please try again.');
    }
};

import "server-only"
import axios from 'axios';

export const api = axios.create({
    baseURL : process.env.API_URL,
    headers : {"Content-Type": "application/json"},
    timeout : 10_000
})

export function bearerHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
}


import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
 NewsItem,
PublicMember,

} from '../types';

const API : AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 5000,
});




// Public
export const getNews = (): Promise<AxiosResponse<NewsItem[]>> =>
  API.get('/news');

export const getPublicMembers = (): Promise<AxiosResponse<PublicMember[]>> =>
  API.get('/members/public');


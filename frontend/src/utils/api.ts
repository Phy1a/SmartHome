import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type {
  User, Device, Room, NewsItem, Alert, DeletionRequest,
  DeviceStats, PlatformStats, PointsResponse, PublicMember,
  LoginForm, RegisterForm, ProfileForm, DeviceForm, DeviceFilters
} from '../types';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
});

API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (data: LoginForm): Promise<AxiosResponse<{ token: string; user: User }>> =>
  API.post('/auth/login', data);

export const register = (data: RegisterForm): Promise<AxiosResponse<{ message: string }>> =>
  API.post('/auth/register', data);

export const getMe = (): Promise<AxiosResponse<User>> =>
  API.get('/auth/me');

export const updateProfile = (data: Partial<ProfileForm>): Promise<AxiosResponse<{ message: string }>> =>
  API.put('/auth/profile', data);

export const getPoints = (): Promise<AxiosResponse<PointsResponse>> =>
  API.get('/auth/points');

// Public
export const getNews = (): Promise<AxiosResponse<NewsItem[]>> =>
  API.get('/news');

export const getPublicMembers = (): Promise<AxiosResponse<PublicMember[]>> =>
  API.get('/members/public');

// Devices
export const getDevices = (params: Partial<DeviceFilters>): Promise<AxiosResponse<Device[]>> =>
  API.get('/devices', { params });

export const getDevice = (id: number | string): Promise<AxiosResponse<Device>> =>
  API.get(`/devices/${id}`);

export const addDevice = (data: Partial<DeviceForm>): Promise<AxiosResponse<{ message: string; id: number; uniqueId: string }>> =>
  API.post('/devices', data);

export const updateDevice = (id: number, data: Partial<DeviceForm>): Promise<AxiosResponse<{ message: string }>> =>
  API.put(`/devices/${id}`, data);

export const toggleDevice = (id: number | string): Promise<AxiosResponse<{ status: string; message: string }>> =>
  API.patch(`/devices/${id}/toggle`);

export const requestDeletion = (id: number, data: { reason?: string }): Promise<AxiosResponse<{ message: string }>> =>
  API.post(`/devices/${id}/delete-request`, data);

export const deleteDevice = (id: number): Promise<AxiosResponse<{ message: string }>> =>
  API.delete(`/devices/${id}`);

export const getDeviceStats = (): Promise<AxiosResponse<DeviceStats>> =>
  API.get('/devices/stats');

export const getRooms = (): Promise<AxiosResponse<Room[]>> =>
  API.get('/rooms');

// Admin
export const getAdminUsers = (): Promise<AxiosResponse<User[]>> =>
  API.get('/admin/users');

export const validateUser = (id: number): Promise<AxiosResponse<{ message: string }>> =>
  API.patch(`/admin/users/${id}/validate`);

export const toggleUserActive = (id: number): Promise<AxiosResponse<{ isActive: boolean }>> =>
  API.patch(`/admin/users/${id}/toggle`);

export const updateUserLevel = (id: number, level: string): Promise<AxiosResponse<{ message: string }>> =>
  API.patch(`/admin/users/${id}/level`, { level });

export const deleteAdminUser = (id: number): Promise<AxiosResponse<{ message: string }>> =>
  API.delete(`/admin/users/${id}`);

export const getDeletionRequests = (): Promise<AxiosResponse<DeletionRequest[]>> =>
  API.get('/admin/deletion-requests');

export const approveDeletion = (id: number): Promise<AxiosResponse<{ message: string }>> =>
  API.post(`/admin/deletion-requests/${id}/approve`);

export const rejectDeletion = (id: number): Promise<AxiosResponse<{ message: string }>> =>
  API.post(`/admin/deletion-requests/${id}/reject`);

export const getAlerts = (): Promise<AxiosResponse<Alert[]>> =>
  API.get('/alerts');

export const getPlatformStats = (): Promise<AxiosResponse<PlatformStats>> =>
  API.get('/admin/stats');

export const addNews = (data: { title: string; content: string; category: string }): Promise<AxiosResponse<{ message: string }>> =>
  API.post('/news', data);

export default API;

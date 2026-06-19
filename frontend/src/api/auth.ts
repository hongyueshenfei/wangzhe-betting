import client from './client';
import type { ApiResponse, User } from '../types';

export interface AuthResult {
  token: string;
  user: User;
}

export async function register(data: {
  username: string;
  password: string;
}): Promise<AuthResult> {
  const res = await client.post<ApiResponse<AuthResult>>('/auth/register', data);
  return res.data.data!;
}

export async function login(data: {
  username: string;
  password: string;
}): Promise<AuthResult> {
  const res = await client.post<ApiResponse<AuthResult>>('/auth/login', data);
  return res.data.data!;
}

export async function getMe(): Promise<User> {
  const res = await client.get<ApiResponse<User>>('/auth/me');
  return res.data.data!;
}

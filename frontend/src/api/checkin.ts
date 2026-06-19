import client from './client';
import type { ApiResponse } from '../types';

export interface CheckinResult {
  earned: number;
  newBalance: number;
}

export async function checkin(): Promise<CheckinResult> {
  const res = await client.post<ApiResponse<CheckinResult>>('/checkin');
  return res.data.data!;
}

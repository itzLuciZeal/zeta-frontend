import { api } from "../lib/api";
import type { UserDashboardResponse } from "../types/dashboard.types";

const DASHBOARD_PREFIX = '/api/v1/dashboard';

export const getUserDashboardApi = async (): Promise<UserDashboardResponse> => {
  const response = await api.get<UserDashboardResponse>(`${DASHBOARD_PREFIX}/user`);
  return response.data;
};

export const getAdminDashboardApi = async () => {
  const response = await api.get(`${DASHBOARD_PREFIX}/admin`);
  return response.data;
};

import { api } from "../lib/api";
import type { LiveQuizSessionResponse, UserDashboardResponse } from "../types/dashboard.types";
import type { QuizOverallAnalytics, QuizParticipantTelemetry } from "../types/dashboard.types";

export const DASHBOARD_PREFIX = '/api/v1/dashboard';

export const getUserDashboardApi = async (): Promise<UserDashboardResponse> => {
  const response = await api.get<UserDashboardResponse>(`${DASHBOARD_PREFIX}/user`);
  return response.data;
};

export const getAdminDashboardApi = async () => {
  const response = await api.get(`${DASHBOARD_PREFIX}/admin`);
  return response.data;
};

export async function getLiveQuizSessionApi(quizId: string): Promise<LiveQuizSessionResponse> {
  const response = await api.get<LiveQuizSessionResponse>(`${DASHBOARD_PREFIX}/admin/quizzes/${quizId}/live`);
  return response.data;
}

export async function getQuizOverallAnalyticsApi(quizId: string): Promise<QuizOverallAnalytics> {
  const response = await api.get(`${DASHBOARD_PREFIX}/admin/quizzes/${quizId}/analytics`);
  return response.data;
}

export async function getQuizParticipantsApi(quizId: string, searchQuery?: string): Promise<QuizParticipantTelemetry[]> {
  const params = searchQuery ? { q: searchQuery } : {};
  const response = await api.get(`${DASHBOARD_PREFIX}/admin/quizzes/${quizId}/participants`, { params });
  return response.data;
}

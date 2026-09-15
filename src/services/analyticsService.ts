import { api } from "../lib/api";
import { type QuizItemAnalysisResponse } from "../types/analytics.types";
import { DASHBOARD_PREFIX } from "./dashboard.service";

export const fetchQuizItemAnalysis = async (quizId: string): Promise<QuizItemAnalysisResponse> => {
  try {
    const response = await api.get<QuizItemAnalysisResponse>(
      `${DASHBOARD_PREFIX}/admin/quizzes/${quizId}/item-analysis`
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch item analysis for quiz ${quizId}:`, error);
    throw error;
  }
};

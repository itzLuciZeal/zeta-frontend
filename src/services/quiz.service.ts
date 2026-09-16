import { api } from "../lib/api"; // Your configured Axios instance
import type { Quiz, QuizCreatePayload, QuizCreateResponse, UpdateQuizRequest, QuizAccessGrantRequest, QuizAccessGrantResponse } from "../types/quiz.types";
import type { QuizAttempt, CurrentQuestionResponse, UserAnswerPayload, ResearchStatsResponse } from '../types/quiz.types';

const QUIZ_PREFIX = '/api/v1/quizzes';

export const getActiveQuizzesApi = async (): Promise<Quiz[]> => {
  const response = await api.get<Quiz[]>(`${QUIZ_PREFIX}/`);
  return response.data;
};

export async function createQuizApi(payload: QuizCreatePayload): Promise<QuizCreateResponse> {
  const response = await api.post<QuizCreateResponse>(`${QUIZ_PREFIX}/create`, payload);
  return response.data;
}

export const updateQuizApi = async (quizId: string, payload: UpdateQuizRequest): Promise<Quiz> => {
  const response = await api.patch<Quiz>(`${QUIZ_PREFIX}/${quizId}`, payload);
  return response.data;
};

export const grantQuizAccessApi = async (quizId: string, payload: QuizAccessGrantRequest): Promise<QuizAccessGrantResponse> => {
  const response = await api.post<QuizAccessGrantResponse>(`${QUIZ_PREFIX}/${quizId}/access`, payload);
  return response.data;
};

export const quizService = {
  async startQuiz(quizId: string, token?: string): Promise<QuizAttempt> {
    const response = await api.post<QuizAttempt>(
      `${QUIZ_PREFIX}/${quizId}/start`,
      {},
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    return response.data;
  },

  async getAllQuestions(attemptId: string, token?: string): Promise<AllQuestionResponse> {
    const response = await api.get<AllQuestionResponse>(
      `${QUIZ_PREFIX}/attempts/${attemptId}/questions`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    return response.data;
  },

  async getCurrentQuestion(attemptId: string, token?: string): Promise<CurrentQuestionResponse> {
    const response = await api.get<CurrentQuestionResponse>(
      `${QUIZ_PREFIX}/attempts/${attemptId}/current-question`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    return response.data;
  },

  async submitAnswer(
    attemptId: string,
    payload: UserAnswerPayload,
    token?: string
  ): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      `${QUIZ_PREFIX}/attempts/${attemptId}/answers`,
      payload,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    return response.data;
  },

  async getAttemptResults(attemptId: string, token?: string): Promise<ResearchStatsResponse> {
    const response = await api.get<ResearchStatsResponse>(
      `${QUIZ_PREFIX}/attempts/${attemptId}/results`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    return response.data;
  },
};

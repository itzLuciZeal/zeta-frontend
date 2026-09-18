import { api } from "../lib/api";
import type {
  Quiz,
  QuizCreatePayload,
  QuizCreateResponse,
  UpdateQuizRequest,
  QuizAccessGrantRequest,
  QuizAccessGrantResponse,
  QuizAttempt,
  CurrentQuestionResponse,
  UserAnswerPayload,
  AllQuestionResponse,
  QuizAttemptResultResponse,
} from "../types/quiz.types";

const QUIZ_PREFIX = "/api/v1/quizzes";

export const getActiveQuizzesApi = async (statusFilter?: string): Promise<Quiz[]> => {
  const response = await api.get<Quiz[]>(`${QUIZ_PREFIX}`, {
    params: statusFilter ? { status: statusFilter } : undefined,
  });
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

export const grantQuizAccessApi = async (
  quizId: string,
  payload: QuizAccessGrantRequest
): Promise<QuizAccessGrantResponse> => {
  const response = await api.post<QuizAccessGrantResponse>(`${QUIZ_PREFIX}/${quizId}/access`, payload);
  return response.data;
};

export async function getAttemptResultsApi(attemptId: string): Promise<QuizAttemptResultResponse> {
  const response = await api.get<QuizAttemptResultResponse>(`${QUIZ_PREFIX}/attempts/${attemptId}/results`);
  return response.data;
}

export const quizService = {
  async getActiveQuizzes(statusFilter?: string): Promise<Quiz[]> {
    return getActiveQuizzesApi(statusFilter);
  },

  async startQuiz(quizId: string): Promise<QuizAttempt> {
    const response = await api.post<QuizAttempt>(`${QUIZ_PREFIX}/${quizId}/start`, {});
    return response.data;
  },

  async getAllQuestions(attemptId: string): Promise<AllQuestionResponse> {
    const response = await api.get<AllQuestionResponse>(`${QUIZ_PREFIX}/attempts/${attemptId}/questions`);
    return response.data;
  },

  async getCurrentQuestion(attemptId: string): Promise<CurrentQuestionResponse> {
    const response = await api.get<CurrentQuestionResponse>(`${QUIZ_PREFIX}/attempts/${attemptId}/current-question`);
    return response.data;
  },

  async submitAnswer(attemptId: string, payload: UserAnswerPayload): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`${QUIZ_PREFIX}/attempts/${attemptId}/answers`, payload);
    return response.data;
  },

  async getAttemptResults(attemptId: string): Promise<QuizAttemptResultResponse> {
    return getAttemptResultsApi(attemptId);
  },
};

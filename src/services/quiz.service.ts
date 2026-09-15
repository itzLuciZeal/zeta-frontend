import { api } from "../lib/api"; // Your configured Axios instance
import type { Quiz } from "../types/quiz.types";

const QUIZ_PREFIX = '/api/v1/quizzes';

export const getActiveQuizzesApi = async (): Promise<Quiz[]> => {
  const response = await api.get<Quiz[]>(`${QUIZ_PREFIX}/`);
  console.log(response);
  return response.data;
};

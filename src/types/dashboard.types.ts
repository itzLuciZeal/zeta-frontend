import type { Quiz } from "./quiz.types";

export interface UserInfo {
  username: string;
  email: string;
  role: string;
}

export interface PerformanceSummary {
  total_quizzes_completed: number;
  lifetime_accuracy_rate: number;
  lifetime_pressure_score: number;
}

export interface UserDashboardResponse {
  user_info: UserInfo;
  performance_summary: PerformanceSummary;
}

export interface LiveQuizUserRoster {
  user_id: string;
  username: string;
  status: "not_started" | "in_progress" | "completed" | "expired" | string;
  started_at: string | null;
  expires_at: string | null;
  current_question_index: number | null;
  slot_elapsed_sec: number | null;
  completed_at: string | null;
}

export interface LiveQuizSummary {
  assigned_total: number;
  not_started_count: number;
  in_progress_count: number;
  completed_count: number;
  expired_count: number;
}

export interface LiveQuizSessionResponse {
  quiz_details: Quiz;
  summary: LiveQuizSummary;
  roster: LiveQuizUserRoster[];
}

export interface QuizOverallAnalytics {
  total_participants: number;
  completion_rate: number;
  mean_accuracy_score: number;
  mean_response_time: number;
  mean_pressure_score: number;
}

export interface QuizParticipantTelemetry {
  username: string;
  email: string;
  status: string;
  accuracy_rate: number;
  avg_response_time: number;
  pressure_score: number;
}

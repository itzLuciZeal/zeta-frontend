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

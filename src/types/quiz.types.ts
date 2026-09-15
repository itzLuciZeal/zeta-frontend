export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  total_questions: number | null;
  created_by: string;
  status: string;
  allow_backtracking: boolean;
  allow_synchronous: boolean;
  max_score: number;
  max_attempts: number | null;
  time_limit_sec: number | null;
  time_per_question_sec: number | null;
  created_at: string;
}

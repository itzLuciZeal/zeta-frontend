export interface Quiz {
  id: string;
  title: string;
  description?: string;
  total_questions: number;
  created_by: string;
  status: string;
  shuffle_questions: boolean;
  allow_backtracking: boolean;
  allow_synchronous: boolean;
  max_score: number;
  max_attempts: number;
  time_limit_sec?: number;
  time_per_question_sec?: number;
  created_at?: string;
  questions?: Question[];
}

export interface AnswerOptionCreate {
  option_text: string;
  is_correct: boolean;
}

export interface QuestionCreate {
  question_text: string;
  options: AnswerOptionCreate[];
}

export interface QuizCreatePayload {
  title: string;
  description?: string;
  status: string; // e.g., "PENDING" | "ACTIVE"
  shuffle_questions: boolean;
  allow_backtracking: boolean;
  allow_synchronous: boolean;
  max_score: number;
  max_attempts: number | null;
  time_limit_sec?: number | null;
  time_per_question_sec?: number | null;
  questions: QuestionCreate[];
}

export interface QuizCreateResponse {
  message: string;
  creator_name: string;
  quiz: Quiz;
}

export interface AnswerOption {
  id?: string;
  option_text: string;
  is_correct: boolean;
}

export interface Question {
  id?: string;
  question_text: string;
  order_index: number;
  options: AnswerOption[];
}

export type QuizStatus = "pending" | "published" | "active" | "completed" | "expired";

export interface UpdateQuizRequest {
  status?: QuizStatus | string;
  shuffle_questions?: boolean;
  allow_synchronous?: boolean;
}

export interface QuizAccessGrantRequest {
  user_ids: string[];
}

export interface QuizAccessGrantResponse {
  message: string;
  total_added: number;
  unmatched_identifiers_count: number;
}

export type AttemptStatus = 'in_progress' | 'completed' | 'expired';

export interface AnswerOptionRead {
  id: string;
  option_text: string;
}

export interface QuestionStudentRead {
  id: string;
  question_text: string;
  options: AnswerOptionRead[];
}

export interface CurrentQuestionResponse {
  question: QuestionStudentRead;
  time_remaining_sec: number;
  target_index: number;
}

export interface AllQuestionResponse {
  time_remaining_sec: number;
  questions: QuestionStudentRead[];
}

export interface UserAnswerPayload {
  question_id: string;
  selected_option_id: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  status: AttemptStatus;
  started_at: string;
  expires_at?: string | null;
  current_question_index?: number | null;
}

export interface ResearchStatsRead {
  id: string;
  quiz_attempt_id: string;
  type_quiz: 'backtrack' | 'sequential';
  score_per_question: number;
  total_correct_answers: number;
  total_incorrect_answers: number;
  total_skipped_answers: number;
  sum_taken_secs: number;
  sum_left_secs: number;
  time_ratio_saved: number;
  accuracy_rate: number;
  avg_response_time: number;
  pressure_score: number;
}

export interface ResearchStatsResponse {
  title: string;
  message: string;
  accuracy_integrity_lvl: string;
  accuracy_classification: string;
  avg_rs_pacing_velocity: string;
  avg_rs_diagnosis: string;
  pressure_score_grade: string;
  pressure_score_info: string;
  finished_at?: string | null;
  research_stats: ResearchStatsRead;
}

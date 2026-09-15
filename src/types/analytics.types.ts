export interface QuizOptionAnalysis {
  option_id: string;
  option_text: string;
  is_correct: boolean;
  selection_count: number;
  selection_percentage: number;
  users_that_picked: string[];
}

export interface ItemAnalysisQuestion {
  question_id: string;
  question_text: string;
  order_index: number;
  total_responses: number;
  correct_responses: number;
  skipped_responses: number;
  accuracy_rate: number;
  avg_time_taken_sec: number;
  users_that_skipped: string[];
  options: QuizOptionAnalysis[];
}

export interface QuizItemAnalysisResponse {
  quiz_id: string;
  total_completed_attempts: number;
  item_analysis: ItemAnalysisQuestion[];
}

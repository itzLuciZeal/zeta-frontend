// src/context/QuizContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { quizService } from '../services/quiz.service';
import type { QuizAttempt, QuestionStudentRead } from '../types/quiz.types';

export type QuizStatus = 'IDLE' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
export type QuizMode = 'SEQUENTIAL' | 'BACKTRACKING' | null;

export interface QuizContextType {
  activeAttempt: QuizAttempt | null;
  status: QuizStatus;
  mode: QuizMode;
  questions: QuestionStudentRead[];
  currentQuestion: QuestionStudentRead | null; // <--- FIXED: Explicitly declared here
  timeRemainingSec: number;
  loading: boolean;
  error: string | null;
  startQuiz: (quizId: string) => Promise<void>;
  submitAnswer: (selectedOption: string, questionId?: string) => Promise<void>;
  loadResults: (attemptId: string) => Promise<void>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeAttempt, setActiveAttempt] = useState<QuizAttempt | null>(null);
  const [status, setStatus] = useState<QuizStatus>('IDLE');
  const [mode, setMode] = useState<QuizMode>(null);
  const [questions, setQuestions] = useState<QuestionStudentRead[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionStudentRead | null>(null);
  const [timeRemainingSec, setTimeRemainingSec] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer Countdown Effect
  useEffect(() => {
    if (status !== 'IN_PROGRESS') return;

    timerRef.current = setInterval(() => {
      setTimeRemainingSec((prev) => {
        if (prev <= 1) {
          if (timerRef.current !== null) clearInterval(timerRef.current);
          setStatus('EXPIRED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, [status]);

  // Start or resume quiz
  const startQuiz = async (quizId: string) => {
    setLoading(true);
    setError(null);
    try {
      const attempt = await quizService.startQuiz(quizId);
      setActiveAttempt(attempt);

      if (attempt.status === 'completed' || attempt.status === 'expired') {
        setStatus(attempt.status.toUpperCase() as QuizStatus);
        setLoading(false);
        return;
      }

      // Try Backtracking endpoint first
      try {
        const allQData = await quizService.getAllQuestions(attempt.id);
        setQuestions(allQData.questions);
        setTimeRemainingSec(Math.max(0, Math.floor(allQData.time_remaining_sec)));
        setMode('BACKTRACKING');
        setStatus('IN_PROGRESS');
      } catch (err: any) {
        // Fallback to Sequential mode if 403 / forbidden
        if (err?.response?.status === 403) {
          setMode('SEQUENTIAL');
          const currentQData = await quizService.getCurrentQuestion(attempt.id);
          setCurrentQuestion(currentQData.question);
          setTimeRemainingSec(Math.max(0, Math.floor(currentQData.time_remaining_sec)));
          setStatus('IN_PROGRESS');
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'FAILED TO INITIALIZE QUIZ ASSIGNMENT');
    } finally {
      setLoading(false);
    }
  };

  // Submit Answer
  const submitAnswer = async (selectedOption: string, questionId?: string) => {
    if (!activeAttempt) return;
    try {
      await quizService.submitAnswer(activeAttempt.id, {
        question_id: questionId || currentQuestion?.id || '',
        selected_option_id: selectedOption,
      });

      if (mode === 'SEQUENTIAL') {
        const nextQ = await quizService.getCurrentQuestion(activeAttempt.id);
        setCurrentQuestion(nextQ.question);
        setTimeRemainingSec(Math.max(0, Math.floor(nextQ.time_remaining_sec)));
      }
    } catch (err: any) {
      console.error('Answer submission error:', err);
      throw err;
    }
  };

  // Load Results
  const loadResults = async (attemptId: string) => {
    try {
      await quizService.getAttemptResults(attemptId);
      setStatus('COMPLETED');
    } catch (err: any) {
      console.error('Failed to load quiz results:', err);
    }
  };

  return (
    <QuizContext.Provider
      value={{
        activeAttempt,
        status,
        mode,
        questions,
        currentQuestion,
        timeRemainingSec,
        loading,
        error,
        startQuiz,
        submitAnswer,
        loadResults,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { quizService } from '../services/quiz.service';
import type { QuizAttempt, QuestionStudentRead, QuizAttemptResultResponse } from '../types/quiz.types';
import axios from 'axios';

export type QuizStatus = 'IDLE' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
export type QuizMode = 'SEQUENTIAL' | 'BACKTRACKING' | null;

export interface QuizContextType {
  activeAttempt: QuizAttempt | null;
  status: QuizStatus;
  mode: QuizMode;
  questions: QuestionStudentRead[];
  currentQuestion: QuestionStudentRead | null;
  timeRemainingSec: number;
  loading: boolean;
  error: string | null;
  results: QuizAttemptResultResponse | null;
  startQuiz: (quizId: string) => Promise<void>;
  submitAnswer: (selectedOption: string, questionId?: string) => Promise<void>;
  loadResults: (attemptId: string) => Promise<void>;
  resetQuizState: () => void;
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
  const [results, setResults] = useState<QuizAttemptResultResponse | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isInitializingRef = useRef<string | null>(null);

  const resetQuizState = () => {
    setActiveAttempt(null);
    setStatus('IDLE');
    setMode(null);
    setQuestions([]);
    setCurrentQuestion(null);
    setTimeRemainingSec(0);
    setLoading(false);
    setError(null);
    setResults(null);
    isInitializingRef.current = null;
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const loadResults = async (attemptId: string) => {
    try {
      const resultData = await quizService.getAttemptResults(attemptId);
      setResults(resultData);
      setStatus('COMPLETED');
    } catch (err: unknown) {
      console.error('Failed to load quiz results:', err);
      setError('FAILED TO LOAD ASSESSMENT RESULTS');
    }
  };

  const advanceSequentialSlot = async (attemptId: string) => {
    try {
      const nextQData = await quizService.getCurrentQuestion(attemptId);
      setCurrentQuestion(nextQData.question);
      setTimeRemainingSec(Math.max(0, Math.floor(nextQData.time_remaining_sec)));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const httpStatus = err.response?.status;
        if (httpStatus === 404) {
          // GUARD: If currentQuestion is still null, this is initial load failure, NOT completion!
          if (!currentQuestion) {
            setError('THIS QUIZ CONTAINS NO QUESTIONS OR FAILED TO INITIALIZE STARTING SLOT.');
            setStatus('IDLE');
            return;
          }
          setStatus('COMPLETED');
          await loadResults(attemptId);
        } else if (httpStatus === 400) {
          setStatus('EXPIRED');
        } else {
          setError('CRITICAL TELEMETRY ERROR DURING QUESTION TRANSITION');
        }
      } else {
        setError('UNEXPECTED ERROR DURING QUESTION TRANSITION');
      }
    }
  };

  useEffect(() => {
    if (status !== 'IN_PROGRESS') return;

    timerRef.current = setInterval(() => {
      setTimeRemainingSec((prev) => {
        if (prev <= 1) {
          if (timerRef.current !== null) clearInterval(timerRef.current);

          if (mode === 'SEQUENTIAL' && activeAttempt) {
            void advanceSequentialSlot(activeAttempt.id);
            return 0;
          }

          if (mode === 'BACKTRACKING') {
            setStatus('EXPIRED');
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [status, mode, activeAttempt]);

  const startQuiz = async (quizId: string) => {
    if (isInitializingRef.current === quizId || (activeAttempt && activeAttempt.quiz_id === quizId && status === 'IN_PROGRESS')) {
      return;
    }

    isInitializingRef.current = quizId;
    setLoading(true);
    setError(null);

    try {
      const attempt = await quizService.startQuiz(quizId);
      setActiveAttempt(attempt);

      const normalizedStatus = (attempt.status || '').toLowerCase();

      if (normalizedStatus === 'completed') {
        setStatus('COMPLETED');
        await loadResults(attempt.id);
        return;
      }

      if (normalizedStatus === 'expired') {
        setStatus('EXPIRED');
        return;
      }

      try {
        const allQData = await quizService.getAllQuestions(attempt.id);
        setQuestions(allQData.questions);
        setTimeRemainingSec(Math.max(0, Math.floor(allQData.time_remaining_sec)));
        setMode('BACKTRACKING');
        setStatus('IN_PROGRESS');
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          setMode('SEQUENTIAL');
          await advanceSequentialSlot(attempt.id);
          setStatus('IN_PROGRESS');
        } else {
          throw err;
        }
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'FAILED TO INITIALIZE QUIZ ASSIGNMENT');
      } else {
        setError('FAILED TO INITIALIZE QUIZ ASSIGNMENT');
      }
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (selectedOption: string, questionId?: string) => {
    if (!activeAttempt) return;
    try {
      const targetQuestionId = questionId || currentQuestion?.id || '';
      await quizService.submitAnswer(activeAttempt.id, {
        question_id: targetQuestionId,
        selected_option_id: selectedOption,
      });

      if (mode === 'SEQUENTIAL') {
        await advanceSequentialSlot(activeAttempt.id);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setStatus('COMPLETED');
        await loadResults(activeAttempt.id);
      } else {
        throw err;
      }
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
        results,
        startQuiz,
        submitAnswer,
        loadResults,
        resetQuizState,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

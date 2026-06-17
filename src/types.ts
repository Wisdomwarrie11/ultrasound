/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface QuizTest {
  id: string;
  title: string;
  topic: string;
  description: string;
  scheduledDate: string; // ISO date-time or YYYY-MM-DD
  duration: number; // in minutes
  status: 'draft' | 'published';
  questionsCount: number;
  createdAt: string;
  publishedAt?: string;
  quizLink?: string;
}

export interface Question {
  id: string;
  testId: string;
  questionText: string;
  options: string[]; // exactly 4 items
  correctAnswer: number; // 0, 1, 2, or 3 representing index
  explanation: string;
}

export interface QuizResult {
  id: string;
  testId: string;
  testTitle: string;
  studentId: string;
  studentName: string;
  score: number; // e.g. 80 out of 100 or raw number
  totalQuestions: number;
  questionsAnswered: number;
  timeTaken: number; // in seconds
  submissionTime: string; // ISO string
}

export interface SystemNotification {
  id: string;
  text: string;
  timestamp: string;
  read: boolean;
  title?: string;
  body?: string;
  category?: 'announcement' | 'class' | 'presentation' | 'other';
  scheduledDate?: string;
  status?: 'draft' | 'published';
}

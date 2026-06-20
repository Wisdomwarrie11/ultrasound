/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, CheckCircle, Clock, Calendar, AlertTriangle, Play,
  ChevronRight, Award, ExternalLink, RefreshCw, Layers, Trophy 
} from 'lucide-react';
import { QuizTest, QuizResult, User, SystemNotification } from '../types';
import { FirebaseStore } from '../lib/firebase';
import LeaderboardView from './LeaderboardView';

interface StudentDashboardViewProps {
  currentUser: User;
  onStartQuiz: (testId: string) => void;
  onReviewResult: (result: QuizResult) => void;
}

export default function StudentDashboardView({ currentUser, onStartQuiz, onReviewResult }: StudentDashboardViewProps) {
  const [tests, setTests] = useState<QuizTest[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date('2026-06-17T09:09:42-07:00'));

  // Static Simulation date
  const TODAY_STR = '2026-06-17';

  useEffect(() => {
    // Load initial data
    fetchData();

    // Set up realtime updates listener
    const unsubscribe = FirebaseStore.subscribeToUpdates(() => {
      fetchData();
    });

    // Tick for Countdown timers
    const timer = setInterval(() => {
      setCurrentTime(prev => new Date(prev.getTime() + 1000));
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  const fetchData = () => {
    const allTests = FirebaseStore.getTests();
    const allResults = FirebaseStore.getResults();
    const studentResults = allResults.filter(r => r.studentId === currentUser.id);
    const notifs = FirebaseStore.getNotifications();

    setTests(allTests);
    setResults(studentResults);
    setNotifications(notifs);
  };

  // Logic to calculate countdown to next test
  const getNextTestCountdown = () => {
    // find published future tests
    const futureTests = tests
      .filter(t => t.status === 'published' && t.scheduledDate > TODAY_STR)
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

    if (futureTests.length === 0) return null;

    const nextTest = futureTests[0];
    const targetDate = new Date(`${nextTest.scheduledDate}T08:00:00`); // Assume scheduled at 8:00 AM
    const diffMs = targetDate.getTime() - currentTime.getTime();

    if (diffMs <= 0) return { test: nextTest, finished: true };

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return {
      test: nextTest,
      finished: false,
      countdownStr: `${hours}h ${minutes}m ${seconds}s`
    };
  };

  const nextTestInfo = getNextTestCountdown();

  // Helper to determine remaining time in the 1-day (24 hours) window since publication
  const getHoursLeft = (test: QuizTest) => {
    const pubTime = test.publishedAt ? new Date(test.publishedAt).getTime() : new Date(test.createdAt).getTime();
    const expiryTime = pubTime + 24 * 60 * 60 * 1000;
    const diffMs = expiryTime - currentTime.getTime();
    if (diffMs <= 0) return 'Expired';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${hours}h ${mins}m left`;
  };

  // Categorize Tests from perspective of student with 24-hours expiration
  // Pending Tests: Published, published less than 24h ago, and NOT completed by student
  const pendingTests = tests.filter(t => {
    const isPublished = t.status === 'published';
    if (!isPublished) return false;

    const pubTime = t.publishedAt ? new Date(t.publishedAt).getTime() : new Date(t.createdAt).getTime();
    const isWithin24h = (currentTime.getTime() - pubTime) <= 24 * 60 * 60 * 1000;
    const isCompleted = results.some(r => r.testId === t.id);
    
    // Check if it matches today or any published category within 24h limit
    return isWithin24h && !isCompleted;
  });

  // Locked Tests: Published, scheduled for future
  const lockedTests = tests.filter(t => {
    const isPublished = t.status === 'published';
    const isFuture = t.scheduledDate > TODAY_STR;
    return isPublished && isFuture;
  });

  // Missed/Past Quiz: Published, but published more than 24h ago and not completed
  const missedTests = tests.filter(t => {
    const isPublished = t.status === 'published';
    if (!isPublished) return false;

    const pubTime = t.publishedAt ? new Date(t.publishedAt).getTime() : new Date(t.createdAt).getTime();
    const isAfter24h = (currentTime.getTime() - pubTime) > 24 * 60 * 60 * 1000;
    const isCompleted = results.some(r => r.testId === t.id);

    return isAfter24h && !isCompleted;
  });

  // Completed Quiz Results
  const completedResults = results;

  return (
    <div className="space-y-8">
      {/* Welcome Hero & Streak */}
      <div className="bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-950 border border-blue-500/20 rounded-3xl text-white p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-blue-600/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider font-mono">Student Portal</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
              Welcome back, {currentUser.name}!
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Sharpen your ultrasound skills. Let's see if you can become today's master Sononaire!
            </p>
          </div>
        </div>
      </div>

      {/* Countdown Announcement for Locked Quiz */}
      {nextTestInfo && !nextTestInfo.finished && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-xl shrink-0 border border-yellow-500/10">
              <Clock className="w-5 h-5" style={{ animation: 'spin 10s linear infinite' }} />
            </div>
            <div>
              <p className="text-xs text-yellow-500 uppercase tracking-wider font-bold font-mono">Upcoming Challenge</p>
              <h4 className="text-sm font-bold text-slate-100 mt-0.5">
                {nextTestInfo.test.title} ({nextTestInfo.test.topic})
              </h4>
            </div>
          </div>
          <div className="px-5 py-2.5 bg-yellow-500 text-slate-950 rounded-xl font-mono text-sm font-bold shadow-md shadow-yellow-500/10 shrink-0">
            Next test in: {nextTestInfo.countdownStr}
          </div>
        </div>
      )}

      {/* Real-Time Bulletin Board displaying live Admin posts */}
      {notifications.filter(n => (n as any).status !== 'draft').length > 0 && (
        <div id="studi-bulletin" className="bg-[#1E293B] border border-slate-700 rounded-3xl p-6 space-y-4 animate-fade-in shadow-inner">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                📢 Academy Notice Board
              </h3>
              <p className="text-xs text-slate-400">Latest announcements, class updates, and schedules.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notifications
              .filter(n => (n as any).status !== 'draft')
              .slice(0, 6)
              .map(n => {
                let badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                if ((n as any).category === 'class') badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                else if ((n as any).category === 'presentation') badgeColor = 'bg-teal-500/10 text-teal-400 border-teal-500/20';
                else if ((n as any).category === 'other') badgeColor = 'bg-slate-500/10 text-slate-400 border-slate-500/20';

                return (
                  <div key={n.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col justify-between gap-3 hover:border-slate-750 hover:bg-slate-900/60 transition-all duration-150">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase font-mono ${badgeColor}`}>
                          {(n as any).category || 'Announcement'}
                        </span>
                        {(n as any).scheduledDate && (
                          <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {(n as any).scheduledDate}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 font-display">{(n as any).title || 'Alert Notice'}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">{(n as any).body || n.text}</p>
                    </div>

                    <span className="text-[9px] text-slate-500 block text-right font-mono border-t border-slate-800/60 pt-2">
                      Posted: {new Date(n.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Grid of Pending Tests & Completed results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column (2 cols in desktop): Test panels */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section: Pending Tests (Scheduled for Today) */}
          <div className="bg-[#1E293B] rounded-3xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                  <span className="flex h-3 w-3 rounded-full bg-blue-500" />
                  Active Quizzes (Available Today)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">These quizzes are open only on their scheduled dates.</p>
              </div>
              <span className="text-xs font-mono font-medium text-slate-350 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
                Date: {TODAY_STR}
              </span>
            </div>

            {pendingTests.length === 0 ? (
              <div className="text-center py-10 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-emerald-450 mx-auto mb-2" />
                <p className="text-slate-200 text-sm font-semibold">You are all caught up!</p>
                <p className="text-slate-500 text-xs mt-1">No active tests scheduled for today remain unanswered.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTests.map(test => (
                  <div 
                    key={test.id} 
                    id={`pending-test-${test.id}`}
                    className="group border border-slate-800 hover:border-blue-500/30 hover:bg-slate-900/20 rounded-xl p-5 transition-all duration-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] uppercase font-bold tracking-wider rounded font-mono">
                          {test.topic}
                        </span>
                        <span className="text-xs font-medium text-slate-350 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {test.duration} mins
                        </span>
                        <span className="text-xs font-medium text-slate-350 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-[10px] font-mono">
                          • {test.questionsCount} questions
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/25 font-bold font-mono animate-pulse shrink-0">
                          {getHoursLeft(test)}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors font-display">
                        {test.title}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-xl">
                        {test.description}
                      </p>
                    </div>

                    {(test as any).quizLink ? (
                      <a
                        href={(test as any).quizLink}
                        target="_blank"
                        rel="noreferrer referrer"
                        id={`external-quiz-link-${test.id}`}
                        className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-blue-500/15 text-center decoration-transparent"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Launch Shared Link</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => onStartQuiz(test.id)}
                        id={`start-quiz-btn-${test.id}`}
                        className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-blue-500/15"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Start Quiz</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Locked Futures & Past Missed */}
          <div className="bg-[#1E293B] rounded-3xl border border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-display">
              <Calendar className="w-5 h-5 text-slate-400" />
              Upcoming & Expired Quizzes
            </h3>
            
            <div className="space-y-3">
              {/* Missed / Expired Tests */}
              {missedTests.map(test => (
                <div key={test.id} className="flex justify-between items-center p-4 bg-rose-950/20 border border-rose-900/30 rounded-xl">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 font-mono">Missed Quiz</span>
                    <h5 className="text-sm font-bold text-white font-display">{test.title}</h5>
                    <p className="text-xs text-slate-450 mt-0.5">Scheduled on {test.scheduledDate} (Unanswered)</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-950/40 text-rose-450 border border-rose-900/40 rounded-lg text-xs font-semibold font-mono">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Expired
                  </span>
                </div>
              ))}

              {/* Locked Future Tests */}
              {lockedTests.map(test => (
                <div key={test.id} className="flex justify-between items-center p-4 bg-slate-900/40 border border-slate-800 rounded-xl opacity-85">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono font-bold">Scheduled Quiz</span>
                    <h5 className="text-sm font-bold text-slate-205 font-display">{test.title}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">Launches on {test.scheduledDate}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-lg text-xs font-bold font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    Locked
                  </span>
                </div>
              ))}

              {missedTests.length === 0 && lockedTests.length === 0 && (
                <p className="text-center py-6 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl font-mono">
                  No other scheduled or expired quizzes pending.
                </p>
              )}
            </div>
          </div>

          {/* Section: Completed Tests & Detailed Scores */}
          <div className="bg-[#1E293B] rounded-3xl border border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-display">
              <CheckCircle className="w-5 h-5 text-emerald-450" />
              Completed Quizzes
            </h3>

            {completedResults.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm font-mono border border-dashed border-slate-800 rounded-xl">
                You haven't completed any quizzes yet. Take an active test to view your scores here!
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {completedResults.map(res => {
                  const percentage = res.totalQuestions > 0 ? Math.round((res.score / res.totalQuestions) * 100) : 0;
                  let scoreBadgeColor = 'bg-rose-950/40 text-rose-300 border-rose-900/40';
                  if (percentage >= 80) scoreBadgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                  else if (percentage >= 60) scoreBadgeColor = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';

                  return (
                    <div key={res.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white font-display">{res.testTitle}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                            {Math.floor(res.timeTaken / 60)}m {res.timeTaken % 60}s taken
                          </span>
                          <span>•</span>
                          <span>Passed: {res.score} / {res.totalQuestions} questions</span>
                          <span>•</span>
                          <span>Submitted: {new Date(res.submissionTime).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className={`px-3 py-1.5 border rounded-xl font-bold text-xs ${scoreBadgeColor} font-mono`}>
                          {percentage}% Score
                        </span>
                        <button
                          onClick={() => onReviewResult(res)}
                          className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <span>Review</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: System Stats, Info Cards, Notifications */}
        <div className="space-y-8">
          
          {/* Sononaire Challenge Trophy Badge */}
          <div className="bg-gradient-to-br from-amber-500/90 to-orange-600 rounded-3xl text-white p-6 shadow-xl relative overflow-hidden border border-amber-500/20">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <Trophy className="w-12 h-12 text-amber-200 animate-bounce mb-3" />
            <h4 className="text-lg font-bold font-display">The Sononaire Status</h4>
            <p className="text-amber-100 text-xs mt-1">
              Score a perfect 100% on any quiz within 3 minutes to unlock the prestigious <strong>Master Sononaire</strong> badge and top the leaderboard!
            </p>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-amber-100 font-mono">
              <span>My Quizzes: {completedResults.length}</span>
              <span>Avg Score: {
                completedResults.length > 0 
                  ? Math.round(completedResults.reduce((acc, c) => acc + (c.score / c.totalQuestions), 0) / completedResults.length * 100)
                  : 0
              }%</span>
            </div>
          </div>

          {/* Quick Notifications Tray */}
          <div className="bg-[#1E293B] rounded-3xl border border-slate-700 p-5">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-display tracking-wide uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                🔔 System Updates
              </h4>
              <button 
                onClick={() => {
                  FirebaseStore.markAllNotificationsRead();
                  fetchData();
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold font-mono cursor-pointer"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {notifications.map(n => (
                <div key={n.id} className={`p-3 rounded-xl border transition-colors ${n.read ? 'bg-slate-900/40 border-slate-800/80 text-slate-400' : 'bg-blue-600/10 border-blue-500/15 text-slate-200'}`}>
                  <p className="text-xs font-medium leading-relaxed">{n.text}</p>
                  <span className="block text-[10px] text-slate-500 mt-1 font-mono">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Global Leaderboard Panel included in Portal */}
      <LeaderboardView results={FirebaseStore.getResults()} />
    </div>
  );
}

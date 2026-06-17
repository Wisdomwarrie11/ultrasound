/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { 
  Plus, Edit2, Trash2, CheckCircle, ChevronDown, Save, 
  FileText, Calendar, Users, List, Play, BookOpen, AlertCircle, RefreshCw, Trophy
} from 'lucide-react';
import { QuizTest, Question, QuizResult, User } from '../types';
import { FirebaseStore } from '../lib/firebase';

interface AdminDashboardViewProps {
  currentUser: User;
}

export default function AdminDashboardView({ currentUser }: AdminDashboardViewProps) {
  // Lists
  const [tests, setTests] = useState<QuizTest[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);

  // Selection states
  const [activeTab, setActiveTab] = useState<'tests' | 'results' | 'announcements'>('tests');
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  // Form states for Test CRUD
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [testTitle, setTestTitle] = useState('');
  const [testTopic, setTestTopic] = useState('Physics');
  const [testDescription, setTestDescription] = useState('');
  const [testScheduledDate, setTestScheduledDate] = useState('2026-06-17');
  const [testDuration, setTestDuration] = useState(10);
  const [testStatus, setTestStatus] = useState<'draft' | 'published'>('draft');
  const [testQuizLink, setTestQuizLink] = useState('');

  // Form states for Question CRUD
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState<string[]>(['', '', '', '']);
  const [qCorrectIndex, setQCorrectIndex] = useState<number>(0);
  const [qExplanation, setQExplanation] = useState('');

  // Announcement/Event Management states
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const [editingAnnounceId, setEditingAnnounceId] = useState<string | null>(null);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceBody, setAnnounceBody] = useState('');
  const [announceCategory, setAnnounceCategory] = useState<'announcement' | 'class' | 'presentation' | 'other'>('announcement');
  const [announceScheduledDate, setAnnounceScheduledDate] = useState('2026-06-17');
  const [announceStatus, setAnnounceStatus] = useState<'draft' | 'published'>('published');

  // Fetch lists
  useEffect(() => {
    fetchData();
    const unsubscribe = FirebaseStore.subscribeToUpdates(() => {
      fetchData();
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const fetchData = () => {
    setTests(FirebaseStore.getTests());
    setResults(FirebaseStore.getResults());
    setAllQuestions(FirebaseStore.getQuestions());
    setAnnouncements(FirebaseStore.getNotifications());
  };

  // Test handlers
  const handleOpenTestModal = (test?: QuizTest) => {
    if (test) {
      setEditingTestId(test.id);
      setTestTitle(test.title);
      setTestTopic(test.topic);
      setTestDescription(test.description);
      setTestScheduledDate(test.scheduledDate);
      setTestDuration(test.duration);
      setTestStatus(test.status);
      setTestQuizLink((test as any).quizLink || '');
    } else {
      setEditingTestId(null);
      setTestTitle('');
      setTestTopic('Physics');
      setTestDescription('');
      setTestScheduledDate('2026-06-17');
      setTestDuration(10);
      setTestStatus('draft');
      setTestQuizLink('');
    }
    setIsTestModalOpen(true);
  };

  const handleSaveTest = (e: FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim()) return;

    const saved = FirebaseStore.saveTest({
      id: editingTestId || undefined,
      title: testTitle.trim(),
      topic: testTopic,
      description: testDescription.trim(),
      scheduledDate: testScheduledDate,
      duration: Number(testDuration),
      status: testStatus,
      quizLink: testQuizLink.trim(),
      questionsCount: editingTestId 
        ? allQuestions.filter(q => q.testId === editingTestId).length
        : 0
    } as any);

    if (!editingTestId && testStatus === 'published') {
      // Create new notification for published tests
      FirebaseStore.addNotification(`Dr. Robert Stone published [${saved.title}]. Start testing!`);
    } else if (editingTestId && testStatus === 'published') {
      const oldStatus = tests.find(t => t.id === editingTestId)?.status;
      if (oldStatus === 'draft') {
        FirebaseStore.addNotification(`Dr. Robert Stone published [${saved.title}]. Start testing!`);
      }
    }

    setIsTestModalOpen(false);
    fetchData();
  };

  const handleDeleteTest = (id: string) => {
    if (window.confirm('Are you absolutely sure you want to delete this test? All questions and student scores submitted for this test will be permanently deleted.')) {
      FirebaseStore.deleteTest(id);
      if (selectedTestId === id) {
        setSelectedTestId(null);
      }
      fetchData();
    }
  };

  // Question handlers
  const handleOpenQuestionModal = (q?: Question) => {
    if (!selectedTestId) return;

    if (q) {
      setEditingQuestionId(q.id);
      setQText(q.questionText);
      setQOptions([...q.options]);
      setQCorrectIndex(q.correctAnswer);
      setQExplanation(q.explanation);
    } else {
      setEditingQuestionId(null);
      setQText('');
      setQOptions(['', '', '', '']);
      setQCorrectIndex(0);
      setQExplanation('');
    }
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTestId || !qText.trim()) return;
    if (qOptions.some(opt => !opt.trim())) {
      alert('All four options must be filled out.');
      return;
    }

    FirebaseStore.saveQuestion({
      id: editingQuestionId || undefined,
      testId: selectedTestId,
      questionText: qText.trim(),
      options: qOptions.map(o => o.trim()),
      correctAnswer: qCorrectIndex,
      explanation: qExplanation.trim()
    });

    setIsQuestionModalOpen(false);
    fetchData();
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!selectedTestId) return;
    if (window.confirm('Do you want to delete this question?')) {
      FirebaseStore.deleteQuestion(qId, selectedTestId);
      fetchData();
    }
  };

  // Switch publish status directly from list
  const togglePublishStatus = (test: QuizTest) => {
    const nextStatus = test.status === 'draft' ? 'published' : 'draft';
    FirebaseStore.saveTest({
      ...test,
      status: nextStatus
    });
    if (nextStatus === 'published') {
      FirebaseStore.addNotification(`Dr. Robert Stone published [${test.title}]. Go complete it now!`);
    }
    fetchData();
  };

  // Announcement event handlers
  const handleOpenAnnounceModal = (notif?: any) => {
    if (notif) {
      setEditingAnnounceId(notif.id);
      setAnnounceTitle(notif.title || '');
      setAnnounceBody(notif.body || notif.text || '');
      setAnnounceCategory(notif.category || 'announcement');
      setAnnounceScheduledDate(notif.scheduledDate || '');
      setAnnounceStatus(notif.status || 'published');
    } else {
      setEditingAnnounceId(null);
      setAnnounceTitle('');
      setAnnounceBody('');
      setAnnounceCategory('announcement');
      setAnnounceScheduledDate('2026-06-17');
      setAnnounceStatus('published');
    }
    setIsAnnounceModalOpen(true);
  };

  const handleSaveAnnounce = (e: FormEvent) => {
    e.preventDefault();
    if (!announceTitle.trim() || !announceBody.trim()) return;

    FirebaseStore.saveNotificationFirebase({
      id: editingAnnounceId || undefined,
      title: announceTitle.trim(),
      body: announceBody.trim(),
      category: announceCategory,
      scheduledDate: announceScheduledDate,
      status: announceStatus
    }).catch(err => console.error("Error saving announcement:", err));

    setIsAnnounceModalOpen(false);
    fetchData();
  };

  const handleDeleteAnnounce = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this announcement / post from all dashboards?')) {
      FirebaseStore.deleteNotificationFirebase(id).catch(err => console.error("Error deleting announcement:", err));
      fetchData();
    }
  };

  const activeTest = tests.find(t => t.id === selectedTestId);
  const activeTestQuestions = selectedTestId 
    ? allQuestions.filter(q => q.testId === selectedTestId)
    : [];

  return (
    <div className="space-y-8">
      {/* Admin header */}
      <div className="bg-slate-900 rounded-3xl text-white p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl border border-slate-800 animate-fade-in">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
            System Administrator (Real-Time Control)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 text-white font-display">
            Academy Control Center
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl font-sans">
            Oversee, compose and authorize computer-based scanning evaluations for custom diagnostic groups.
          </p>
        </div>

        <button
          onClick={() => handleOpenTestModal()}
          id="create-test-btn"
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all duration-150 hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Test Specification</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-800">
        <button
          onClick={() => { setActiveTab('tests'); setSelectedTestId(null); }}
          className={`px-5 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer font-display ${activeTab === 'tests' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <FileText className="w-4 h-4" />
          <span>Evaluation Manager</span>
        </button>
        <button
          onClick={() => { setActiveTab('results'); setSelectedTestId(null); }}
          className={`px-5 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer font-display ${activeTab === 'results' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Users className="w-4 h-4" />
          <span>Real-time Submissions ({results.length})</span>
        </button>
        <button
          onClick={() => { setActiveTab('announcements'); setSelectedTestId(null); }}
          className={`px-5 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer font-display ${activeTab === 'announcements' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Calendar className="w-4 h-4" />
          <span>Announcements & Schedules ({announcements.length})</span>
        </button>
      </div>

      {activeTab === 'tests' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* List of tests (col span 5) */}
          <div className="lg:col-span-5 bg-[#1E293B] rounded-3xl border border-slate-700 p-5 space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 font-display">
              Diagnostic Evaluations
            </h3>

            {tests.length === 0 ? (
              <p className="text-sm text-slate-550 py-6 text-center font-mono">No tests defined. Create one to start.</p>
            ) : (
              <div className="divide-y divide-slate-800 max-h-[600px] overflow-y-auto pr-1">
                {tests.map(test => {
                  const isSelected = selectedTestId === test.id;
                  const isPublished = test.status === 'published';

                  return (
                    <div 
                      key={test.id} 
                      className={`p-4 hover:bg-slate-900/35 transition-all rounded-xl relative cursor-pointer group mt-1.5 first:mt-0 ${isSelected ? 'bg-blue-600/10 border border-blue-500/20 shadow-lg' : 'border border-slate-800 bg-slate-900/10'}`}
                      onClick={() => setSelectedTestId(test.id)}
                    >
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 bg-slate-950 text-slate-400 text-[9px] uppercase font-bold tracking-wider rounded font-mono border border-slate-850">
                          {test.topic}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {/* Publish toggle badge */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePublishStatus(test);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${isPublished ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 hover:bg-emerald-900/20' : 'bg-amber-950/40 text-amber-500 border border-amber-900/30 hover:bg-amber-900/20'}`}
                            title="Click to toggle status"
                          >
                            {isPublished ? 'Published' : 'Draft'}
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-white mt-1.5 text-sm font-display">
                        {test.title}
                      </h4>
                      <p className="text-slate-400 text-xs line-clamp-2 mt-0.5 font-sans">
                        {test.description}
                      </p>

                      <div className="flex items-center gap-x-3 text-[11px] font-mono text-slate-500 mt-3 pt-3 border-t border-slate-800">
                        <span>Duration: {test.duration}m</span>
                        <span>•</span>
                        <span>Questions: {test.questionsCount}</span>
                        <span>•</span>
                        <span>Date: {test.scheduledDate}</span>
                      </div>

                      {/* Tool Actions */}
                      <div className="absolute right-4 top-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenTestModal(test);
                          }}
                          className="p-1.5 bg-slate-805 bg-slate-800 text-slate-200 border border-slate-700 rounded hover:bg-slate-700 cursor-pointer shadow-sm"
                          title="Edit Specification"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTest(test.id);
                          }}
                          className="p-1.5 bg-slate-800 text-slate-400 border border-slate-700 rounded hover:bg-rose-950/45 hover:text-rose-400 cursor-pointer shadow-sm"
                          title="Delete Spec"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* List of questions under selected test (col span 7) */}
          <div className="lg:col-span-7 bg-[#1E293B] rounded-3xl border border-slate-700 p-5">
            {!selectedTestId ? (
              <div className="h-full flex flex-col justify-center items-center text-center py-16">
                <FileText className="w-12 h-12 text-slate-650 mb-2" />
                <h4 className="text-base font-bold text-slate-205 text-white font-display">Select an Evaluation Scheme</h4>
                <p className="text-slate-400 text-sm max-w-sm mt-1 font-sans">
                  Click on one of the diagnostics listed on the left to verify, compose, or edit its interactive MCQ bank pool.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      📝 {activeTest?.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">MCQ Bank Pool: {activeTestQuestions.length} Questions</p>
                  </div>

                  <button
                    onClick={() => handleOpenQuestionModal()}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-blue-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add MCQ Question</span>
                  </button>
                </div>

                {activeTestQuestions.length === 0 ? (
                  <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                    <List className="w-8 h-8 text-slate-655 mx-auto mb-2" />
                    <p className="text-slate-205 text-white font-bold text-sm">MCQ Pool Empty</p>
                    <p className="text-slate-400 text-xs mt-1 font-sans">Add multiple-choice items with precise diagnostic option vectors and keys.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                    {activeTestQuestions.map((q, qIndex) => (
                      <div key={q.id} className="p-4 bg-slate-900/45 hover:bg-slate-900/65 border border-slate-800 rounded-2xl space-y-3 relative group">
                        <div className="flex justify-between items-start pr-12">
                          <span className="font-bold text-xs font-mono text-slate-450 uppercase">
                            Question #{qIndex + 1}
                          </span>
                        </div>

                        <p className="font-bold text-white text-sm font-display">
                          {q.questionText}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = optIdx === q.correctAnswer;
                            return (
                              <div 
                                key={optIdx} 
                                className={`p-2 rounded-lg border flex items-center gap-2 ${isCorrect ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-400 font-bold' : 'bg-slate-900/40 border-slate-800 text-slate-300'}`}
                              >
                                <span className={`flex h-5 w-5 rounded-full items-center justify-center text-[10px] font-bold shrink-0 ${isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="truncate">{opt}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="pt-2 border-t border-slate-800 text-slate-300 text-xs">
                          <span className="font-semibold text-emerald-400 font-bold font-mono font-sans">Explanation: </span>
                          <span className="text-slate-400 font-sans font-normal leading-relaxed">{q.explanation}</span>
                        </div>

                        {/* Inline controls */}
                        <div className="absolute right-4 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={() => handleOpenQuestionModal(q)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-200 rounded-lg cursor-pointer shadow-sm"
                            title="Edit Question"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-950/45 border border-slate-750 hover:text-rose-400 text-slate-400 rounded-lg cursor-pointer shadow-sm"
                            title="Delete Question"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'results' && (
        <div className="bg-[#1E293B] rounded-3xl border border-slate-700 p-6 shadow-xl animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                📊 Real-Time Candidate Scoring Log
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">Real-time compilation of sonographer evaluations. Access and monitor metrics instantly.</p>
            </div>
            
            <button
              onClick={fetchData}
              className="p-2 border border-slate-700 rounded-xl hover:bg-slate-800 bg-slate-900/40 transition-colors text-slate-300 flex items-center justify-center cursor-pointer"
              title="Refresh logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm font-mono">
              No quiz submission logs recorded in the database yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-500 tracking-wider font-mono">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Evaluation Test</th>
                    <th className="py-3 px-4 text-center">Questions Checked</th>
                    <th className="py-3 px-4 text-center">Score Grade</th>
                    <th className="py-3 px-4 text-center">Duration</th>
                    <th className="py-3 px-4 text-right">Completion Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {results.slice().sort((a,b) => b.submissionTime.localeCompare(a.submissionTime)).map(r => {
                    const pct = r.totalQuestions > 0 ? Math.round((r.score / r.totalQuestions) * 100) : 0;
                    let pctStyle = 'text-rose-400 bg-rose-950/30 border border-rose-900/30';
                    if (pct >= 80) pctStyle = 'text-emerald-400 bg-emerald-950/30 border border-emerald-900/30';
                    else if (pct >= 60) pctStyle = 'text-amber-400 bg-amber-950/30 border border-amber-900/30';

                    return (
                      <tr key={r.id} className="hover:bg-slate-900/30 transition-all font-sans">
                        <td className="py-3.5 px-4 font-bold text-white">
                          {r.studentName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-medium max-w-xs truncate">
                          {r.testTitle}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-xs">
                          {r.questionsAnswered} / {r.totalQuestions}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${pctStyle}`}>
                            {pct}% ({r.score}/{r.totalQuestions})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-400">
                          {Math.floor(r.timeTaken / 60)}m {r.timeTaken % 60}s
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-500">
                          {new Date(r.submissionTime).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="bg-[#1E293B] rounded-3xl border border-slate-700 p-6 shadow-xl animate-fade-in space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                📢 Announcements & Educational Schedule Manager
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">Publish custom posts, upcoming presentation notifications, or schedule classes in real-time.</p>
            </div>
            
            <button
              onClick={() => handleOpenAnnounceModal()}
              id="create-announce-btn"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-500/25 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Announcement</span>
            </button>
          </div>

          {announcements.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm font-mono border border-dashed border-slate-800 rounded-2xl">
              No current published posts or active schedule events found in Firestore.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.map((item: any) => {
                let badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                if (item.category === 'class') badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                else if (item.category === 'presentation') badgeColor = 'bg-teal-500/10 text-teal-400 border-teal-500/20';
                else if (item.category === 'other') badgeColor = 'bg-slate-500/10 text-slate-400 border-slate-500/20';

                const isDraft = item.status === 'draft';

                return (
                  <div key={item.id} className="p-5 bg-slate-900/40 border border-slate-800 hover:border-slate-700 rounded-2xl flex flex-col justify-between gap-4 relative group transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono uppercase ${badgeColor}`}>
                          {item.category || 'announcement'}
                        </span>
                        {isDraft && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-mono uppercase">
                            DRAFT
                          </span>
                        )}
                        {item.scheduledDate && (
                          <span className="text-slate-450 text-[10px] font-mono flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Scheduled: {item.scheduledDate}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-white font-display">
                        {item.title || 'Notice'}
                      </h4>
                      <p className="text-slate-400 text-xs font-sans leading-relaxed">
                        {item.body || item.text}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                      <span>Ref: {item.id}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenAnnounceModal(item)}
                          className="px-2.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750 hover:border-slate-600 rounded-lg cursor-pointer text-[10px] font-semibold flex items-center gap-1 transition-all"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteAnnounce(item.id)}
                          className="px-2 py-1.5 bg-slate-850 hover:bg-rose-950/45 text-slate-400 hover:text-rose-400 border border-slate-750 hover:border-rose-900 rounded-lg cursor-pointer text-[10px] font-semibold flex items-center gap-1 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Test Creation/Edit Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-150 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">
                {editingTestId ? '⚙️ Edit Test Specifications' : '✨ Define New Test Evaluation'}
              </h3>
              <button 
                onClick={() => setIsTestModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Test Title</label>
                  <input
                    type="text"
                    required
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    placeholder="e.g. Sonographic Physics Diagnostics"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Topic Classification</label>
                  <select
                    value={testTopic}
                    onChange={(e) => setTestTopic(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 outline-none bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                  >
                    <option value="Physics">Acoustic Physics</option>
                    <option value="Abdominal / Vascular">Abdominal / Vascular</option>
                    <option value="OB/GYN">OB/GYN Pathology</option>
                    <option value="MSK">Musculoskeletal (MSK)</option>
                    <option value="General">General Sonography</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    required
                    value={testDuration}
                    onChange={(e) => setTestDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={testScheduledDate}
                    onChange={(e) => setTestScheduledDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Authorization Status</label>
                  <select
                    value={testStatus}
                    onChange={(e) => setTestStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 outline-none bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 text-slate-950"
                  >
                    <option value="draft">Draft Specification</option>
                    <option value="published">Authorize/Publish immediately</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Quiz External Live Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={testQuizLink}
                    onChange={(e) => setTestQuizLink(e.target.value)}
                    placeholder="https://docs.google.com/forms/d/e/... (Share a quiz directly via web link)"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 text-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    If this link is provided, student candidates will access this shared external resource instead of taking the local multiple-choice form.
                  </p>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Instructions / Description</label>
                  <textarea
                    rows={3}
                    value={testDescription}
                    onChange={(e) => setTestDescription(e.target.value)}
                    placeholder="Enter short description about evaluation metrics, materials, or goals."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 border border-slate-250 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Specs</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Creation/Edit Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-150 max-w-xl w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">
                {editingQuestionId ? '⚙️ Edit MCQ Question Item' : '✨ Add Multiple-Choice Question'}
              </h3>
              <button 
                onClick={() => setIsQuestionModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Question Prompt Text</label>
                <textarea
                  required
                  rows={2}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Enter diagnostic question statement or finders prompt..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                />
              </div>

              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-700 uppercase">MCQ Response Options Vector</label>
                
                {qOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-slate-500 w-6">
                      ({String.fromCharCode(65 + idx)})
                    </span>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => {
                        const copy = [...qOptions];
                        copy[idx] = e.target.value;
                        setQOptions(copy);
                      }}
                      placeholder={`Enter choice ${String.fromCharCode(65 + idx)}`}
                      className="flex-1 px-3 py-1.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                    />
                    <input
                      type="radio"
                      name="correctAnswerOption"
                      checked={qCorrectIndex === idx}
                      onChange={() => setQCorrectIndex(idx)}
                      className="cursor-pointer h-4 w-4 text-teal-600 focus:ring-teal-500 shrink-0"
                      title="Set as correct choice"
                    />
                  </div>
                ))}
                <p className="text-[10px] text-slate-400 italic text-right">* Check the radio selector of the correct answer above.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Explanatory Diagnostic Rationale</label>
                <textarea
                  rows={2}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Provide immediate reasoning explaining why the checked response is standardly correct."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 border border-slate-250 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Question</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement/Post Creation & Edit Modal */}
      {isAnnounceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-150 max-w-lg w-full overflow-hidden text-slate-800">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-base font-display">
                {editingAnnounceId ? '📐 Edit Published Post / Event' : '📢 Compose New Announcement / Schedule'}
              </h3>
              <button 
                onClick={() => setIsAnnounceModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAnnounce} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Post Title / Subject</label>
                <input
                  type="text"
                  required
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  placeholder="e.g. Vascular Scanning Practical, Diagnostic Lecture"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 outline-none text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Event Category</label>
                  <select
                    value={announceCategory}
                    onChange={(e) => setAnnounceCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 outline-none bg-white text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                  >
                    <option value="announcement">Announcement Notice</option>
                    <option value="class">Upcoming Session/Class</option>
                    <option value="presentation">Student Presentation</option>
                    <option value="other">General Resource</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={announceScheduledDate}
                    onChange={(e) => setAnnounceScheduledDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 outline-none text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Authorization Status</label>
                <select
                  value={announceStatus}
                  onChange={(e) => setAnnounceStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 outline-none bg-white text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                >
                  <option value="draft">Draft Notice</option>
                  <option value="published">Publish to Dashboards immediately</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description / Post Body</label>
                <textarea
                  required
                  rows={4}
                  value={announceBody}
                  onChange={(e) => setAnnounceBody(e.target.value)}
                  placeholder="Enter detailed notice content, timing details, or hyperlinks..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-100 outline-none text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsAnnounceModalOpen(false)}
                  className="px-4 py-2 border border-slate-250 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Publish Announcement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

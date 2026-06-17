/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Clock, AlertTriangle, ChevronRight, ChevronLeft, 
  Check, X, Award, RotateCcw, HelpCircle, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { QuizTest, Question, QuizResult, User } from '../types';
import { FirebaseStore } from '../lib/firebase';

interface QuizRunnerViewProps {
  currentUser: User;
  testId: string;
  onFinished: () => void;
}

export default function QuizRunnerView({ currentUser, testId, onFinished }: QuizRunnerViewProps) {
  const [test, setTest] = useState<QuizTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Quiz running progress state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({}); // qId: selectedOptionIdx
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds (default fallback)
  const [quizState, setQuizState] = useState<'intro' | 'running' | 'submitted'>('intro');
  const [timeTaken, setTimeTaken] = useState(0);

  // Score metrics
  const [finalResult, setFinalResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    // Locate specific test specifications
    const allTests = FirebaseStore.getTests();
    const matched = allTests.find(t => t.id === testId);
    if (matched) {
      setTest(matched);
      setTimeLeft(matched.duration * 60);
    }

    const testQs = FirebaseStore.getQuestionsForTest(testId);
    setQuestions(testQs);
  }, [testId]);

  // Live timer tick
  useEffect(() => {
    if (quizState !== 'running') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTimeTaken(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState]);

  const handleStartQuiz = () => {
    if (questions.length === 0) {
      alert("This test doesn't contain any questions yet. Please inform your instructor!");
      return;
    }
    setQuizState('running');
  };

  const selectOption = (optIndex: number) => {
    const qId = questions[currentQuestionIndex].id;
    setAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Check if the student missed any options
    const unselectedCount = questions.length - Object.keys(answers).length;
    let confirmMsg = 'Are you sure you want to finalize and submit this evaluation?';
    if (unselectedCount > 0) {
      confirmMsg = `You have left ${unselectedCount} questions blank! Do you still want to finalize and submit this evaluation?`;
    }

    if (window.confirm(confirmMsg)) {
      evaluateScoreAndSave();
    }
  };

  const handleAutoSubmit = () => {
    alert("Time is up! Your score has been automatically compiled and saved.");
    evaluateScoreAndSave();
  };

  const evaluateScoreAndSave = () => {
    if (!test) return;

    let correctCount = 0;
    questions.forEach(q => {
      const selected = answers[q.id];
      if (selected !== undefined && selected === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const studentResultInfo: Omit<QuizResult, 'id'> = {
      testId: test.id,
      testTitle: test.title,
      studentId: currentUser.id,
      studentName: currentUser.name,
      score: correctCount,
      totalQuestions: questions.length,
      questionsAnswered: Object.keys(answers).length,
      timeTaken: timeTaken,
      submissionTime: new Date().toISOString()
    };

    const savedResult = FirebaseStore.saveResult(studentResultInfo);
    setFinalResult(savedResult);
    setQuizState('submitted');
  };

  const handleClose = () => {
    onFinished();
  };

  if (!test) {
    return (
      <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl">
        <p className="text-slate-400 font-bold font-mono">Loading evaluation metadata...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOptionForCurrent = currentQuestion ? answers[currentQuestion.id] : undefined;

  // Formatting minutes/seconds
  const mm = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const ss = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Quiz Intro View */}
      {quizState === 'intro' && (
        <div className="bg-[#1E293B] rounded-3xl border border-slate-700 shadow-xl overflow-hidden animate-fade-in">
          <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-[#0F172A] to-slate-950 text-white relative border-b border-slate-800">
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
            <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20 font-mono">
              {test.topic} Evaluation
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-3 text-white font-display">
              {test.title}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl font-sans leading-relaxed">
              {test.description}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Evaluation Period</p>
                  <p className="text-sm font-bold text-white font-display">{test.duration} Minutes</p>
                </div>
              </div>

              <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-blue-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-505 text-slate-500 font-bold uppercase tracking-wider font-mono">Total Questions</p>
                  <p className="text-sm font-bold text-white font-display">{questions.length} MCQs</p>
                </div>
              </div>

              <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                <Award className="w-6 h-6 text-blue-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Challenge System</p>
                  <p className="text-sm font-bold text-white font-display">Who Wants to Be a Sononaire</p>
                </div>
              </div>
            </div>

            {/* Instruction Warning for Sononaire Challenge */}
            <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-2xl text-amber-500 text-xs flex gap-3 leading-relaxed">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-mono">IMPORTANT SUBMISSION NOTES:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1 font-sans">
                  <li>Keep track of the countdown clock in the top sidebar header. Once triggered, the quiz auto-saves on zero.</li>
                  <li>Do not close your browser tab or back out unless you intend to forfeit your submission attempt.</li>
                  <li>Explanations and final correct answer guidelines are presented instantly following submission.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              <button
                onClick={onFinished}
                className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Back to Dashboard
              </button>
              
              <button
                onClick={handleStartQuiz}
                id="begin-evaluation-btn"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 hover:scale-[1.02] cursor-pointer font-display"
              >
                <span>Begin Evaluation Session</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Running State */}
      {quizState === 'running' && currentQuestion && (
        <div className="space-y-6">
          
          {/* Runner Header Bar */}
          <div className="bg-[#1E293B] rounded-3xl border border-slate-700 shadow-xl p-4 flex justify-between items-center animate-fade-in shadow-blue-500/5">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900 text-slate-400 border border-slate-800">
                Evaluating
              </span>
              <h3 className="font-bold text-white text-sm truncate max-w-sm font-display">
                {test.title}
              </h3>
            </div>

            {/* Live timer clock */}
            <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-mono text-sm font-bold border ${timeLeft < 60 ? 'bg-rose-950/40 text-rose-400 border-rose-900/40 animate-pulse' : 'bg-slate-900/45 text-slate-200 border-slate-800'}`}>
              <Clock className={`w-4 h-4 ${timeLeft < 60 ? 'text-rose-455 text-rose-400' : 'text-slate-500'}`} />
              <span>{mm}:{ss}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* Question indexes sidebar */}
            <div className="bg-[#1E293B] rounded-3xl border border-slate-700 shadow-xl p-4 space-y-3">
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Evaluation Index</h5>
              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-3 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = idx === currentQuestionIndex;

                  let indicatorClass = 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800';
                  if (isCurrent) indicatorClass = 'bg-blue-600 text-white ring-4 ring-blue-500/20 border-blue-600';
                  else if (isAnswered) indicatorClass = 'bg-blue-950/20 text-blue-400 border-blue-905 border-blue-900/30';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-10 text-xs font-mono font-bold rounded-xl border flex items-center justify-center transition-all cursor-pointer ${indicatorClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <button
                  onClick={handleSubmit}
                  id="submit-quiz-runner-btn"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Evaluation</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Do you really want to cancel and leave this quiz session? Your progress will be lost.")) {
                      onFinished();
                    }
                  }}
                  className="w-full py-2 bg-slate-900/40 hover:bg-slate-900 text-slate-400 font-bold rounded-xl text-xs transition-colors border border-slate-800 cursor-pointer"
                >
                  Cancel & Forfeit
                </button>
              </div>
            </div>

            {/* Actual Question panel */}
            <div className="lg:col-span-3 bg-[#1E293B] rounded-3xl border border-slate-700 shadow-xl p-6 sm:p-8 space-y-6">
              
              {/* Index details */}
              <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-450 uppercase tracking-widest pb-4 border-b border-slate-800">
                <span>QUESTION {currentQuestionIndex + 1} OF {questions.length}</span>
                <span>Topic: {test.topic}</span>
              </div>

              {/* Question Text */}
              <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed font-display">
                {currentQuestion.questionText}
              </h2>

              {/* Choices list */}
              <div id="choices-list" className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedOptionForCurrent === index;

                  return (
                    <button
                      key={index}
                      onClick={() => selectOption(index)}
                      className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all cursor-pointer text-left ${isSelected ? 'bg-blue-950/30 border-blue-500 hover:bg-blue-950/40 shadow-lg shadow-blue-500/5' : 'bg-slate-900/40 border-slate-800 text-slate-350 hover:bg-slate-905/40'}`}
                    >
                      <span className={`flex h-6 w-6 rounded-xl border items-center justify-center text-xs font-bold transition-transform ${isSelected ? 'bg-blue-600 border-blue-600 text-white hover:scale-105' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className={`text-sm font-sans ${isSelected ? 'font-bold text-white' : 'text-slate-350 font-medium'}`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Next and Previous Controls */}
              <div className="flex justify-between pt-6 border-t border-slate-800">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 border border-slate-700 bg-slate-900/40 text-slate-350 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer rounded-xl text-xs font-bold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-5 py-2 bg-[#0F172A] hover:bg-slate-905 border border-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-500/25 animate-pulse"
                  >
                    <span>Submit & Finish</span>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Quiz Submitted View (Calculation & Review Panel) */}
      {quizState === 'submitted' && finalResult && (
        <div className="bg-[#1E293B] rounded-3xl border border-slate-700 shadow-xl overflow-hidden animate-fade-in shadow-blue-500/5">
          
          <div className="text-center p-8 bg-gradient-to-r from-slate-900 via-[#0F172A] to-slate-950 text-white relative border-b border-slate-855 border-b border-slate-800 animate-fade-in">
            <Award className="w-16 h-16 text-amber-500 mx-auto animate-pulse mb-3" />
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display text-white">
              Evaluation Completed!
            </h1>
            <p className="text-slate-400 text-sm mt-1 font-sans">
              Outstanding work! Your ultrasound diagnostic capabilities have been logged.
            </p>

            {/* Score showcase circular indicator */}
            <div className="mt-6 inline-flex items-center justify-center p-6 bg-slate-900/60 rounded-full border border-slate-800 shadow-xl shrink-0">
              <div className="text-center">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-mono">My Score</p>
                <p className="text-3xl font-black">{Math.round((finalResult.score / finalResult.totalQuestions) * 100)}%</p>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{finalResult.score} of {finalResult.totalQuestions} Correct</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-400 font-mono">
              <span>Time Taken: {Math.floor(finalResult.timeTaken / 60)}m {finalResult.timeTaken % 60}s</span>
              <span>•</span>
              <span>Questions Answered: {finalResult.questionsAnswered}</span>
              <span>•</span>
              <span>Participant: {finalResult.studentName}</span>
            </div>
          </div>

          {/* Correct Answers & Explanations review (Students cannot access before submission, but can review instantly after submission) */}
          <div className="p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2 font-display">
              📝 Diagnostic Answers & Explanations Review
            </h3>

            <div className="space-y-6 divide-y divide-slate-800">
              {questions.map((q, idx) => {
                const studentAnsIndex = answers[q.id];
                const isCorrect = studentAnsIndex !== undefined && studentAnsIndex === q.correctAnswer;

                return (
                  <div key={q.id} className="pt-5 first:pt-0 space-y-2.5">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <span className="font-bold text-xs uppercase text-slate-400">
                        Question #{idx + 1}
                      </span>
                      {isCorrect ? (
                        <span className="px-2.5 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 text-[10px] font-bold rounded-lg flex items-center gap-1 shrink-0 font-mono">
                          <Check className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-rose-950/40 text-rose-400 border border-rose-900/30 text-[10px] font-bold rounded-lg flex items-center gap-1 shrink-0 font-mono">
                          <X className="w-3.5 h-3.5" /> Incomplete or Incorrect
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-white text-base leading-relaxed">
                      {q.questionText}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      {q.options.map((opt, oIdx) => {
                        const isCorrectOption = oIdx === q.correctAnswer;
                        const isStudentOptionSelection = oIdx === studentAnsIndex;

                        let cardStyle = "border-slate-800 bg-slate-900/40 text-slate-350";
                        let ringStyle = "bg-slate-800 border-slate-700 text-slate-400";

                        if (isCorrectOption) {
                          cardStyle = "border-emerald-600/40 bg-emerald-950/20 text-emerald-300 font-bold";
                          ringStyle = "bg-emerald-600 text-white";
                        } else if (isStudentOptionSelection) {
                          cardStyle = "border-rose-600/40 bg-rose-950/20 text-rose-305 text-rose-305 text-rose-300";
                          ringStyle = "bg-rose-600 text-white";
                        }

                        return (
                          <div key={oIdx} className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${cardStyle}`}>
                            <span className={`flex h-5 w-5 rounded-lg border items-center justify-center text-[10px] font-bold shrink-0 ${ringStyle}`}>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="leading-tight">{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-xs space-y-1 mt-2.5 font-sans">
                      <span className="font-bold text-emerald-400 font-mono">Diagnostic Explanations:</span>
                      <p className="text-slate-400 leading-relaxed font-normal">{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-center">
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all hover:scale-[1.02] cursor-pointer shadow-md shadow-blue-500/20 font-display"
              >
                Return to Portal Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

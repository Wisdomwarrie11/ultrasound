/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { 
  Menu, X, LogIn, LogOut, Award, UserPlus, Shield, 
  HelpCircle, ChevronRight, Layers, ExternalLink, Activity, Sparkles,
  Sun, Moon
} from 'lucide-react';
import { User, QuizResult, QuizTest } from './types';
import { FirebaseStore } from './lib/firebase';
import AnnouncementBanner from './components/AnnouncementBanner';
import StudentDashboardView from './components/StudentDashboardView';
import AdminDashboardView from './components/AdminDashboardView';
import QuizRunnerView from './components/QuizRunnerView';

export default function App() {
  // Theme state supporting toggles
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('studio_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('studio_theme', theme);
  }, [theme]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // View routing states
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [showAdminTab, setShowAdminTab] = useState(false);

  // Authentication Dialog control
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailForm, setEmailForm] = useState('');
  const [passwordForm, setPasswordForm] = useState('');
  const [nameForm, setNameForm] = useState('');
  const [roleForm, setRoleForm] = useState<'student' | 'admin'>('student');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Load existing session on target mount
  useEffect(() => {
    const session = FirebaseStore.getSessionUser();
    if (session) {
      setCurrentUser(session);
      if (session.role === 'admin') {
        setShowAdminTab(true);
      }
    }

    const unsubscribe = FirebaseStore.subscribeToUpdates(() => {
      const liveSession = FirebaseStore.getSessionUser();
      setCurrentUser(liveSession);
    });

    return unsubscribe;
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthError(null);
    setAuthLoading(false);
    setAuthModalOpen(true);
  };

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    if (authMode === 'login') {
      const { user, error } = await FirebaseStore.loginFirebase(emailForm, passwordForm);
      setAuthLoading(false);
      if (error) {
        setAuthError(error);
      } else {
        setCurrentUser(user);
        setAuthModalOpen(false);
        resetAuthForm();
        if (user && user.role === 'admin') {
          setShowAdminTab(true);
        }
      }
    } else {
      if (!nameForm.trim()) {
        setAuthError('Name is required.');
        setAuthLoading(false);
        return;
      }
      const { user, error } = await FirebaseStore.registerFirebase(nameForm.trim(), emailForm, passwordForm);
      setAuthLoading(false);
      if (error) {
        setAuthError(error);
      } else {
        setCurrentUser(user);
        setAuthModalOpen(false);
        resetAuthForm();
        if (user && user.role === 'admin') {
          setShowAdminTab(true);
        }
      }
    }
  };

  const handleQuickLogin = async (email: string) => {
    setAuthError(null);
    setAuthLoading(true);
    setAuthModalOpen(true);
    setAuthMode('login');
    setEmailForm(email);
    
    // Preset default fallback password for demo emails
    let assumedPass = email.includes('admin') ? 'admin123' : 'student123';
    if (email === 'wwtbas@gmail.com') {
      assumedPass = 'WWTBASS2';
    }
    setPasswordForm(assumedPass);

    // Try live verification
    const { user, error } = await FirebaseStore.loginFirebase(email, assumedPass);
    setAuthLoading(false);
    if (error) {
      // If user is not yet signed up with this assumed password, let them type/register
      setAuthError(`${error} (If this is a fresh database deployment, please use "Register Now" to create your credential!)`);
    } else {
      setCurrentUser(user);
      setAuthModalOpen(false);
      resetAuthForm();
      if (user && user.role === 'admin') {
        setShowAdminTab(true);
      } else {
        setShowAdminTab(false);
      }
    }
  };

  const handleLogout = () => {
    FirebaseStore.logout();
    setCurrentUser(null);
    setActiveTestId(null);
    setShowAdminTab(false);
  };

  const resetAuthForm = () => {
    setEmailForm('');
    setPasswordForm('');
    setNameForm('');
    setRoleForm('student');
    setAuthError(null);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${theme === 'dark' ? 'bg-[#0F172A] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'} selection:bg-blue-600/20 selection:text-white`}>
      
      {/* Global Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${theme === 'dark' ? 'bg-[#0F172A]/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { if (quizStateIntro()) setActiveTestId(null); }}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white font-display">U</div>
              <div>
                <span id="title-ua" className={`text-base sm:text-lg font-extrabold tracking-tight flex items-center gap-1.5 leading-none font-display ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Ultrasound <span className="text-blue-500">Academy</span>
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-blue-400 font-mono tracking-widest uppercase block mt-1 leading-none">
                  Sononaire Challenge
                </span>
              </div>
            </div>

            {/* Navbar logo to sign in as an Admin */}
            {!currentUser && (
              <button 
                onClick={() => {
                  handleOpenAuth('login');
                  setEmailForm('wwtbas@gmail.com');
                  setPasswordForm('WWTBASS2');
                }}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold cursor-pointer animate-pulse ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-350 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'}`}
                title="Quick admin login"
              >
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Quick Admin Login</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-350' : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-750 shadow-sm'}`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3">
                {/* Admin Role controls */}
                {currentUser.role === 'admin' && (
                  <div className="hidden sm:flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                    <button
                      onClick={() => { setShowAdminTab(false); setActiveTestId(null); }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${!showAdminTab ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                      Student view
                    </button>
                    <button
                      onClick={() => { setShowAdminTab(true); setActiveTestId(null); }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${showAdminTab ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
                    >
                      Admin Console
                    </button>
                  </div>
                )}

                {/* Display profile details */}
                <div className="hidden md:block text-right">
                  <p className="text-xs font-semibold text-slate-100">{currentUser.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 capitalize font-mono">{currentUser.role} Account</p>
                </div>

                <button
                  onClick={handleLogout}
                  id="logout-btn"
                  className="px-3 py-2 border border-slate-800 hover:bg-rose-950/40 hover:text-rose-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-slate-400"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenAuth('login')}
                  id="auth-login-trigger"
                  className="px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => handleOpenAuth('register')}
                  id="auth-register-trigger"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {currentUser ? (
          <div>
            {activeTestId ? (
              <QuizRunnerView 
                currentUser={currentUser} 
                testId={activeTestId} 
                onFinished={() => setActiveTestId(null)} 
              />
            ) : showAdminTab && currentUser.role === 'admin' ? (
              <AdminDashboardView currentUser={currentUser} />
            ) : (
              <StudentDashboardView 
                currentUser={currentUser} 
                onStartQuiz={(id) => setActiveTestId(id)}
                onReviewResult={(res) => setActiveTestId(res.testId)}
              />
            )}
          </div>
        ) : (
          
          /* PUBLIC HOMEPAGE */
          <div className="space-y-12">
            
            {/* Hero module */}
            <div className="bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-500/30 rounded-3xl overflow-hidden py-16 px-6 sm:px-12 text-center md:text-left relative">
              <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
              <div className="absolute top-10 right-10 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-7 space-y-6">
                  
                  {/* Visual flare badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                      Who Wants to Be a Sononaire
                    </span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-none font-display">
                    Ultrasound Academy
                  </h1>
                  
                  <p className="text-lg sm:text-xl font-bold italic text-blue-200 opacity-90">
                    “Test your knowledge. Become a Sononaire.”
                  </p>

                  <p className="text-slate-350 text-sm leading-relaxed max-w-xl">
                    Welcome to our interactive practice platform for ultrasound students and medical imagers. Study physics, blood flow, and anatomy questions easily.
                  </p>

                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <button
                      onClick={() => handleOpenAuth('register')}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-full text-sm uppercase tracking-wider shadow-lg shadow-yellow-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      Start Practice Quiz
                    </button>
                    <button
                      onClick={() => handleOpenAuth('login')}
                      className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-6 py-3 rounded-full text-sm transition-all cursor-pointer bg-slate-900/40 hover:bg-slate-800/40"
                    >
                      Log In
                    </button>
                  </div>
                </div>

                <div className="md:col-span-5 grid grid-cols-2 gap-4">
                  {/* Dynamic interactive feature summary stats */}
                  <div className="p-5 bg-[#1E293B] rounded-2xl border border-slate-700 text-center">
                    <p className="text-3xl font-black text-blue-400 font-display">98%</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1 font-mono">Exam Success Rate</p>
                  </div>
                  <div className="p-5 bg-[#1E293B] rounded-2xl border border-slate-700 text-center">
                    <p className="text-3xl font-black text-yellow-500 font-display">Core</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1 font-mono">Detailed Explanations</p>
                  </div>
                  <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-500/30 rounded-2xl text-center col-span-2">
                    <p className="text-sm font-bold text-white font-display">Leaderboard Challenges</p>
                    <p className="text-xs text-blue-100 mt-1">Join students and practitioners on the leaderboards</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Prominent announcement banner regarding StudiRad contribute */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                📢 Important Announcement
              </h4>
              <AnnouncementBanner />
            </div>

            {/* Quick Demo Logins Container */}
            <div className="p-6 bg-[#121B2E] rounded-3xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                  <Shield className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Quick Demo Sign In
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sign in instantly to test our platform as a student or explore the quiz administration features.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:col-span-2 gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('student@ua.edu')}
                  className="px-4 py-3 bg-[#1E293B] hover:bg-slate-800 rounded-xl border border-slate-700 text-xs text-left cursor-pointer transition-all hover:scale-[1.01] group"
                >
                  <p className="font-bold text-white group-hover:text-blue-400 transition-colors">Login as student Sarah</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">student@ua.edu</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('wwtbas@gmail.com')}
                  className="px-4 py-3 bg-[#1E293B] hover:bg-slate-800 rounded-xl border border-slate-700 text-xs text-left cursor-pointer transition-all hover:scale-[1.01] group"
                >
                  <p className="font-bold text-white group-hover:text-blue-400 transition-colors">Login as Admin</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">wwtbas@gmail.com</p>
                </button>
              </div>
            </div>

            {/* Additional details on diagnostic specifications */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-[#1E293B] rounded-2xl border border-slate-850 space-y-2">
                <Award className="w-8 h-8 text-blue-500" />
                <h4 className="font-bold text-white text-sm font-display">Interactive Quizzes</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  A friendly quiz interface designed to mimic standard imaging exams with real-time feedback.
                </p>
              </div>

              <div className="p-6 bg-[#1E293B] rounded-2xl border border-slate-850 space-y-2">
                <Layers className="w-8 h-8 text-blue-500" />
                <h4 className="font-bold text-white text-sm font-display">Study Tools</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Direct integration with companion study guides and helpful learning grids.
                </p>
              </div>

              <div className="p-6 bg-[#1E293B] rounded-2xl border border-slate-850 space-y-2">
                <HelpCircle className="w-8 h-8 text-blue-500" />
                <h4 className="font-bold text-white text-sm font-display">Helpful Explanations</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Every single question has clear, detailed text and answers to guide you when you finish.
                </p>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Global Footer */}
      <footer className="bg-slate-950 border-t border-slate-850 py-8 mt-12 text-[#64748B] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-center md:text-left">
            © 2026 Ultrasound Academy. Practice platform for medical ultrasound imaging.
          </p>
        </div>
      </footer>

      {/* Auth Modal overlay Dialog */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-700 max-w-sm w-full overflow-hidden transition-all duration-150">
            
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
              <h3 className="font-bold text-base font-display">
                {authMode === 'login' ? '🔐 Sign In' : '✨ Sign Up'}
              </h3>
              <button 
                onClick={() => setAuthModalOpen(false)}
                className="text-slate-450 hover:text-white transition-colors cursor-pointer text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              
              {authError && (
                <div className="p-3 bg-rose-950/40 border border-rose-900 rounded-xl text-rose-300 text-xs font-medium">
                  ⚠️ {authError}
                </div>
              )}

              {authMode === 'register' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    disabled={authLoading}
                    value={nameForm}
                    onChange={(e) => setNameForm(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#0F172A] border border-slate-700 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-50"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  disabled={authLoading}
                  value={emailForm}
                  onChange={(e) => setEmailForm(e.target.value)}
                  placeholder="e.g. name@email.com"
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#0F172A] border border-slate-700 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Password</label>
                <input
                  type="password"
                  required
                  disabled={authLoading}
                  value={passwordForm}
                  onChange={(e) => setPasswordForm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#0F172A] border border-slate-700 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-50"
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Account Info</label>
                  <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl text-slate-300 text-xs">
                    🔒 <strong className="text-white">Account Type:</strong> Student Account
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold cursor-pointer transition-all shadow-lg shadow-blue-500/20 disabled:opacity-55 flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{authMode === 'login' ? 'Sign In' : 'Sign Up & Log In'}</span>
                )}
              </button>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  {authMode === 'login' ? "No account?" : "Have password?"}
                </span>
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthError(null);
                  }}
                  className="text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer disabled:opacity-50"
                >
                  {authMode === 'login' ? 'Register Now' : 'Sign In Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );

  function quizStateIntro() {
    return true;
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Trophy, Award, Landmark, Search, Zap } from 'lucide-react';
import { QuizResult } from '../types';
import { useState } from 'react';

interface LeaderboardViewProps {
  results: QuizResult[];
}

export default function LeaderboardView({ results }: LeaderboardViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Aggregate stats per student
  const studentStats: Record<string, {
    name: string;
    totalScore: number;
    quizzesCount: number;
    averageScore: number;
    totalTimeTaken: number;
    highestScore: number;
  }> = {};

  results.forEach(r => {
    const key = r.studentId;
    if (!studentStats[key]) {
      studentStats[key] = {
        name: r.studentName,
        totalScore: 0,
        quizzesCount: 0,
        averageScore: 0,
        totalTimeTaken: 0,
        highestScore: 0,
      };
    }
    
    studentStats[key].totalScore += r.score;
    studentStats[key].quizzesCount += 1;
    studentStats[key].totalTimeTaken += r.timeTaken;
    if (r.score > studentStats[key].highestScore) {
      studentStats[key].highestScore = r.score;
    }
  });

  // Calculate averages & convert to array
  const leaderboardData = Object.keys(studentStats).map(key => {
    const item = studentStats[key];
    return {
      id: key,
      name: item.name,
      totalQuizzes: item.quizzesCount,
      highestScore: item.highestScore,
      averageScore: Math.round(item.totalScore / item.quizzesCount),
      averageTime: Math.round(item.totalTimeTaken / item.quizzesCount),
    };
  });

  // Sort descending by highestScore, then by averageScore, then ascending by time
  leaderboardData.sort((a, b) => {
    if (b.highestScore !== a.highestScore) {
      return b.highestScore - a.highestScore;
    }
    if (b.averageScore !== a.averageScore) {
      return b.averageScore - a.averageScore;
    }
    return a.averageTime - b.averageTime;
  });

  const filteredData = leaderboardData.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="leaderboard-section" className="bg-[#1E293B] rounded-3xl border border-slate-700 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
            <Trophy className="w-5 h-5 text-yellow-500 animate-pulse" />
            Sononaire Leaderboard
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            The highest scoring sonographers in the "Who Wants to Be a Sononaire" feature challenge.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search sonographer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 w-full sm:w-60 text-sm rounded-xl bg-[#0F172A] border border-slate-700 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 font-medium"
          />
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center py-10 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
          <Award className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-450 text-sm font-mono">No leaderboard entries found yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table id="leaderboard-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400 tracking-wider font-mono">
                <th className="py-3 px-4 text-center w-12">Rank</th>
                <th className="py-3 px-4">Sonographer</th>
                <th className="py-3 px-4 text-center">Quizzes Taken</th>
                <th className="py-3 px-4 text-center">Highest Score</th>
                <th className="py-3 px-4 text-center">Avg. Score</th>
                <th className="py-3 px-4 text-center">Avg. Time</th>
                <th className="py-3 px-4 text-right">Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredData.map((row, index) => {
                const rank = index + 1;
                let rankStyle = "text-slate-400 font-medium";
                let rankBadge = null;

                if (rank === 1) {
                  rankStyle = "font-extrabold text-yellow-500 bg-yellow-500/10 rounded-lg border border-yellow-500/10";
                  rankBadge = <Trophy className="w-4 h-4 text-yellow-500 fill-yellow-500 inline" />;
                } else if (rank === 2) {
                  rankStyle = "font-extrabold text-slate-200 bg-slate-800 rounded-lg border border-slate-700";
                  rankBadge = <Award className="w-4 h-4 text-slate-300 fill-slate-300 inline" />;
                } else if (rank === 3) {
                  rankStyle = "font-extrabold text-amber-500 bg-amber-500/10 rounded-lg border border-amber-500/10";
                  rankBadge = <Award className="w-4 h-4 text-amber-500/75 inline" />;
                }

                // Title assigned by performance
                let professionalTitle = "Pro Sonographer";
                if (row.highestScore === 100) {
                  professionalTitle = "Master Sononaire 💎";
                } else if (row.highestScore >= 80) {
                  professionalTitle = "Expert Diagnostic Specialist";
                } else if (row.highestScore >= 60) {
                  professionalTitle = "Advanced Practitioner";
                }

                return (
                  <tr key={row.id} className="hover:bg-slate-900/30 transition-colors text-slate-300 text-sm">
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 ${rankStyle}`}>
                        {rankBadge ? rankBadge : rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-100">
                      <div>
                        {row.name}
                        <span className="block text-xs font-normal text-slate-500 mt-0.5">
                          {professionalTitle}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-405">
                      {row.totalQuizzes}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-blue-400 bg-blue-500/10 border border-blue-500/10 px-2.5 py-0.5 rounded-full text-xs font-mono">
                        <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                        {row.highestScore}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400 font-mono">
                      {row.averageScore}%
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-500 text-xs">
                      {Math.floor(row.averageTime / 60)}m {row.averageTime % 60}s
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${
                        row.highestScore === 100 
                          ? 'bg-purple-950/40 text-purple-400 border-purple-900/40' 
                          : row.highestScore >= 80 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-slate-900 text-slate-450 border border-slate-800'
                      }`}>
                        {row.highestScore === 100 ? '👑 Sononaire' : row.highestScore >= 80 ? 'Gold' : 'Silver'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Megaphone, ExternalLink, Sparkles } from 'lucide-react';

export default function AnnouncementBanner() {
  return (
    <div id="studirad-banner" className="relative overflow-hidden bg-gradient-to-br from-[#1E293B] via-indigo-950 to-[#0F172A] border-2 border-indigo-500/60 rounded-3xl p-6 sm:p-8 md:p-10 group animate-fade-in shadow-xl shadow-indigo-950/40">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="p-4 bg-indigo-500/20 rounded-2xl backdrop-blur-md text-indigo-400 border border-indigo-400/20 shrink-0 shadow-lg animate-pulse">
            <Megaphone className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-400/10 text-yellow-500 border border-yellow-400/20 font-mono uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-yellow-500" />
                Featured Platform Partner
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                STUDIRAD CONTRIBUTOR HUB
              </span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display leading-tight">
             You can contribute your resources on <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 font-extrabold">StudiRad</span>!
            </h3>
            
            <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
              StudiRad is an connects students to learning resources and career opportunites. Discover their community to explore articles, study guides, or contribute your own materials to support fellow candidates.
            </p>
          </div>
        </div>
        
        <div className="shrink-0 flex items-center w-full lg:w-auto">
          <a
            href="https://www.studirad.org"
            target="_blank"
            rel="noopener noreferrer"
            id="explore-studirad-btn"
            className="w-full lg:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 rounded-2xl font-black text-sm uppercase tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-indigo-500/25 hover:scale-[1.03]"
          >
            <span>Access StudiRad Hub</span>
            <ExternalLink className="w-4.5 h-4.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

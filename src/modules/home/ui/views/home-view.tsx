"use client";

import { AlertTriangle } from "lucide-react";

export const HomeView = () => {
  return (
    <div className="flex justify-center items-start w-full px-2 sm:px-4 md:px-6 py-4">
      <div className="max-w-4xl w-full">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl shadow-2xl shadow-cyan-500/20 border border-cyan-500/30 p-6 sm:p-8 md:p-10 space-y-6">
          {/* Welcome Header */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
              Welcome to <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">AIssist</span> — your full-stack SaaS where AI powers your productivity!
            </h1>
          </div>

          {/* How it Works Section */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-200">Here's how it works:</h2>
            <ul className="space-y-3 text-slate-300 text-base sm:text-lg leading-relaxed">
              <li>
                Create your personal <span className="text-cyan-400 font-semibold">AI Assistant</span> with your own custom instructions.
              </li>
              <li>
                Assign your assistant to a meeting or task and <span className="text-cyan-400 font-semibold">collaborate live</span> — it can take notes, summarize discussions, or even act as a mock interviewer.
              </li>
              <li>
                <span className="text-cyan-400 font-semibold">Chat in any language</span> — real-time translation and transcription are built in.
              </li>
              <li>
                After the session, access your recordings, transcripts, summaries, and AI chat insights — all in one place.
              </li>
            </ul>
          </div>

          {/* Navigation Instructions */}
          <div className="space-y-2 text-slate-300 text-base sm:text-lg leading-relaxed">
            <p>
              Use the <span className="text-cyan-400 font-semibold">sidebar</span> to navigate between your <span className="text-cyan-400 font-semibold">Meetings</span> and <span className="text-cyan-400 font-semibold">Assistants</span>. Click the <span className="text-cyan-400 font-semibold">AIssist logo</span> anytime to return to the home page. Use the user menu in the sidebar to log out.
            </p>
          </div>

          {/* Warning Section */}
          <div className="bg-gradient-to-r from-amber-900/40 to-yellow-900/40 border-l-4 border-amber-500/60 rounded-r-lg p-4 sm:p-5 space-y-3 shadow-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="text-slate-200 font-semibold text-base sm:text-lg">
                  Note: This is a demo/trial version.
                </p>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Running real-time AI services involves operational costs, and as an F-1 student in the U.S., I'm unable to implement payments.
                </p>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  You're allowed <span className="text-cyan-400 font-semibold">2–3 test sessions (about 10 minutes each)</span>.
                </p>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Meetings cannot be deleted or edited. After each one, you can still view the recording, transcript, and AI chat.
                </p>
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium">
                  In short — you get a few chances to explore what AIssist can do. Enjoy your demo!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
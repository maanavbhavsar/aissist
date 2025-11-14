"use client";

import { AlertTriangle } from "lucide-react";
import Image from "next/image";

export const HomeView = () => {
  return (
    <div className="flex flex-col items-center w-full px-2 sm:px-4 md:px-6 py-6 relative z-10">
      <div className="max-w-4xl w-full">
        {/* Logo and Name Above Card */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Image 
            src="/Aissist Logo.png" 
            alt="AIssist Logo" 
            width={40} 
            height={40}
            className="h-10 w-auto object-contain"
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            AIssist
          </h1>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sm:p-8 space-y-5">
          {/* Welcome Text */}
          <p className="text-slate-800 text-sm leading-relaxed">
            Welcome to <span className="font-semibold text-cyan-600">AIssist</span>, your full-stack SaaS where AI powers your productivity! Here&apos;s how it works:
          </p>

          {/* How it Works Section */}
          <ul className="space-y-2.5 text-slate-700 text-sm leading-relaxed">
            <li>
              Create your personal <span className="font-semibold text-cyan-600">AI Assistant</span> with your own custom instructions.
            </li>
            <li>
              Assign your assistant to a meeting or task and <span className="font-semibold text-blue-600">collaborate live</span> — it can take notes, summarize discussions, or even act as a mock interviewer.
            </li>
            <li>
              Use it as your <span className="font-semibold text-cyan-500">mock interviewer</span> — ask queries in any language (real-time + translation enabled).
            </li>
            <li>
              After the call, access the recording, AI chat on your transcripts, view transcriptions, and see detailed summaries.
            </li>
          </ul>

          {/* Navigation Instructions */}
          <p className="text-slate-700 text-sm leading-relaxed">
            Navigate using the <span className="font-semibold text-cyan-500">sidebar</span> to go to your <span className="font-semibold text-cyan-600">Meetings</span> and <span className="font-semibold text-cyan-600">Agents</span>. Click the <span className="font-semibold text-blue-600">AIssist logo</span> anytime to return here. Click on the user button in the sidebar to Logout.
          </p>

          {/* Note Section */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-l-4 border-cyan-500 rounded-r-lg p-4 space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <p className="text-slate-800 font-semibold text-sm">
                  This is a <span className="text-blue-600">trial/demo SaaS</span>.
                </p>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Running real-time AI calls costs me money and as current F1 student in the US, I cannot implement payments. You are allowed <span className="font-semibold text-cyan-600">2 - 3 screening calls (10 minutes each)</span> only. You cannot delete or edit meetings. Once a meeting is done, you can view the recording, transcripts, and AI chat.
                </p>
                <p className="text-slate-800 text-sm leading-relaxed font-medium">
                  So in summary, you get limited chances to try this app — enjoy your demo!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support - Outside Card */}
        <p className="text-center text-slate-400 text-xs mt-4">
          Reach out for feedback, suggestions, bugs, or anything else: <a href="mailto:mbhavsa3@asu.edu" className="text-slate-400 hover:text-slate-300 underline underline-offset-2">mbhavsa3@asu.edu</a>
        </p>
      </div>
    </div>
  );
};
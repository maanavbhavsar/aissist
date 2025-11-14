'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { ArrowLeft, FileText, ScrollText, Video, MessageSquare } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Transcript from '@/modules/meetings/ui/components/transcript'
import { ChatProvider } from '@/modules/meetings/ui/components/chat-provider'

interface CompletedStateProps {
  meetingId: string
  meetingName?: string
  summary?: string | null
  transcript?: string | null
  recordingUrl?: string | null
}

export default function CompletedState({
  meetingId,
  meetingName,
  summary,
  recordingUrl,
}: CompletedStateProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-6 w-full h-full p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => router.push('/dashboard/meetings')}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60 transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Meetings
        </Button>
        <h2 className="text-xl font-semibold text-white">{meetingName || 'Meeting Summary'}</h2>
      </div>

      <div className="border-t border-slate-700/50" />

      <Tabs defaultValue="summary" className="w-full flex-1 flex flex-col min-h-0">
        <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible scrollbar-hide">
          <TabsList className="inline-flex w-auto min-w-max sm:grid sm:w-full sm:grid-cols-4 h-auto gap-2 sm:gap-1 bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger 
              value="summary" 
              className="flex-shrink-0 whitespace-nowrap px-6 py-2.5 sm:px-3 sm:py-1.5 text-sm font-medium flex items-center gap-2 text-white bg-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/50"
            >
              <FileText className="w-4 h-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger 
              value="transcript" 
              className="flex-shrink-0 whitespace-nowrap px-6 py-2.5 sm:px-3 sm:py-1.5 text-sm font-medium flex items-center gap-2 text-white bg-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/50"
            >
              <ScrollText className="w-4 h-4" />
              Transcript
            </TabsTrigger>
            <TabsTrigger 
              value="recording" 
              className="flex-shrink-0 whitespace-nowrap px-6 py-2.5 sm:px-3 sm:py-1.5 text-sm font-medium flex items-center gap-2 text-white bg-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/50"
            >
              <Video className="w-4 h-4" />
              Recording
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="flex-shrink-0 whitespace-nowrap px-6 py-2.5 sm:px-3 sm:py-1.5 text-sm font-medium flex items-center gap-2 text-white bg-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/50"
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="summary" className="flex-1 min-h-0">
          <Card className="h-full border-cyan-500/20 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm shadow-2xl shadow-cyan-500/20">
            <CardHeader className="border-b border-slate-700/50 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Meeting Summary</h3>
                {summary && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Summary</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none pt-6">
              {summary ? (
                <div className="space-y-6">
                  <ReactMarkdown
                    components={{
                      h1: ({...props}) => <h1 className="text-2xl font-bold text-white mb-4 mt-6 first:mt-0" {...props} />,
                      h2: ({...props}) => <h2 className="text-xl font-bold text-cyan-400 mb-3 mt-5 first:mt-0" {...props} />,
                      h3: ({...props}) => <h3 className="text-lg font-semibold text-white mb-3 mt-6 first:mt-0" {...props} />,
                      h4: ({...props}) => <h4 className="text-base font-semibold text-cyan-300 mb-2 mt-4 ml-6" {...props} />,
                      p: ({...props}) => <p className="text-slate-200 leading-relaxed mb-4" {...props} />,
                      ul: ({...props}) => <ul className="list-disc space-y-2 mb-4 text-slate-200 ml-8 pl-2" {...props} />,
                      ol: ({...props}) => <ol className="list-decimal space-y-2 mb-4 text-slate-200 ml-8 pl-2" {...props} />,
                      li: ({...props}) => <li className="text-slate-200 leading-relaxed pl-1" {...props} />,
                      strong: ({...props}) => <strong className="font-semibold text-white" {...props} />,
                      em: ({...props}) => <em className="italic text-slate-200" {...props} />,
                      code: ({...props}) => <code className="bg-slate-700/50 text-cyan-300 px-1.5 py-0.5 rounded text-sm" {...props} />,
                    }}
                  >
                    {summary}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No summary available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transcript" className="flex-1 min-h-0">
          <Transcript meetingId={meetingId} />
        </TabsContent>

        <TabsContent value="recording" className="flex-1 min-h-0">
          <Card className="h-full border-cyan-500/20 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm shadow-2xl shadow-cyan-500/20">
            <CardHeader className="border-b border-slate-700/50 pb-4">
              <h3 className="text-xl font-bold text-white">Recording</h3>
            </CardHeader>
            <CardContent>
              {recordingUrl ? (
                <video 
                  controls 
                  className="w-full rounded-lg shadow-lg border border-slate-700/50"
                  preload="metadata"
                >
                  <source src={recordingUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <p className="text-slate-400 text-center py-8">No recording available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="flex-1 min-h-0">
          <ChatProvider meetingId={meetingId} meetingName={meetingName || 'Meeting'} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
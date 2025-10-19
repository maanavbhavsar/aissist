'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Transcript from '@/modules/meetings/ui/components/transcript'
import ChatProvider from '@/modules/meetings/ui/components/chat-provider'

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
  transcript,
  recordingUrl,
}: CompletedStateProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-6 w-full h-full p-6">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <h2 className="text-xl font-semibold text-foreground">{meetingName || 'Meeting Summary'}</h2>
      </div>

      <div className="border-t border-border" />

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="recording">Recording</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-foreground">Meeting Summary</h3>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground">
              {summary ? (
                <ReactMarkdown>{summary}</ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">No summary available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transcript">
          <Transcript meetingId={meetingId} />
        </TabsContent>

        <TabsContent value="recording">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-foreground">Recording</h3>
            </CardHeader>
            <CardContent>
              {recordingUrl ? (
                <video 
                  controls 
                  className="w-full rounded-lg shadow-lg border border-border"
                  preload="metadata"
                >
                  <source src={recordingUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <p className="text-muted-foreground">No recording available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <ChatProvider meetingId={meetingId} meetingName={meetingName || 'Meeting'} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
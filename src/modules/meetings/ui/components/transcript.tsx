'use client'

import React, { useMemo, useState } from 'react'
import Highlighter from 'react-highlight-words'
import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { generateAvatarURI } from '@/lib/avatar'
import { TranscriptItemWithSpeaker } from '@/modules/meetings/types'
import { Search } from 'lucide-react'

interface TranscriptProps {
  meetingId: string
}

export default function Transcript({ meetingId }: TranscriptProps) {
  const [q, setQ] = useState('')
  const trpc = useTRPC()
  const { data = [] } = useQuery(
    trpc.meetings.getTranscript.queryOptions({ id: meetingId })
  )

  const filtered = useMemo(() => {
    if (!q) return data
    const lower = q.toLowerCase()
    return data.filter((item: TranscriptItemWithSpeaker) => item.text?.toLowerCase().includes(lower) || item.speaker?.name?.toLowerCase().includes(lower))
  }, [data, q])

  return (
    <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm rounded-lg border border-cyan-500/20 shadow-2xl shadow-cyan-500/20 p-4 h-full flex flex-col min-h-0">
      <p className="text-base font-bold text-white mb-3">Transcript</p>

      <div className="relative mb-4 max-w-xl flex-shrink-0">
        <Input 
          placeholder="Search transcript..." 
          value={q} 
          onChange={(e) => setQ(e.target.value)} 
          className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500" 
        />
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-4 pr-4">
          {filtered.map((item: TranscriptItemWithSpeaker) => (
            <div key={item.start_ts} className="flex gap-4 hover:bg-slate-700/40 p-4 rounded-md border border-slate-700/50 transition-colors">
              <div className="flex-shrink-0">
                <Avatar className="h-8 w-8 border border-slate-600">
                  <AvatarImage src={item.speaker?.image ?? generateAvatarURI({ seed: item.speaker?.name ?? 'unknown', variant: 'initials' })} />
                </Avatar>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{item.speaker?.name ?? 'Unknown'}</p>
                  <p className="text-sm text-cyan-400 font-medium">
                    {(() => {
                      // start_ts is relative to meeting start (in seconds)
                      // Convert to absolute timestamp by adding to meeting start time
                      if (item.meetingStartedAt && item.start_ts) {
                        const meetingStart = new Date(item.meetingStartedAt).getTime()
                        const absoluteTimestamp = meetingStart + (item.start_ts * 1000)
                        return format(new Date(absoluteTimestamp), 'MMM d, yyyy HH:mm')
                      }
                      // Fallback: show relative time if meeting start is not available
                      return format(new Date(item.start_ts * 1000), 'MMM d, yyyy HH:mm')
                    })()}
                  </p>
                </div>

                <div className="mt-2 text-sm text-slate-300 leading-relaxed">
                  <Highlighter
                    highlightClassName="bg-yellow-500/30 text-yellow-200"
                    searchWords={[q]}
                    autoEscape
                    textToHighlight={item.text || ''}
                  />
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No transcript lines found.</p>}
        </div>
      </ScrollArea>
    </div>
  )
}

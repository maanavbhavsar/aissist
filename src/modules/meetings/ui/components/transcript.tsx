'use client'

import React, { useMemo, useState } from 'react'
import Highlighter from 'react-highlight-words'
import { trpc } from '@/trpc/client'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { generateAvatarURI } from '@/lib/avatar'
import { Search } from 'lucide-react'

interface TranscriptProps {
  meetingId: string
}

export default function Transcript({ meetingId }: TranscriptProps) {
  const [q, setQ] = useState('')
  const { data = [] } = trpc.meetings.getTranscript.useQuery({ id: meetingId })

  const filtered = useMemo(() => {
    if (!q) return data
    const lower = q.toLowerCase()
    return data.filter((item: any) => item.text?.toLowerCase().includes(lower) || item.speaker?.name?.toLowerCase().includes(lower))
  }, [data, q])

  return (
    <div className="bg-white rounded-lg border p-4">
      <p className="text-sm font-medium mb-3">Transcript</p>

      <div className="relative mb-4 max-w-xl">
        <Input placeholder="Search transcript..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" />
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      </div>

      <ScrollArea className="max-h-[60vh]">
        <div className="space-y-4">
          {filtered.map((item: any) => (
            <div key={item.start_timestamp} className="flex gap-4 hover:bg-muted p-4 rounded-md border">
              <div className="flex-shrink-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={item.speaker?.image ?? generateAvatarURI({ seed: item.speaker?.name ?? 'unknown', variant: 'initials' })} />
                </Avatar>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{item.speaker?.name ?? 'Unknown'}</p>
                  <p className="text-sm text-blue-500 font-medium">
                    {format(new Date(item.start_timestamp), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>

                <div className="mt-2 text-sm">
                  <Highlighter
                    highlightClassName="bg-yellow-200"
                    searchWords={[q]}
                    autoEscape
                    textToHighlight={item.text || ''}
                  />
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && <p className="text-sm text-muted-foreground">No transcript lines found.</p>}
        </div>
      </ScrollArea>
    </div>
  )
}

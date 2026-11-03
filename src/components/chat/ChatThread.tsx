import { useEffect, useRef } from "react"
import type { Message, Session } from "@/types"
import { MessageBubble } from "./MessageBubble"
import { ProfileCard } from "./ProfileCard"
import { BarChart2, Upload } from "lucide-react"

interface ChatThreadProps {
    session: Session | null
    messages: Message[]
    isUploading: boolean
    onUpload: (file: File) => void
}

export function ChatThread({ session, messages, isUploading, onUpload }: ChatThreadProps) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file) onUpload(file)
    }

    // Uploading state
    if (isUploading) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500" />
                <p className="text-xs text-white/30">Uploading and profiling dataset...</p>
            </div>
        )
    }

    // Empty state — no session yet
    if (!session) {
        return (
            <div
                className="flex flex-1 flex-col items-center justify-center gap-5 p-4 sm:gap-6 sm:p-8"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] sm:h-16 sm:w-16">
                    <BarChart2 size={24} className="text-white/20" />
                </div>

                <div className="text-center">
                    <p className="text-sm font-medium text-white/40">No dataset loaded</p>
                    <p className="mt-1 text-xs text-white/20">
                        Upload a file to start analysing your data
                    </p>
                </div>

                {/* Drop zone */}
                <label className="flex w-full max-w-xs cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 px-6 py-7 text-center transition-colors hover:border-indigo-500/30 hover:bg-indigo-500/[0.02] sm:w-auto sm:max-w-none sm:px-12 sm:py-8">
                    <Upload size={16} className="text-white/20" />
                    <span className="text-xs text-white/20">Drop a file here or click to browse</span>
                    <input
                        type="file"
                        accept=".csv,.tsv,.xlsx,.xls,.json,.jsonl,.parquet"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) onUpload(file)
                        }}
                    />
                </label>
            </div>
        )
    }

    // Active session — show profile + messages
    return (
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <ProfileCard profile={session.profile!} filename={session.filename} />

            {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
            ))}

            <div ref={bottomRef} />
        </div>
    )
}

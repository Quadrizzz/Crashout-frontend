import { useState, useRef } from "react"
import type { KeyboardEvent } from "react"
import { ArrowUp, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
    onSend: (message: string) => void
    onUpload: (file: File) => void
    isLoading: boolean
    hasSession: boolean
}

export function ChatInput({ onSend, onUpload, isLoading, hasSession }: ChatInputProps) {
    const [value, setValue] = useState("")
    const fileRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSend = () => {
        if (!value.trim() || isLoading || !hasSession) return
        onSend(value.trim())
        setValue("")
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
        }
    }

    const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) onUpload(file)
        e.target.value = ""
    }

    const canSend = value.trim() && !isLoading && hasSession

    return (
        <div className="border-t border-white/5 bg-[#0a0a0f] p-4">
            <div
                className={cn(
                    "flex items-end gap-2 rounded-2xl border bg-white/[0.03] p-2 transition-colors duration-200",
                    hasSession
                        ? "border-white/10 focus-within:border-indigo-500/40"
                        : "border-white/5"
                )}
            >
                {/* File upload button */}
                <button
                    onClick={() => fileRef.current?.click()}
                    title="Upload dataset"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white/30 transition-colors hover:bg-white/5 hover:text-white/60"
                >
                    <Paperclip size={15} />
                </button>
                <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.tsv,.xlsx,.xls,.json,.jsonl,.parquet"
                    onChange={handleFile}
                    className="hidden"
                />

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value)
                        e.target.style.height = "auto"
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
                    }}
                    onKeyDown={handleKey}
                    placeholder={
                        hasSession
                            ? "Ask anything about your data..."
                            : "Upload a dataset to get started"
                    }
                    disabled={!hasSession || isLoading}
                    rows={1}
                    className="flex-1 resize-none bg-transparent py-1.5 text-sm text-white/80 placeholder-white/20 outline-none disabled:cursor-not-allowed"
                    style={{ maxHeight: "120px" }}
                />

                {/* Send button */}
                <button
                    onClick={handleSend}
                    disabled={!canSend}
                    className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
                        canSend
                            ? "bg-indigo-600 text-white hover:bg-indigo-500"
                            : "bg-white/5 text-white/20 cursor-not-allowed"
                    )}
                >
                    <ArrowUp size={15} />
                </button>
            </div>

            <p className="mt-2 text-center font-mono text-[10px] text-white/15">
                CSV · TSV · Excel · JSON · JSONL · Parquet
            </p>
        </div>
    )
}
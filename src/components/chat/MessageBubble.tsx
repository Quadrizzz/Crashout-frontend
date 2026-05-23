import type { Message } from "@/types"
import { ChartBlock } from "./ChartBlock"
import { cn } from "@/lib/utils"
import { BarChart2, Brain, Code2, Cpu, Sparkles } from "lucide-react"

const NODE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
    router: { label: "Thinking...", icon: <Brain size={12} /> },
    code_writer: { label: "Writing code...", icon: <Code2 size={12} /> },
    code_evaluator: { label: "Evaluating code...", icon: <Code2 size={12} /> },
    code_executor: { label: "Running analysis...", icon: <Cpu size={12} /> },
    result_interpreter: { label: "Interpreting results...", icon: <Sparkles size={12} /> },
    chart_decider: { label: "Preparing chart...", icon: <BarChart2 size={12} /> },
}

export function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === "user"

    return (
        <div className={cn("flex w-full gap-3 px-4 py-3", isUser ? "justify-end" : "justify-start")}>
            {/* Agent avatar */}
            {!isUser && (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-500/20">
                    <Sparkles size={13} className="text-indigo-400" />
                </div>
            )}

            <div className={cn("max-w-[75%]", isUser ? "items-end" : "items-start")}>
                {isUser ? (
                    // User bubble
                    <div className="rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-2.5 text-sm text-white">
                        {message.content}
                    </div>
                ) : (
                    // Assistant bubble
                    <div className="rounded-2xl rounded-tl-sm bg-white/[0.04] px-4 py-3 ring-1 ring-white/5">

                        {/* Node progress */}
                        {message.isStreaming && message.node && NODE_LABELS[message.node] && (
                            <div className="mb-2 flex items-center gap-1.5 text-xs text-indigo-400/70">
                                <span className="animate-pulse">{NODE_LABELS[message.node].icon}</span>
                                <span className="font-mono">{NODE_LABELS[message.node].label}</span>
                            </div>
                        )}

                        {/* Loading dots — before any node fires */}
                        {message.isStreaming && !message.node && (
                            <div className="flex gap-1 py-1">
                                {[0, 1, 2].map((i) => (
                                    <span
                                        key={i}
                                        className="h-1.5 w-1.5 rounded-full bg-white/30"
                                        style={{
                                            animation: "bounce 1s infinite",
                                            animationDelay: `${i * 150}ms`,
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Message text */}
                        {message.content && (
                            <p className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap">
                                {message.content}
                            </p>
                        )}

                        {/* Inline chart */}
                        {message.chart && <ChartBlock config={message.chart} />}
                    </div>
                )}
            </div>

            {/* User avatar */}
            {isUser && (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                    <span className="text-xs font-medium text-white/60">U</span>
                </div>
            )}
        </div>
    )
}
import type { Message } from "@/types"
import { ChartBlock } from "./ChartBlock"
import { cn } from "@/lib/utils"
import { AlertCircle, BarChart2, Brain, Code2, Cpu, Sparkles } from "lucide-react"

const NODE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
    profiler: { label: "Reading schema...", icon: <Brain size={12} /> },
    router: { label: "Analyzing question...", icon: <Brain size={12} /> },
    code_writer: { label: "Writing query...", icon: <Code2 size={12} /> },
    code_executor: { label: "Executing on data...", icon: <Cpu size={12} /> },
    error_handler: { label: "Refining query...", icon: <Code2 size={12} /> },
    result_interpreter: { label: "Interpreting results...", icon: <Sparkles size={12} /> },
    chart_generator: { label: "Generating chart...", icon: <BarChart2 size={12} /> },
    response_composer: { label: "Finalizing response...", icon: <Sparkles size={12} /> },
}

function normalizeContent(content: unknown): string {
    if (typeof content === "string") return content
    if (Array.isArray(content)) {
        return content
            .map((item) => {
                if (typeof item === "string") return item
                if (item && typeof item === "object" && "text" in item) {
                    return String((item as any).text)
                }
                return ""
            })
            .filter(Boolean)
            .join("\n")
    }
    if (content && typeof content === "object" && "text" in content) {
        return String((content as any).text)
    }
    if (content === null || content === undefined) return ""
    return String(content)
}

export function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === "user"
    const textContent = normalizeContent(message.content)

    return (
        <div className={cn("flex w-full gap-3 px-4 py-3", isUser ? "justify-end" : "justify-start")}>
            {/* Agent avatar */}
            {!isUser && (
                <div className={cn(
                    "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1",
                    message.isError
                        ? "bg-rose-500/10 ring-rose-500/20 text-rose-400"
                        : "bg-indigo-500/10 ring-indigo-500/20 text-indigo-400"
                )}>
                    {message.isError ? <AlertCircle size={13} /> : <Sparkles size={13} />}
                </div>
            )}

            <div className={cn("max-w-[75%]", isUser ? "items-end" : "items-start")}>
                {isUser ? (
                    // User bubble
                    <div className="rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-2.5 text-sm text-white">
                        {textContent}
                    </div>
                ) : (
                    // Assistant bubble
                    <div className={cn(
                        "rounded-2xl rounded-tl-sm px-4 py-3 ring-1",
                        message.isError
                            ? "bg-rose-950/20 ring-rose-500/20 text-rose-200"
                            : "bg-white/[0.04] ring-white/5 text-white/80"
                    )}>

                        {/* Live progress status */}
                        {message.isStreaming && (
                            <div className="mb-2 flex items-center gap-2 text-xs text-indigo-400">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                                </span>
                                <span className="font-mono text-xs text-indigo-300/90">
                                    {message.status || (message.node && NODE_LABELS[message.node]?.label) || "Analyzing data..."}
                                </span>
                            </div>
                        )}

                        {/* Message text */}
                        {textContent && (
                            <p className={cn("text-sm leading-relaxed whitespace-pre-wrap", message.isError && "text-rose-300/90")}>
                                {textContent}
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
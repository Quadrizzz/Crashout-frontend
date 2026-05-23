import type { Session } from "@/types"
import { cn } from "@/lib/utils"
import { Plus, FileText, Blocks } from "lucide-react"
import { useRef, useEffect } from "react"

interface SidebarProps {
    sessions: Session[]
    activeSessionId: string | null
    onSelectSession: (session: Session) => void
    onNewSession: () => void
    onLoadMore: () => void
    hasMore: boolean
    isLoadingMore: boolean
}

export function Sidebar({
    sessions,
    activeSessionId,
    onSelectSession,
    onNewSession,
    onLoadMore,
    hasMore,
    isLoadingMore,
}: SidebarProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const scrollContainer = scrollRef.current
        if (!scrollContainer) return

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainer
            // Load more when user scrolls to within 100px of bottom
            if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !isLoadingMore) {
                onLoadMore()
            }
        }

        scrollContainer.addEventListener('scroll', handleScroll)
        return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }, [hasMore, isLoadingMore, onLoadMore])

    return (
        <aside className="flex h-full w-56 shrink-0 flex-col border-r border-white/5 bg-[#08080d]">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-4 py-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
                    <Blocks size={14} className="text-white" />
                </div>
                <span className="font-mono text-sm font-semibold tracking-tight text-white">
                    Crashout
                </span>
            </div>

            {/* New session */}
            <div className="px-3 pb-3">
                <button
                    onClick={onNewSession}
                    className="flex w-full items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-white/40 transition-colors hover:border-white/10 hover:bg-white/[0.06] hover:text-white/60"
                >
                    <Plus size={13} />
                    New analysis
                </button>
            </div>

            <div className="mx-3 mb-3 h-px bg-white/5" />

            <p className="px-4 pb-2 font-mono text-[10px] uppercase tracking-widest text-white/20">
                Recent
            </p>

            {/* Session list */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 pb-4">
                {sessions.length === 0 ? (
                    <p className="px-2 text-xs text-white/20">No sessions yet</p>
                ) : (
                    <>
                        {sessions.map((session) => (
                            <button
                                key={session.id}
                                onClick={() => onSelectSession(session)}
                                className={cn(
                                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors",
                                    session.id === activeSessionId
                                        ? "bg-indigo-600/10 text-indigo-400"
                                        : "text-white/40 hover:bg-white/[0.03] hover:text-white/60"
                                )}
                            >
                                <FileText size={12} className="shrink-0" />
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-medium">{session.filename}</p>
                                    <p className="font-mono text-[10px] text-white/20">
                                        {session.profile?.row_count
                                            ? `${session.profile.row_count.toLocaleString()} rows`
                                            : session.filename.split(".").pop()?.toUpperCase() ?? "—"
                                        }
                                    </p>
                                </div>
                            </button>
                        ))}
                        {isLoadingMore && (
                            <div className="flex items-center justify-center py-3">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-white/40"></div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </aside>
    )
}
import { useState, useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import type { Session } from "@/types/index"
import { uploadFile, fetchSessions, fetchSessionProfile, fetchMessages } from "@/lib/api"
import { useChat } from "@/hooks/useChat"
import { useAuth } from "@/context/AuthContext"
import { Sidebar } from "@/components/layout/Sidebar"
import { ChatThread } from "@/components/chat/ChatThread"
import { ChatInput } from "@/components/chat/ChatInput"


export default function App() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoadingSession, setIsLoadingSession] = useState(false)
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreSessions, setHasMoreSessions] = useState(true)
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()

  const { messages, isLoading, sendMessage, resetMessages, setMessages } = useChat(activeSession)

  // load sessions on mount
  useEffect(() => {
    if (!token) return
    setIsLoadingSessions(true)
    fetchSessions(token, 1)
      .then((data) => {
        setSessions(data)
        setHasMoreSessions(data.length > 0)
      })
      .catch((err) => console.error("Failed to load sessions:", err))
      .finally(() => setIsLoadingSessions(false))
  }, [token])

  const loadMoreSessions = useCallback(async () => {
    if (!token || isLoadingMore || !hasMoreSessions) return
    
    setIsLoadingMore(true)
    const nextPage = currentPage + 1
    
    try {
      const newSessions = await fetchSessions(token, nextPage)
      if (newSessions.length === 0) {
        setHasMoreSessions(false)
      } else {
        setSessions((prev) => [...prev, ...newSessions])
        setCurrentPage(nextPage)
      }
    } catch (err) {
      console.error("Failed to load more sessions:", err)
    } finally {
      setIsLoadingMore(false)
    }
  }, [token, currentPage, isLoadingMore, hasMoreSessions])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  const handleUpload = useCallback(async (file: File) => {
    if (!token) {
      alert("Authentication required. Please log in again.");
      return;
    }
    
    setIsUploading(true)
    try {
      const response = await uploadFile(file, token)
      const newSession: Session = {
        id: response.session_id,
        filename: file.name,
        parquet_path: response.parquet_path,
        profile: response.profile,
        messages: [],
        created_at: new Date().toISOString(),
      }
      setSessions((prev) => [newSession, ...prev])
      setActiveSession(newSession)
      resetMessages()
    } catch (err) {
      console.error("Upload failed:", err)
      alert("Upload failed. Please check the file and try again.")
    } finally {
      setIsUploading(false)
    }
  }, [token, resetMessages])

  const handleSelectSession = async (session: Session) => {
    // if session already has a full profile loaded, just switch
    if (session.profile && session.parquet_path) {
      setActiveSession(session)
      resetMessages()
      setIsLoadingSession(true)
      try {
        const msgs = await fetchMessages(session.id, token)
        setMessages(msgs)
      } catch (err) {
        console.error("Failed to load messages:", err)
      } finally {
        setIsLoadingSession(false)
      }
      return
    }

    // otherwise fetch the full profile and messages
    setIsLoadingSession(true)
    try {
      const [profileData, msgs] = await Promise.all([
        fetchSessionProfile(session.id, token),
        fetchMessages(session.id, token),
      ])

      const fullSession: Session = {
        id: session.id,
        filename: profileData.filename,
        parquet_path: profileData.parquet_path,
        profile: profileData.profile,
        messages: [],
        created_at: session.created_at,
      }

      setActiveSession(fullSession)
      setMessages(msgs)
    } catch (err) {
      console.error("Failed to load session:", err)
    } finally {
      setIsLoadingSession(false)
    }
  }

  const handleNewSession = () => {
    setActiveSession(null)
    resetMessages()
  }

  const handleDownloadReport = async () => {
    if (!activeSession || !token) return
    
    const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/v1/sessions/${activeSession.id}/report`,
        {
            headers: { "Authorization": `Bearer ${token}` }
        }
    )

    if (!res.ok) {
        alert("Failed to generate report")
        return
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank")  // opens PDF in new tab
  } 

  if (isLoadingSessions) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0f]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-white/10 border-t-white/60"></div>
          <p className="font-mono text-sm text-white/50">Loading sessions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0f] text-white">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSession?.id ?? null}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onLoadMore={loadMoreSessions}
        hasMore={hasMoreSessions}
        isLoadingMore={isLoadingMore}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-12 items-center justify-between border-b border-white/5 px-5">
          <div className="flex items-center gap-3">
            <p className="font-mono text-xs text-white/50">
              {user?.email}
            </p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1.5 font-mono text-xs text-white/40 transition-colors hover:border-white/10 hover:bg-white/[0.05] hover:text-white/60"
              title="Sign out"
            >
              <LogOut size={12} />
              <span>Sign out</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <p className="font-mono text-xs text-white/30">
              {activeSession ? activeSession.filename : "No dataset loaded"}
            </p>
            {activeSession && (
              <button
                  onClick={handleDownloadReport}
                  className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-1.5 font-mono text-xs text-white/30 transition-colors hover:border-white/10 hover:text-white/50"
              >
                  Download report
              </button>
            )}
          </div>
        </header>

        {/* Chat area */}
        <ChatThread
          session={activeSession}
          messages={messages}
          isUploading={isUploading || isLoadingSession}
          onUpload={handleUpload}
        />

        {/* Input */}
        <ChatInput
          onSend={sendMessage}
          onUpload={handleUpload}
          isLoading={isLoading}
          hasSession={!!activeSession}
        />
      </div>
    </div>
  )
}
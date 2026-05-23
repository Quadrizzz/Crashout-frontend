import type { UploadResponse, Message, DatasetProfile, Session } from "@/types/index"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function getUser(token: string) {
    const res = await fetch(`${API_URL}/api/v1/auth/me`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || "Failed to get user")
    }

    return res.json()
}

export async function uploadFile(file: File, token: string | null): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch(`${API_URL}/api/v1/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || "Upload failed")
    }

    return res.json()
}

export async function fetchSessions(token: string | null, page: number = 1): Promise<Session[]> {
    const res = await fetch(`${API_URL}/api/v1/sessions?page=${page}`, {
        headers: { "Authorization": `Bearer ${token}` },
    })

    if (!res.ok) throw new Error("Failed to fetch sessions")

    const data = await res.json()
    // backend returns minimal session data — no profile yet
    return data.sessions
}

export async function fetchSessionProfile(
    sessionId: string,
    token: string | null
): Promise<{ session_id: string; parquet_path: string; filename: string; profile: DatasetProfile }> {
    const res = await fetch(`${API_URL}/api/v1/sessions/${sessionId}/profile`, {
        headers: { "Authorization": `Bearer ${token}` },
    })

    if (!res.ok) throw new Error("Failed to fetch session profile")
    return res.json()
}

export async function fetchMessages(
    sessionId: string,
    token: string | null
): Promise<Message[]> {
    const res = await fetch(`${API_URL}/api/v1/sessions/${sessionId}/messages`, {
        headers: { "Authorization": `Bearer ${token}` },
    })

    if (!res.ok) throw new Error("Failed to fetch messages")

    const data = await res.json()
    return data.messages.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        created_at: m.created_at,
        chart: m.chart_config ?? undefined,
        isStreaming: false,
    }))
}

export type StreamEvent =
    | { type: "progress"; node: string }
    | { type: "response"; message: string; chart_config: unknown }

export async function* streamChat({
    sessionId,
    parquetPath,
    datasetProfile,
    messages,
    message,
    token,
}: {
    sessionId: string
    parquetPath: string
    datasetProfile: DatasetProfile
    messages: Message[]
    message: string
    token: string | null
}): AsyncGenerator<StreamEvent> {
    const res = await fetch(`${API_URL}/api/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
            session_id: sessionId,
            parquet_path: parquetPath,
            dataset_profile: datasetProfile,
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            message,
        }),
    })

    if (!res.ok) throw new Error("Chat request failed")

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "))

        for (const line of lines) {
            const data = line.replace("data: ", "").trim()
            if (data === "[DONE]") return
            try {
                yield JSON.parse(data) as StreamEvent
            } catch {
                // skip malformed chunks
            }
        }
    }
}
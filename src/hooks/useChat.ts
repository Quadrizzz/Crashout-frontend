import { useState, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Message, Session } from "@/types/index"
import { streamChat } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

function formatUserFriendlyError(rawError?: string): string {
    if (!rawError) return "The analysis service is temporarily unavailable. Please try asking again."
    const lower = rawError.toLowerCase()
    if (lower.includes("503") || lower.includes("unavailable") || lower.includes("high demand") || lower.includes("overloaded")) {
        return "Our AI analysis service is experiencing high demand right now. Please wait a moment and try asking your question again."
    }
    if (lower.includes("429") || lower.includes("rate limit") || lower.includes("quota")) {
        return "We've reached a temporary capacity limit. Please wait a few seconds before trying again."
    }
    if (lower.includes("fetch") || lower.includes("network") || lower.includes("econnrefused")) {
        return "Unable to connect to the server. Please check your connection and try again."
    }
    if (lower.includes("token") || lower.includes("auth") || lower.includes("401") || lower.includes("403")) {
        return "Your session has expired. Please refresh the page or log in again."
    }
    return "We ran into an issue while analyzing the data. Please try again."
}

export function useChat(session: Session | null) {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { token } = useAuth()

    const resetMessages = useCallback(() => setMessages([]), [])

    const sendMessage = useCallback(
        async (content: string) => {
            if (!session || isLoading) return

            const userMessage: Message = {
                id: uuidv4(),
                role: "user",
                content,
            }

            const assistantId = uuidv4()
            const assistantMessage: Message = {
                id: assistantId,
                role: "assistant",
                content: "",
                isStreaming: true,
                isError: false,
            }

            setMessages((prev) => [...prev, userMessage, assistantMessage])
            setIsLoading(true)

            try {
                const stream = streamChat({
                    sessionId: session.id,
                    parquetPath: session.parquet_path,
                    datasetProfile: session.profile!,
                    messages: [...messages, userMessage],
                    message: content,
                    token,
                })

                for await (const event of stream) {
                    if (event.type === "status") {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === assistantId ? { ...m, status: event.status, node: event.node ?? m.node } : m
                            )
                        )
                    } else if (event.type === "progress") {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === assistantId ? { ...m, node: event.node } : m
                            )
                        )
                    } else if (event.type === "response") {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === assistantId
                                    ? {
                                        ...m,
                                        content: event.message,
                                        chart: event.chart_config as Message["chart"],
                                        isStreaming: false,
                                        isError: false,
                                        node: undefined,
                                        status: undefined,
                                    }
                                    : m
                            )
                        )
                    } else if (event.type === "error") {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === assistantId
                                    ? {
                                        ...m,
                                        content: formatUserFriendlyError(event.message),
                                        isStreaming: false,
                                        isError: true,
                                        node: undefined,
                                        status: undefined,
                                    }
                                    : m
                            )
                        )
                    }
                }
            } catch (err: any) {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantId
                            ? {
                                ...m,
                                content: formatUserFriendlyError(err?.message),
                                isStreaming: false,
                                isError: true,
                                node: undefined,
                                status: undefined,
                            }
                            : m
                    )
                )
            } finally {
                setIsLoading(false)
            }
        },
        [session, messages, isLoading, token]
    )

    return { messages, isLoading, sendMessage, resetMessages, setMessages }
}
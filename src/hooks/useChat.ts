import { useState, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Message, Session } from "@/types/index"
import { streamChat } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

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
                    if (event.type === "progress") {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === assistantId ? { ...m, node: event.node } : m
                            )
                        )
                    }

                    if (event.type === "response") {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === assistantId
                                    ? {
                                        ...m,
                                        content: event.message,
                                        chart: event.chart_config as Message["chart"],
                                        isStreaming: false,
                                        node: undefined,
                                    }
                                    : m
                            )
                        )
                    }
                }
            } catch {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantId
                            ? {
                                ...m,
                                content: "Something went wrong. Please try again.",
                                isStreaming: false,
                                node: undefined,
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
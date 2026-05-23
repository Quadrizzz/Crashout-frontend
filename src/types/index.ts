export type MessageRole = "user" | "assistant"

export interface ChartConfig {
    type: "bar" | "line" | "area" | "scatter" | "pie"
    title?: string
    data: Record<string, unknown>[]
    xKey: string
    yKey: string
    color?: string
}

export interface Message {
    id: string
    role: MessageRole
    content: string
    chart?: ChartConfig
    isStreaming?: boolean
    node?: string
}

export interface ColumnProfile {
    type: "numeric" | "categorical" | "datetime"
    null_count: number
    null_percentage: number
    min?: number
    max?: number
    mean?: number
    median?: number
    std?: number
    unique_count?: number
    top_values?: string[]
}

export interface DatasetProfile {
    overview?: {
        row_count: number
        column_count: number
    }
    row_count: number
    column_count: number
    suggested_analysis: []
    summary: string
    quality_flags: string[]
    columns: Record<string, ColumnProfile>
}

export interface Session {
    id: string
    filename: string
    parquet_path: string
    profile?: DatasetProfile
    messages?: Message[]
    created_at: string
}

export interface UploadResponse {
    session_id: string
    parquet_path: string
    profile: DatasetProfile
}
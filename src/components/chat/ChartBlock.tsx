import {
    BarChart, Bar,
    LineChart, Line,
    AreaChart, Area,
    ScatterChart, Scatter,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import type { ChartConfig } from "@/types/index"

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"]

const axisProps = {
    tick: { fill: "#6b7280", fontSize: 11, fontFamily: "monospace" },
    axisLine: { stroke: "#1f2937" },
    tickLine: false as const,
}

const tooltipStyle = {
    contentStyle: {
        background: "#111827",
        border: "1px solid #1f2937",
        borderRadius: "8px",
        fontSize: "12px",
        color: "#f9fafb",
    },
}

const commonProps = (data: ChartConfig["data"]) => ({
    data,
    margin: { top: 8, right: 16, left: 0, bottom: 8 },
})

export function ChartBlock({ config }: { config: ChartConfig }) {
    const type = (config as any).chart_type || config.type
    const xKey = (config as any).x_axis_key || config.xKey
    const yKey = (config as any).y_axis_keys?.[0] || config.yKey
    const { title, data, color = "#6366f1" } = config

    return (
        <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            {title && (
                <p className="mb-3 text-xs font-mono uppercase tracking-widest text-white/30">
                    {title}
                </p>
            )}
            <ResponsiveContainer width="100%" height={220}>
                {type === "bar" ? (
                    <BarChart {...commonProps(data)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis dataKey={xKey} {...axisProps} />
                        <YAxis {...axisProps} />
                        <Tooltip {...tooltipStyle} />
                        <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
                    </BarChart>
                ) : type === "line" ? (
                    <LineChart {...commonProps(data)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis dataKey={xKey} {...axisProps} />
                        <YAxis {...axisProps} />
                        <Tooltip {...tooltipStyle} />
                        <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={false} />
                    </LineChart>
                ) : type === "area" ? (
                    <AreaChart {...commonProps(data)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis dataKey={xKey} {...axisProps} />
                        <YAxis {...axisProps} />
                        <Tooltip {...tooltipStyle} />
                        <Area type="monotone" dataKey={yKey} stroke={color} fill={`${color}20`} strokeWidth={2} />
                    </AreaChart>
                ) : type === "scatter" ? (
                    <ScatterChart {...commonProps(data)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                        <XAxis dataKey={xKey} {...axisProps} />
                        <YAxis dataKey={yKey} {...axisProps} />
                        <Tooltip {...tooltipStyle} />
                        <Scatter data={data} fill={color} />
                    </ScatterChart>
                ) : (
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey={yKey}
                            nameKey={xKey}
                            cx="50%"
                            cy="50%"
                            outerRadius={75}
                            label={({ value }) => `${value}%`}
                            labelLine={true}
                        >
                            {data.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            {...tooltipStyle}
                            formatter={(value, name) => [`${value}%`, name]}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: "11px", color: "#9ca3af" }}
                            formatter={(value) => data.find((d: any) => d[xKey] === value)?.[xKey] ?? value}
                        />
                    </PieChart>
                )}
            </ResponsiveContainer>
        </div>
    )
}
import type { DatasetProfile } from "@/types"
import { formatNumber } from "@/lib/utils"
import { StampIcon, AlertTriangle, Database } from "lucide-react"

export function ProfileCard({
    profile,
    filename,
}: {
    profile: DatasetProfile
    filename: string
}) {
    return (
        <div className="mx-3 my-3 rounded-2xl border border-indigo-500/10 bg-indigo-500/[0.04] p-3.5 sm:mx-4 sm:p-4">
            {/* Header */}
            <div className="mb-3 flex items-center gap-2">
                <Database size={13} className="shrink-0 text-indigo-400" />
                <span className="truncate font-mono text-xs font-medium text-indigo-400">
                    {filename}
                </span>
            </div>

            {/* Stats row */}
            <div className="mb-3 flex flex-wrap gap-4 sm:gap-5">
                <div>
                    <p className="font-mono text-base font-semibold text-white sm:text-lg">
                        {profile.overview?.row_count ? formatNumber(profile.overview.row_count) : formatNumber(profile.row_count)}
                    </p>
                    <p className="text-xs text-white/30">rows</p>
                </div>
                <div className="w-px bg-white/5" />
                <div>
                    <p className="font-mono text-base font-semibold text-white sm:text-lg">
                        {profile.overview?.column_count ? profile.overview.column_count : profile.column_count}
                    </p>
                    <p className="text-xs text-white/30">columns</p>
                </div>
                {profile.quality_flags.length > 0 && (
                    <>
                        <div className="w-px bg-white/5" />
                        <div>
                            <p className="font-mono text-base font-semibold text-amber-400 sm:text-lg">
                                {profile.quality_flags.length}
                            </p>
                            <p className="text-xs text-white/30">flags</p>
                        </div>
                    </>
                )}
            </div>

            {/* Summary */}
            <p className="text-sm leading-relaxed break-words text-white/60">{profile.summary}</p>

            {/* Quality flags */}
            {profile.quality_flags.length > 0 && (
                <div className="mt-3 space-y-1.5">
                    {profile.quality_flags.map((flag, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-2 rounded-lg bg-amber-500/5 px-3 py-2 ring-1 ring-amber-500/10"
                        >
                            <AlertTriangle size={11} className="mt-0.5 shrink-0 text-amber-400/70" />
                            <span className="min-w-0 text-xs break-words text-amber-400/70">{flag}</span>
                        </div>
                    ))}
                </div>
            )}

            {/*Suggested Analysis*/}
            {profile.suggested_analysis && profile.suggested_analysis.length > 0 && (
                <div className="mt-3 space-y-1.5">
                    <p className="text-xs font-medium text-white/50">Suggested Analysis</p>
                    {profile.suggested_analysis.map((analysis, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-2 rounded-lg bg-green-500/5 px-3 py-2 ring-1 ring-amber-500/10"
                        >
                            <StampIcon size={11} className="mt-0.5 shrink-0 text-green-400/70" />
                            <span className="min-w-0 text-xs break-words text-green-400/70">{analysis}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

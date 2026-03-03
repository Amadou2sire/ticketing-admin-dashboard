import React from 'react';
import {
    ArrowUpRight,
    ArrowDownRight,
    Star
} from 'lucide-react';
import { cn } from '../../utils/cn';

export interface StatCardProps {
    title: string;
    value: string;
    trend: string;
    trendUp: boolean;
    icon: React.ReactNode;
    iconBg: string;
    progress?: number;
    progressColor?: string;
    subtitle?: string;
    rating?: number;
    multiProgress?: { color: string, width: string }[];
}

export function StatCard({
    title,
    value,
    trend,
    trendUp,
    icon,
    iconBg,
    progress,
    progressColor,
    subtitle,
    rating,
    multiProgress
}: StatCardProps) {
    return (
        <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBg)}>
                    {icon}
                </div>
                <div className={cn(
                    "flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold",
                    trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                    {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {trend}
                </div>
            </div>

            <div className="space-y-1">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h4 className="text-3xl font-bold tracking-tight text-slate-900">{value}</h4>
                    {rating && (
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} className={cn(i < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200")} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-5">
                {progress !== undefined && (
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", progressColor)} style={{ width: `${progress}%` }} />
                    </div>
                )}
                {subtitle && (
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{subtitle}</p>
                )}
                {multiProgress && (
                    <div className="flex gap-1">
                        {multiProgress.map((p, i) => (
                            <div key={i} className={cn("h-2 rounded-full", p.color)} style={{ width: p.width }} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

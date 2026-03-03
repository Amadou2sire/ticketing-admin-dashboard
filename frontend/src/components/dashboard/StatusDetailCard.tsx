import React from 'react';
import { cn } from '../../utils/cn';

interface StatusDetailCardProps {
    title: string;
    count: number;
    typologyData: Record<string, number>;
    icon: React.ReactNode;
    themeColor: 'emerald' | 'blue' | 'rose' | 'orange' | 'indigo';
    summary?: React.ReactNode;
}

export function StatusDetailCard({
    title,
    count,
    typologyData,
    icon,
    themeColor,
    summary
}: StatusDetailCardProps) {
    const themes = {
        emerald: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            iconBg: 'bg-emerald-100',
            textColor: 'text-emerald-600'
        },
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            iconBg: 'bg-blue-100',
            textColor: 'text-blue-600'
        },
        rose: {
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            iconBg: 'bg-rose-100',
            textColor: 'text-rose-600'
        },
        orange: {
            bg: 'bg-orange-50',
            border: 'border-orange-100',
            iconBg: 'bg-orange-100',
            textColor: 'text-orange-600'
        },
        indigo: {
            bg: 'bg-indigo-50',
            border: 'border-indigo-100',
            iconBg: 'bg-indigo-100',
            textColor: 'text-indigo-600'
        }
    };

    const theme = themes[themeColor];

    return (
        <div className="border border-slate-200 rounded-3xl p-8 bg-white shadow-sm flex flex-col">
            <h3 className="text-xl font-bold mb-6 text-slate-800">{title}</h3>
            <div className={cn("p-6 rounded-2xl border mb-6 flex-1", theme.bg, theme.border)}>
                <div className="flex items-center gap-4 mb-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", theme.iconBg, theme.textColor)}>
                        {icon}
                    </div>
                    <div>
                        <p className={cn("text-xs font-bold uppercase tracking-widest", theme.textColor)}>Total {title.split(' ').pop()}</p>
                        <p className="text-3xl font-bold text-slate-900">{count}</p>
                    </div>
                </div>
                <div className="space-y-3">
                    {Object.entries(typologyData).map(([name, count]) => (
                        <div key={name} className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-500">{name} :</span>
                            <span className="text-lg font-bold text-slate-900">{count}</span>
                        </div>
                    ))}
                    {Object.keys(typologyData).length === 0 && <p className="text-sm text-slate-400 italic">Aucune donnée disponible.</p>}
                </div>
            </div>
            {summary && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-slate-600 italic text-sm leading-relaxed">
                        {summary}
                    </div>
                </div>
            )}
        </div>
    );
}

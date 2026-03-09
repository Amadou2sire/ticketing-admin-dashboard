import React, { useMemo } from 'react';
import { cn } from '../../utils/cn';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
interface StatusDetailCardProps {
    title: string;
    count: number;
    typologyData: Record<string, number>;
    icon: React.ReactNode;
    themeColor: 'emerald' | 'blue' | 'rose' | 'orange' | 'indigo';
    summary?: React.ReactNode;
    colorMap?: Record<string, string>;
    badge?: string;
}

export function StatusDetailCard({
    title,
    count,
    typologyData,
    icon,
    themeColor,
    summary,
    colorMap,
    badge
}: StatusDetailCardProps) {
    const themes = {
        emerald: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            iconBg: 'bg-emerald-100',
            textColor: 'text-emerald-600',
            barColor: 'bg-emerald-500',
            chartColors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0']
        },
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            iconBg: 'bg-blue-100',
            textColor: 'text-blue-600',
            barColor: 'bg-blue-500',
            chartColors: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']
        },
        rose: {
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            iconBg: 'bg-rose-100',
            textColor: 'text-rose-600',
            barColor: 'bg-rose-500',
            chartColors: ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3']
        },
        orange: {
            bg: 'bg-orange-50',
            border: 'border-orange-100',
            iconBg: 'bg-orange-100',
            textColor: 'text-orange-600',
            barColor: 'bg-orange-500',
            chartColors: ['#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7']
        },
        indigo: {
            bg: 'bg-indigo-50',
            border: 'border-indigo-100',
            iconBg: 'bg-indigo-100',
            textColor: 'text-indigo-600',
            barColor: 'bg-indigo-500',
            chartColors: ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe']
        }
    };

    const theme = themes[themeColor];

    const sortedData = useMemo(() =>
        Object.entries(typologyData)
            .map(([name, val]) => ({ name, value: val }))
            .sort((a, b) => b.value - a.value),
        [typologyData]
    );

    return (
        <div className="border border-slate-200 rounded-3xl p-8 bg-white shadow-sm flex flex-col h-full hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <span className={cn("w-2.5 h-7 rounded-full", theme.barColor)} />
                    {title}
                </h3>
                {badge && (
                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-sm border", theme.iconBg, theme.textColor, theme.border)}>
                        {badge}
                    </span>
                )}
            </div>

            <div className={cn("p-6 rounded-2xl border mb-6 flex-1", theme.bg, theme.border)}>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center mb-10">
                    <div className="sm:col-span-5 h-36 relative">
                        {count > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sortedData}
                                        innerRadius={40}
                                        outerRadius={65}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {sortedData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={colorMap?.[entry.name] || theme.chartColors[index % theme.chartColors.length]}
                                            />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className={cn("w-full h-full rounded-2xl flex items-center justify-center opacity-20", theme.iconBg, theme.textColor)}>
                                <div className={cn(badge && "animate-bounce")}>
                                    {icon}
                                </div>
                            </div>
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-extrabold text-slate-900 drop-shadow-sm">{count}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tickets</span>
                        </div>
                    </div>

                    <div className="sm:col-span-7">
                        <p className="text-slate-900 text-lg font-black leading-tight mb-2">
                            Répartition par Typologie
                        </p>
                        <p className="text-slate-500 text-sm font-medium italic">
                            Analyse quantitative des interventions par catégorie pour cet état.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {sortedData.map((item, index) => {
                        const percentage = count > 0 ? (item.value / count) * 100 : 0;
                        const itemColor = colorMap?.[item.name] || theme.chartColors[index % theme.chartColors.length];

                        return (
                            <div key={item.name} className="group">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-3 h-3 rounded-full shadow-md" style={{ backgroundColor: itemColor }} />
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{item.name}</span>
                                        <div className="flex-1 border-b border-dashed border-slate-200 mx-2 opacity-30 group-hover:opacity-60 transition-opacity"></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-black text-slate-900 drop-shadow-sm">{item.value.toString().padStart(2, '0')}</span>
                                        <span className="text-[10px] font-bold text-slate-400 bg-white/80 px-2 py-0.5 rounded-md border border-slate-100 shadow-sm">{Math.round(percentage)}%</span>
                                    </div>
                                </div>
                                <div className="h-2.5 w-full bg-white/60 rounded-full overflow-hidden shadow-inner border border-slate-100/50">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: itemColor
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                    {sortedData.length === 0 && (
                        <div className="text-center py-10 opacity-30">
                            <p className="text-sm font-bold italic uppercase tracking-widest">Aucune donnée disponible</p>
                        </div>
                    )}
                </div>
            </div>

            {summary && (
                <div className="mt-auto p-5 bg-slate-50/50 rounded-2xl border border-slate-200/40 shadow-inner backdrop-blur-sm">
                    <div className="text-slate-600 italic text-sm leading-relaxed font-semibold">
                        {summary}
                    </div>
                </div>
            )}
        </div>
    );
}



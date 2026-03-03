import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PriorityItem {
    label: string;
    time: string;
    count: number;
    total: number;
    color: string;
    bg: string;
    border: string;
    bar: string;
}

interface PriorityGridProps {
    data: PriorityItem[];
}

export function PriorityGrid({ data }: PriorityGridProps) {
    return (
        <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="border border-slate-200 rounded-3xl p-8 bg-white shadow-sm flex-1">
                <h3 className="text-xl font-bold mb-8 text-slate-800">Détails des Priorités</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.map((item) => (
                        <div key={item.label} className={cn("p-5 rounded-2xl border transition-all hover:shadow-md", item.bg, item.border)}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", item.color)}>{item.label}</p>
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <Clock size={12} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Délai : {item.time}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-slate-900">{item.count}</span>
                                    <span className="text-slate-400 text-xs ml-1">/ {item.total}</span>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all duration-1000 ease-out", item.bar)}
                                    style={{ width: `${(item.total > 0 ? (item.count / item.total) * 100 : 0)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-sm text-blue-800 leading-relaxed">
                    {(() => {
                        const topPriority = [...data].sort((a, b) => b.count - a.count)[0];
                        const total = data.reduce((acc, item) => acc + item.count, 0);

                        if (total === 0) return <><strong className="mr-1">Analyse :</strong> Aucun ticket n'a été identifié pour cette période.</>;

                        return (
                            <>
                                <strong>Analyse :</strong> La répartition des priorités montre une concentration sur les interventions de type <strong>"{topPriority.label}"</strong>.
                                {topPriority.label === 'Critique' || topPriority.label === 'Urgent'
                                    ? " Une attention particulière est portée sur ces tickets critiques pour assurer la continuité du service."
                                    : " Le respect des délais est maintenu à un niveau optimal sur l'ensemble du périmètre."}
                            </>
                        );
                    })()}
                </p>
            </div>
        </div>
    );
}

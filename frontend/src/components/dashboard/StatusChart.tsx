import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip
} from 'recharts';

interface StatusData {
    name: string;
    count: number;
    color: string;
}

interface StatusChartProps {
    data: StatusData[];
    total: number;
}

export function StatusChart({ data, total }: StatusChartProps) {
    return (
        <div className="lg:col-span-5 border border-slate-200 rounded-3xl p-8 bg-white shadow-sm flex flex-col">
            <h3 className="text-xl font-bold mb-8 text-slate-800">Répartition par Statut</h3>
            <div className="flex-1 min-h-[300px] relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={10}
                            dataKey="count"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <RechartsTooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-bold text-slate-900">{total}</span>
                    <span className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Interventions</span>
                </div>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{item.count} tickets</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

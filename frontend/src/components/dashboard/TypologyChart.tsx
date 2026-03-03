import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Cell,
    ResponsiveContainer
} from 'recharts';

interface TypologyData {
    name: string;
    count: number;
    color: string;
}

interface TypologyChartProps {
    data: TypologyData[];
    total: number;
}

export function TypologyChart({ data, total }: TypologyChartProps) {
    return (
        <div className="mt-8 border border-slate-200 rounded-3xl p-8 bg-white shadow-sm">
            <h3 className="text-xl font-bold mb-8 text-slate-800">Typologie des tickets</h3>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-8 h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                            />
                            <RechartsTooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar
                                dataKey="count"
                                radius={[6, 6, 0, 0]}
                                barSize={40}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-4 space-y-4">
                    {data.map((item) => (
                        <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-sm transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-md" style={{ backgroundColor: item.color }} />
                                <span className="text-sm font-bold text-slate-700">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-slate-900">{item.count}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tickets</span>
                            </div>
                        </div>
                    ))}
                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total</span>
                            <span className="text-2xl font-black text-blue-600">{total}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

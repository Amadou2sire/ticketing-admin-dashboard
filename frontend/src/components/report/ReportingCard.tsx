import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ChevronRight } from 'lucide-react';
import { RedmineIssue } from '../../types/redmine';
import { cn } from '../../utils/cn';

interface ReportingCardProps {
    ticket: RedmineIssue;
    key?: React.Key;
}

export const ReportingCard: React.FC<ReportingCardProps> = ({ ticket }) => {
    return (
        <Link
            to={`/report/${ticket.id}`}
            className="group bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between hover:border-blue-400 hover:shadow-lg transition-all duration-300"
        >
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <FileText size={28} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{ticket.subject}</h3>
                    <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-slate-500 font-medium">{ticket.project.name}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-sm text-slate-400">Créé le {new Date(ticket.created_on).toLocaleDateString()}</span>
                        {ticket.due_date && (
                            <>
                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                <span className={cn(
                                    "text-sm font-medium",
                                    new Date(ticket.due_date) < new Date() && !ticket.status.name.toLowerCase().includes('clot') && !ticket.status.name.toLowerCase().includes('resolu')
                                        ? "text-rose-600 font-bold"
                                        : "text-slate-400"
                                )}>
                                    Échéance : {new Date(ticket.due_date).toLocaleDateString()}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-8">
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ID Redmine</p>
                    <p className="text-lg font-bold text-slate-900">#{ticket.id}</p>
                </div>
                <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                    ticket.status.name.toLowerCase().includes('clot') || ticket.status.name.toLowerCase().includes('resolu')
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-blue-50 text-blue-600"
                )}>
                    {ticket.status.name}
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
        </Link>
    );
}

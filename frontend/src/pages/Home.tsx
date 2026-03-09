import React, { useState, useEffect, useMemo } from 'react';
import {
    FileText,
    LayoutDashboard,
    Loader2,
    AlertCircle,
    Filter
} from 'lucide-react';
import { RedmineIssue } from '../types/redmine';
import { ReportingCard } from '../components/report/ReportingCard';

export function Home() {
    const [tickets, setTickets] = useState<RedmineIssue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<number | 'all'>('all');

    useEffect(() => {
        const loadTickets = async () => {
            try {
                // On demande directement au backend de filtrer par tracker_id=16 (Documentation et reporting)
                const response = await fetch('/api/redmine/tickets?tracker_id=16&limit=1000&status_id=*');
                if (!response.ok) throw new Error('Erreur lors de la récupération des tickets');
                const data = await response.json() as { issues: RedmineIssue[] };

                // Sécurité supplémentaire : on garde uniquement ce qui correspond à l'ID 16 ou au nom exact
                const filtered = data.issues.filter((issue) =>
                    issue.tracker.id === 16 ||
                    issue.tracker.name.toLowerCase() === 'documentation et reporting'
                );

                setTickets(filtered);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadTickets();
    }, []);

    // Extraire la liste unique des projets des tickets récupérés
    const projects = useMemo(() => {
        const projectMap = new Map<number, string>();
        tickets.forEach(ticket => {
            projectMap.set(ticket.project.id, ticket.project.name);
        });
        return Array.from(projectMap.entries())
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [tickets]);

    // Tickets filtrés par projet
    const filteredTickets = useMemo(() => {
        if (selectedProjectId === 'all') return tickets;
        return tickets.filter(ticket => ticket.project.id === selectedProjectId);
    }, [tickets, selectedProjectId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                    <p className="text-slate-500 font-medium">Chargement des rapports Redmine...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-rose-100 shadow-xl text-center">
                    <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Erreur de connexion</h2>
                    <p className="text-slate-500 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-8 md:p-12">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                                <LayoutDashboard size={24} />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Portail de Reporting Redmine</h1>
                        </div>
                        <p className="text-slate-500 text-lg">Sélectionnez un ticket de reporting pour générer le rapport d'activité dynamique.</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-2 pl-4 rounded-2xl border border-slate-200 shadow-sm min-w-[280px]">
                        <Filter size={18} className="text-slate-400" />
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            className="flex-1 bg-transparent border-none text-slate-600 font-medium focus:ring-0 cursor-pointer outline-none"
                        >
                            <option value="all">Tous les projets</option>
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>{project.name}</option>
                            ))}
                        </select>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={16} />
                            Documentation et reporting ({filteredTickets.length})
                        </h2>
                    </div>

                    {filteredTickets.length === 0 ? (
                        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">
                                {selectedProjectId === 'all'
                                    ? 'Aucun ticket de type "Documentation et reporting" trouvé.'
                                    : 'Aucun ticket trouvé pour ce projet.'}
                            </p>
                        </div>
                    ) : (
                        filteredTickets.map((ticket) => (
                            <ReportingCard key={ticket.id} ticket={ticket} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

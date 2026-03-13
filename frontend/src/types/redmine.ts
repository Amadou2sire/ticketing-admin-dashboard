export interface RedmineJournal {
    id: number;
    user: { id: number; name: string };
    notes: string;
    created_on: string;
}

export interface RedmineIssue {
    id: number;
    subject: string;
    project: { id: number; name: string };
    tracker: { id: number; name: string };
    status: { id: number; name: string };
    priority: { id: number; name: string };
    created_on: string;
    updated_on: string;
    due_date?: string;
    description?: string;
    journals?: RedmineJournal[];
}

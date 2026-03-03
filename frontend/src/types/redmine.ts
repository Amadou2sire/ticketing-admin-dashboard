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
}

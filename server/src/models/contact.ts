export interface Contact {
    id: number;
    phoneNumber: string | null;
    email: string | null;
    linkedid: number | null;
    linkprecedence: 'primary' | 'secondary';
    createdat: Date;
    updatedat: Date;
    deletedat: Date | null;
}

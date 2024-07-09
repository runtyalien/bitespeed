import pool from '../utils/database';
import { Contact } from '../models/contact';

interface IdentifyResponse {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
}

export class ContactService {
    async identify(email?: string, phoneNumber?: string): Promise<IdentifyResponse> {
        let primaryContact: Contact | null = null;
        const linkedContacts: Contact[] = [];
        const emails: Set<string> = new Set();
        const phoneNumbers: Set<string> = new Set();

        if (email) {
            const { rows } = await pool.query('SELECT * FROM contacts WHERE email = $1 AND deletedat IS NULL', [email]);
            for (const row of rows) {
                const contact = row as Contact;
                if (contact.linkprecedence === 'primary') {
                    primaryContact = contact;
                }
                linkedContacts.push(contact);
                emails.add(contact.email!);
                phoneNumbers.add(contact.phoneNumber!);
            }
        }

        if (phoneNumber) {
            const { rows } = await pool.query('SELECT * FROM contacts WHERE phoneNumber = $1 AND deletedat IS NULL', [phoneNumber]);
            for (const row of rows) {
                const contact = row as Contact;
                if (!primaryContact || contact.createdat < primaryContact.createdat) {
                    primaryContact = contact;
                }
                linkedContacts.push(contact);
                emails.add(contact.email!);
                phoneNumbers.add(contact.phoneNumber!);
            }
        }

        if (!primaryContact) {
            const { rows } = await pool.query(
                'INSERT INTO contacts (email, phoneNumber, linkPrecedence) VALUES ($1, $2, $3) RETURNING *',
                [email, phoneNumber, 'primary']
            );
            primaryContact = rows[0] as Contact;
        }

        for (const contact of linkedContacts) {
            if (contact.id !== primaryContact.id && contact.linkprecedence === 'primary') {
                await pool.query('UPDATE contacts SET linkPrecedence = $1, linkedid = $2 WHERE id = $3', ['secondary', primaryContact.id, contact.id]);
            }
        }

        linkedContacts.forEach(contact => {
            if (contact.linkprecedence === 'secondary' || contact.id !== primaryContact!.id) {
                emails.add(contact.email!);
                phoneNumbers.add(contact.phoneNumber!);
            }
        });

        return {
            primaryContactId: primaryContact.id,
            emails: Array.from(emails),
            phoneNumbers: Array.from(phoneNumbers),
            secondaryContactIds: linkedContacts.filter(contact => contact.linkprecedence === 'secondary').map(contact => contact.id),
        };
    }
}

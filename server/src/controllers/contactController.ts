// import { Request, Response } from 'express';
// import { ContactService } from '../services/contactService';
// import pool from '../utils/database';

// const contactService = new ContactService();

// export const identify = async (req: Request, res: Response) => {
//     const { email, phonenumber } = req.body;

//   try {
//     // Find existing contacts with the same email or phone number
//     const result = await pool.query(`
//       SELECT * FROM contacts
//       WHERE email = $1 OR phonenumber = $2
//     `, [email, phonenumber]);

//     let primaryContactId: number | null = null;
//     const emails: string[] = [];
//     const phonenumbers: string[] = [];
//     const secondaryContactIds: number[] = [];

//     if (result.rows.length > 0) {
//       // There are existing contacts
//       for (const row of result.rows) {
//         if (!primaryContactId || row.linkprecedence === 'primary') {
//           primaryContactId = row.id;
//         }
//         emails.push(row.email);
//         phonenumbers.push(row.phonenumber);
//         if (row.linkprecedence === 'secondary') {
//           secondaryContactIds.push(row.id);
//         }
//       }

//       // Check if new contact information should be added
//       if (!result.rows.some(row => row.email === email && row.phonenumber === phonenumber)) {
//         // Insert a new secondary contact
//         const newContactResult = await pool.query(`
//           INSERT INTO Contact (phonenumber, email, linkedid, linkprecedence, createdat, updatedat)
//           VALUES ($1, $2, $3, 'secondary', NOW(), NOW())
//           RETURNING id
//         `, [phonenumber, email, primaryContactId]);

//         secondaryContactIds.push(newContactResult.rows[0].id);
//         emails.push(email);
//         phonenumbers.push(phonenumber);
//       }
//     } else {
//       // No existing contacts, create a new primary contact
//       const newContactResult = await pool.query(`
//         INSERT INTO Contact (phonenumber, email, linkprecedence, createdat, updatedat)
//         VALUES ($1, $2, 'primary', NOW(), NOW())
//         RETURNING id
//       `, [phonenumber, email]);

//       primaryContactId = newContactResult.rows[0].id;
//       emails.push(email);
//       phonenumbers.push(phonenumber);
//     }

//     res.status(200).json({
//       contact: {
//         primaryContactId,
//         emails: [...new Set(emails)], // Remove duplicates
//         phonenumbers: [...new Set(phonenumbers)], // Remove duplicates
//         secondaryContactIds,
//       },
//     });
//     } catch (error) {
//         res.status(500).json({ error });
//     }
// };





import { Request, Response } from 'express';
import pool from '../utils/database';

export const identify = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  try {
    // Find existing contacts with the same email or phone number
    const result = await pool.query(`
      SELECT * FROM contacts
      WHERE email = $1 OR phonenumber = $2
    `, [email, phoneNumber]);

    let primaryContactId: number | null = null;
    const emails: string[] = [];
    const phoneNumbers: string[] = [];
    const secondaryContactIds: number[] = [];

    if (result.rows.length > 0) {
      // There are existing contacts
      for (const row of result.rows) {
        if (!primaryContactId || row.linkprecedence === 'primary') {
          primaryContactId = row.id;
        }
        if (row.email) emails.push(row.email);
        if (row.phonenumber) phoneNumbers.push(row.phonenumber); // Corrected to phonenumber
        if (row.linkprecedence === 'secondary') {
          secondaryContactIds.push(row.id);
        }
      }

      // Check if new contact information should be added
      if (!result.rows.some(row => row.email === email && row.phonenumber === phoneNumber)) {
        // Insert a new secondary contact
        const newContactResult = await pool.query(`
          INSERT INTO contacts (phonenumber, email, linkedid, linkprecedence, createdat, updatedat)
          VALUES ($1, $2, $3, 'secondary', NOW(), NOW())
          RETURNING id
        `, [phoneNumber, email, primaryContactId]);

        secondaryContactIds.push(newContactResult.rows[0].id);
        emails.push(email);
        phoneNumbers.push(phoneNumber);
      }
    } else {
      // No existing contacts, create a new primary contact
      const newContactResult = await pool.query(`
        INSERT INTO contacts (phonenumber, email, linkprecedence, createdat, updatedat)
        VALUES ($1, $2, 'primary', NOW(), NOW())
        RETURNING id
      `, [phoneNumber, email]);

      primaryContactId = newContactResult.rows[0].id;
      emails.push(email);
      phoneNumbers.push(phoneNumber);
    }

    res.status(200).json({
      contact: {
        primaryContactId,
        emails: [...new Set(emails)], // Remove duplicates
        phoneNumbers: [...new Set(phoneNumbers)], // Remove duplicates
        secondaryContactIds,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

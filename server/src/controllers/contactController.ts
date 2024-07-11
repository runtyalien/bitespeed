import { Request, Response } from 'express';
import pool from '../utils/database';

export const identify = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  try {
    let result;
    //handle email and phone number
    if (email && phoneNumber) {
      result = await pool.query(`
        SELECT * FROM contacts
        WHERE email = $1 OR phonenumber = $2
      `, [email, phoneNumber]);
    } else if (email) { //hadndle just email
      result = await pool.query(`
        SELECT * FROM contacts
        WHERE email = $1
      `, [email]);
    } else if (phoneNumber) {// handle just phone number
      result = await pool.query(`
        SELECT * FROM contacts
        WHERE phonenumber = $1
      `, [phoneNumber]);
    } else {
      return res.status(400).json({ error: 'Email or Phone Number is required' });
    }

    let primaryContactId: number | null = null;
    const emails: string[] = [];
    const phoneNumbers: string[] = [];
    const secondaryContactIds: number[] = [];

    if (result.rows.length > 0) {
      // handle existing contacts
      for (const row of result.rows) {
        if (!primaryContactId || row.linkprecedence === 'primary') {
          primaryContactId = row.id;
        }
        if (row.email) emails.push(row.email);
        if (row.phonenumber) phoneNumbers.push(row.phonenumber);
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
        `, [phoneNumber || null, email || null, primaryContactId]);

        secondaryContactIds.push(newContactResult.rows[0].id);
        if (email) emails.push(email);
        if (phoneNumber) phoneNumbers.push(phoneNumber);
      }
    } else {
      // No existing contacts, create a new primary contact
      const newContactResult = await pool.query(`
        INSERT INTO contacts (phonenumber, email, linkprecedence, createdat, updatedat)
        VALUES ($1, $2, 'primary', NOW(), NOW())
        RETURNING id
      `, [phoneNumber || null, email || null]);

      primaryContactId = newContactResult.rows[0].id;
      if (email) emails.push(email);
      if (phoneNumber) phoneNumbers.push(phoneNumber);
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

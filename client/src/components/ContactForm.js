import React, { useState } from 'react';
import axios from 'axios';

const ContactForm = () => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email && !phoneNumber) {
      alert('Please enter an email or phone number');
      return;
    }

    try {
      const res = await axios.post(`https://omkar-bitespeed-backend.vercel.app/api/identify`, {
        email,
        phoneNumber
      }, {
        withCredentials: true 
      });
      setResponse(res.data.contact);
    } catch (error) {
      console.error('Error identifying contact:', error);
      setResponse(null);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h2>Contact Identifier</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <button type="submit">Identify</button>
      </form>
      {response && (
        <div className="response">
          <h3>Contact Details</h3>
          <p><strong>Primary Contact ID:</strong> {response.primaryContactId}</p>
          <p><strong>Emails:</strong> {response.emails.join(', ')}</p>
          <p><strong>Phone Numbers:</strong> {response.phoneNumbers.join(', ')}</p>
          <p><strong>Secondary Contact IDs:</strong> {response.secondaryContactIds.join(', ')}</p>
        </div>
      )}
    </div>
  );
};

export default ContactForm;

'use client';
import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function Classifier() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dropdownValue, setDropdownValue] = useState(15);

  useEffect(() => {
    async function fetchEmails() {
      try {
        const response = await fetch(`/api/gmail/fetchEmails?limit=${dropdownValue}`);
        const data = await response.json();
        setEmails(data.emails || []);
      } catch (error) {
        console.error('Error fetching emails:', error.message);
      }
    }
    fetchEmails();
  }, [dropdownValue]);

  const handleClassify = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gmail/classifyEmails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      });
      const data = await response.json();
      setEmails(data.classifiedEmails || []);
    } catch (error) {
      console.error('Error classifying emails:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  const handleClose = () => {
    setSelectedEmail(null);
  };

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'important':
        return 'text-green-500';
      case 'marketing':
        return 'text-yellow-500';
      case 'promotion':
        return 'text-blue-500';
      case 'general':
        return 'text-blue-300';
      case 'social':
        return 'text-red-200';
      case 'spam':
        return 'text-red-500';
      default:
        return 'text-purple';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <div className="flex flex-col p-4 bg-gray-800 text-white space-y-4">
        <div className="flex justify-between items-center mb-4">
          <select
            value={dropdownValue}
            onChange={(e) => setDropdownValue(parseInt(e.target.value))}
            className="select select-primary w-20 max-w-xs"
          >
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={25}>25</option>
            <option value={30}>30</option>
            <option value={35}>35</option>
            <option value={40}>40</option>
          </select>
          <div>
            <button onClick={signOut} className="btn btn-secondary mr-2">
              Logout
            </button>
            <button className="btn btn-primary" onClick={handleClassify} disabled={loading}>
              {loading ? 'Classifying...' : 'Classify'}
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-grow">
          {emails.length > 0 ? (
            emails.map((email) => (
              <div
                key={email.id}
                className="p-4 border-b border-gray-700 cursor-pointer flex justify-between items-center"
                onClick={() => handleEmailClick(email)}
              >
                <div>
                  <strong>Subject:</strong> {email.subject}
                  <br />
                  <strong>Sender:</strong> {email.sender}
                </div>
                <div className={`ml-1 text-xl ${getClassificationColor(email.classification)}`}>
                {email.classification}
                </div>
              </div>
            ))
          ) : (
            <p>No emails to display</p>
          )}
        </div>
      </div>

      {selectedEmail && (
        <div className="fixed top-0 right-0 w-2/5 h-full bg-gray-800 text-white shadow-lg transition-transform transform translate-x-0 z-50">
          <div className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <button className="btn btn-secondary" onClick={handleClose}>
                Close
              </button>
              <div className={`ml-2 text-3xl ${getClassificationColor(selectedEmail.classification)}`}>
               {selectedEmail.classification}
              </div>
            </div>
            <div className="overflow-y-auto flex-grow">
              <strong>Subject:</strong> {selectedEmail.subject}
              <br />
              <strong>Sender:</strong> {selectedEmail.sender}
              <br />
              <div className="mt-4">
                <strong>Body:</strong> {selectedEmail.body}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


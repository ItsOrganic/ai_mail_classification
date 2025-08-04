'use client';
import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function Classifier() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dropdownValue, setDropdownValue] = useState(15);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    async function fetchEmails() {
      setIsFetching(true);
      try {
        const response = await fetch(`/api/gmail/fetchEmails?limit=${dropdownValue}`);
        const data = await response.json();
        setEmails(data.emails || []);
      } catch (error) {
        console.error('Error fetching emails:', error.message);
      } finally {
        setIsFetching(false);
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

  const getClassificationBadge = (classification) => {
    const baseClasses = "classification-badge";
    switch (classification) {
      case 'important':
        return `${baseClasses} classification-important`;
      case 'marketing':
        return `${baseClasses} classification-marketing`;
      case 'promotion':
        return `${baseClasses} classification-promotion`;
      case 'general':
        return `${baseClasses} classification-general`;
      case 'social':
        return `${baseClasses} classification-social`;
      case 'spam':
        return `${baseClasses} classification-spam`;
      default:
        return `${baseClasses} classification-general`;
    }
  };

  const getClassificationIcon = (classification) => {
    switch (classification) {
      case 'important':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'marketing':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        );
      case 'promotion':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'social':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'spam':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <div className="glass-effect border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-white">Mail Classifier</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-white/60">Emails:</label>
                <select
                  value={dropdownValue}
                  onChange={(e) => setDropdownValue(parseInt(e.target.value))}
                  className="input-modern text-sm w-20"
                >
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={25}>25</option>
                  <option value={30}>30</option>
                  <option value={35}>35</option>
                  <option value={40}>40</option>
                </select>
              </div>

              <button onClick={signOut} className="button-secondary text-sm">
                Logout
              </button>

              <button
                className="button-primary text-sm"
                onClick={handleClassify}
                disabled={loading || emails.length === 0}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Classifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>Classify Emails</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Email List */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Stats Bar */}
            <div className="glass-effect border-b border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{emails.length}</div>
                    <div className="text-xs text-white/60">Total Emails</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {emails.filter(e => e.classification === 'important').length}
                    </div>
                    <div className="text-xs text-white/60">Important</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400">
                      {emails.filter(e => e.classification === 'marketing').length}
                    </div>
                    <div className="text-xs text-white/60">Marketing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {emails.filter(e => e.classification === 'spam').length}
                    </div>
                    <div className="text-xs text-white/60">Spam</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Email List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isFetching ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-indigo-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-white/60">Loading emails...</p>
                  </div>
                </div>
              ) : emails.length > 0 ? (
                emails.map((email) => (
                  <div
                    key={email.id}
                    className="email-card card-hover"
                    onClick={() => handleEmailClick(email)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{email.sender}</p>
                            <p className="text-sm text-white/60 truncate">{email.subject}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {getClassificationIcon(email.classification)}
                        <span className={getClassificationBadge(email.classification)}>
                          {email.classification}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-white/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-white/60">No emails to display</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Email Detail Panel */}
        {selectedEmail && (
          <div className="w-1/2 border-l border-white/10 bg-black/20 backdrop-blur-xl">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="glass-effect border-b border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Email Details</h2>
                  <button
                    onClick={handleClose}
                    className="button-secondary text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Classification Badge */}
                  <div className="flex items-center space-x-3">
                    {getClassificationIcon(selectedEmail.classification)}
                    <span className={getClassificationBadge(selectedEmail.classification)}>
                      {selectedEmail.classification}
                    </span>
                  </div>

                  {/* Email Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-white/60">From:</label>
                      <p className="text-white mt-1">{selectedEmail.sender}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-white/60">Subject:</label>
                      <p className="text-white mt-1">{selectedEmail.subject}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-white/60">Content:</label>
                      <div className="mt-2 p-4 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                          {selectedEmail.body}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


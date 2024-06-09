"use client";
import {useSession} from 'next-auth/react'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function KeyPage() {
  const [apiKey, setApiKey] = useState('');
  const router = useRouter();

    const {data : session, status } = useSession();
    if(status == 'unauthenticated'){
        router.push('/')
    }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Store the API key in local storage
    localStorage.setItem('gemini-api-key', apiKey);
    // Navigate to the classifier page
    router.push('/key/classifier');
  };

  return (
    <div className="hero min-h-screen bg-base-200">
    <div className="hero-content text-center">
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-4">Enter Gemini API Key</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full px-20 border rounded"
          placeholder="Enter your Gemini API key here...(wasnt able to use key in localStorage)"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <button type="submit" className="btn btn-primary mt-2">Submit</button>
      </form>
    </div>

      </div>
      </div>
  );
}


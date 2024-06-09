'use client';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/key');
    }
  }, [status, router]);

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-6xl font-bold text-primary">Mail Classifier</h1>
          <p className="py-6 text-lg leading-loose">
            App that classifies your mails from important, marketing, spam, and
            general.
          </p>
          {!session ? (
            <button
              onClick={() => signIn('google')}
              className="btn btn-primary"
            >
             Login in With Google
            </button>
          ) : (
            <Link href="/key/classifier" className="btn btn-primary">
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}


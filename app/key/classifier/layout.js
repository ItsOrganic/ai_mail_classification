'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function KeyLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dropdownValue, setDropdownValue] = useState(15);


  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);
    const handleDropdownChange = (e) => {
    setDropdownValue(e.target.value);
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null; // or a fallback UI, if needed
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <div className="flex justify-between items-center p-4">
        <div className="flex flex-col items-center space-x-30 absolute right-58 left-80 top-40 space-y-4">
          <div className="avatar">
  <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
    <img src={session.user.image}/>
  </div>
</div>
          <div className="text-center">
            <p className="text-sm">{session.user.email}</p>
          </div>
                 </div>
         <div className="flex flex-col space-y-20 absolute right-80 top-40">

        </div>     </div>
      <div className="flex justify-center items-center flex-grow p-80">
        {children}
      </div>
    </div>
  );
}


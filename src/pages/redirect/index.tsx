import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Redirect() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      if (session.user.role === 'club') {
        router.push('/events');
      } else if (session.user.role === 'admin') {
        router.push('/clubs');
      }
    }
  }, [router.isReady]);
}

Redirect.auth = {
  role: ['club', 'admin'],
};

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';

export default function Authed({
  roles,
  nope,
  match,
  children,
}: {
  roles?: string[];
  nope?: boolean;
  match?: (RegExp | string)[];
  children: ReactNode;
}) {
  const { data: session } = useSession();
  if (nope) {
    return !session ? children : null;
  }

  if (match && session && roles.includes(session?.user.role ?? '')) {
    if (session.user.id.match(match[roles.indexOf(session.user.role)]))
      return children;
    else return null;
  }

  if (session && roles && roles.includes(session?.user.role ?? '')) {
    return children;
  } else if (!roles && !session) {
    return children;
  } else if (roles?.includes('none') && !session) {
    return children;
  } else {
    return null;
  }
}

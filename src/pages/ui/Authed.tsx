import { useSession } from "next-auth/react";
import { ReactNode } from "react";

export default function Authed({ roles, nope, children } : { roles?: string[], nope?: boolean, children: ReactNode })  {
    const { data: session } = useSession();
    if (nope)   {
        return !session ? children : null;
    }
    if (session && roles && roles.includes(session?.user.role ?? "")) {
        return children;
    }
    else if(!roles && !session)    {
        return children;
    }
    else if (roles?.includes("none") && !session)    {
        return children
    }
    else    {
        return null;
    }
}
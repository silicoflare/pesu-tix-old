import { type Session } from "next-auth";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import { type AppType } from "next/app";
import { ReactNode, useEffect } from 'react';


import { api } from "~/utils/api";

import "~/styles/globals.css";
import "tippy.js/dist/tippy.css";
import { Toaster } from "~/components/ui/toaster";

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    return (
        <SessionProvider session={session}>
            <Toaster />
            {(Component as any).auth ? (
                <Auth role={(Component as any).auth.role}>
                    <Component {...pageProps} />
                </Auth>
            ) : (
                <Component {...pageProps} />
            )}
        </SessionProvider>
    )
};


interface AuthProps {
    role: string[];
    children: ReactNode;
}

function Auth({ role, children }: AuthProps) {
    const { data: session, status } = useSession();
    const isUser = session?.user;

    useEffect(() => {
        if (status === "loading") {
            return;
        }

        if (!isUser || !role.includes(session?.user.role ?? "")) {
            signIn();
        }
    }, [isUser, status, session, role]);

    if (isUser && role.includes(session?.user.role ?? "")) {
        return <>{children}</>;
    }

    return (
        <div className="window">
            Loading...
        </div>
    );
}


export default api.withTRPC(MyApp);
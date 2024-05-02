import { type Session } from "next-auth";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import { type AppType } from "next/app";
import { ReactNode, useEffect } from 'react';

import { api } from "~/utils/api";

import "~/styles/globals.css";
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


function Auth({ role, children }: { role: string, children: ReactNode }) {
    const { data: session, status } = useSession()
    const isUser = session?.user
    useEffect(() => {
        if (status === "loading")
            return
        if (!isUser || session?.user.role !== role) {
            signIn();
        }
    }, [isUser, status, session])

    if (isUser && session.user.role == role) {
        return children
    }
    return (
        <div className="container">
            Loading...
        </div>
    )
}


export default api.withTRPC(MyApp);
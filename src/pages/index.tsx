import Head from "next/head";
import Navbar from "./ui/Navbar";

export default function Home() {
    return (
        <>
            <Head>
                <title>PESU Tix</title>
                <meta name="description" content="An event ticketing system tailored for PESU" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="flex flex-col w-screen h-screen items-center bg-background">
                <Navbar />
            </main>
        </>
    );
}

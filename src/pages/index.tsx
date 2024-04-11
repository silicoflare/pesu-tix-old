import Head from "next/head";

export default function Home() {
    return (
        <>
            <Head>
                <title>PESU Tix</title>
                <meta name="description" content="An event ticketing system tailored for PESU" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="flex flex-col w-screen h-screen items-center justify-center bg-white dark:bg-gray-950">
                <h1 className="text-5xl text-black dark:text-white font-bold">PESU Tix</h1>
            </main>
        </>
    );
}
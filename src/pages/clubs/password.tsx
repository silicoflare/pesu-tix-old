import copy from "copy-to-clipboard";
import { useAtom } from "jotai";
import { Clipboard } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { clubCreds } from "~/atoms";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { font } from "~/fonts";
import Navbar from "~/pages/ui/Navbar";

export default function ClubPassword()  {
    const [ { username, password }, setCreds ] = useAtom(clubCreds);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (!username || !password) {
            router.push('/clubs');
        }
    })


    function yoink(data: string, name: string)  {
        copy(data);
        toast({
            description: `Copied ${name} to clipboard!`,
        });
    }

    return (
        <>
            <Head>
                <title>Club Password - PESU-tix</title>
            </Head>
            <div className={`window justify-center basic gap-y-5 ${font}`}>
                <Navbar />
                <div className="flex flex-col items-center justify-center w-1/3">
                    <h1 className="text-2xl font-bold mb-5">Club Credentials</h1>
                    <span className="text-center mb-5">These are the credentials for the club created, please note them down as the password will be shown only once.</span>
                    <div className="grid grid-cols-4 w-full my-3 items-center">
                        <span className="col-span-1 mr-5 text-right">Username</span>
                        <span className="p-2 border rounded-md col-span-2">
                            { username }
                        </span>
                        <Clipboard onClick={_ => yoink(username as string, 'username')} className="ml-10" />
                    </div>
                    <div className="grid grid-cols-4 w-full my-3 items-center">
                        <span className="col-span-1 mr-5 text-right">Password</span>
                        <span className="p-2 border rounded-md col-span-2">
                            { password }
                        </span>
                        <Clipboard onClick={_ => yoink(password as string, 'password')} className="ml-10" />
                    </div>
                    <Button className="w-1/3 mt-5" 
                        onClick={_ => { 
                            router.push('/clubs'); 
                            setCreds({}); 
                    }}>
                        Proceed
                    </Button>
                </div>
            </div>
        </>
    )
}
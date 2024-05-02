import { inter } from "~/fonts";
import Navbar from "../ui/Navbar";
import { PlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default function AdminPage() {
    return (
        <div className={`flex flex-col items-center w-screen h-screen bg-background text-primary ${inter}`}>
            <Navbar />
            <div className="w-full flex flex-col items-center mt-5">
                <h1 className="text-3xl font-semibold my-5 mt-20 w-3/4 px-7 flex flex-row items-end justify-between">
                    Admin Dashboard
                    <Button>
                        <Link href="/events/create" className="flex flex-row items-center gap-x-2">
                            <PlusIcon /> Add Club
                        </Link>
                    </Button>
                </h1>
                <div className="p-7 grid grid-cols-3 w-3/4 gap-3">
                    
                </div>
            </div>
        </div>
    )
}

AdminPage.auth = {
    role: "admin"
};
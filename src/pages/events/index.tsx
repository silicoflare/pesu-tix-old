import { Button } from "~/components/ui/button";
import Navbar from "../ui/Navbar";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { inter } from "~/fonts";

export default function EventsList() {
    return (
        <div className={`flex flex-col items-center w-screen h-screen bg-background text-primary ${inter}`}>
            <Navbar />
            <div className="w-full flex flex-col items-center mt-5">
                <h1 className="text-3xl font-semibold my-5 mt-20 w-3/4 px-7 flex flex-row items-end justify-start">
                    Upcoming Events
                </h1>
                <div className="p-7 grid grid-cols-3 w-3/4 gap-3">

                </div>
            </div>
        </div>
    )
}

EventsList.auth = {
    role: "student"
}
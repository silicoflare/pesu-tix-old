import { Component, Info, KeySquare, Send, Ticket, TicketCheck } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { Event } from "~/types"
import Tippy from "@tippyjs/react";
import Authed from "./Authed";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api, server_api } from "~/utils/api";
import React, { useEffect, useRef, useState } from "react";
import { useToast } from "~/components/ui/use-toast";
import { Popover, PopoverTrigger, PopoverContent } from "~/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { Button } from "~/components/ui/button";
import copy from "copy-to-clipboard";
import moment from "moment";


type EventPostProps = {
    event: Event,
}

export default function EventPost(props: EventPostProps) {
    const ticketRef = useRef(null);
    const { id, name, date, creatorID } = props.event;
    const { data: session } = useSession();
    const [isRegd, setIsRegd] = useState(false);
    const { toast } = useToast();

    const register = api.event.addRegistration.useMutation();
    const deregister = api.event.removeRegistration.useMutation();

    useEffect(() => {
        if (session?.user.role === "student") {
            const prn = session.user.studentInfo!.prn;
            server_api.event.checkRegistration.query({ prn: prn, id: id })
                .then(res => {
                    if (res) {
                        setIsRegd(true);
                    }
                })
        }
    }, [session, id]);

    function toggleRegistration() {
        setIsRegd((old: boolean) => {
            if (old) {
                deregister.mutate({ id: id, prn: session!.user.id });
                toast({
                    description: "Unregistered from event!",
                    variant: "success"
                });
                return false;
            }
            else {
                register.mutate({ id: id, prn: session!.user.id });
                toast({
                    description: "Registered for event!",
                    variant: "success"
                });
                return true;
            }
        })
    }

    function copyLink() {
        copy(`${process.env.NEXT_PUBLIC_URL}/events/${id}`);
        toast({
            description: "Link copied to clipboard!",
        });
    }

    return (
        <div className="w-2/5 border border-border rounded-md">
            <div className="p-4 flex items-center w-full font-semibold gap-x-5 ml-3">
                <Tippy content={creatorID}>
                    <Avatar>
                        <AvatarImage src="/pragma.png" />
                    </Avatar>
                </Tippy>
                <div className="flex flex-col items-start justify-center">
                    <span className="text-xl">
                        { name }
                    </span>
                    <span className="text-xs text-gray-300">
                        { moment(date).format("LL \\at LT") }
                    </span>
                </div>
            </div>
            <Image src="/dummy_event.jpeg" className="w-full" height={500} width={500} alt="event image" />
            <div className="w-full p-5">
                <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-row items-center gap-x-5">
                        <Authed nope>
                            <Tippy content={<span><Link href="/login" className="text-blue-500 underline">Login</Link> to register!</span>} interactive>
                                <KeySquare className="w-6 h-6" />
                            </Tippy>
                        </Authed>
                        <Authed roles={["student"]}>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <span className="" ref={ticketRef}>
                                        {isRegd ? <TicketCheck className="text-green-500 w-6 h-6" /> : <Ticket className="w-6 h-6" />}
                                    </span>
                                </PopoverTrigger>
                                <Tippy content={`${isRegd ? "Unregister from" : "Register for"} event`} reference={ticketRef} />
                                <PopoverContent className="w-[25rem]">
                                    <div className="flex flex-col items-center w-full">
                                        <span className="w-full text-center flex flex-col text-xl">
                                            Are you sure you want to {isRegd ? "unregister from" : "register for"} this event?
                                            <span className="text-xs text-accent-foreground">
                                                {isRegd ? "" : "By registering, you accept all the rules of the event and your data will be shared with the club for registration."}
                                            </span>
                                        </span>
                                        <span className="flex flex-row justify-center items-center w-full gap-x-5 mt-5">
                                            <PopoverClose asChild>
                                                <Button onClick={toggleRegistration}>Yes</Button>
                                            </PopoverClose>
                                            <PopoverClose asChild>
                                                <Button variant="outline">No</Button>
                                            </PopoverClose>
                                        </span>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </Authed>
                        <Tippy content="Visit club page [WIP]">
                            <Component className="w-6 h-6" />
                        </Tippy>
                        <Tippy content="Copy event link">
                            <Send className="w-6 h-6" onClick={copyLink} />
                        </Tippy>
                    </div>
                    <Tippy content="More info">
                        <Link href={`/events/${id}`}>
                            <Info className="w-6 h-6" />
                        </Link>
                    </Tippy>
                </div>
            </div>
        </div>
    )
}
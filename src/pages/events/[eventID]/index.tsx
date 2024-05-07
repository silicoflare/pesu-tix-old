import { ChevronLeft, Eye, EyeOff, Users, Pencil, Trash } from "lucide-react";
import moment from "moment";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { montserrat } from "~/fonts";
import Navbar from "~/pages/ui/Navbar";
import { api, server_api } from "~/utils/api";
import Tippy from "@tippyjs/react";
import { Badge } from "~/components/ui/badge";
import Authed from "~/pages/ui/Authed";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import Image from "next/image";


export default function ViewEvent() {
    const { data: session } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const { eventID } = router.query;
    let ID: string = "";

    const delRef = useRef(null);
    const editRef = useRef(null);

    if (router.isReady) {
        ID = eventID as string;
    }

    const eventDelete = api.event.deleteEvent.useMutation();

    function deleteEvent() {
        eventDelete.mutate({ id: ID }, {
            onSuccess: () => {
                toast({
                    title: "Event Deleted",
                    description: "The event has been deleted",
                });
                router.push("/events");
            }
        });
    }

    const [isPublic, setIsPublic] = useState(true);
    const [isRegd, setIsRegd] = useState(false);

    const { data: formData } = api.event.getEvent.useQuery({ id: ID || "" }, {
        refetchOnWindowFocus: false,
        refetchOnMount: true
    });

    const register = api.event.addRegistration.useMutation();
    const deregister = api.event.removeRegistration.useMutation();

    useEffect(() => {
        if (session?.user.role === "student") {
            const prn = session.user.studentInfo!.prn;
            server_api.event.checkRegistration.query({ prn: prn, id: ID })
                .then(res => {
                    if (res) {
                        setIsRegd(true);
                    }
                })
        }
    }, [session, eventID]);

    useEffect(() => {
        if (formData) {
            setIsPublic(formData.public);
        }
    }, [formData, eventID]);

    const eventEdit = api.event.editEvent.useMutation();

    function togglePrivacy() {
        setIsPublic(old => {
            const event = {
                ...formData!,
                public: !old
            };
            const res = eventEdit.mutate({ event: event, id: ID });
            toast({
                description: "Changed visibility of event to " + (event.public ? "public" : "private") + "!",
                variant: "success"
            });
            return event.public;
        })
    }

    function toggleRegistration() {
        setIsRegd((old: boolean) => {
            if (old) {
                let reg: string | null = null;
                server_api.event.checkRegistration.query({ id: ID, prn: session!.user.id })
                    .then(data => {
                        reg = data?.id || null;
                        deregister.mutate({ id: ID, prn: session!.user.id, regID: reg || "" });
                        toast({
                            description: "Unregistered from event!",
                            variant: "success"
                        });
                    })
                    .catch(error => {
                        console.error("Error checking registration:", error);
                    });
                return false;

            }
            else {
                register.mutate({ id: ID, prn: session!.user.id });
                toast({
                    description: "Registered for event!",
                    variant: "success"
                });
                return true;
            }
        })
    }

    return (
        <div className={`window ${montserrat}`}>
            <Navbar />
            {formData && (
                <>
                    <span className="w-1/3 flex flex-row items-center justify-between mt-32">
                        <Link className="text-sm flex items-center hover:underline" href="/events"><ChevronLeft className="w-5 h-5" /> Back</Link>
                        <Authed roles={["club", "admin"]}>
                            <span className="flex flex-row items-center gap-x-2">
                                <Tippy content="Delete event" reference={delRef} />
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" ref={delRef}>
                                            <Trash className="w-5 h-5" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[25rem]">
                                        <div className="flex flex-col items-center w-full">
                                            <span className="w-full text-center text-lg">
                                                Are you sure you want to delete this event? <span className="uppercase font-bold">This action cannot be undone.</span>
                                            </span>
                                            <span className="flex flex-row justify-center items-center w-full gap-x-5 mt-5">
                                                <PopoverClose asChild>
                                                    <Button onClick={deleteEvent} variant="destructive">Yes</Button>
                                                </PopoverClose>
                                                <PopoverClose asChild>
                                                    <Button variant="outline">No</Button>
                                                </PopoverClose>
                                            </span>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <Tippy content="View registrations">
                                    <Link href={`/events/${ID}/registrations`}>
                                        <Button variant="outline">
                                            <Users className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                </Tippy>
                                <Tippy content={isPublic ? "Make event private" : "Make event public"} reference={editRef} />
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline">
                                            {isPublic ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[25rem]">
                                        <div className="flex flex-col items-center w-full">
                                            <span className="w-full text-center text-lg">
                                                Are you sure you want to make this event {isPublic ? "private" : "public"}?
                                            </span>
                                            <span className="flex flex-row justify-center items-center w-full gap-x-5 mt-5">
                                                <PopoverClose asChild>
                                                    <Button onClick={togglePrivacy}>Yes</Button>
                                                </PopoverClose>
                                                <PopoverClose asChild>
                                                    <Button variant="outline">No</Button>
                                                </PopoverClose>
                                            </span>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <Tippy content="Edit event">
                                    <Button onClick={() => router.push("/events/" + ID + "/edit")}>
                                        <Pencil className="w-5 h-5" />
                                    </Button>
                                </Tippy>
                            </span>
                        </Authed>
                    </span>
                    <h1 className="w-1/3 text-4xl font-semibold text-left mt-5">{formData.name}</h1>
                    <div className="w-1/3 my-2 flex items-center justify-between">
                        <span>{moment(formData.date).format("LL \\at LT")}</span>
                        <Badge>{formData.type}</Badge>
                    </div>
                    <Image src="/dummy_event.jpeg" className="w-1/3 py-5" height={500} width={500} alt="event image" />
                    <div className="w-1/3 mt-10 text-lg" dangerouslySetInnerHTML={{ __html: formData.description }}></div>
                    <Authed roles={["student"]}>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={isRegd ? "outline" : "default"} className="w-1/3 mt-10">{isRegd ? "Unregister" : "Register"}</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[25rem]">
                                <div className="flex flex-col items-center w-full">
                                    <span className="w-full text-center flex flex-col text-xl">
                                        Are you sure you want to {isRegd ? "unregister from" : "register for"} this event?
                                        <span className="text-xs text-accent-foreground">
                                            {isRegd ? "" : "By registering, you accept all the rules of the event and your data will be shared with the club for registration."}
                                        </span>
                                    </span>
                                    {/* <span className="flex flex-row justify-center items-center w-full gap-x-5 mt-5">
                                        <PopoverClose onClick={toggleRegistration} className="bg-gray-900 text-gray-50 shadow hover:bg-gray-900/90 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90">Yes</PopoverClose>
                                        <PopoverClose>Yes</PopoverClose>
                                    </span> */}
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
                    <Authed>
                        <div className="mt-10">
                            <Link href="/login" className="text-blue-500 underline">Sign in</Link> to register for the event!
                        </div>
                    </Authed>
                </>
            )}
        </div>
    )
}
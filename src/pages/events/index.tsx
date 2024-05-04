import { useEffect, useState } from "react";
import Navbar from "~/pages/ui/Navbar";
import { montserrat } from '~/fonts';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { CheckCircle2, EyeIcon, EyeOffIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Event } from "~/types";
import moment from "moment";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import Authed from "~/pages/ui/Authed";
import Image from "next/image";
import EventPost from "../ui/EventPost";
import Head from "next/head";

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const router = useRouter();
    const { data: session } = useSession();

    const { data: clubEvents } = api.event.getAllEvents.useQuery(
        { username: session?.user.id },
        {
            refetchOnWindowFocus: false,
            enabled: session?.user.role === 'club' || session?.user.role === 'admin',
        }
    );

    const { data: publicEvents } = api.event.getAllEvents.useQuery(
        {},
        {
            refetchOnWindowFocus: false,
            enabled: session?.user.role !== 'club' && session?.user.role !== 'admin',
        }
    );

    useEffect(() => {
        if (clubEvents) {
            setEvents(
                clubEvents.map((x) => ({
                    id: x.id,
                    name: x.name,
                    type: x.type as Event['type'],
                    description: x.description,
                    date: x.date,
                    creatorID: x.creatorID,
                    public: x.public,
                    registrations: x?.registrations,
                }))
            );
        }
        else if (publicEvents) {
            setEvents(
                publicEvents.map((x) => ({
                    id: x.id,
                    name: x.name,
                    type: x.type as Event['type'],
                    description: x.description,
                    date: x.date,
                    creatorID: x.creatorID,
                    public: x.public,
                    registrations: x?.registrations,
                }))
            );
        }
    }, [clubEvents, publicEvents]);


    return (
        <>
            <Authed roles={["student", "none"]}>
                <Head>
                    <title>Events - PESU-tix</title>
                </Head>
            </Authed>
            <Authed roles={["admin", "club"]}>
                <Head>
                    <title>Events by {session?.user.clubInfo?.name}</title>
                </Head>
            </Authed>
            <div className={`flex flex-col items-center w-screen h-screen bg-background text-primary ${montserrat}`}>
                <Navbar />
                <div className="w-full flex flex-col items-center mt-5">
                    <Authed roles={["club", "admin"]}>
                        <h1 className="text-3xl font-semibold my-5 mt-20 w-3/4 px-7 flex flex-row items-center justify-between">
                            Events by {session?.user.clubInfo?.name}
                            <Button>
                                <Link href="/events/create" className="flex flex-row items-center gap-x-2">
                                    <PlusIcon /> Add Event
                                </Link>
                            </Button>
                        </h1>
                        <div className="p-7 grid grid-cols-3 w-3/4 gap-3 items-center justify-center">
                            {
                                events.map((event: Event) => {
                                    return (
                                        <Card className="transition duration-200 cursor-default hover:scale-105" key={event.id} onClick={() => router.push(`/events/${event.id}`)}>
                                            <CardHeader className="flex flex-col items-start justify-center">
                                                <CardTitle className="text-xl">{event.name}</CardTitle>
                                                <div className="flex items-center justify-between w-full">
                                                    <Badge>{event.type}</Badge>
                                                    <Authed roles={["student"]}>
                                                        {event.registrations?.some(x => x?.prn == session?.user.id) ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <CheckCircle2 className="w-5 h-5 text-accent" />}
                                                    </Authed>
                                                    <Authed roles={["club", "admin"]}>
                                                        {event.public ? <EyeIcon className="w-6 h-6" /> : <EyeOffIcon className="w-6 h-6" />}
                                                    </Authed>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex flex-row items-center justify-between mt-3">
                                                <span className="text-primary w-full text-center">
                                                    {moment(event.date).format("LL \\at LT")}
                                                </span>
                                            </CardContent>
                                        </Card>
                                    )
                                })
                            }
                        </div>
                    </Authed>
                    <Authed roles={["student", "none"]}>
                        <div className="p-7 flex flex-col items-center w-3/4 gap-y-10 mt-20">
                            {
                                events.map((event: Event) => {
                                    return (
                                        <EventPost event={event} key={event.id} />
                                    )
                                })
                            }
                        </div>
                    </Authed>
                </div>
            </div>
        </>
    )
}
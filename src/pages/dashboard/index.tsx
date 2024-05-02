import { useEffect, useState } from "react";
import Navbar from "../ui/Navbar";
import { inter } from '~/fonts';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Event } from "~/types";
import moment from "moment";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { editEventID } from "~/atoms";

export default function Dashboard() {
    const { data: session } = useSession();
    const [events, setEvents] = useState<Event[]>([]);
    const router = useRouter();

    const [editEventId, setEditEvent] = useAtom(editEventID);

    const { data } = api.event.getAllEvents.useQuery({ username: session?.user.id });
    useEffect(() => {
        if (data) {
            const newData = data.map(x => ({
                id: x.id,
                name: x.name,
                type: x.type as Event["type"],
                description: x.description,
                date: x.date,
                creatorID: x.creatorID,
            }));
            setEvents(newData);
        }
    }, [data, session]);

    function editEvent(id: string) {
        setEditEvent(id);
        router.push("/events/edit");
    }

    return (
        <div className={`flex flex-col items-center w-screen h-screen bg-background text-primary ${inter}`}>
            <Navbar />
            <div className="w-full flex flex-col items-center mt-5">
                <h1 className="text-3xl font-semibold my-5 mt-20 w-3/4 px-7 flex flex-row items-end justify-between">
                    Club Dashboard
                    <Button>
                        <Link href="/events/create" className="flex flex-row items-center gap-x-2">
                            <PlusIcon /> Add Event
                        </Link>
                    </Button>
                </h1>
                <div className="p-7 grid grid-cols-3 w-3/4 gap-3">
                    {
                        events.map((event: Event) => {
                            return (
                                <Card className="hover:scale-105 transition duration-200" key={event.id} onClick={() => editEvent(event.id ?? "")}>
                                    <CardHeader>
                                        <CardTitle>{event.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-row items-center justify-between">
                                        <span className="text-primary text-lg">
                                            {moment(event.date).format("LL \\at LT")}
                                        </span>
                                        <Badge>{event.type}</Badge>
                                    </CardContent>
                                </Card>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}

Dashboard.auth = {
    role: "club"
};

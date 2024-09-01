import { useEffect, useState } from 'react';
import Navbar from '~/pages/ui/Navbar';
import { font } from '~/fonts';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { CheckCircle2, EyeIcon, EyeOffIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Event } from '~/types';
import moment from 'moment';
import { api, server_api } from '~/utils/api';
import { useRouter } from 'next/router';
import Authed from '~/pages/ui/Authed';
import Image from 'next/image';
import EventPost from '~/pages/ui/EventPost';
import Head from 'next/head';
import useSWR from 'swr';

export default function EventsPage() {
  // const [events, setEvents] = useState<Event[]>([]);
  const router = useRouter();
  const { data: session } = useSession();

  const {
    data: events,
    isLoading,
    mutate,
  } = useSWR(
    'getAllEvents',
    () => {
      return server_api.event.getAllEvents.query({});
    },
    {
      revalidateOnMount: true,
    },
  );

  return (
    <>
      <Head>
        <title>Events - PESU-tix</title>
      </Head>
      <div
        className={`flex flex-col items-center w-screen h-screen bg-background text-primary ${font}`}
      >
        <Navbar />
        <div className="w-full flex flex-col items-center mt-5">
          <div className="p-7 flex flex-col items-center w-3/4 gap-y-10 mt-20">
            {!isLoading &&
              events.map((event: Event) => {
                return <EventPost event={event} key={event.id} />;
              })}
          </div>
        </div>
      </div>
    </>
  );
}

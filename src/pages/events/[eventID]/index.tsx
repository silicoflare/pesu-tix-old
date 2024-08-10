import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import { api, server_api } from '~/utils/api';
import Authed from '~/pages/ui/Authed';
import Image from 'next/image';
import Head from 'next/head';
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Users,
  Pencil,
  Trash,
  User,
  Info,
  Link2,
  KeySquare,
  Clipboard,
  Trash2,
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useToast } from '~/components/ui/use-toast';
import { Badge } from '~/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { PopoverClose } from '@radix-ui/react-popover';
import { Tabs, TabsTrigger, TabsList, TabsContent } from '~/components/ui/tabs';
import moment from 'moment';
import { font } from '~/fonts';
import Navbar from '~/pages/ui/Navbar';
import Tippy from '@tippyjs/react';
import { Input } from '~/components/ui/input';
import copy from 'copy-to-clipboard';
import { namify, nhost } from '~/tools';
// import { QueryClientContext } from "~/pages/_app";
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function ViewEvent() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { eventID, teamID } = router.query;
  let ID: string = '';

  const delRef = useRef(null);
  const editRef = useRef(null);
  const credRef = useRef(null);

  if (router.isReady) {
    ID = eventID as string;
  }

  const [regTeamType, setRegTeamType] = useState<'create' | 'join'>('create');
  const [regTeamName, setRegTeamName] = useState('');
  const [regTeamID, setRegTeamID] = useState('');
  const [isRegd, setIsRegd] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [regInfo, setRegInfo] = useState<{
    id: string;
    eventId: string;
    regType: string;
    teamName: string | null;
    maxTeamMembers: number;
    students: any[];
    ownerID: string | null;
  } | null>(null);

  const eventDelete = api.event.deleteEvent.useMutation();

  function deleteEvent() {
    eventDelete.mutate(
      { id: ID },
      {
        onSuccess: () => {
          toast({
            title: 'Event Deleted',
            description: 'The event has been deleted',
          });
          router.push('/events');
        },
      },
    );
  }

  const [isPublic, setIsPublic] = useState(true);

  const { data: formData } = api.event.getEvent.useQuery(
    { id: ID || '' },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  );

  useQuery({
    queryKey: ['checkRegistration'],
    queryFn: () => {
      if (router.isReady && session?.user.studentInfo) {
        server_api.event.checkRegistration
          .query({ prn: session!.user.studentInfo!.prn, id: ID })
          .then((res) => {
            // console.log(res);
            if (res === null) {
              setIsRegd(false);
              setRegInfo(null);
            } else {
              setRegInfo(res);
              setIsRegd(true);
            }
          });
        setRegTeamID((teamID as string) || '');
        setRegTeamType(teamID ? 'join' : 'create');
      }
      return true;
    },
  });

  const queryClient = useQueryClient();

  const register = api.event.addRegistration.useMutation();
  const deregister = api.event.removeRegistration.useMutation();

  function fetchRegData() {
    if (session?.user.role === 'student') {
      if (router.isReady) {
        const prn = session.user.studentInfo!.prn;
        server_api.event.checkRegistration
          .query({ prn: prn, id: ID })
          .then((res) => {
            // console.log(res);
            if (res === null) {
              setIsRegd(false);
              setRegInfo(null);
            } else {
              setRegInfo(res);
              setIsRegd(true);
            }
          });
        setRegTeamID((teamID as string) || '');
        setRegTeamType(teamID ? 'join' : 'create');
      }
    }
  }

  useEffect(() => {
    fetchRegData();
  }, [eventID, teamID, router.isReady, formData]);

  useEffect(() => {
    fetchRegData();
  }, []);

  useEffect(() => {
    if (formData) {
      setIsPublic(formData.public);
      setImgUrl(nhost.storage.getPublicUrl({ fileId: formData.imageURL }));
    }
  }, [formData, eventID]);

  const eventEdit = api.event.editEvent.useMutation();

  function togglePrivacy() {
    setIsPublic((old) => {
      const event = {
        ...formData!,
        public: !old,
      };
      const res = eventEdit.mutate({ event: event, id: ID });
      toast({
        description:
          'Changed visibility of event to ' +
          (event.public ? 'public' : 'private') +
          '!',
        variant: 'success',
      });
      return event.public;
    });
  }

  function toggleRegistration(teamName?: string, teamID?: string) {
    setIsRegd((old: boolean) => {
      let newVal = old;
      if (old) {
        deregister.mutate(
          { id: ID, prn: session!.user.id, regID: regInfo?.id || '' },
          {
            onSuccess: () => {
              setRegInfo(null);
              setIsRegd(false);
              toast({
                description: 'Unregistered from event!',
                variant: 'success',
              });
            },
          },
        );
        newVal = false;
      } else {
        register.mutate(
          {
            id: ID,
            prn: session!.user.id,
            teamName: teamName || undefined,
            teamID: teamID || undefined,
          },
          {
            onSuccess: (data) => {
              setRegInfo(data);
              setIsRegd(true);
              toast({
                description: 'Registered for event!',
                variant: 'success',
              });
              newVal = true;
            },
            onError: (e) => {
              toast({
                description: e.message,
                variant: 'destructive',
              });
              newVal = false;
            },
          },
        );
      }
      return newVal;
    });
    queryClient.invalidateQueries();
  }

  function kickOut(prn: string, name: string) {
    deregister.mutate(
      { id: ID, prn: prn, regID: regInfo?.id || '' },
      {
        onSuccess: () => {
          toast({
            description: `Kicked ${namify(name)} out of the team!`,
            variant: 'success',
          });
          queryClient?.invalidateQueries();
          fetchRegData();
        },
      },
    );
  }

  function yoink(data: string, name: string) {
    copy(data);
    toast({
      description: `Copied ${name} to clipboard!`,
    });
  }

  return (
    <div className={`window ${font}`}>
      <Head>
        <title>{formData?.name} - PESU-tix</title>
      </Head>
      <Navbar />
      {formData && (
        <>
          <span className="w-1/3 flex flex-row items-center justify-between mt-32">
            <Link
              className="text-sm flex items-center hover:underline"
              href="/events"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </Link>
            <Authed roles={['club', 'admin']}>
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
                        Are you sure you want to delete this event?{' '}
                        <span className="uppercase font-bold">
                          This action cannot be undone.
                        </span>
                      </span>
                      <span className="flex flex-row justify-center items-center w-full gap-x-5 mt-5">
                        <PopoverClose asChild>
                          <Button onClick={deleteEvent} variant="destructive">
                            Yes
                          </Button>
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
                <Tippy content="View event credentials" reference={credRef} />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" ref={credRef}>
                      <KeySquare className="w-5 h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[25rem]">
                    <h1 className="text-xl font-bold w-full text-center">
                      Event Credentials
                    </h1>
                    <div className="grid grid-cols-[25%,60%,15%] items-center w-full gap-y-3 gap-x-2 mt-3">
                      <span>Username:</span>
                      <span className="p-2 border rounded-md text-sm">
                        {formData.id}
                      </span>
                      <span>
                        <Button
                          variant="outline"
                          className="w-10 p-1"
                          onClick={() => yoink(formData.id, 'username')}
                        >
                          <Clipboard className="w-5 h-5" />
                        </Button>
                      </span>
                      <span>Password:</span>
                      <span className="p-2 border rounded-md text-sm">
                        {formData.password}
                      </span>
                      <span className="flex gap-x-2">
                        <Button
                          variant="outline"
                          className="w-10 p-1"
                          onClick={() => yoink(formData.password, 'password')}
                        >
                          <Clipboard className="w-5 h-5" />
                        </Button>
                      </span>
                    </div>
                  </PopoverContent>
                </Popover>
                <Tippy
                  content={
                    isPublic ? 'Make event private' : 'Make event public'
                  }
                  reference={editRef}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      {isPublic ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[25rem]">
                    <div className="flex flex-col items-center w-full">
                      <span className="w-full text-center text-lg">
                        Are you sure you want to make this event{' '}
                        {isPublic ? 'private' : 'public'}?
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
                {/* <Tippy content="Edit event">
                                    <Button onClick={() => router.push("/events/" + ID + "/edit")}>
                                        <Pencil className="w-5 h-5" />
                                    </Button>
                                </Tippy> */}
              </span>
            </Authed>
          </span>
          <h1 className="w-1/3 text-4xl font-semibold text-left mt-5">
            {formData.name}
          </h1>
          <span className="w-1/3">
            {moment(formData.date).format('LL \\at LT')}
          </span>
          <div className="w-1/3 my-3 mt-5 flex items-center justify-between">
            {formData.participation === 'SOLO' ? (
              <Button variant="outline">
                <User />
                Solo
              </Button>
            ) : (
              <Button
                variant="outline"
                className="cursor-default hover:bg-background flex items-center gap-x-3"
              >
                <Users />
                Teams of {formData.maxTeamMembers}
              </Button>
            )}
            <Badge>{formData.type}</Badge>
          </div>
          <Image
            src={imgUrl === '' ? '/dummy_event.jpeg' : imgUrl}
            className="w-1/3 py-5"
            height={500}
            width={500}
            alt="event image"
          />
          <div
            className="w-1/3 mt-10 text-lg"
            dangerouslySetInnerHTML={{ __html: formData.description }}
          ></div>
          <Authed roles={['student']}>
            {regInfo === null ||
            regInfo?.regType === 'SOLO' ||
            (regInfo?.regType === 'TEAM' && !isRegd) ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={isRegd ? 'outline' : 'default'}
                    className="w-1/3 mt-10"
                  >
                    {isRegd ? 'Unregister' : 'Register'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[25rem]">
                  {formData.participation === 'SOLO' ? (
                    <div className="flex flex-col items-center w-full">
                      <span className="w-full text-center flex flex-col text-xl">
                        Are you sure you want to{' '}
                        {isRegd ? 'unregister from' : 'register for'} this
                        event?
                        <span className="text-xs text-accent-foreground">
                          {isRegd
                            ? ''
                            : 'By registering, you accept all the rules of the event and your data will be shared with the club for registration.'}
                        </span>
                      </span>
                      <span className="flex flex-row justify-center items-center w-full gap-x-5 mt-5">
                        <PopoverClose asChild>
                          <Button onClick={() => toggleRegistration()}>
                            Yes
                          </Button>
                        </PopoverClose>
                        <PopoverClose asChild>
                          <Button variant="outline">No</Button>
                        </PopoverClose>
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center w-full">
                      <Tabs
                        defaultValue={regTeamType}
                        className="w-full bg-transparent"
                      >
                        <TabsList className="w-full grid grid-cols-2 bg-transparent gap-2">
                          <TabsTrigger
                            value="create"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border rounded-md"
                          >
                            Create Team
                          </TabsTrigger>
                          <TabsTrigger
                            value="join"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border rounded-md"
                          >
                            Join Team
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="create">
                          <div className="flex flex-col items-center w-full">
                            <span className="w-full text-center text-xl font-semibold">
                              Create Team
                            </span>
                            <span className="w-full flex items-center">
                              Team Name:
                              <Input
                                value={regTeamName}
                                onChange={(e) => setRegTeamName(e.target.value)}
                              />
                            </span>
                            <br />
                            <span className="text-xs text-accent-foreground my-5">
                              By registering, you accept all the rules of the
                              event and your data will be shared with the club
                              for registration.
                            </span>
                            <PopoverClose asChild>
                              <Button
                                onClick={() => toggleRegistration(regTeamName)}
                              >
                                Yes
                              </Button>
                            </PopoverClose>
                          </div>
                        </TabsContent>
                        <TabsContent value="join">
                          <div className="flex flex-col items-center w-full">
                            <span className="w-full text-center text-xl font-semibold">
                              Join Team
                            </span>
                            <span className="w-full flex items-center">
                              Team ID:
                              <Input
                                value={regTeamID}
                                onChange={(e) => setRegTeamID(e.target.value)}
                              />
                            </span>
                            <br />
                            <span className="text-xs text-accent-foreground my-5">
                              By registering, you accept all the rules of the
                              event and your data will be shared with the club
                              for registration.
                            </span>
                            <PopoverClose asChild>
                              <Button
                                onClick={() =>
                                  toggleRegistration(undefined, regTeamID)
                                }
                              >
                                Yes
                              </Button>
                            </PopoverClose>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            ) : (
              <div className="flex flex-col items-center w-1/3 p-5 rounded-md border mt-10">
                <span className="w-full text-center text-xl font-semibold">
                  {regInfo?.teamName}
                </span>
                <span className="w-full grid grid-cols-2 gap-3 px-5 my-3">
                  <Button onClick={() => yoink(`${regInfo?.id}`, 'Team ID')}>
                    <Info />
                    &nbsp;Copy Team ID
                  </Button>
                  <Button
                    onClick={() =>
                      yoink(
                        `${process.env.NEXT_PUBLIC_URL}/events/${ID}?teamID=${regInfo?.id}`,
                        'Team Link',
                      )
                    }
                  >
                    <Link2 />
                    &nbsp;Copy Team Link
                  </Button>
                </span>
                <span className="w-full grid grid-cols-2 items-center my-3 px-5 gap-2">
                  {regInfo?.students.map((student) => (
                    <span
                      key={student.prn}
                      className="w-full text-center flex items-center justify-center gap-x-3"
                      style={{
                        color: regInfo.ownerID === student.prn ? 'green' : '',
                      }}
                    >
                      {namify(student.name)}
                      {regInfo.ownerID === session?.user.id &&
                        student.prn !== regInfo.ownerID && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost">
                                <Trash2 className="w-5 h-5 text-white" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[25rem]">
                              <div className="flex flex-col items-center w-full">
                                <span className="w-full text-center flex flex-col text-xl">
                                  Are you sure you want to kick {student.name}{' '}
                                  from this team?
                                </span>
                                <span className="flex flex-row justify-center items-center w-full gap-x-5 mt-5">
                                  <PopoverClose asChild>
                                    <Button
                                      onClick={() =>
                                        kickOut(student.prn, student.name)
                                      }
                                    >
                                      Yes
                                    </Button>
                                  </PopoverClose>
                                  <PopoverClose asChild>
                                    <Button variant="outline">No</Button>
                                  </PopoverClose>
                                </span>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                    </span>
                  ))}
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="destructive" className="w-1/3">
                      Unregister
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[25rem]">
                    <div className="flex flex-col items-center w-full">
                      <span className="w-full text-center flex flex-col text-xl">
                        Are you sure you want to unregister from this event?
                      </span>
                      <span className="flex flex-row justify-center items-center w-full gap-x-5 mt-5">
                        <PopoverClose asChild>
                          <Button
                            onClick={() =>
                              toggleRegistration(undefined, regInfo?.id)
                            }
                          >
                            Yes
                          </Button>
                        </PopoverClose>
                        <PopoverClose asChild>
                          <Button variant="outline">No</Button>
                        </PopoverClose>
                      </span>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </Authed>
          <Authed>
            <div className="mt-10">
              <Link href="/login" className="text-blue-500 underline">
                Sign in
              </Link>{' '}
              to register for the event!
            </div>
          </Authed>
        </>
      )}
    </div>
  );
}

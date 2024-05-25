import { useRouter } from "next/router";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "~/components/ui/table";
import { montserrat } from "~/fonts";
import Navbar from "~/pages/ui/Navbar";
import { api, server_api } from "~/utils/api";
import { useEffect, useState } from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import Barcode from "react-barcode";
import { useAtom } from "jotai";
import { dark } from "~/atoms";
import { namify, snakify, studentField } from "~/tools";
import { ChevronLeft, Download, Trash2 } from "lucide-react";
import copy from "copy-to-clipboard";
import { useToast } from "~/components/ui/use-toast";
import Link from "next/link";
import * as htmlToImage from "html-to-image";
import download from "downloadjs";
import Head from "next/head";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Event } from "~/types";

export default function Registrations() {
    const router = useRouter();
    const { eventID } = router.query;
    let ID: string = "";

    const queryClient = useQueryClient();

    const [isDark] = useAtom(dark);
    const { toast } = useToast();

    if (router.isReady) {
        ID = eventID as string;
    }

    const [ eventData, setEventData ] = useState<Event | null>(null);

    useQuery({
        queryKey: ["fetchEvent"],
        queryFn: () => {
            server_api.event.getEvent.query({ id: ID }).then(res => {
                setEventData(res);
            });
            return null;
        }
    });

    const removeReg = api.event.removeRegistration.useMutation();

    type CheckList = Record<string, boolean> & {
        [key: string]: boolean;
    };

    type Student = {
        prn: string;
        srn: string;
        name: string;
        phone: string | null;
        email: string | null;
        program: string;
        branch: string;
        semester: string;
        section: string;
        campus: string;
        cycle: string;
    }

    const [checkedList, setCheckedList] = useState<Record<string, boolean>>({});
    const [ allCheck, setAllCheck ] = useState(false);
    const [viewData, setViewData] = useState<Student | null>(null);

    useEffect(() => {
        if (eventData?.registrations) {
            eventData.registrations.forEach((reg) => {
                setCheckedList((prevCheckedList) => ({
                    ...prevCheckedList,
                    [reg.id]: false,
                }));
            });
        }
    }, []);

    useEffect(() => {
        setAllCheck(Object.values(checkedList).every((checked) => checked));
    }, [ checkedList ]);

    useEffect(() => {
        setAllCheck(Object.values(checkedList).every((checked) => checked));
    }, [ ]);

    function downloadImage(name: string)    {
        htmlToImage.toPng(document.getElementById("idcard") as HTMLElement, {
            quality: 1,
            canvasHeight: 1080,
            canvasWidth: 1080
        })
            .then((dataUrl) => {
                download(dataUrl, `${snakify(name)}.png`);
            })
    }

    const toggleAllChecked = () => {
        setAllCheck((prevAllCheck) => {
            const newCheckedList = Object.fromEntries(
                Object.entries(checkedList).map(([key, _]) => [key, !prevAllCheck])
            );
            setCheckedList(newCheckedList);
            return !prevAllCheck;
        });
    };

    function removeRegistration()  {
        const ids = Object.keys(checkedList).filter((id) => checkedList[id]);
        // console.log(ids);
        if (ids.length > 0) {
            for (let id of ids) {
                removeReg.mutate({ id: ID, regID: id });
            }
            toast({
                description: "Successfully removed registration",
                variant: "success"
            });
            queryClient.invalidateQueries();
        }
    }

    return (
        <div className={`window ${montserrat}`}>
            <Head>
                <title>Registrations for {eventData?.name} - PESU-tix</title>
            </Head>
            <Navbar />
            {eventData && (
                <>
                    <span className="w-3/4 items-start mt-32">
                        <Link className="text-sm flex items-center hover:underline" href={`/events/${ID}`}><ChevronLeft className="w-5 h-5" /> Back</Link>
                    </span>
                    <h1 className="text-4xl font-semibold mb-10">Registrations for {eventData.name}</h1>
                    {eventData!.registrations!.length > 0 ? (
                        <div className="w-3/4">
                            <div className="flex flex-row justify-end gap-3 w-full my-5">
                                <Button onClick={removeRegistration} disabled={!Object.values(checkedList).every((checked) => checked)} className="flex gap-x-2">
                                    <Trash2 className="w-5 h-5" /> Remove Registration
                                </Button>
                            </div>
                            <Table className="rounded-t-md">
                                <TableHeader>
                                    <TableRow className="bg-secondary">
                                        <TableHead className="flex items-center">
                                            <Checkbox checked={allCheck} onClick={toggleAllChecked} />
                                        </TableHead>
                                        <TableHead>Registration ID</TableHead>
                                        {
                                            eventData.participation !== "SOLO" ? <TableHead>Team Name</TableHead> : null
                                        }
                                        {
                                            eventData.participation === "SOLO" ? (
                                                <TableHead>Student Name</TableHead>
                                            ) : (
                                                <TableHead>Participants</TableHead>
                                            )
                                        }
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {
                                        eventData!.registrations!.map((reg) => (
                                            <TableRow key={reg.id} className={`items-center ${checkedList[reg.id] ? "bg-accent" : "" }`}>
                                                <TableCell className="flex items-center"><Checkbox checked={checkedList[reg.id]} onClick={() => setCheckedList(old => ({ ...old, [reg.id]: !old[reg.id] }))} /></TableCell>
                                                <TableCell>{reg.id}</TableCell>
                                                {
                                                    eventData.participation !== "SOLO" ? <TableCell>{reg.teamName}</TableCell> : null
                                                }
                                                <TableCell>
                                                    {
                                                        <Dialog>
                                                            <DialogTrigger className="flex items-center gap-3">
                                                                {
                                                                    reg.students.map((stu, index) => (
                                                                        <Button variant="outline" onClick={() => setViewData(stu)} key={index}>{namify(stu.name)}</Button>
                                                                    ))
                                                                }
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                {viewData ? (
                                                                    <div className="w-full" id="idcard">
                                                                        <div className="w-full flex flex-col items-center p-5 mt-5 border rounded-md bg-background">
                                                                            <h1 className="text-3xl font-semibold">{viewData?.name}</h1>
                                                                            <Barcode value={viewData?.prn} format="CODE39" displayValue={false} height={50} background="transparent" lineColor={isDark ? "white" : "black"} width={1.5} />
                                                                            <span className="my-3"></span>
                                                                            {
                                                                                Object.entries(viewData).map(([key, value]) => (
                                                                                    <div className="grid grid-cols-3 w-3/4" key={key}>
                                                                                        <span className="col-span-1 font-bold select-none">{studentField(key)}</span>
                                                                                        <span className="col-span-2 flex items-center gap-x-2">
                                                                                            <span className="select-none cursor-pointer hover:underline" onClick={() => {
                                                                                                copy(`${value}`);
                                                                                                toast({ description: `${studentField(key)} copied to clipboard` });
                                                                                            }}>{value}</span>
                                                                                        </span>
                                                                                    </div>
                                                                                ))
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span>Loading...</span>
                                                                )}
                                                                <Button onClick={() => downloadImage(viewData?.name || "")}><Download />&nbsp;Download</Button>
                                                            </DialogContent>
                                                        </Dialog>
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <span className="text-xl">No registrations yet!</span>
                    )}
                </>
            )}
        </div>
    )
}


Registrations.auth = {
    role: ["club", "admin"]
};
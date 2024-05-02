import Head from "next/head";
import { inter } from "~/fonts";
import Navbar from "~/pages/ui/Navbar";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Popover, PopoverTrigger, PopoverContent } from "~/components/ui/popover";
import { CalendarIcon, ChevronLeft } from "lucide-react";
import { Calendar } from "~/components/ui/calendar";
import { useForm } from "react-hook-form";
import TipTap from "~/pages/ui/TipTap";
import Link from "next/link";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "~/components/ui/input-otp";
import { Event } from "~/types";
import moment from "moment";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { editEventID } from "~/atoms";
import { useToast } from "~/components/ui/use-toast";
import { useRouter } from "next/router";

export default function CreateEvent() {
    const { data: session } = useSession();
    const router = useRouter();
    const [editEventId] = useAtom(editEventID);
    const eventEdit = api.event.editEvent.useMutation();

    const { data: formData } = api.event.getEvent.useQuery({ id: editEventId ?? "" }, {
        // refetchOnMount: false,
        refetchOnWindowFocus: false
    });

    const { toast } = useToast();

    const defaultVals: z.infer<typeof formSchema> = {
        name: "",
        description: "Formatting is <b><i>supported</i></b>!",
        type: "hackathon",
        dateandtime: {
            date: new Date(),
            time: moment(new Date()).toArray().slice(3, 5).map(x => x.toString().padStart(2, '0'))
        }
    };

    const [formVals, setFormVals] = useState<z.infer<typeof formSchema>>(defaultVals);

    useEffect(() => {
        if (formData) {
            setFormVals({
                name: formData.name,
                description: formData.description || defaultVals.description,
                type: formData.type as Event["type"],
                dateandtime: {
                    date: moment(formData.date).toDate(),
                    time: moment(moment(formData.date).toDate())
                        .toArray()
                        .slice(3, 5)
                        .map((x) => x.toString().padStart(2, "0")),
                },
            });
        }
    }, [formData, editEventId]);    

    const formSchema = z.object({
        name: z.string(),
        description: z.string(),
        type: z.enum(["hackathon", "seminar", "workshop", "performance", "screening", "CTF", "talk", "treasure-hunt"] as const),
        dateandtime: z.object({
            date: z.date(),
            time: z.string().array().length(2)
        })
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultVals,
        mode: 'onChange',
        values: formVals
    });

function formSubmit(values: z.infer<typeof formSchema>) {
    const event = {
        creatorID: session!.user.id,
        name: values.name,
        description: values.description,
        type: values.type,
        date: moment([...moment(values.dateandtime.date).toArray().slice(0, 3), ...values.dateandtime.time]).toISOString()
    };
    console.log(event);
    const res = eventEdit.mutate({ event: event, id: editEventId! });
    toast({
        description: "Event edited successfully!",
        variant: "success"
    });
    router.push("/dashboard");
}

return (
    <>
        <Head>
            <title>Edit Event - PESU-tix</title>
        </Head>
        <div className={`flex flex-col items-center w-screen h-screen bg-background text-primary gap-y-5 ${inter}`}>
            <Navbar />
            {formData && (
                <>
                    <span className="w-1/3 items-start mt-32">
                        <Link className="text-sm flex items-center hover:underline" href="/dashboard"><ChevronLeft className="w-5 h-5" /> Back</Link>
                    </span>
                    <h1 className="w-1/3 text-3xl font-semibold text-left">Edit Event</h1>
                    <div className="w-1/3 my-2 items-center border rounded-md p-7">
                        <Form {...form}>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /><br /><br />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Description</FormLabel>
                                        <FormControl>
                                            <TipTap description={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /><br /><br />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Type</FormLabel>
                                        <FormControl>
                                            <RadioGroup {...field} onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-3 px-5 w-full gap-y-5">
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="hackathon" />
                                                    </FormControl>
                                                    <FormLabel>Hackathon</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl className="flex flex-row items-center">
                                                        <RadioGroupItem value="seminar" />
                                                    </FormControl>
                                                    <FormLabel>Seminar</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl className="flex flex-row items-center">
                                                        <RadioGroupItem value="workshop" />
                                                    </FormControl>
                                                    <FormLabel>Workshop</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl className="flex flex-row items-center">
                                                        <RadioGroupItem value="performance" />
                                                    </FormControl>
                                                    <FormLabel>Performance</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl className="flex flex-row items-center">
                                                        <RadioGroupItem value="screening" />
                                                    </FormControl>
                                                    <FormLabel>Screening</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl className="flex flex-row items-center">
                                                        <RadioGroupItem value="CTF" />
                                                    </FormControl>
                                                    <FormLabel>CTF</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl className="flex flex-row items-center">
                                                        <RadioGroupItem value="talk" />
                                                    </FormControl>
                                                    <FormLabel>Talk</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl className="flex flex-row items-center">
                                                        <RadioGroupItem value="treasure-hunt" />
                                                    </FormControl>
                                                    <FormLabel>Treasure Hunt</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            /><br /><br />
                            <FormField
                                    control={form.control}
                                    name="dateandtime"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Event Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="popover"
                                                            className="bg-background">
                                                            {field.value ? (
                                                                moment([...moment(field.value.date).toArray().slice(0, 3), ...field.value.time]).format("LL \\at LT")
                                                            ) : (
                                                                <span>Pick a date and time</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-2 flex flex-col items-center gap-y-4" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={moment(field.value.date).toDate()}
                                                        onSelect={(value) => field?.onChange({ time: field.value.time, date: value })}
                                                        disabled={(date) =>
                                                            date < new Date()
                                                        }
                                                        initialFocus
                                                    />
                                                    <InputOTP maxLength={4} className="" value={field.value.time.join("")} onChange={value => {
                                                        const arr = value.split("");
                                                        field.onChange({ date: field.value.date, time: [arr.slice(0, 2).join(""), arr.slice(2, 4).join("")] })
                                                    }}>
                                                        <InputOTPGroup>
                                                            <InputOTPSlot index={0} />
                                                            <InputOTPSlot index={1} />
                                                        </InputOTPGroup>
                                                        <InputOTPSeparator><span className="font-semibold">:</span></InputOTPSeparator>
                                                        <InputOTPGroup>
                                                            <InputOTPSlot index={2} />
                                                            <InputOTPSlot index={3} />
                                                        </InputOTPGroup>
                                                    </InputOTP>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                        </Form>
                        <div className="pt-7 w-full flex justify-end">
                            <Button type="submit" onClick={form.handleSubmit(formSubmit)}>Submit</Button>
                        </div>
                    </div>
                </>
            )}
            <span className="min-h-5">&nbsp;</span>
        </div>
    </>
)
}

CreateEvent.auth = {
    role: "club"
}

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

export default function CreateEvent() {
    const formSchema = z.object({
        name: z.string(),
        description: z.string(),
        type: z.enum(["hackathon", "seminar", "workshop", "performance", "screening", "CTF", "talk", "treasure-hunt"] as const),
        date: z.date(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "Markdown is *supported*",
            type: "hackathon",
        }
    })

    function formSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
    }

    return (
        <>
            <Head>
                <title>Create Event - PESU-tix</title>
            </Head>
            <div className={`flex flex-col items-center w-screen h-screen bg-background text-primary gap-y-5 ${inter}`}>
                <Navbar />
                <span className="w-1/3 items-start">
                    <button className="text-xs flex items-center hover:underline"><ChevronLeft className="w-5 h-5" /> Back</button>
                </span>
                <h1 className="w-1/3 text-3xl font-semibold text-left">Create Event</h1>
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
                            name="date"
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
                                                        field.value.toLocaleDateString()
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date()
                                                }
                                                initialFocus
                                            />
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
                <span className="min-h-5">&nbsp;</span>
            </div>
        </>
    )
}
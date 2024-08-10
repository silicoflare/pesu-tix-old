import Head from 'next/head';
import { inter } from '~/fonts';
import Navbar from '~/pages/ui/Navbar';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '~/components/ui/popover';
import { CalendarIcon, ChevronLeft } from 'lucide-react';
import { Calendar } from '~/components/ui/calendar';
import { useForm, useWatch } from 'react-hook-form';
import TipTap from '~/pages/ui/TipTap';
import Link from 'next/link';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '~/components/ui/input-otp';
import { Event } from '~/types';
import moment from 'moment';
import { useSession } from 'next-auth/react';
import { api, server_api } from '~/utils/api';
import { useToast } from '~/components/ui/use-toast';
import { useRouter } from 'next/router';
import { nhost } from '~/tools';

export default function CreateEvent() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  const eventCreate = api.event.createEvent.useMutation();

  const formSchema = z.object({
    name: z.string(),
    description: z.string(),
    image: z
      .instanceof(File)
      .refine((x) => x.size < 1024 * 1024 * 5, {
        message: 'File size must be less than 5MB',
      })
      .refine(
        (x) =>
          [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/svg',
          ].includes(x.type),
        {
          message: 'File must be an image',
        },
      ),
    type: z.string(),
    participation: z.string(),
    maxTeamMembers: z.number().min(1).max(7),
    dateandtime: z.object({
      date: z.date(),
      time: z.string().array().length(2),
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: 'Formatting is <b><i>supported</i></b>!',
      type: 'hackathon',
      participation: 'SOLO',
      maxTeamMembers: 1,
      dateandtime: {
        date: new Date(),
        time: moment(new Date())
          .toArray()
          .slice(3, 5)
          .map((x) => x.toString().padStart(2, '0')),
      },
    },
  });

  const participation = useWatch({
    control: form.control,
    name: 'participation',
  });

  function formSubmit(values: z.infer<typeof formSchema>) {
    const chars =
      '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const passwordLength = 10;
    let password = '';
    for (let i = 0; i <= passwordLength; i++) {
      let randomNumber = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomNumber, randomNumber + 1);
    }
    const event: Event = {
      creatorID: session!.user.id,
      name: values.name,
      description: values.description,
      imageURL: '',
      type: values.type,
      date: moment([
        ...moment(values.dateandtime.date).toArray().slice(0, 3),
        ...values.dateandtime.time,
      ]).toISOString(),
      public: false,
      participation: values.participation as 'SOLO' | 'TEAM',
      maxTeamMembers: values.maxTeamMembers,
      password: password,
    };

    // console.log(event);
    // return;

    eventCreate.mutate(
      { event: event },
      {
        onSuccess(data) {
          nhost.storage.upload({ file: values.image }).then((res) => {
            server_api.event.addImage
              .mutate({ id: data.id, image: res.fileMetadata!.id })
              .then(() => {
                toast({
                  description: 'Event created successfully!',
                  variant: 'success',
                });
                router.push('/events/' + data.id);
              });
          });
        },
      },
    );
  }

  return (
    <>
      <Head>
        <title>Create Event - PESU-tix</title>
      </Head>
      <div
        className={`flex flex-col items-center w-screen h-screen bg-background text-primary gap-y-5 ${inter}`}
      >
        <Navbar />
        <span className="w-1/3 items-start mt-32">
          <Link
            className="text-sm flex items-center hover:underline"
            href="/events"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </Link>
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
            />
            <br />
            <br />
            {form.getValues().description && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Description</FormLabel>
                    <FormControl>
                      <TipTap
                        description={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <br />
            <br />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      onChange={(e) => field.onChange(e.target.files![0])}
                      accept="image/*"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <br />
            <br />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <br />
            <br />
            <FormField
              control={form.control}
              name="participation"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Participation type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="SOLO" />
                        </FormControl>
                        <FormLabel className="font-normal">Solo</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="TEAM" />
                        </FormControl>
                        <FormLabel className="font-normal">Team</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <br />
            <br />
            {participation === 'TEAM' && (
              <>
                <FormField
                  control={form.control}
                  name="maxTeamMembers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Members</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={7}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <br />
                <br />
              </>
            )}
            <FormField
              control={form.control}
              name="dateandtime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Event Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="popover" className="bg-background">
                          {field.value ? (
                            moment([
                              ...moment(field.value.date).toArray().slice(0, 3),
                              ...field.value.time,
                            ]).format('LL \\at LT')
                          ) : (
                            <span>Pick a date and time</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-2 flex flex-col items-center gap-y-4"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={moment(field.value.date).toDate()}
                        onSelect={(value) =>
                          field.onChange({
                            time: field.value.time,
                            date: value,
                          })
                        }
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                      <InputOTP
                        maxLength={4}
                        className=""
                        value={field.value.time.join('')}
                        onChange={(value) => {
                          const arr = value.split('');
                          field.onChange({
                            date: field.value.date,
                            time: [
                              arr.slice(0, 2).join(''),
                              arr.slice(2, 4).join(''),
                            ],
                          });
                        }}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                        </InputOTPGroup>
                        <InputOTPSeparator>
                          <span className="font-semibold">:</span>
                        </InputOTPSeparator>
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
            <Button type="submit" onClick={form.handleSubmit(formSubmit)}>
              Submit
            </Button>
          </div>
        </div>
        <span className="min-h-5">&nbsp;</span>
      </div>
    </>
  );
}

CreateEvent.auth = {
  role: 'club',
};

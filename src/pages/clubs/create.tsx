import { zodResolver } from '@hookform/resolvers/zod';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { font } from '~/fonts';
import Navbar from '../ui/Navbar';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import { ClubInfo } from '~/types';
import { generatePassword, nhost } from '~/tools';
import { api } from '~/utils/api';
import { useToast } from '~/components/ui/use-toast';
import { useRouter } from 'next/router';
import { sha256 } from 'js-sha256';
import { useAtom } from 'jotai';
import { clubCreds } from '~/atoms';

export default function CreateClub() {
  const [creds, setCreds] = useAtom(clubCreds);

  const formSchema = z.object({
    name: z.string(),
    username: z.string(),
    campus: z.string(),
    avatar: z
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
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      username: '',
      campus: 'RR',
      avatar: undefined,
    },
  });

  const createClub = api.club.create.useMutation();
  const { toast } = useToast();
  const router = useRouter();

  async function formSubmit(values: z.infer<typeof formSchema>) {
    const pass = generatePassword(10);

    const file = await nhost.storage.upload({ file: values.avatar });

    console.log(file);

    if (!file) {
      toast({ description: 'Error uploading file' });
      return;
    }

    const clubData: ClubInfo = {
      name: values.name,
      username: values.username,
      campus: values.campus as ClubInfo['campus'],
      password: sha256(pass),
      avatar: file.fileMetadata!.id,
    };

    setCreds({
      username: values.username,
      password: pass,
    });

    createClub.mutate(clubData, {
      onSuccess: () => {
        toast({
          description: 'Club created successfully!',
          variant: 'success',
        });
        router.push('/clubs/password');
      },
    });
  }

  return (
    <>
      <Head>
        <title>Create Club - PESU-tix</title>
      </Head>
      <div className={`window basic gap-y-5 ${font} overflow-x-hidden mt-24`}>
        <Navbar />
        <span className="w-1/3 items-start">
          <Link
            className="text-sm flex items-center hover:underline"
            href="/clubs"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </Link>
        </span>
        <h1 className="w-1/3 text-3xl font-semibold text-left">Create Club</h1>
        <div className="w-1/3 my-2 items-center border rounded-md p-7">
          <Form {...form}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Club Name</FormLabel>
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Club Username</FormLabel>
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
              name="campus"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Campus</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="RR" />
                        </FormControl>
                        <FormLabel className="font-normal">RR Campus</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="EC" />
                        </FormControl>
                        <FormLabel className="font-normal">EC Campus</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <br />
            <br />
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Club Avatar</FormLabel>
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
            <div className="pt-7 w-full flex justify-end">
              <Button type="submit" onClick={form.handleSubmit(formSubmit)}>
                Submit
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}

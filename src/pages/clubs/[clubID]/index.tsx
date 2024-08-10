import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { font } from '~/fonts';
import Navbar from '~/pages/ui/Navbar';
import { ClubInfo } from '~/types';
import { api, server_api } from '~/utils/api';
import Head from 'next/head';
import { Button } from '~/components/ui/button';
import {
  ChevronLeft,
  KeyRoundIcon,
  Pencil,
  PencilIcon,
  TrashIcon,
} from 'lucide-react';
import Link from 'next/link';
import Authed from '~/pages/ui/Authed';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { nhost } from '~/tools';
import Tippy from '@tippyjs/react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { useToast } from '~/components/ui/use-toast';
import { sha256 } from 'js-sha256';
import { PopoverClose } from '@radix-ui/react-popover';

export default function ClubData() {
  const router = useRouter();
  const { clubID } = router.query;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const resetPassword = api.club.resetPassword.useMutation();
  const clubDelete = api.club.delete.useMutation();
  const nameChange = api.club.changeName.useMutation();

  const delClubRef = useRef(null);
  const [delName, setDelName] = useState<string>('');
  const passwordRef = useRef(null);

  const { data: clubData } = useQuery({
    queryKey: ['getClubInfo'],
    queryFn: async () => {
      if (clubID) {
        const club = await server_api.club.get.query({
          username: clubID as string,
        });
        return club;
      }
    },
  });

  const [avatarURL, setAvatarURL] = useState('');

  useEffect(() => {
    async function getAvatarURL() {
      if (clubData) {
        const url = await nhost.storage.getPublicUrl({
          fileId: clubData.avatar,
        });
        setAvatarURL(url);
      }
    }

    getAvatarURL();
  }, [clubData]);

  useEffect(() => {
    if (router.isReady) {
      queryClient.refetchQueries();
    }
  }, [router, router.isReady]);

  const formSchema = z.object({
    newPass: z.string(),
    confPass: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const changeNameFormSchema = z.object({
    name: z.string().min(5, 'Name should be minimum 5 characters'),
  });

  const changeNameForm = useForm<z.infer<typeof changeNameFormSchema>>({
    resolver: zodResolver(changeNameFormSchema),
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (data.newPass !== data.confPass) {
      toast({ description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }

    toast({ description: 'Changing password...' });
    await resetPassword.mutate({
      username: clubData!.username,
      password: sha256(data.confPass),
    });
    toast({
      description: 'Password successfully changed!',
      variant: 'success',
    });
  }

  async function changeName(data: z.infer<typeof changeNameFormSchema>) {
    toast({ description: 'Changing club name...' });
    await nameChange.mutate({
      username: clubData!.username,
      newName: data.name,
    });
    toast({
      description: 'Name changed successfully!',
      variant: 'success',
    });
    await queryClient.invalidateQueries();
  }

  async function deleteClub() {
    await clubDelete.mutate({ username: clubData!.username });
    toast({
      description: 'Club deleted successfully!',
    });
    queryClient.invalidateQueries();
    router.push('/clubs');
  }

  return (
    <>
      <Head>{clubData && <title>{clubData.name} - PESU-tix</title>}</Head>
      <div className={`window basic ${font} gap-3`}>
        <Navbar />
        {clubData && (
          <div className="w-full h-full flex flex-col items-center mt-20">
            <Authed roles={['admin']}>
              <div className="my-10 w-1/3 flex flex-row items-center justify-between">
                <Link
                  href="/clubs"
                  className="flex flex-row items-center hover:underline cursor-pointer"
                >
                  <ChevronLeft />
                  Back
                </Link>
                <div className="flex flex-row items-center justify-end gap-x-2">
                  <Tippy content="Remove Club" reference={delClubRef} />
                  <Dialog>
                    <DialogTrigger>
                      <Button
                        variant="destructive"
                        className="w-10 h-10 p-2"
                        ref={delClubRef}
                      >
                        <TrashIcon className="w-10 h-10" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle>Delete Club</DialogTitle>
                      <div className="">
                        Are you sure that you want to delete the club{' '}
                        <span className="font-bold">{clubData.name}</span> and
                        all associated events? This action is irreversible.
                      </div>
                      <div className="mt-5 text-sm flex flex-col items-center gap-2 w-full">
                        <span className="">
                          Type{' '}
                          <span className="font-bold">{clubData.name}</span> to
                          delete the club.
                        </span>
                        <Input
                          value={delName}
                          onChange={(e) => setDelName(e.target.value)}
                        />
                        <DialogClose className="w-full">
                          <Button
                            className="w-full"
                            variant="destructive"
                            disabled={delName !== clubData.name}
                            onClick={(_) => deleteClub()}
                          >
                            Delete
                          </Button>
                        </DialogClose>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Tippy content="Change Password" reference={passwordRef} />
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        variant="outline"
                        className="w-10 h-10 p-2"
                        ref={passwordRef}
                      >
                        <KeyRoundIcon className="w-10 h-10" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="flex flex-col items-center w-full gap-2">
                      <h1 className="text-lg font-semibold">Change Password</h1>
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="flex flex-col gap-2"
                        >
                          <FormField
                            control={form.control}
                            name="newPass"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="confPass"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <PopoverClose>
                            <Button className="w-full">Change Password</Button>
                          </PopoverClose>
                        </form>
                      </Form>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </Authed>
            <h1 className="text-3xl font-bold flex items-start gap-2">
              {clubData.name}
              <Popover>
                <PopoverTrigger>
                  <Pencil size={12} />
                </PopoverTrigger>
                <PopoverContent>
                  <h1 className="text-lg w-full text-center font-bold">
                    Change Club Name
                  </h1>
                  <Form {...changeNameForm}>
                    <FormField
                      control={changeNameForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="w-full flex items-center">
                      <Button
                        onClick={changeNameForm.handleSubmit(changeName)}
                        className="my-2 w-full"
                      >
                        Submit
                      </Button>
                    </div>
                  </Form>
                </PopoverContent>
              </Popover>
            </h1>
            <span className="text-light">@{clubData.username}</span>
            <img
              src={avatarURL || ''}
              alt="club logo"
              className="w-52 h-52 mt-10"
            />
            <Authed roles={['club']}>
              <div className="flex items-center justify-end my-10">
                <Popover>
                  <PopoverTrigger>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      ref={passwordRef}
                    >
                      <KeyRoundIcon size={20} />
                      Change Password
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="flex flex-col items-center w-full gap-2">
                    <h1 className="text-lg font-semibold">Change Password</h1>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-2"
                      >
                        <FormField
                          control={form.control}
                          name="newPass"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="confPass"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <PopoverClose>
                          <Button className="w-full">Change Password</Button>
                        </PopoverClose>
                      </form>
                    </Form>
                  </PopoverContent>
                </Popover>
              </div>
            </Authed>
          </div>
        )}
      </div>
    </>
  );
}

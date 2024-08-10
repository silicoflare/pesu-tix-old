import { api } from '~/utils/api';
import Navbar from '../ui/Navbar';
import { Button } from '~/components/ui/button';
import Link from 'next/link';
import { PlusIcon } from '@radix-ui/react-icons';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { ClubInfo } from '~/types';
import { font } from '~/fonts';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage } from '~/components/ui/avatar';
import { nhost } from '~/tools';
import { useEffect, useState } from 'react';

export default function ClubsPage() {
  const router = useRouter();

  const { data: clubList } = api.club.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const [avatarURLs, setAvatarURLs] = useState<Record<string, string>>({});

  useEffect(() => {
    async function getURLs() {
      if (clubList) {
        setAvatarURLs({});
        clubList.map(async (club) => {
          const url = await nhost.storage.getPublicUrl({ fileId: club.avatar });
          setAvatarURLs((old) => ({ ...old, [club.username]: url }));
        });
      }
    }

    getURLs();
  }, [clubList]);

  return (
    <>
      <Head>
        <title>Clubs - PESU-tix</title>
      </Head>
      <div className={`window basic ${font}`}>
        <Navbar />
        <div className="w-full flex flex-col items-center mt-5">
          <h1 className="text-3xl font-semibold my-5 mt-20 w-3/4 px-7 flex flex-row items-center justify-between">
            All Clubs
            <Button
              className="flex flex-row items-center gap-x-2"
              onClick={(_) => router.push('/clubs/create')}
            >
              <PlusIcon /> Add Club
            </Button>
          </h1>
          <div className="w-3/4 p-7 ">
            {clubList ? (
              clubList.length > 0 ? (
                <div className="grid grid-cols-3 w-full gap-3 items-center justify-center">
                  {clubList.map((club: ClubInfo) => {
                    return (
                      <Card
                        className="transition hover:scale-105 duration-300 ease-in-out hover:bg-accent cursor-pointer"
                        onClick={(_) => router.push(`/clubs/${club.username}`)}
                      >
                        <CardContent className="flex flex-row items-center gap-x-7 pt-5">
                          <Avatar className="w-24 h-24 p-0">
                            <AvatarImage
                              src={avatarURLs[club.username]}
                              width={20}
                              height={20}
                            />
                          </Avatar>
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-xl">
                              {club.name}
                            </span>
                            <span className="font-light">
                              {club.campus} Campus
                            </span>
                            <span className="font-light">@{club.username}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="w-full">
                  <h1 className="w-full text-center text-gray-600 text-5xl">
                    No clubs yet
                  </h1>
                </div>
              )
            ) : (
              <div className="w-full">Loading...</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

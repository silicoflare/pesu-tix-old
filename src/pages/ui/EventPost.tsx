import { Component, Send, Ticket } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarImage } from '~/components/ui/avatar';
import { Event } from '~/types';
import Tippy from '@tippyjs/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { api, server_api } from '~/utils/api';
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '~/components/ui/use-toast';
import copy from 'copy-to-clipboard';
import moment from 'moment';
import { nhost } from '~/tools';

type EventPostProps = {
  event: Event;
};

export default function EventPost({ event }: EventPostProps) {
  const ticketRef = useRef(null);
  const { id, name, date, creatorID, imageURL } = event;
  const [avatarURL, setAvatarURL] = useState('');
  const { toast } = useToast();

  function copyLink() {
    copy(`${process.env.NEXT_PUBLIC_URL}/events/${id}`);
    toast({
      description: 'Link copied to clipboard!',
    });
  }

  useEffect(() => {
    async function getAvatarURL() {
      if (event) {
        const club = await server_api.club.get.query({
          username: event.creatorID,
        });
        const url = nhost.storage.getPublicUrl({
          fileId: club.avatar,
        });
        setAvatarURL(url);
      }
    }

    getAvatarURL();
  }, [event]);

  return (
    <div className="w-2/5 border border-border rounded-md">
      <div className="p-4 flex items-center w-full font-semibold gap-x-5 ml-1">
        <Tippy content={creatorID}>
          <Link href={`/clubs/${event.creatorID}`} target="_blank">
            <Avatar>
              <AvatarImage src={avatarURL} />
            </Avatar>
          </Link>
        </Tippy>
        <div className="flex flex-col items-start justify-center">
          <span className="text-xl">{name}</span>
          <span className="text-xs text-gray-300">
            {moment(date).format('LL \\at LT')}
          </span>
        </div>
      </div>
      <Image
        src={
          imageURL
            ? nhost.storage.getPublicUrl({ fileId: imageURL })
            : '/dummy_event.jpeg'
        }
        className="w-full"
        height={500}
        width={500}
        alt="event image"
      />
      <div className="w-full">
        <div className="flex flex-row items-center justify-between p-5">
          <div className="flex flex-row items-center gap-x-5">
            <Tippy content="More info">
              <Link href={`/events/${id}`}>
                <Ticket className="w-6 h-6" />
              </Link>
            </Tippy>
            <Tippy content="Visit club page [WIP]">
              <Component className="w-6 h-6" />
            </Tippy>
            <Tippy content="Copy event link">
              <Send className="w-6 h-6" onClick={copyLink} />
            </Tippy>
          </div>
        </div>
      </div>
    </div>
  );
}

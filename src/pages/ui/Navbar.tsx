import { createAvatar } from '@dicebear/core';
import { adventurerNeutral } from '@dicebear/collection';
import ThemeButton from './ThemeButton';
import { TicketIcon } from 'lucide-react';

export default function Navbar()    {
    const account = 'HackerSpace';
    const avatar = createAvatar(adventurerNeutral, {
        seed: account
    }).toString();

    return (
        <div className="w-full flex flex-row items-center justify-between px-7 py-4 bg-background text-primary border-b border-border">
            <h1 className="font-semibold text-2xl cursor-pointer flex flex-row gap-x-3 items-center">
                <TicketIcon className='-rotate-45' />
                PESU-tix
            </h1>
            <span className="flex flex-row items-center justify-end cursor-pointer gap-x-3">
                <span className="w-10 h- border rounded-full overflow-clip" dangerouslySetInnerHTML={{ __html: avatar }}></span>
                <span className="text-lg">{ account }</span>
                <ThemeButton />
            </span>
        </div>
    )
}
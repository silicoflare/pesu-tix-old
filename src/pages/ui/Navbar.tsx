import ThemeButton from './ThemeButton';
import { TicketIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from '~/components/ui/dropdown-menu';
import { Avatar, AvatarImage } from '~/components/ui/avatar';
import { useEffect, useState } from 'react';

export default function Navbar()    {
    const [ user, setUser ] = useState("");

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_URL}/api/user`)
            .then(data => data.json())
            .then(json => setUser(json.username));
    })

    return (
        <div className="w-full flex flex-row items-center justify-between px-7 py-4 bg-background text-primary">
            <h1 className="font-semibold text-2xl cursor-pointer flex flex-row gap-x-3 items-center">
                <TicketIcon className='-rotate-45' />
            </h1>
            <span className="flex flex-row items-center justify-end cursor-pointer gap-x-3">
                <ThemeButton />
                <DropdownMenu>
                    <DropdownMenuTrigger className='outline-none'>
                        <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/8.x/adventurer-neutral/svg?seed=${user}`}>
                            </AvatarImage>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='mr-5 mt-2'>
                        <DropdownMenuLabel>{user}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Foo</DropdownMenuItem>
                        <DropdownMenuItem>Bar</DropdownMenuItem>
                        <DropdownMenuItem>Baz</DropdownMenuItem>
                        <DropdownMenuItem>Boo</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </span>
        </div>
    )
}
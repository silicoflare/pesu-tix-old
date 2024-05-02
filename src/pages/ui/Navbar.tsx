import ThemeButton from './ThemeButton';
import { TicketIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from '~/components/ui/dropdown-menu';
import { Avatar, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';
import { namify } from '~/tools';

export default function Navbar({ hidelogin = false } : { hidelogin?: boolean })    {
    const { data: session } = useSession();
    const router = useRouter();

    return (
        <div className="w-full flex flex-row items-center justify-between px-7 py-7 basic fixed top-0 left-0 bg-transparent z-0">
            <h1 className="font-semibold text-2xl cursor-pointer flex flex-row gap-x-3 items-center">
                <Link href="/">
                    <TicketIcon className='-rotate-45' />
                </Link>
            </h1>
            <span className="flex flex-row items-center justify-end cursor-pointer gap-x-3">
                <ThemeButton />
                { !hidelogin && (!!session?.user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger className='outline-none'>
                            <Avatar>
                                <AvatarImage src={`https://api.dicebear.com/8.x/adventurer-neutral/svg?seed=${namify(session.user.id)}`}>
                                </AvatarImage>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='mr-5 mt-2'>
                            <DropdownMenuLabel className='font-semibold text-lg'>{namify(session.user.studentInfo?.name || session.user.clubInfo?.name || session.user.adminInfo?.name || "")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Foo</DropdownMenuItem>
                            <DropdownMenuItem>Bar</DropdownMenuItem>
                            <DropdownMenuItem>Baz</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => signOut()} className='text-red-600'>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button onClick={() => signIn()}>
                        Login
                    </Button>
                ))}
            </span>
        </div>
    )
}

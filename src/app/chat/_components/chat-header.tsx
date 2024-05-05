import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenuContent, DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useUser } from '@clerk/nextjs';
import { Companion, Message } from '@prisma/client';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { ChevronLeft, Edit, MessagesSquare, MoreVertical, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react'

type Props = {
    companion: Companion & {
        messages: Message[];
        _count: {
            messages: number
        }
    }
}

const ChatHeader = ({ companion }: Props) => {
    const router = useRouter();
    const { user } = useUser();

    return (
        <div className='flex w-full justify-between items-center border-b border-primary/10 pb-4'>
            <div className='flex gap-x-2 items-center'>
                <Button onClick={() => router.back()} size="icon">
                    <ChevronLeft className='h-8 w-8' />
                </Button>
            </div>
            <Avatar className='h-12 w-12'>
                <AvatarImage src="./logo" />
                <AvatarFallback>fall</AvatarFallback>
            </Avatar>
            <div className='flex flex-col gap-y-1'>
                <div className='flex items-center gap-x-2'>
                    <p>
                        {companion.name}
                    </p>
                    <div className='flex items-center text-xs text-muted-foreground'>
                        <MessagesSquare className='w-3 h-3 mr-1' /> {companion._count.messages}
                    </div>
                </div>
                <p className='text-xs text-muted-foreground'>
                    Created by {companion.userName}
                </p>
            </div>
            {user?.id === companion.userId && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='secondary' size="icon">
                            <MoreVertical className='h-6 w-6' />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align='end'
                    >
                        <DropdownMenuItem>
                            <Edit className='w-4 h-4 mr-2' /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Trash className='w-4 h-4 mr-2' /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    )
}

export default ChatHeader
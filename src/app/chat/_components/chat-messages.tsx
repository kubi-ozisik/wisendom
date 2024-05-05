"use client"
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Companion } from '@prisma/client'
import { AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { useTheme } from 'next-themes';
import React, { ElementRef, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner';
import { BeatLoader } from "react-spinners";
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

type MessageProps = {
    role: "system" | "user",
    content?: string;
    isLoading?: boolean;
    src?: string;
}
const ChatMessage = ({ role, content, isLoading, src }: MessageProps) => {
    const { theme } = useTheme();

    const onCopy = () => {
        if (!content) {
            return;
        }

        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard');
    }

    return (
        <div className={cn('group flex items-start gap-x-3 w-full py-4',
            role === 'user' && 'justify-end',

        )}>
            {role !== "user" && src && (<Avatar><AvatarImage src={src} />
                <AvatarFallback>..</AvatarFallback>
            </Avatar>)}
            <div className='rounded-md px-4 py-2 max-w-sm text-sm bg-primary/10'>
                {isLoading ? <BeatLoader size={5} color={theme === 'light' ? "black" : "white"} /> : content}
            </div>
            {role === "user" && (<Avatar><AvatarImage src={src} />
                <AvatarFallback>..</AvatarFallback>
            </Avatar>)}
            {role !== "user" && !isLoading &&
                <Button onClick={onCopy}
                    className='opacity-0 group-hover:opacity-100 transition'
                    size={'icon'} variant={'ghost'}>
                    <Copy />
                </Button>}
        </div>
    )
}

type Props = {
    messages: any[]
    isLoading: boolean
    companion: Companion
}
const ChatMessages = ({ messages, isLoading, companion }: Props) => {

    const scrollRef = useRef<ElementRef<"div">>(null);

    const [fakeLoading, setFakeLoading] = useState(messages.length === 0 ? true : false)

    useEffect(() => {
        const timeout = setTimeout(() => { setFakeLoading(false) }, 1000);


        return () => clearTimeout(timeout);
    }, [])

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className='flex-1 overflow-y-auto pr-4'>
            <ChatMessage
                isLoading={fakeLoading}
                src={companion.src}
                role='system'
                content={`Hello, I am ${companion.name}, ${companion.description}`} />

            {messages.map((message) => (
                <ChatMessage
                    src={message.src}
                    role={message.role}
                    content={message.content}
                    key={message.id} />
            ))}
            {isLoading && (<ChatMessage isLoading src={companion.src} role='system' />)}
            <div ref={scrollRef} />
        </div>
    )
}

export default ChatMessages
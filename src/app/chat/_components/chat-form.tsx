"use client"
import React, { ChangeEvent, FormEvent } from 'react'
import { ChatRequestOptions } from 'ai';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal } from 'lucide-react';

type Props = {
    input: string;
    handleInputChange: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>, chatRequestOptions?: ChatRequestOptions | undefined) => void;
    isLoading: boolean;
}
const ChatForm = ({ input, handleInputChange, onSubmit, isLoading }: Props) => {


    return (
        <form onSubmit={onSubmit} className='border-t border-primary/10 py-4 items-center gap-x-2'>
            <Input
                value={input}
                onChange={handleInputChange}
                disabled={isLoading}
                className='rounded-lg bg-primary/10'
            />
            <Button disabled={isLoading} variant={'ghost'} className=''>
                <SendHorizonal className='w-6 h-6' />
            </Button>
        </form>
    )
}

export default ChatForm
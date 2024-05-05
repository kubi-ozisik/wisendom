"use client"
import { Companion, Message } from '@prisma/client'
import React, { FormEvent, useState } from 'react'
import ChatHeader from './chat-header'
import { useRouter } from 'next/navigation'
import { useCompletion } from 'ai/react'
import ChatForm from './chat-form'
import ChatMessages from './chat-messages'

type Props = {
    companion: Companion & {
        messages: Message[];
        _count: {
            messages: number
        }
    }
}

const ChatClient = ({ companion }: Props) => {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>(companion.messages);

    const { input, isLoading, handleInputChange, handleSubmit, setInput } = useCompletion({
        api: `/api/chat/${companion.id}`,
        onFinish(prompt, completion) {
            const systemMessage = {
                role: 'system',
                content: completion
            };

            setMessages((prevMessages) => [...prevMessages, systemMessage as Message]);
            setInput('');

            router.refresh();
        }
    });

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!input) {
            return;
        }

        const userMessage = {
            role: 'user',
            content: input
        };

        setMessages((prevMessages) => [...prevMessages, userMessage as Message]);
        handleSubmit(e);
        setInput('');
    }


    return (
        <div className='flex flex-col h-full p-4 space-y-2'>
            <ChatHeader companion={companion} />
            <ChatMessages
                companion={companion}
                isLoading={isLoading}
                messages={messages} />
            <ChatForm
                isLoading={isLoading}
                input={input}
                handleInputChange={handleInputChange}
                onSubmit={onSubmit} />
        </div>
    )
}

export default ChatClient
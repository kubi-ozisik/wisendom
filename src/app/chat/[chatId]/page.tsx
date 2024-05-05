import { db } from '@/lib/db'
import { auth, redirectToSignIn } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'
import ChatClient from '../_components/chat-client'

interface Props {
    params: {
        chatId: string
    }
}

const ChatPage = async ({ params: { chatId } }: Props) => {
    // console.log(chatId)
    const { userId } = auth();
    if (!userId) {
        return redirectToSignIn();
    }

    const companion = await db.companion.findUnique({
        where: { id: chatId },
        include: {
            messages: {
                orderBy: {
                    createdAt: "asc",
                },
                where: {
                    userId
                }
            },
            _count: {
                select: {
                    messages: true
                }
            }
        }
    });

    if (!companion) {
        return redirect("/");
    }

    return (
        <div className="mx-auto max-w-4xl h-full w-full ">
            <ChatClient companion={companion} />
        </div>
    )
}

export default ChatPage
"use client"
import { Companion } from '@prisma/client'
import Image from 'next/image'
import React from 'react'
import { Card, CardFooter, CardHeader } from './ui/card'
import Link from 'next/link'
import { MessagesSquare } from 'lucide-react'
import { Button } from './ui/button'

type Props = {
    data: (Companion & { _count: { messages: number } })[]
}

const Companions = ({ data }: Props) => {

    const handleCall = async () => {
        fetch("/api/rag", {
            body: JSON.stringify({}),
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })
    }

    if (data.length === 0) {
        return (
            <div className='pt-10 flex flex-col items-center justify-center space-y-3'>
                <div className="relative w-60 h-60">
                    <Image fill className='grayscale' src="/empty.png" alt="empty" />
                    No comps found
                </div>
            </div>
        )
    }
    return (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 pb-10'>
            {data.map((item) => (
                <Card key={item.id} className="bg-primary/10 rounded-xl cursor-pointer hover:opacity-75 border-0 w-[200px]" >
                    <Link href={`/chat/${item.id}`}>
                        <CardHeader className="flex items-center justify-center text-center text-muted-foreground">
                            <p>
                                {item.name}
                            </p>
                            <p className='truncate max-w-16'>
                                {item.description}
                            </p>
                        </CardHeader>
                        <CardFooter>
                            <p className="lowercase">
                                @{item.userName}

                            </p>
                            <div className="flex items-center">
                                <MessagesSquare className='w-3 h-3 mr-1' />
                                {item._count.messages}
                            </div>
                        </CardFooter>
                    </Link>

                </Card>

            ))}
            <Button onClick={handleCall}>Call</Button>
        </div>
    )
}

export default Companions
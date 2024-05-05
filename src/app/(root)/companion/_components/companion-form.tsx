"use client"
import { Companion } from '@prisma/client'
import React from 'react'
import { useForm } from 'react-hook-form';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand, Wand2 } from 'lucide-react';
import axios from "axios"
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Name is required",
    }),
    description: z.string().min(1, {
        message: "Description is required",
    }),
    instructions: z.string().min(200, {
        message: "Instructions are require at least 200 chars",
    }),
    seed: z.string().min(200, {
        message: "Instructions are require at least 200 chars",
    }),
    // src: z.string().min(1, {
    //     message: "Image is required",
    // }).optional()
});



type Props = {
    initialData?: Companion | null
}

const CompanionForm = ({ initialData }: Props) => {
    const router = useRouter();

    const PREAMBLE = `
        You are a fictional character whose name is Elon. You are a visionary entrepreneur
    `
    const SEED_CHAT = `
    Human: Hi Elon, how's your day been?
    Elon: Busy as always. Between sending rockets to space and building the future of electric vehicles.

    Human: Just a regular day for me. How's the progress with Mars colonization?
    Elon: We're making strides. Our goal is to make life multi-planetary. Mars is the next logical step.

    Human: That sounds incredibly ambitious. Are electric vehicles part of this big picture?
    Elon: Absolutely! Sustainable energy is crucial both on Earth and for our future colonies.

    Human: It's fascinating to see your vision unfod. Any new projects or innovations?
    Elon: Always! But right now, I am particulary excited about Neuralink.
    `;

    const form = useForm<z.infer<typeof formSchema>>({
        defaultValues: initialData || {
            name: "",
            instructions: "",
            seed: "",
        },
        resolver: zodResolver(formSchema),
    })
    const isLoading = form.formState.isLoading || form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log(values)
        try {
            if (initialData) {
                // update companion functionality
                await axios.patch(`/api/companion/${initialData.id}`, values);
            } else {
                console.log('posting')
                await axios.post(`/api/companion`, values);
            }
            router.refresh();
            router.push('/')
        } catch (errr) {
            toast.error("Failed to save companion")
        }
    }
    console.log(form.formState.errors)
    return (
        <div className='h-full p-4 space-y max-w-3xl mx-auto'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 pb-10'>
                    <div className='space-y-2 w-full col-span-2'>
                        <h3 className='text-lg font-medium'>General Info</h3>
                        <p className='text-sm text-muted-foreground'>
                            General info about companion
                        </p>
                    </div>
                    <Separator className="bg-primary/10" />

                    <div>
                        {/* <FormField
                            name="src"
                            render={({ field }) => (
                                <FormItem
                                    className="flex flex-col items-center justify-center space-y-4">
                                    <FormControl>
                                        <Input type='file' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>)
                            }
                        /> */}

                        <FormField
                            name="name"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem
                                    className="flex flex-col items-center justify-center space-y-4">
                                    <FormControl>
                                        <Input disabled={isLoading} placeholder='Elon Musk' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="description"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem
                                    className="flex flex-col items-center justify-center space-y-4">
                                    <FormControl>
                                        <Textarea disabled={isLoading} placeholder='description' {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is the name of the companion
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>)
                            }
                        />
                    </div>
                    <div className='space-y-2 w-full'>
                        <div>
                            <h3 className="text-lg font-medium">
                                Configuration
                            </h3>
                            <p className='text-sm text-muted-foreground'>
                                Detailed Instructions for ai behaviour
                            </p>
                        </div>
                        <Separator className="bg-primary/10" />
                        <div className='space-y-2'>

                            <FormField
                                name="instructions"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem
                                        className="flex flex-col items-center justify-center space-y-4">
                                        <FormLabel>Instructions</FormLabel>
                                        <FormControl>
                                            <Textarea className='bg-background resize-none'
                                                rows={7}
                                                disabled={isLoading}
                                                placeholder={PREAMBLE} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <FormField
                                name="seed"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem
                                        className="flex flex-col items-center justify-center space-y-4">
                                        <FormLabel>Example Conversation</FormLabel>
                                        <FormControl>
                                            <Textarea className='bg-background resize-none'
                                                rows={7}
                                                disabled={isLoading}
                                                placeholder={SEED_CHAT} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>
                        <div className="w-full flex justify-center">
                            <Button size="lg" disabled={isLoading}>
                                {initialData ? "Edit your companion" : "Create"}
                                <Wand2 className='w-4 h-4 ml-2' />
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default CompanionForm
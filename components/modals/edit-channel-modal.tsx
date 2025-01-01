"use client";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useForm } from "react-hook-form";

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-model.store";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { ChannelType } from "@prisma/client";
import qs from "query-string"
import { useEffect } from "react";

const formSchema = z.object({
    name: z.string().min(1, { message: "Kanal ismi zorunlu" }).refine(name => name !== "general", {
        message: "Kanal ismi 'general' olamaz"
    }),
    type: z.nativeEnum(ChannelType)
})


export const EditChannelModal = () => {
    const { isOpen, onClose, type, data } = useModal()
    const router = useRouter();

    const isModalOpen = isOpen && type === "editChannel"
    const { channel, server } = data;
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: channel?.type || ChannelType.TEXT
        }
    })

    useEffect(() => {
        if (channel) {
            form.setValue("name", channel.name);
            form.setValue("type", channel.type);
        }
    }, [form, channel])

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: `/api/channels/${channel?.id}`,
                query: {
                    serverId: server?.id
                }
            })

            await axios.patch(url, values);
            form.reset()
            router.refresh()
            onClose()
        }
        catch (error) {
            console.log(error)
        }
    }

    const handleClose = () => {
        form.reset()
        onClose()
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white dark:bg-[#1E1F22] dark:text-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6" >
                    <DialogTitle className="text-2xl text-center font-bold">
                        Kanalı Düzenle
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-8 px-6">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white/80">Kanal ismi</FormLabel>
                                    <FormControl>
                                        <Input disabled={isLoading} className="bg-zinc-300/50 dark:bg-[#2B2D31] dark:text-white/60 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0" placeholder="Kanal ismi giriniz" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="type" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white/80">Kanal Tipi</FormLabel>
                                    <Select disabled={isLoading} onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-zinc-300/50 border-0 dark:bg-[#2B2D31] dark:text-white/60 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                                                <SelectValue placeholder="Kanal tipi seçiniz" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(ChannelType).map((type) => (
                                                <SelectItem key={type} value={type} className="capitalize">
                                                    {type.toLowerCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <DialogFooter className="bg-gray-100 dark:bg-[#2B2D31]  px-6 py-4">
                            <Button type="submit" variant={"primary"} disabled={isLoading}>Kaydet</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
import Companions from "@/components/companions";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

interface RootPageProps {
  searchParams: {
    categoryId?: string;
    name: string
  }
}

export default async function Home({ searchParams: { categoryId, name } }: RootPageProps) {

  const data: any = await db.companion.findMany({
    where: {
      name,
    },
    include: {
      _count: {
        select: {
          messages: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },

  })

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <UserButton />
      <Companions data={data} />

    </main>
  );
}

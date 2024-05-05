import React from 'react'
import { db } from '@/lib/db'
import CompanionForm from '../_components/companion-form'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

type Props = {
  params: {
    companionId: string
  }
}

const CompanionPage = async ({ params: { companionId } }: Props) => {
  // todo: check subscription

  const { userId } = auth();
  if (!userId) {
    return redirect('/sign-in');
  }
  let companion;

  try {
    companion = await db.companion.findUnique({
      where: {
        id: companionId
      }
    });
    console.log('CPM', companion)
  } catch (err) {

  }


  return (
    <div>
      <CompanionForm initialData={companion} />
    </div>
  )
}

export default CompanionPage
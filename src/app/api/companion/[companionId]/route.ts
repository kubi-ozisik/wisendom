import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params: { companionId } }: { params: { companionId: string } }
) {
  try {
    const body = await request.json();
    const user = await currentUser();
    const { name, description, instructions, seed } = body;

    if (!companionId) {
      return new NextResponse("Comp id is requierd", { status: 400 });
    }

    if (!user || !user.id || !user.firstName) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name || !description || !instructions || !seed) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    // todo: check for subscription
    const companion = await db.companion.update({
      where: { id: companionId },
      data: {
        name,
        userName: user.firstName,
        description,
        instructions,
        seed,
        userId: user.id,
      },
    });
    return NextResponse.json(companion);
  } catch (err) {
    console.log("[COMPANION_PATCH]", err);
    return new Response("Internal Error", { status: 500 });
  }
}

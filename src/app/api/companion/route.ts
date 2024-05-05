import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await currentUser();
    const { name, description, instructions, seed } = body;

    if (!user || !user.id || !user.firstName) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name || !description || !instructions || !seed) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    // todo: check for subscription
    const companion = await db.companion.create({
      data: {
        src: "",
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
    console.log("[COMPANION_API]", err);
    return new Response("Internal Error", { status: 500 });
  }
}

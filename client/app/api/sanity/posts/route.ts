import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { postsQuery } from "@/sanity/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await client.fetch(postsQuery);
    return NextResponse.json(posts);
  } catch (error: any) {
    console.error("Sanity API Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { authConfigured, readSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const required = authConfigured();
  return NextResponse.json({ required, email: required ? readSession(req) : null });
}

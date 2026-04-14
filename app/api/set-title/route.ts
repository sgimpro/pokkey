import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title } = await req.json();

  await supabase
    .from("users")
    .update({ active_title: title || null })
    .eq("id", user.id);

  return NextResponse.json({ success: true });
}

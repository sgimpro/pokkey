import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subscription } = await req.json();

  // Upsert — delete old subscriptions for this user first, then insert new one
  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id);

  await supabase.from("push_subscriptions").insert({
    user_id: user.id,
    subscription,
  });

  return NextResponse.json({ success: true });
}

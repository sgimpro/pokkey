import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { friendshipId } = await req.json();
  if (!friendshipId) {
    return NextResponse.json({ error: "Missing friendshipId" }, { status: 400 });
  }

  // Verify the user owns this friendship
  const { data: friendship } = await supabase
    .from("friendships")
    .select("id, user_id, friend_id")
    .eq("id", friendshipId)
    .eq("user_id", user.id)
    .limit(1);

  if (!friendship || friendship.length === 0) {
    return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
  }

  const friendId = friendship[0].friend_id;

  // Delete both directions of the friendship
  await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);

  await supabase
    .from("friendships")
    .delete()
    .eq("user_id", friendId)
    .eq("friend_id", user.id);

  return NextResponse.json({ success: true });
}

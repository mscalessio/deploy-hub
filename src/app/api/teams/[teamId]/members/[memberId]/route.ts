import { auth } from "@clerk/nextjs/server";
import { createClientSsr } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";


async function checkAdminAccess(supabase: SupabaseClient, teamId: string, userId: string) {
  const { data: membership, error } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .single();

  if (error || !membership || membership.role !== "admin") {
    return false;
  }

  return true;
}

export async function PATCH(
  req: Request,
  { params }: { params: { teamId: string; memberId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = await createClientSsr();

    // Check if user is an admin
    const isAdmin = await checkAdminAccess(supabase, params.teamId, userId);
    if (!isAdmin) {
      return new NextResponse("Not authorized", { status: 403 });
    }

    const { role } = await req.json();
    if (!role) {
      return new NextResponse("Role is required", { status: 400 });
    }

    // Update member role
    const { error: updateError } = await supabase
      .from("team_members")
      .update({ role })
      .eq("id", params.memberId)
      .eq("team_id", params.teamId);

    if (updateError) throw updateError;

    return new NextResponse("Member role updated successfully", { status: 200 });
  } catch (error) {
    console.error("[TEAM_MEMBER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { teamId: string; memberId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = await createClientSsr();

    // Check if user is an admin
    const isAdmin = await checkAdminAccess(supabase, params.teamId, userId);
    if (!isAdmin) {
      return new NextResponse("Not authorized", { status: 403 });
    }

    // Get the member being removed
    const { data: member, error: memberError } = await supabase
      .from("team_members")
      .select("*")
      .eq("id", params.memberId)
      .eq("team_id", params.teamId)
      .single();

    if (memberError || !member) {
      return new NextResponse("Member not found", { status: 404 });
    }

    // Check if trying to remove the last admin
    if (member.role === "admin") {
      const { data: admins, error: adminsError } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", params.teamId)
        .eq("role", "admin");

      if (adminsError) throw adminsError;

      if (admins.length === 1) {
        return new NextResponse(
          "Cannot remove the last admin from the team",
          { status: 400 }
        );
      }
    }

    // Remove member
    const { error: deleteError } = await supabase
      .from("team_members")
      .delete()
      .eq("id", params.memberId)
      .eq("team_id", params.teamId);

    if (deleteError) throw deleteError;

    return new NextResponse("Member removed successfully", { status: 200 });
  } catch (error) {
    console.error("[TEAM_MEMBER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 
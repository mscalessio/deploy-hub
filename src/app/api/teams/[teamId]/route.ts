import { auth } from "@clerk/nextjs/server";
import { createClientSsr } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function checkAdminAccess(supabase: any, teamId: string, userId: string) {
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

export async function GET(
  req: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = await createClientSsr();

    // Get team details
    const { data: team, error } = await supabase
      .from("teams")
      .select(
        `
        id,
        name,
        created_at,
        team_members!inner (
          role
        )
      `
      )
      .eq("id", params.teamId)
      .eq("team_members.user_id", userId)
      .single();

    if (error) {
      return new NextResponse("Team not found", { status: 404 });
    }

    // Format response
    const formattedTeam = {
      id: team.id,
      name: team.name,
      role: team.team_members[0].role,
      created_at: team.created_at,
    };

    return NextResponse.json(formattedTeam);
  } catch (error) {
    console.error("[TEAM_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { teamId: string } }
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

    const { name } = await req.json();
    if (!name?.trim()) {
      return new NextResponse("Team name is required", { status: 400 });
    }

    // Update team
    const { error: updateError } = await supabase
      .from("teams")
      .update({ name })
      .eq("id", params.teamId);

    if (updateError) throw updateError;

    return new NextResponse("Team updated successfully", { status: 200 });
  } catch (error) {
    console.error("[TEAM_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { teamId: string } }
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

    // Delete team (cascade will handle team members)
    const { error: deleteError } = await supabase
      .from("teams")
      .delete()
      .eq("id", params.teamId);

    if (deleteError) throw deleteError;

    return new NextResponse("Team deleted successfully", { status: 200 });
  } catch (error) {
    console.error("[TEAM_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

import { auth } from "@clerk/nextjs/server";
import { createClientSsr } from "@/utils/supabase/server";
// import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = await createClientSsr();

    // Get all teams where the user is a member
    const { data: teams, error } = await supabase
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
      .eq("team_members.user_id", userId);

    if (error) throw error;

    // Format the response
    const formattedTeams = teams.map((team) => ({
      id: team.id,
      name: team.name,
      role: team.team_members[0].role,
      created_at: team.created_at,
    }));

    return NextResponse.json(formattedTeams);
  } catch (error) {
    console.error("[TEAMS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name } = await req.json();
    if (!name?.trim()) {
      return new NextResponse("Team name is required", { status: 400 });
    }

    const supabase = await createClientSsr();

    // Create team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({ name });
      // .select()
      // .single();

    if (teamError) throw teamError;

    // Add creator as admin
    // MODIFIED TO BE DONE IN TRIGGER
    // const { error: memberError } = await supabase
    //   .from("team_members")
    //   .insert({
    //     team_id: team.id,
    //     user_id: userId,
    //     role: "admin",
    //   });

    // if (memberError) throw memberError;

    return NextResponse.json(team);
  } catch (error) {
    console.error("[TEAMS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 
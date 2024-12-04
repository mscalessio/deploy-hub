import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createClientSsr } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

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

    const { teamId } = await params;

    // Check if user is a member of the team
    const { data: membership, error: membershipError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .single();

    if (membershipError || !membership) {
      return new NextResponse("Not a team member", { status: 403 });
    }

    // Get all team members
    const { data: members, error: membersError } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_id", teamId);

    if (membersError) throw membersError;

    // Get user details from Clerk
    const client = await clerkClient();

    const userList = await client.users.getUserList({
      userId: members.map((member) => member.user_id),
    });

    // Combine Supabase and Clerk data
    const enrichedMembers = members.map((member) => {
      const user = userList.data.find((u: any) => u.id === member.user_id);
      return {
        ...member,
        user: {
          id: user?.id,
          email: user?.emailAddresses[0]?.emailAddress,
          firstName: user?.firstName,
          lastName: user?.lastName,
        },
      };
    });

    return NextResponse.json(enrichedMembers);
  } catch (error) {
    console.error("[TEAM_MEMBERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
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
    const { data: membership, error: membershipError } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", params.teamId)
      .eq("user_id", userId)
      .single();

    if (membershipError || !membership || membership.role !== "admin") {
      return new NextResponse("Not authorized", { status: 403 });
    }

    const { email, role } = await req.json();
    if (!email?.trim()) {
      return new NextResponse("Email is required", { status: 400 });
    }

    // Find user in Clerk
    const client = await clerkClient();
    const userList = await client.users.getUserList({
      emailAddress: [email],
    });
    const [user] = userList.data;

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Add user to team
    const { error: addError } = await supabase.from("team_members").insert({
      team_id: params.teamId,
      user_id: user.id,
      role,
    });

    if (addError?.code === "23505") {
      return new NextResponse("User is already a member", { status: 400 });
    }

    if (addError) throw addError;

    return new NextResponse("Member added successfully", { status: 200 });
  } catch (error) {
    console.error("[TEAM_MEMBERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 
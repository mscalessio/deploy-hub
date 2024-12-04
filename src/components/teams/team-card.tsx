"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Settings, Users, Trash2 } from "lucide-react";
import { TeamMembersDialog } from "@/components/teams/team-members-dialog";

interface Team {
  id: string;
  name: string;
  role: "admin" | "developer" | "viewer";
  created_at: string;
}

interface TeamCardProps {
  team: Team;
  onUpdate: () => void;
}

export function TeamCard({ team, onUpdate }: TeamCardProps) {
  const { user } = useUser();
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this team?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete team");
      }

      onUpdate();
    } catch (error) {
      console.error("Error deleting team:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isAdmin = team.role === "admin";

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="truncate">{team.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsMembersDialogOpen(true)}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Members
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={`/teams/${team.id}/settings`}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Team
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>
            Your role: {team.role.charAt(0).toUpperCase() + team.role.slice(1)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Created on {new Date(team.created_at).toLocaleDateString()}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/teams/${team.id}/projects`}>View Projects</Link>
          </Button>
        </CardFooter>
      </Card>

      <TeamMembersDialog
        teamId={team.id}
        open={isMembersDialogOpen}
        onOpenChange={setIsMembersDialogOpen}
        isAdmin={isAdmin}
      />
    </>
  );
}

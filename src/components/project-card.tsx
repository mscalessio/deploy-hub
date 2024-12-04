import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Globe } from "lucide-react";

interface ProjectCardProps {
  name: string;
  framework: string;
  domain: string;
  branch: string;
  status: "active" | "archived";
}

export function ProjectCard({
  name,
  framework,
  domain,
  branch,
  status,
}: ProjectCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">{framework}</div>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div className="flex items-center">
          <Globe className="mr-1 h-4 w-4" />
          {domain}
        </div>
        <div className="flex items-center">
          <GitBranch className="mr-1 h-4 w-4" />
          {branch}
        </div>
      </CardFooter>
    </Card>
  );
}

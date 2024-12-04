import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-2xl font-bold">
            DeployHub
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/projects"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Projects
            </Link>
            <Link
              href="/deployments"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Deployments
            </Link>
            <Link
              href="/analytics"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Analytics
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="default">Create Project</Button>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
      <div className="border-t">
        <div className="flex items-center space-x-6 px-4 py-2 max-w-7xl mx-auto">
          <Button variant="ghost" className="text-sm font-medium">
            Overview
          </Button>
          <Button variant="ghost" className="text-sm font-medium">
            Settings
          </Button>
          <Button variant="ghost" className="text-sm font-medium">
            Domains
          </Button>
          <Button variant="ghost" className="text-sm font-medium">
            Environment
          </Button>
        </div>
      </div>
    </header>
  );
}

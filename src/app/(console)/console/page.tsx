import { ProjectCard } from "@/components/project-card";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col w-full bg-background">
      <main className="max-w-7xl">
        {/* <SearchBar /> */}
        <div className="p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ProjectCard
              name="My Next.js App"
              framework="Next.js"
              domain="my-app.vercel.app"
              branch="main"
              status="active"
            />
            <ProjectCard
              name="React Dashboard"
              framework="React"
              domain="dashboard.vercel.app"
              branch="main"
              status="active"
            />
            <ProjectCard
              name="Legacy Project"
              framework="Vue"
              domain="legacy.vercel.app"
              branch="main"
              status="archived"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

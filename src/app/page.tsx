import { Header } from "@/components/header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold">Deploy Hub</h1>
      </main>
    </div>
  );
}

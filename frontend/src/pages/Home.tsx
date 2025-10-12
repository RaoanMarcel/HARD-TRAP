import { Navbar } from "../components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-hardtrap-black min-h-screen text-hardtrap-white p-8">
        <h1 className="text-5xl font-hard text-hardtrap-red">
          HardTrap Frontend 🔥
        </h1>
        <p className="mt-4 text-lg">
          Página inicial pronta para receber os próximos blocos.
        </p>
      </main>
    </>
  );
}
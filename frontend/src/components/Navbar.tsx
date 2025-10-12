export const Navbar = () => {
  return (
    <nav className="bg-hardtrap-black text-hardtrap-white px-6 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold font-hard tracking-widest">
        HARDTRAP
      </div>
      <ul className="flex gap-8 text-sm font-semibold uppercase">
        <li><a href="#" className="hover:text-hardtrap-red">Loja</a></li>
        <li><a href="#" className="hover:text-hardtrap-red">Novidades</a></li>
        <li><a href="#" className="hover:text-hardtrap-red">Entre</a></li>
      </ul>
    </nav>
  );
};
// src/components/Navbar.tsx

export default function Navbar(): React.JSX.Element {
    return (
    <header className="navbar" role="banner">
      <nav className="navbar-inner" role="navigation" aria-label="Main">
        <ul className="menu-left">
          <li><a href="#">LOJA</a></li>
          <li><a href="#">NOVIDADES</a></li>
        </ul>

        <div className="logo-wrap" aria-hidden>
          <h1 className="logo">HardTrap</h1>
        </div>

        <div className="menu-right">
          <img
            src="https://cdn-icons-png.flaticon.com/512/833/833314.png"
            alt="Carrinho"
            className="cart-icon"
          />
          <button className="login-btn">ENTRE</button>
        </div>
      </nav>
    </header>
  );
}

import { useNavigate } from "react-router-dom";

export default function Navbar(): React.JSX.Element {
  const navigate = useNavigate();
  const handleLoginClick = () => {
    navigate("/login");
  };
  return (
    <header className="navbar" role="banner">
      {/* barra fina topo */}
      <div className="navbar-top">
        <div className="logo-wrap">
          <h1 className="logo">HardTrap</h1>
        </div>
      </div>

      {/* menus principais */}
      <div className="navbar-bottom">
        <nav className="navbar-inner" role="navigation" aria-label="Main">
          <ul className="menu-left">
            <li><a href="#">LOJA</a></li>
            <li><a href="#">NOVIDADES</a></li>
          </ul>

          <div className="menu-right">
            <img
               src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png"
                 alt="Carrinho"
           className="cart-icon"
          />
            <button className="login-btn" onClick={handleLoginClick}>ENTRAR</button>
          </div>
        </nav>
      </div>
    </header>
  );
}

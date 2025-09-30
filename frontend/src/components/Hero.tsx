export default function Hero(): React.JSX.Element {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="sidebar left"></div>
      <div className="sidebar right"></div>
      
      <div className="hero-content">
        <div className="banners">
          <div className="banner-wrap">
            <img
              src="/assets/banner.png"
              alt="Banner HardTrap"
              className="banner"
            />
                        <img
              src="/assets/banner.png"
              alt="Banner HardTrap"
              className="banner"
            />
                        <img
              src="/assets/banner.png"
              alt="Banner HardTrap"
              className="banner"
            />
          </div>
        </div>

        <img
          src="/assets/logo.png"
          alt="Mascote HardTrap"
          className="mascot"
        />
      </div>
    </section>
  );
}

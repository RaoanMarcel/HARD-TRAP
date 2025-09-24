
export default function Hero(): React.JSX.Element {  return (
    <section className="hero" aria-labelledby="hero-title">
      {/* barras laterais finas */}
      <div className="sidebar left" aria-hidden></div>
      <div className="sidebar right" aria-hidden></div>

      {/* destaque da marca (trapezio invertido) */}
      <div className="highlight" id="hero-title">
        <div className="highlight-inner">
          <span className="highlight-text">HardTrap</span>
        </div>
      </div>

      <div className="hero-content">
        <div className="banners">
          <div className="banner-wrap">
            <img src="/assets/banner.png" alt="Banner NEW DROP" className="banner" />
            <div className="new-drop">NEW DROP</div>
          </div>

          <div className="banner-wrap">
            <img src="/assets/banner.png" alt="Banner NEW DROP" className="banner" />
            <div className="new-drop">NEW DROP</div>
          </div>

          <div className="banner-wrap">
            <img src="/assets/banner.png" alt="Banner NEW DROP" className="banner" />
            <div className="new-drop">NEW DROP</div>
          </div>
        </div>

        <img src="/assets/logo.png" alt="Mascote HardTrap" className="mascot" />
      </div>
    </section>
  );
}

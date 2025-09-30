import React, { useEffect, useRef, useState } from "react";

type Produto = { id: number; nome: string; url: string };

export default function ProductCarousel(): React.JSX.Element {
  const [index, setIndex] = useState(1); // começa no "meio"
  const trackRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const baseProdutos: Produto[] = [
    { id: 1, nome: "Produto 1", url: "https://picsum.photos/600/800?random=1" },
    { id: 2, nome: "Produto 2", url: "https://picsum.photos/600/800?random=2" },
    { id: 3, nome: "Produto 3", url: "https://picsum.photos/600/800?random=3" },
    { id: 4, nome: "Produto 4", url: "https://picsum.photos/600/800?random=4" },
    { id: 5, nome: "Produto 5", url: "https://picsum.photos/600/800?random=5" },
  ];

  // cria clones para loop infinito
  const produtos = [
    baseProdutos[baseProdutos.length - 1],
    ...baseProdutos,
    baseProdutos[0],
  ];

  const next = () => setIndex((i) => i + 1);
  const prev = () => setIndex((i) => i - 1);

  // centraliza o slide ativo
  const centerActive = () => {
    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) return;

    const slides = Array.from(track.children) as HTMLElement[];
    const active = slides[index];
    if (!active) return;

    const containerWidth = container.clientWidth;
    const offset = active.offsetLeft - (containerWidth - active.offsetWidth) / 2;
    track.style.transition = "transform 0.6s ease";
    track.style.transform = `translateX(-${Math.max(0, offset)}px)`;
  };

  // reset para loop infinito
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    if (index === produtos.length - 1) {
      setTimeout(() => {
        track.style.transition = "none";
        setIndex(1); // volta para o segundo (real primeiro)
      }, 600);
    } else if (index === 0) {
      setTimeout(() => {
        track.style.transition = "none";
        setIndex(produtos.length - 2); // volta para o penúltimo
      }, 600);
    } else {
      centerActive();
    }
  }, [index]);

  useEffect(() => {
    centerActive(); // centraliza já no primeiro render
    window.addEventListener("resize", centerActive);
    return () => window.removeEventListener("resize", centerActive);
  }, []);

  return (
    <section className="product-carousel">
      <div className="pc-header">
        <h2 className="pc-title">CONFIRA A NOVA COLEÇÃO</h2>
        <p className="pc-subtitle">Coleção feita pra quem não conhece limites.</p>
      </div>

      <div className="product-carousel-viewport" ref={containerRef}>
<div className="pc-bg-text" aria-hidden="true">
  <div className="row">
    <span>PAIN</span>
    <span>IMPACT</span>
    <span>BRUTALITY</span>
    <span>SAVAGE</span>
    <span>RAGE</span>
  </div>
  <div className="row">
    <span>FURY</span>
    <span>VIOLENCE</span>
    <span>POWER</span>
    <span>ENDURANCE</span>
    <span>PAIN</span>
  </div>
  <div className="row">
    <span>STRENGTH</span>
    <span>DOMINANCE</span>
    <span>RAGE</span>
    <span>VICTORY</span>
    <span>FEARLESS</span>
  </div>
</div>


        <button className="pc-arrow pc-arrow-left" onClick={prev}>‹</button>
        <button className="pc-arrow pc-arrow-right" onClick={next}>›</button>

        <div className="pc-track" ref={trackRef}>
          {produtos.map((p, i) => {
            const isActive = i === index;
            const isPrev = i === index - 1;
            const isNext = i === index + 1;

            let cls = "pc-slide";
            if (isActive) cls += " active";
            else if (isPrev) cls += " prev";
            else if (isNext) cls += " next";
            else cls += " hidden";

            return (
              <div key={`${p.id}-${i}`} className={cls}>
                <img src={p.url} alt={p.nome} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

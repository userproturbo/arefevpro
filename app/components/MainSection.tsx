const faces = [
  { title: "About", className: "face-about", href: "/about" },
  { title: "The Impact", className: "face-impact", href: "/impact" },
  { title: "Statistics", className: "face-statistics", href: "/statistics" },
  { title: "The People", className: "face-people", href: "/people" },
  { title: "Support", className: "face-support", href: "/support" },
];

export default function MainSection() {
  return (
    <section id="Main" className="main-section texture1">
      <div className="main-section__inner">
        <div className="top-block">
          <img className="logo" src="/img/logo.svg" alt="Meetshow логотип" />
          <p className="top-text">
            Nowadays real-life violence is just a few clicks away. Are you sure you would like to
            continue?
          </p>
        </div>

        <div className="faces-row">
          {faces.map((face) => (
            <div key={face.title} className="face-item">
              <a className={`face-image ${face.className}`} href={face.href} aria-label={face.title}>
                <span className="sr-only">{face.title}</span>
              </a>
              <h6>{face.title}</h6>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

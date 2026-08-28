import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Icon({ name, size = 22, strokeWidth = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    coffee: (
      <>
        <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" />
        <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" />
        <path d="M7 3c0 1.3 1 1.7 1 3" />
        <path d="M11 3c0 1.3 1 1.7 1 3" />
      </>
    ),
    scan: (
      <>
        <path d="M4 7V5a1 1 0 0 1 1-1h2" />
        <path d="M17 4h2a1 1 0 0 1 1 1v2" />
        <path d="M20 17v2a1 1 0 0 1-1 1h-2" />
        <path d="M7 20H5a1 1 0 0 1-1-1v-2" />
        <circle cx="12" cy="12" r="3.2" />
        <path d="M4 12h16" />
      </>
    ),
    activity: (
      <>
        <path d="M3 12h4l2-6 4 12 2-6h6" />
      </>
    ),
    cpu: (
      <>
        <rect x="7" y="7" width="10" height="10" rx="2" />
        <rect x="10" y="10" width="4" height="4" rx="1" />
        <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
      </>
    ),
    powder: (
      <>
        <circle cx="8" cy="9" r="2" />
        <circle cx="15" cy="7" r="1.5" />
        <circle cx="15" cy="14" r="2.5" />
        <circle cx="7" cy="16" r="1.5" />
      </>
    ),
    package: (
      <>
        <path d="m4 7 8-4 8 4-8 4-8-4Z" />
        <path d="M4 7v10l8 4 8-4V7" />
        <path d="M12 11v10" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 4-4 3 2 5-6" />
      </>
    ),
    wifi: (
      <>
        <path d="M5 12.5a10 10 0 0 1 14 0" />
        <path d="M8.5 16a5 5 0 0 1 7 0" />
        <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </>
    ),
    alert: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6" />
        <path d="M12 17h.01" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 19 6v5c0 4.5-2.8 7.6-7 10-4.2-2.4-7-5.5-7-10V6l7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    cog: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    route: (
      <>
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="6" r="2" />
        <path d="M8 18h3a3 3 0 0 0 3-3v-2a3 3 0 0 1 3-3h1" />
      </>
    ),
    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m14 7 5 5-5 5" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
  };

  return <svg {...common}>{icons[name] || icons.coffee}</svg>;
}

function HomePage() {
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const revealItems = document.querySelectorAll("[data-reveal]");

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    revealItems.forEach((item) => revealObserver.observe(item));

    const sectionIds = [
      "home",
      "platform",
      "workflow",
      "technology",
      "about",
      "contact",
    ];
    const sectionElements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0.01, 0.15, 0.3],
      },
    );

    sectionElements.forEach((section) => sectionObserver.observe(section));

    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const modules = [
    {
      icon: "coffee",
      title: "Raw Bean Quality",
      text: "Detect bean defects and evaluate raw coffee quality using computer vision and sensor-based analysis.",
      step: "01",
    },
    {
      icon: "powder",
      title: "Powder Quality",
      text: "Monitor moisture, colour and granulation consistency across coffee powder batches.",
      step: "02",
    },
    {
      icon: "package",
      title: "Packaging Inspection",
      text: "Identify seal and packaging defects before products move to final distribution.",
      step: "03",
    },
    {
      icon: "chart",
      title: "Sales & Market Analysis",
      text: "Support business and product decisions using quality and production insights.",
      step: "04",
    },
  ];

  const workflow = [
    {
      step: "01",
      icon: "coffee",
      title: "Raw Bean Scan",
      text: "Capture bean images and inspect visible quality characteristics.",
    },
    {
      step: "02",
      icon: "activity",
      title: "Sensor Analysis",
      text: "Collect environmental and bean-condition readings from connected sensors.",
    },
    {
      step: "03",
      icon: "cpu",
      title: "AI Decision",
      text: "Combine vision and sensor results to support quality decisions.",
    },
    {
      step: "04",
      icon: "powder",
      title: "Powder QC",
      text: "Evaluate coffee powder quality at the production stage.",
    },
    {
      step: "05",
      icon: "package",
      title: "Packaging QC",
      text: "Inspect packaging and seal quality before distribution.",
    },
    {
      step: "06",
      icon: "chart",
      title: "Market Insight",
      text: "Use quality and production information for business analysis.",
    },
  ];

  const technologies = [
    {
      icon: "scan",
      title: "Computer Vision",
      text: "AI-assisted visual inspection for coffee bean and packaging quality analysis.",
    },
    {
      icon: "activity",
      title: "IoT Sensor Monitoring",
      text: "Connected sensors provide additional physical and environmental quality information.",
    },
    {
      icon: "cpu",
      title: "Decision Intelligence",
      text: "Quality signals are combined into clear recommendations and inspection outcomes.",
    },
    {
      icon: "clock",
      title: "Real-Time Monitoring",
      text: "Operational information can be tracked throughout the quality-control workflow.",
    },
  ];

  const benefits = [
    {
      icon: "alert",
      title: "Detect Problems Earlier",
      text: "Identify quality issues before they move into later manufacturing stages.",
    },
    {
      icon: "shield",
      title: "Improve Consistency",
      text: "Use repeatable AI and sensor-based checks to support consistent inspection.",
    },
    {
      icon: "cog",
      title: "Reduce Manual Work",
      text: "Support inspectors with automated analysis and organized quality information.",
    },
    {
      icon: "route",
      title: "Trace Every Stage",
      text: "Connect quality information from raw bean inspection through packaging and analysis.",
    },
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          margin: 0;
          background: #f8f2ea;
          font-family: Inter, Arial, sans-serif;
        }

        :root {
          --espresso: #2b1812;
          --coffee: #5a3726;
          --mocha: #7a4b33;
          --caramel: #c58a4d;
          --cream: #fffaf3;
          --latte: #f2e4d3;
          --soft: #f7efe5;
          --leaf: #5f775f;
          --leaf-dark: #34503a;
          --text: #2d211c;
          --muted: #75675f;
          --line: rgba(90, 55, 38, 0.12);
        }

        .coffee-page {
          min-height: 100vh;
          color: var(--text);
          background:
            radial-gradient(circle at 85% 8%, rgba(197, 138, 77, 0.16), transparent 26%),
            radial-gradient(circle at 8% 75%, rgba(95, 119, 95, 0.10), transparent 26%),
            linear-gradient(180deg, #fffaf4 0%, #f8efe4 100%);
          overflow: hidden;
        }


        /* ADVANCED MOTION + REVEAL */
        [data-reveal] {
          opacity: 0;
          transform: translateY(24px);
          transition:
            opacity 0.72s cubic-bezier(.2,.7,.2,1),
            transform 0.72s cubic-bezier(.2,.7,.2,1);
        }
        [data-reveal].is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .feature-card:nth-child(2),
        .workflow-item:nth-child(2),
        .tech-card:nth-child(2) { transition-delay: 70ms; }
        .feature-card:nth-child(3),
        .workflow-item:nth-child(3),
        .tech-card:nth-child(3) { transition-delay: 140ms; }
        .feature-card:nth-child(4),
        .workflow-item:nth-child(4),
        .tech-card:nth-child(4) { transition-delay: 210ms; }
        .workflow-item:nth-child(5) { transition-delay: 280ms; }
        .workflow-item:nth-child(6) { transition-delay: 350ms; }

        @keyframes pulseDot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(136,191,141,.30); }
          50% { box-shadow: 0 0 0 7px rgba(136,191,141,0); }
        }
        @keyframes floatBeanA {
          0%, 100% { transform: translateY(0) rotate(-20deg); }
          50% { transform: translateY(-10px) rotate(-14deg); }
        }
        @keyframes floatBeanB {
          0%, 100% { transform: translateY(0) rotate(28deg); }
          50% { transform: translateY(9px) rotate(34deg); }
        }
        @keyframes bobCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        @keyframes scanner {
          0% { top: 13%; opacity: 0; }
          10% { opacity: .75; }
          50% { opacity: .75; }
          90% { opacity: .25; }
          100% { top: 88%; opacity: 0; }
        }
        @keyframes flowDot {
          0% { left: 7%; opacity: 0; }
          8% { opacity: 1; }
          92% { opacity: 1; }
          100% { left: calc(93% - 8px); opacity: 0; }
        }

        /* NAVBAR */
        .navbar {
          width: min(1220px, calc(100% - 48px));
          min-height: 70px;
          padding: 10px 12px 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: fixed;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          background: rgba(255, 250, 243, 0.82);
          border: 1px solid rgba(90, 55, 38, 0.10);
          border-radius: 19px;
          box-shadow: 0 14px 42px rgba(43, 24, 18, 0.10);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .brand { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .brand-icon {
          width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(145deg, var(--coffee), var(--espresso));
          color: #fff; font-size: 22px;
          box-shadow: 0 12px 28px rgba(43, 24, 18, 0.16);
          position: relative;
        }
        .brand-icon::after {
          content: ""; width: 10px; height: 10px; position: absolute;
          right: -4px; top: 12px; border: 3px solid var(--coffee);
          border-left: 0; border-radius: 0 10px 10px 0;
        }
        .brand-text strong { display: block; color: var(--espresso); font-size: 16px; }
        .brand-text span {
          display: block; margin-top: 2px; font-size: 10px; letter-spacing: 1.3px;
          text-transform: uppercase; color: #947765; font-weight: 700;
        }
        .nav-menu {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-left: auto;
          margin-right: 18px;
        }
        .nav-menu a {
          padding: 9px 10px;
          border-radius: 9px;
          color: #6f5849;
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
          transition: 0.2s ease;
        }
        .nav-menu a:hover,
        .nav-menu a.active {
          color: var(--coffee);
          background: rgba(90, 55, 38, 0.08);
        }
        .nav-menu a.active {
          box-shadow: inset 0 0 0 1px rgba(90, 55, 38, 0.06);
        }
        .mobile-menu-btn {
          display: none;
          width: 42px;
          height: 42px;
          border: 1px solid rgba(90,55,38,.12);
          border-radius: 12px;
          background: rgba(255,255,255,.58);
          color: var(--coffee);
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .mobile-nav-panel {
          display: none;
        }
        .nav-actions { display: flex; align-items: center; gap: 10px; }
        .nav-login, .nav-register, .primary-btn, .secondary-btn {
          text-decoration: none; border-radius: 10px; font-size: 14px; font-weight: 700;
          transition: 0.2s ease; display: inline-flex; align-items: center; justify-content: center;
        }
        .nav-login { padding: 10px 16px; color: var(--coffee); }
        .nav-login:hover { background: rgba(90, 55, 38, 0.08); }
        .nav-register {
          padding: 11px 18px; color: #fffaf3;
          background: linear-gradient(135deg, var(--coffee), var(--espresso));
          box-shadow: 0 10px 24px rgba(43, 24, 18, 0.18);
        }
        .nav-register:hover { transform: translateY(-1px); }

        /* HERO */
        .hero {
          width: min(1220px, calc(100% - 48px)); margin: 0 auto; padding: 145px 0 90px;
          display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 64px; align-items: center;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px;
          border-radius: 999px; background: rgba(255, 250, 243, 0.88);
          border: 1px solid rgba(122, 75, 51, 0.12); color: var(--mocha);
          font-size: 11px; font-weight: 800; letter-spacing: 1.1px; text-transform: uppercase;
        }
        .hero-badge-dot {
          width: 8px; height: 8px; border-radius: 50%; background: var(--leaf);
          box-shadow: 0 0 0 4px rgba(95, 119, 95, 0.12);
        }
        .hero h1 {
          margin: 22px 0 0; max-width: 680px; font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(48px, 5.2vw, 74px); line-height: 1; letter-spacing: -2px; color: var(--espresso);
        }
        .hero h1 span { color: var(--caramel); font-style: italic; }
        .hero-description {
          margin: 24px 0 0; max-width: 610px; color: var(--muted); font-size: 16px; line-height: 1.8;
        }
        .hero-actions { display: flex; gap: 12px; margin-top: 30px; }
        .primary-btn, .secondary-btn { min-width: 155px; padding: 14px 22px; }
        .primary-btn {
          background: linear-gradient(135deg, var(--coffee), var(--espresso)); color: #fffaf3;
          box-shadow: 0 13px 28px rgba(67, 35, 24, 0.20);
        }
        .primary-btn:hover { transform: translateY(-2px); }
        .btn-arrow {
          display: inline-flex;
          margin-left: 8px;
          transition: transform .22s ease;
        }
        .primary-btn:hover .btn-arrow,
        .feature-card:hover .feature-link .btn-arrow {
          transform: translateX(4px);
        }
        .secondary-btn {
          background: rgba(255, 250, 242, 0.86); color: var(--coffee);
          border: 1px solid rgba(90, 55, 38, 0.15);
        }
        .secondary-btn:hover { transform: translateY(-2px); background: #fff; }
        .trust-row { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 24px; font-size: 12px; color: #8a7768; font-weight: 600; }
        .trust-item { display: inline-flex; align-items: center; gap: 7px; }
        .trust-icon {
          width: 19px; height: 19px; border-radius: 50%; display: inline-flex;
          align-items: center; justify-content: center; background: var(--leaf); color: white; font-size: 10px;
        }

        /* HERO CARD */
        .hero-visual { position: relative; min-height: 520px; display: flex; align-items: center; justify-content: center; }
        .bean-float { position: absolute; color: rgba(90, 55, 38, 0.14); font-size: 26px; }
        .bean-1 { top: 20px; left: 18px; transform: rotate(-20deg); animation: floatBeanA 5.5s ease-in-out infinite; }
        .bean-2 { right: 15px; bottom: 55px; transform: rotate(28deg); animation: floatBeanB 6.2s ease-in-out infinite; }
        .bean-3 { left: 36px; bottom: 45px; transform: rotate(15deg); font-size: 18px; }
        .dashboard-card {
          width: min(100%, 520px); min-height: 485px; padding: 25px; border-radius: 30px; color: white;
          background: radial-gradient(circle at 92% 6%, rgba(224, 169, 107, 0.18), transparent 28%), linear-gradient(145deg, #4a2a1d 0%, #26140f 74%);
          box-shadow: 0 32px 78px rgba(55, 29, 20, 0.24); position: relative; overflow: hidden;
        }
        .dashboard-card::before {
          content: ""; position: absolute; width: 290px; height: 290px; border-radius: 50%;
          background: rgba(197, 138, 77, 0.08); right: -90px; bottom: -130px;
        }
        .dashboard-card::after {
          content: "";
          position: absolute;
          left: 7%;
          right: 7%;
          height: 1px;
          top: 15%;
          z-index: 1;
          background: linear-gradient(90deg, transparent, rgba(240,200,147,.55), transparent);
          box-shadow: 0 0 18px rgba(240,200,147,.16);
          animation: scanner 6s ease-in-out infinite;
          pointer-events: none;
        }
        .dash-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; position: relative; z-index: 2; }
        .dash-title small { display: block; margin-bottom: 5px; color: #c8a78f; font-size: 9px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; }
        .dash-title strong { font-size: 15px; }
        .ai-badge {
          display: inline-flex; align-items: center; gap: 6px; padding: 7px 10px; border-radius: 999px;
          background: rgba(95, 119, 95, 0.18); border: 1px solid rgba(170, 205, 170, 0.10);
          color: #dff1df; font-size: 9px; font-weight: 800; letter-spacing: 0.8px;
        }
        .ai-dot { width: 7px; height: 7px; border-radius: 50%; background: #88bf8d; animation: pulseDot 1.8s ease-in-out infinite; }
        .quality-box {
          margin-top: 22px; padding: 18px 20px; border-radius: 18px; background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between;
          position: relative; z-index: 2;
        }
        .quality-box span { display: block; color: #b9a08f; font-size: 10px; }
        .quality-box strong { display: block; margin-top: 4px; font-size: 17px; }
        .quality-ai { color: #e4b779; font-size: 36px; font-family: Georgia, serif; }
        .dash-grid { margin-top: 13px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; position: relative; z-index: 2; }
        .dash-module { min-height: 132px; padding: 16px; border-radius: 17px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.07); transition: .22s ease; } .dash-module:hover { transform: translateY(-3px); background: rgba(255,255,255,.085); border-color: rgba(240,200,147,.14); }
        .dash-module-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .dash-icon { width: 35px; height: 35px; border-radius: 11px; display: flex; align-items: center; justify-content: center; background: rgba(224, 169, 107, 0.12); color: #f0c893; font-size: 16px; }
        .dash-status { color: #aac9ae; font-size: 8px; font-weight: 800; letter-spacing: 0.7px; text-transform: uppercase; }
        .dash-module strong { display: block; margin-top: 12px; font-size: 12px; }
        .dash-module p { margin: 6px 0 0; color: #ab9586; font-size: 10px; line-height: 1.55; }
        .process-strip {
          margin-top: 13px; padding: 13px 16px; border-radius: 15px; background: rgba(197, 138, 77, 0.10);
          border: 1px solid rgba(224, 169, 107, 0.10); display: flex; align-items: center; justify-content: space-between;
          gap: 12px; position: relative; z-index: 2;
        }
        .process-strip span { color: #bea791; font-size: 9px; }
        .process-strip strong { color: #f0c893; font-size: 11px; letter-spacing: 0.2px; }
        .floating-card {
          position: absolute; z-index: 4; padding: 12px 15px; border-radius: 14px; background: rgba(255, 250, 242, 0.95);
          border: 1px solid rgba(90, 55, 38, 0.08); box-shadow: 0 16px 30px rgba(60, 34, 24, 0.12);
        }
        .floating-card small { display: block; color: #927764; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; }
        .floating-card strong { display: block; margin-top: 4px; color: var(--coffee); font-size: 13px; }
        .floating-left { left: -18px; bottom: 52px; animation: bobCard 4.6s ease-in-out infinite; }
        .floating-right { right: -22px; top: 76px; animation: bobCard 5.2s ease-in-out infinite reverse; }

        section[id], #home { scroll-margin-top: 100px; }

        /* COMMON SECTION */
        .section-head { max-width: 700px; margin: 0 auto 48px; text-align: center; }
        .section-head span { color: var(--mocha); font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; }
        .section-head h2 { margin: 14px 0 0; color: var(--espresso); font-family: Georgia, "Times New Roman", serif; font-size: 40px; letter-spacing: -1px; }
        .section-head p { margin: 14px auto 0; color: #7b6d63; font-size: 15px; line-height: 1.75; }

        /* MODULES */
        .features-section { padding: 90px 24px 100px; background: #fffaf3; border-top: 1px solid rgba(90, 55, 38, 0.06); }
        .features-wrap { width: min(1180px, 100%); margin: 0 auto; }
        .feature-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        .feature-card {
          position: relative; padding: 28px 24px; min-height: 230px; border-radius: 20px;
          background: linear-gradient(180deg, #ffffff 0%, #fcf7f1 100%); border: 1px solid var(--line);
          box-shadow: 0 15px 35px rgba(43, 24, 18, 0.05); transition: 0.22s ease; overflow: hidden;
        }
        .feature-card:hover { transform: translateY(-5px); box-shadow: 0 20px 44px rgba(43, 24, 18, 0.09); border-color: rgba(197,138,77,.22); } .feature-card:hover .feature-icon { transform: translateY(-3px) rotate(-3deg); }
        .feature-step { position: absolute; top: 16px; right: 18px; font-size: 12px; font-weight: 800; color: #c7b5a8; }
        .feature-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: linear-gradient(145deg, #f0dfcd, #f8ede0); color: var(--coffee); margin-bottom: 18px; transition: .22s ease; }
        .feature-card h3 { margin: 0; color: var(--espresso); font-size: 18px; }
        .feature-card p { margin: 10px 0 0; color: #77685f; font-size: 14px; line-height: 1.7; }
        .feature-link { display: inline-block; margin-top: 16px; color: var(--leaf-dark); font-size: 13px; font-weight: 700; }

        /* HOW IT WORKS */
        .workflow-section { padding: 95px 24px; background: #f3e7d8; }
        .workflow-wrap { width: min(1180px, 100%); margin: 0 auto; }
        .workflow-grid { display: grid; grid-template-columns: repeat(6, 1fr); position: relative; gap: 14px; }
        .workflow-grid::before {
          content: ""; position: absolute; left: 7%; right: 7%; top: 39px; height: 2px;
          background: linear-gradient(90deg, rgba(90,55,38,.12), rgba(197,138,77,.58), rgba(90,55,38,.12));
          z-index: 0;
        }
        .workflow-grid::after {
          content: "";
          position: absolute;
          top: 34px;
          left: 7%;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--caramel);
          box-shadow: 0 0 0 5px rgba(197,138,77,.14), 0 0 16px rgba(197,138,77,.35);
          z-index: 2;
          animation: flowDot 8s linear infinite;
        }
        .workflow-item { text-align: center; position: relative; z-index: 1; transition: .22s ease; } .workflow-item:hover { transform: translateY(-5px); }
        .workflow-icon {
          width: 78px; height: 78px; margin: 0 auto; border-radius: 24px; display: grid; place-items: center;
          background: #fffaf3; border: 1px solid rgba(90,55,38,.12); box-shadow: 0 12px 28px rgba(55,29,20,.08);
          color: var(--coffee); font-weight: 850; transition: .22s ease;
        }
        .workflow-number { display: block; margin-top: 16px; color: var(--caramel); font-size: 10px; font-weight: 900; letter-spacing: 1px; }
        .workflow-item h3 { margin: 7px 0 0; color: var(--espresso); font-size: 14px; }
        .workflow-item p { margin: 7px auto 0; max-width: 165px; color: #7a6a60; font-size: 11px; line-height: 1.55; }

        /* TECHNOLOGY */
        .technology-section { padding: 95px 24px 100px; background: #2a1711; color: white; position: relative; overflow: hidden; }
        .technology-section::before {
          content: ""; position: absolute; width: 420px; height: 420px; border-radius: 50%;
          top: -220px; right: -130px; background: rgba(197,138,77,.10);
        }
        .technology-wrap { width: min(1180px, 100%); margin: 0 auto; position: relative; z-index: 1; }
        .technology-section .section-head span { color: #d6a56d; }
        .technology-section .section-head h2 { color: #fff7ed; }
        .technology-section .section-head p { color: #bda99b; }
        .technology-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .tech-card {
          padding: 28px 24px; min-height: 220px; border-radius: 20px; background: rgba(255,255,255,.055);
          border: 1px solid rgba(255,255,255,.075); transition: .22s ease;
        }
        .tech-card:hover { transform: translateY(-5px); background: rgba(255,255,255,.075); border-color: rgba(239,193,140,.16); } .tech-card:hover .tech-icon { transform: translateY(-3px) rotate(3deg); }
        .tech-icon {
          width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center;
          background: rgba(197,138,77,.14); color: #efc18c; font-weight: 900; transition: .22s ease;
        }
        .tech-card h3 { margin: 19px 0 0; color: #fff6ec; font-size: 17px; }
        .tech-card p { margin: 10px 0 0; color: #bba597; font-size: 13px; line-height: 1.7; }

        /* BENEFITS */
        .benefits-section { padding: 95px 24px; background: #fffaf3; }
        .benefits-wrap { width: min(1100px, 100%); margin: 0 auto; }
        .benefits-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .benefit-card {
          padding: 25px 26px; border-radius: 18px; border: 1px solid var(--line); background: #fff;
          display: flex; gap: 18px; align-items: flex-start; box-shadow: 0 12px 30px rgba(43,24,18,.045);
        }
        .benefit-icon {
          width: 44px; height: 44px; flex: 0 0 44px; border-radius: 14px; display: grid; place-items: center;
          background: #edf2ea; color: var(--leaf-dark); font-weight: 900; font-size: 17px;
        }
        .benefit-card:hover .benefit-icon { transform: scale(1.06) rotate(-3deg); }
        .benefit-card h3 { margin: 1px 0 0; color: var(--espresso); font-size: 17px; }
        .benefit-card p { margin: 8px 0 0; color: #796a60; font-size: 13px; line-height: 1.65; }

        /* CTA */
        .cta-section { padding: 72px 24px 85px; background: linear-gradient(180deg, #f4ebdf 0%, #efe1d0 100%); }
        .cta-card {
          width: min(980px, 100%); margin: 0 auto; padding: 42px; border-radius: 24px;
          background: rgba(255, 250, 243, 0.92); border: 1px solid rgba(90, 55, 38, 0.08);
          box-shadow: 0 20px 40px rgba(43, 24, 18, 0.06); display: flex; align-items: center;
          justify-content: space-between; gap: 30px;
        }
        .cta-copy small { display: block; color: var(--mocha); font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; }
        .cta-copy h2 { margin: 10px 0 0; color: var(--espresso); font-size: 30px; font-family: Georgia, "Times New Roman", serif; letter-spacing: -0.8px; }
        .cta-copy p { margin: 12px 0 0; color: #77685f; font-size: 14px; line-height: 1.7; max-width: 560px; }
        .cta-actions { display: flex; gap: 10px; flex-shrink: 0; }

        /* ABOUT */
        .about-section {
          padding: 96px 24px;
          background:
            radial-gradient(circle at 10% 15%, rgba(197, 138, 77, 0.10), transparent 25%),
            #f5ecdf;
        }
        .about-wrap {
          width: min(1120px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 58px;
          align-items: center;
        }
        .about-visual {
          min-height: 390px;
          border-radius: 28px;
          padding: 28px;
          background:
            radial-gradient(circle at 82% 16%, rgba(224, 169, 107, 0.20), transparent 27%),
            linear-gradient(145deg, #4a2a1d, #28150f);
          box-shadow: 0 28px 65px rgba(55, 29, 20, 0.18);
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .about-visual::after {
          content: "";
          position: absolute;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          right: -90px;
          bottom: -110px;
          background: rgba(197, 138, 77, 0.09);
        }
        .about-visual small {
          color: #c9a88e;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.4px;
          position: relative;
          z-index: 2;
        }
        .about-visual h3 {
          max-width: 350px;
          margin: 14px 0 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 34px;
          line-height: 1.08;
          position: relative;
          z-index: 2;
        }
        .about-mini-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 11px;
          margin-top: 32px;
          position: relative;
          z-index: 2;
        }
        .about-mini-card {
          padding: 14px;
          border-radius: 14px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .about-mini-card strong {
          display: block;
          color: #f0c893;
          font-size: 12px;
        }
        .about-mini-card span {
          display: block;
          margin-top: 5px;
          color: #b7a091;
          font-size: 9px;
          line-height: 1.5;
        }
        .about-copy > span {
          color: var(--mocha);
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        .about-copy h2 {
          margin: 13px 0 0;
          color: var(--espresso);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 42px;
          letter-spacing: -1px;
        }
        .about-copy p {
          margin: 18px 0 0;
          color: #77685f;
          font-size: 15px;
          line-height: 1.8;
        }
        .about-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 22px;
        }
        .about-tag {
          padding: 8px 11px;
          border-radius: 999px;
          color: var(--leaf-dark);
          background: rgba(95, 119, 95, 0.09);
          border: 1px solid rgba(95, 119, 95, 0.12);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.3px;
        }

        /* CONTACT */
        .contact-section {
          padding: 86px 24px;
          background: #fffaf3;
        }
        .contact-card {
          width: min(1040px, 100%);
          margin: 0 auto;
          padding: 42px;
          border-radius: 25px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 32px;
          align-items: center;
          background:
            radial-gradient(circle at 90% 20%, rgba(197, 138, 77, 0.11), transparent 28%),
            linear-gradient(180deg, #ffffff, #fbf5ed);
          border: 1px solid var(--line);
          box-shadow: 0 18px 45px rgba(43, 24, 18, 0.06);
        }
        .contact-copy small {
          color: var(--mocha);
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }
        .contact-copy h2 {
          margin: 10px 0 0;
          color: var(--espresso);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 32px;
          letter-spacing: -0.8px;
        }
        .contact-copy p {
          max-width: 650px;
          margin: 12px 0 0;
          color: #77685f;
          font-size: 14px;
          line-height: 1.75;
        }
        .contact-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }

        /* FOOTER */
        .footer {
          background: #24140e;
          color: #9b8270;
        }
        .footer-wrap {
          width: min(1120px, calc(100% - 48px));
          margin: 0 auto;
          padding: 52px 0 36px;
          display: grid;
          grid-template-columns: 1.35fr 1fr 1fr 1fr;
          gap: 40px;
        }
        .footer-brand strong { color: #ead2b7; font-size: 15px; display: inline-flex; align-items: center; gap: 7px; }
        .footer-brand p {
          max-width: 310px;
          margin: 10px 0 0;
          font-size: 11px;
          line-height: 1.7;
        }
        .footer-column h4 {
          margin: 0 0 12px;
          color: #e3c8ae;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .footer-column a {
          display: block;
          margin: 8px 0;
          color: #9b8270;
          text-decoration: none;
          font-size: 11px;
          transition: 0.2s ease;
        }
        .footer-column a:hover { color: #ead2b7; }
        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.07);
          padding: 18px 24px 22px;
          text-align: center;
          font-size: 10px;
          color: #755f51;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
          [data-reveal] { opacity: 1; transform: none; }
        }

        @media (max-width: 1040px) {
          .nav-menu { display: none; }
          .mobile-menu-btn { display: inline-flex; }
          .mobile-nav-panel {
            display: grid;
            gap: 5px;
            position: fixed;
            top: 92px;
            left: 50%;
            width: min(520px, calc(100% - 32px));
            transform: translateX(-50%);
            padding: 12px;
            z-index: 99;
            border-radius: 18px;
            background: rgba(255, 250, 243, 0.96);
            border: 1px solid rgba(90,55,38,.10);
            box-shadow: 0 18px 46px rgba(43,24,18,.14);
            backdrop-filter: blur(18px);
          }
          .mobile-nav-panel a {
            padding: 12px 13px;
            border-radius: 11px;
            color: var(--coffee);
            text-decoration: none;
            font-size: 13px;
            font-weight: 750;
          }
          .mobile-nav-panel a:hover,
          .mobile-nav-panel a.active {
            background: rgba(90,55,38,.07);
          }
          .hero { grid-template-columns: 1fr; gap: 38px; padding-top: 130px; }
          .hero-left { text-align: center; }
          .hero h1, .hero-description { margin-left: auto; margin-right: auto; }
          .hero-actions, .trust-row { justify-content: center; }
          .hero-visual { width: min(620px, 100%); margin: 0 auto; }
          .feature-grid, .technology-grid { grid-template-columns: repeat(2, 1fr); }
          .workflow-grid { grid-template-columns: repeat(3, 1fr); row-gap: 34px; }
          .workflow-grid::before, .workflow-grid::after { display: none; }
          .cta-card { flex-direction: column; text-align: center; }
          .cta-copy p { margin-left: auto; margin-right: auto; }
          .about-wrap { grid-template-columns: 1fr; }
          .about-visual { width: min(620px, 100%); margin: 0 auto; }
          .about-copy { text-align: center; }
          .about-tags { justify-content: center; }
          .contact-card { grid-template-columns: 1fr; text-align: center; }
          .contact-copy p { margin-left: auto; margin-right: auto; }
          .contact-actions { justify-content: center; }
          .footer-wrap { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 720px) {
          .navbar, .hero { width: min(100% - 32px, 1220px); }
          .navbar {
            width: min(100% - 24px, 1220px);
            top: 10px;
            min-height: 64px;
            padding: 8px 9px 8px 12px;
          }
          .brand-text span, .nav-login { display: none; }
          .hero { padding: 118px 0 70px; }
          .hero h1 { font-size: 43px; letter-spacing: -1.3px; }
          .hero-actions, .cta-actions { flex-direction: column; }
          .primary-btn, .secondary-btn { width: 100%; }
          .dashboard-card { padding: 20px; border-radius: 24px; }
          .dash-grid { grid-template-columns: 1fr; }
          .floating-card { display: none; }
          .feature-grid, .technology-grid, .benefits-grid { grid-template-columns: 1fr; }
          .workflow-grid { grid-template-columns: repeat(2, 1fr); }
          .features-section, .workflow-section, .technology-section, .benefits-section,
          .about-section, .contact-section { padding: 70px 18px 75px; }
          .section-head h2 { font-size: 34px; }
          .cta-section { padding: 55px 18px 65px; }
          .cta-card { padding: 30px 24px; }
          .about-visual { min-height: 340px; padding: 22px; }
          .about-visual h3 { font-size: 30px; }
          .about-copy h2 { font-size: 35px; }
          .contact-card { padding: 30px 24px; }
          .contact-actions { flex-direction: column; }
          .footer-wrap {
            width: min(100% - 36px, 1120px);
            grid-template-columns: 1fr;
            gap: 27px;
            padding-top: 40px;
          }
        }

        @media (max-width: 480px) {
          .workflow-grid { grid-template-columns: 1fr; }
          .workflow-item p { max-width: 250px; }
        }
      `}</style>

      <div className="coffee-page" id="home">
        <nav className="navbar">
          <a href="#home" className="brand" onClick={closeMenu}>
            <div className="brand-icon">
              <Icon name="coffee" size={22} />
            </div>
            <div className="brand-text">
              <strong>Smart Coffee Manufacturing</strong>
              <span>AI Quality Control Platform</span>
            </div>
          </a>

          <div className="nav-menu">
            <a
              className={activeSection === "platform" ? "active" : ""}
              href="#platform"
            >
              Platform
            </a>
            <a
              className={activeSection === "workflow" ? "active" : ""}
              href="#workflow"
            >
              How It Works
            </a>
            <a
              className={activeSection === "technology" ? "active" : ""}
              href="#technology"
            >
              Technology
            </a>
            <a
              className={activeSection === "about" ? "active" : ""}
              href="#about"
            >
              About
            </a>
            <a
              className={activeSection === "contact" ? "active" : ""}
              href="#contact"
            >
              Contact
            </a>
          </div>

          <div className="nav-actions">
            <Link to="/login" className="nav-login">
              Sign In
            </Link>
            <Link to="/register" className="nav-register">
              Create Account
            </Link>
            <button
              type="button"
              className="mobile-menu-btn"
              aria-label={
                menuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Icon name={menuOpen ? "close" : "menu"} size={20} />
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="mobile-nav-panel">
            <a
              className={activeSection === "platform" ? "active" : ""}
              href="#platform"
              onClick={closeMenu}
            >
              Platform
            </a>
            <a
              className={activeSection === "workflow" ? "active" : ""}
              href="#workflow"
              onClick={closeMenu}
            >
              How It Works
            </a>
            <a
              className={activeSection === "technology" ? "active" : ""}
              href="#technology"
              onClick={closeMenu}
            >
              Technology
            </a>
            <a
              className={activeSection === "about" ? "active" : ""}
              href="#about"
              onClick={closeMenu}
            >
              About
            </a>
            <a
              className={activeSection === "contact" ? "active" : ""}
              href="#contact"
              onClick={closeMenu}
            >
              Contact & Support
            </a>
          </div>
        )}

        <main className="hero">
          <section className="hero-left" data-reveal>
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              AI-Powered Coffee Quality Control
            </div>

            <h1>
              Smarter Coffee Manufacturing,
              <span> From Bean to Pack.</span>
            </h1>

            <p className="hero-description">
              A connected quality intelligence platform for raw coffee beans,
              powder production, packaging inspection and market analysis — all
              in one streamlined manufacturing workflow.
            </p>

            <div className="hero-actions">
              <Link to="/login" className="primary-btn">
                Enter Platform{" "}
                <span className="btn-arrow">
                  <Icon name="arrow" size={16} />
                </span>
              </Link>
              <Link to="/register" className="secondary-btn">
                Create Account
              </Link>
            </div>

            <div className="trust-row">
              <span className="trust-item">
                <span className="trust-icon">
                  <Icon name="check" size={12} strokeWidth={2.2} />
                </span>
                AI quality inspection
              </span>
              <span className="trust-item">
                <span className="trust-icon">
                  <Icon name="check" size={12} strokeWidth={2.2} />
                </span>
                Sensor monitoring
              </span>
              <span className="trust-item">
                <span className="trust-icon">
                  <Icon name="check" size={12} strokeWidth={2.2} />
                </span>
                Role-based access
              </span>
            </div>
          </section>

          <section className="hero-visual" data-reveal>
            <span className="bean-float bean-1">◒</span>
            <span className="bean-float bean-2">◒</span>
            <span className="bean-float bean-3">◒</span>

            <div className="dashboard-card">
              <div className="dash-top">
                <div className="dash-title">
                  <small>Manufacturing Intelligence</small>
                  <strong>Quality Control Overview</strong>
                </div>
                <div className="ai-badge">
                  <span className="ai-dot" />
                  AI ACTIVE
                </div>
              </div>

              <div className="quality-box">
                <div>
                  <span>End-to-End Quality Status</span>
                  <strong>Production Ready</strong>
                </div>
                <div className="quality-ai">AI</div>
              </div>

              <div className="dash-grid">
                <div className="dash-module">
                  <div className="dash-module-top">
                    <div className="dash-icon">
                      <Icon name="coffee" size={18} />
                    </div>
                    <span className="dash-status">Vision + Sensors</span>
                  </div>
                  <strong>Bean Quality</strong>
                  <p>
                    Defect detection, sensor analysis and raw bean evaluation.
                  </p>
                </div>
                <div className="dash-module">
                  <div className="dash-module-top">
                    <div className="dash-icon">
                      <Icon name="powder" size={18} />
                    </div>
                    <span className="dash-status">Batch Monitor</span>
                  </div>
                  <strong>Powder Quality</strong>
                  <p>Moisture, colour and granulation consistency insights.</p>
                </div>
                <div className="dash-module">
                  <div className="dash-module-top">
                    <div className="dash-icon">
                      <Icon name="package" size={18} />
                    </div>
                    <span className="dash-status">Real-Time AI</span>
                  </div>
                  <strong>Packaging Quality</strong>
                  <p>
                    Seal and packaging defect detection before distribution.
                  </p>
                </div>
                <div className="dash-module">
                  <div className="dash-module-top">
                    <div className="dash-icon">
                      <Icon name="chart" size={18} />
                    </div>
                    <span className="dash-status">Decision Support</span>
                  </div>
                  <strong>Sales Analysis</strong>
                  <p>Quality-aware product and market suitability analysis.</p>
                </div>
              </div>

              <div className="process-strip">
                <span>Smart Coffee Manufacturing Flow</span>
                <strong>BEAN → POWDER → PACK → MARKET</strong>
              </div>
            </div>

            <div className="floating-card floating-left">
              <small>Inspection</small>
              <strong>Bean Defect AI ✓</strong>
            </div>
            <div className="floating-card floating-right">
              <small>System</small>
              <strong>Quality AI Online</strong>
            </div>
          </section>
        </main>
      </div>

      <section className="features-section" id="platform">
        <div className="features-wrap">
          <div className="section-head" data-reveal>
            <span>From Bean to Pack</span>
            <h2>One platform for every quality stage.</h2>
            <p>
              Intelligent inspection and decision-support modules connect the
              most important stages of your coffee manufacturing workflow.
            </p>
          </div>

          <div className="feature-grid">
            {modules.map((module) => (
              <article className="feature-card" key={module.title} data-reveal>
                <div className="feature-step">{module.step}</div>
                <div className="feature-icon">
                  <Icon name={module.icon} />
                </div>
                <h3>{module.title}</h3>
                <p>{module.text}</p>
                <span className="feature-link">
                  Quality Stage{" "}
                  <span className="btn-arrow">
                    <Icon name="arrow" size={14} />
                  </span>
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="workflow-section" id="workflow">
        <div className="workflow-wrap">
          <div className="section-head" data-reveal>
            <span>How It Works</span>
            <h2>A connected quality-control workflow.</h2>
            <p>
              Each stage contributes information to the next, creating a clear
              journey from raw coffee inspection to final business insight.
            </p>
          </div>

          <div className="workflow-grid">
            {workflow.map((item) => (
              <article className="workflow-item" key={item.step} data-reveal>
                <div className="workflow-icon">
                  <Icon name={item.icon} size={25} />
                </div>
                <span className="workflow-number">STEP {item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="technology-section" id="technology">
        <div className="technology-wrap">
          <div className="section-head" data-reveal>
            <span>Core Technologies</span>
            <h2>Intelligence behind every inspection.</h2>
            <p>
              The platform brings together AI, sensors and connected monitoring
              to support coffee quality-control decisions.
            </p>
          </div>

          <div className="technology-grid">
            {technologies.map((tech) => (
              <article className="tech-card" key={tech.title} data-reveal>
                <div className="tech-icon">
                  <Icon name={tech.icon} size={23} />
                </div>
                <h3>{tech.title}</h3>
                <p>{tech.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="benefits-section">
        <div className="benefits-wrap">
          <div className="section-head" data-reveal>
            <span>Why This Platform</span>
            <h2>Built for smarter coffee quality control.</h2>
            <p>
              The system is designed to make inspection clearer, more consistent
              and easier to follow throughout the manufacturing process.
            </p>
          </div>

          <div className="benefits-grid">
            {benefits.map((benefit) => (
              <article className="benefit-card" key={benefit.title} data-reveal>
                <div className="benefit-icon">
                  <Icon name={benefit.icon} size={21} />
                </div>
                <div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-wrap">
          <div className="about-visual" data-reveal>
            <div>
              <small>Bean-to-Pack Intelligence</small>
              <h3>
                Quality visibility across the coffee manufacturing journey.
              </h3>
            </div>

            <div className="about-mini-grid">
              <div className="about-mini-card">
                <strong>Vision AI</strong>
                <span>Visual inspection for bean and packaging quality.</span>
              </div>
              <div className="about-mini-card">
                <strong>Sensor Data</strong>
                <span>Physical and environmental condition monitoring.</span>
              </div>
              <div className="about-mini-card">
                <strong>Quality Decisions</strong>
                <span>Clear results and recommendations for inspectors.</span>
              </div>
              <div className="about-mini-card">
                <strong>Connected Workflow</strong>
                <span>
                  Quality information from bean inspection to market insight.
                </span>
              </div>
            </div>
          </div>

          <div className="about-copy" data-reveal>
            <span>About the Platform</span>
            <h2>Built around the complete coffee quality process.</h2>
            <p>
              Smart Coffee Manufacturing is an AI-powered quality-control
              platform designed to support coffee production from raw bean
              inspection to powder quality, packaging inspection and market
              analysis.
            </p>
            <p>
              The platform combines computer vision, sensor-based monitoring and
              intelligent decision support to help identify quality issues
              earlier, improve inspection consistency and provide clearer
              visibility across the manufacturing workflow.
            </p>

            <div className="about-tags">
              <span className="about-tag">AI Powered</span>
              <span className="about-tag">Sensor Integrated</span>
              <span className="about-tag">Bean-to-Pack Quality Control</span>
              <span className="about-tag">Role-Based Access</span>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-card" data-reveal>
          <div className="contact-copy">
            <small>Contact & Support</small>
            <h2>Need help accessing or using the platform?</h2>
            <p>
              Contact the platform administrator for account approval, access
              issues, system support or technical assistance related to the
              Smart Coffee Manufacturing platform.
            </p>
          </div>

          <div className="contact-actions">
            <Link to="/login" className="secondary-btn">
              Sign In
            </Link>
            <Link to="/register" className="primary-btn">
              Request Access
            </Link>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-card" data-reveal>
          <div className="cta-copy">
            <small>Secure Platform Access</small>
            <h2>Ready to inspect your next coffee batch?</h2>
            <p>
              Sign in using an approved account, or create a new role-based
              account for inspectors, analysts and administrators.
            </p>
          </div>

          <div className="cta-actions">
            <Link to="/login" className="primary-btn">
              Sign In
            </Link>
            <Link to="/register" className="secondary-btn">
              Register
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-wrap">
          <div className="footer-brand">
            <strong>
              <Icon name="coffee" size={16} /> Smart Coffee Manufacturing
            </strong>
            <p>
              AI-powered end-to-end coffee quality control from raw bean
              inspection to packaging and market insight.
            </p>
          </div>

          <div className="footer-column">
            <h4>Platform</h4>
            <a href="#platform">Bean Quality</a>
            <a href="#platform">Powder Quality</a>
            <a href="#platform">Packaging Quality</a>
            <a href="#platform">Sales Analysis</a>
          </div>

          <div className="footer-column">
            <h4>Explore</h4>
            <a href="#workflow">How It Works</a>
            <a href="#technology">Technology</a>
            <a href="#about">About Platform</a>
            <a href="#contact">Contact & Support</a>
          </div>

          <div className="footer-column">
            <h4>Access</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Account</Link>
            <a href="#contact">Technical Support</a>
          </div>
        </div>

        <div className="footer-bottom">
          Smart Coffee Manufacturing — End-to-End Quality Control from Bean to
          Pack
        </div>
      </footer>
    </>
  );
}

export default HomePage;

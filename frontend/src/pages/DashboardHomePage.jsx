import { Link } from "react-router-dom";

import { useAuth } from "../auth/context/AuthContext";

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
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
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0" />
        <path d="M16 4.5a3 3 0 0 1 0 5.8" />
        <path d="M18 20a5 5 0 0 0-3-4.6" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 19 6v5c0 4.5-2.8 7.6-7 10-4.2-2.4-7-5.5-7-10V6l7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
        <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m14 7 5 5-5 5" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
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
  };

  return <svg {...common}>{icons[name] || icons.coffee}</svg>;
}

function DashboardHomePage() {
  const { user } = useAuth();

  const getRoleLabel = (role) => {
    const roles = {
      ADMIN: "Administrator",
      BEAN_QUALITY_INSPECTOR: "Bean Quality Inspector",
      POWDER_QUALITY_INSPECTOR: "Powder Quality Inspector",
      PACKAGING_QUALITY_INSPECTOR: "Packaging Quality Inspector",
      SALES_ANALYST: "Sales Analyst",
    };

    return roles[role] || role;
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      ADMIN:
        "Full platform access for user administration and quality-control oversight.",
      BEAN_QUALITY_INSPECTOR:
        "Access to raw bean inspection, AI analysis and sensor-assisted quality evaluation.",
      POWDER_QUALITY_INSPECTOR:
        "Access to coffee powder quality evaluation and production batch analysis.",
      PACKAGING_QUALITY_INSPECTOR:
        "Access to seal and packaging quality inspection workflows.",
      SALES_ANALYST:
        "Access to product quality and market-oriented decision-support tools.",
    };

    return (
      descriptions[role] ||
      "Access is configured according to your assigned platform role."
    );
  };

  const getModules = () => {
    const modules = [];

    if (user.role === "ADMIN" || user.role === "BEAN_QUALITY_INSPECTOR") {
      modules.push({
        title: "Bean Quality Inspection",
        shortTitle: "Bean Quality",
        description:
          "Analyze raw coffee beans using AI-based image inspection and sensor data.",
        path: "/beans",
        icon: "coffee",
        eyebrow: "Vision + Sensors",
        status: "Available",
        accent: "caramel",
      });
    }

    if (user.role === "ADMIN" || user.role === "POWDER_QUALITY_INSPECTOR") {
      modules.push({
        title: "Powder Quality Checking",
        shortTitle: "Powder Quality",
        description:
          "Evaluate coffee powder quality using moisture, color and granulation analysis.",
        path: "/powder",
        icon: "powder",
        eyebrow: "Batch Quality",
        status: "Available",
        accent: "mocha",
      });
    }

    if (user.role === "ADMIN" || user.role === "PACKAGING_QUALITY_INSPECTOR") {
      modules.push({
        title: "Packaging Quality Inspection",
        shortTitle: "Packaging",
        description:
          "Detect packet seal and packaging defects using real-time AI inspection.",
        path: "/seals",
        icon: "package",
        eyebrow: "Real-Time AI",
        status: "Available",
        accent: "leaf",
      });
    }

    if (user.role === "ADMIN" || user.role === "SALES_ANALYST") {
      modules.push({
        title: "Sales & Market Analysis",
        shortTitle: "Sales Analysis",
        description:
          "Analyze product quality and market-related information for decision support.",
        path: "/sales",
        icon: "chart",
        eyebrow: "Decision Support",
        status: "Available",
        accent: "gold",
      });
    }

    if (user.role === "ADMIN") {
      modules.push({
        title: "User Management",
        shortTitle: "User Management",
        description:
          "Approve new registrations, manage roles and control system access.",
        path: "/admin",
        icon: "users",
        eyebrow: "Administration",
        status: "Available",
        accent: "admin",
      });
    }

    return modules;
  };

  const modules = getModules();
  const roleLabel = getRoleLabel(user.role);

  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          :root {
            --espresso: #2b1812;
            --espresso-soft: #3d2419;
            --coffee: #5a3726;
            --mocha: #7a4b33;
            --caramel: #c58a4d;
            --caramel-light: #dfae72;
            --cream: #fffaf3;
            --paper: #fcf7f0;
            --foam: #f5ecdf;
            --leaf: #5f775f;
            --leaf-dark: #3d5c42;
            --text: #30231d;
            --muted: #776960;
            --line: rgba(90, 55, 38, 0.11);
          }

          @keyframes welcomeGlow {
            0%, 100% {
              transform: translate3d(0, 0, 0);
            }

            50% {
              transform: translate3d(-18px, 12px, 0);
            }
          }

          @keyframes statusPulse {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(111, 150, 112, 0.28);
            }

            50% {
              box-shadow: 0 0 0 7px rgba(111, 150, 112, 0);
            }
          }

          @keyframes buttonShine {
            0% {
              transform: translateX(-160%) skewX(-18deg);
            }

            60%, 100% {
              transform: translateX(260%) skewX(-18deg);
            }
          }

          @keyframes floatBean {
            0%, 100% {
              transform: translateY(0) rotate(-20deg);
            }

            50% {
              transform: translateY(-8px) rotate(-14deg);
            }
          }

          .dashboard-home {
            min-height: 100vh;
            padding: 34px;
            color: var(--text);
            font-family:
              Inter,
              ui-sans-serif,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
            background:
              radial-gradient(
                circle at 92% 4%,
                rgba(197, 138, 77, 0.08),
                transparent 25%
              ),
              linear-gradient(180deg, #fbf7f1 0%, #f5eee5 100%);
          }

          .dashboard-home-wrapper {
            width: min(1280px, 100%);
            margin: 0 auto;
          }

          /* ================= WELCOME ================= */

          .dashboard-welcome {
            min-height: 285px;
            position: relative;
            overflow: hidden;
            display: grid;
            grid-template-columns: 1.4fr 0.6fr;
            gap: 30px;
            padding: 38px 40px;
            border-radius: 26px;
            color: white;
            background:
              radial-gradient(
                circle at 92% 12%,
                rgba(224, 169, 107, 0.20),
                transparent 28%
              ),
              linear-gradient(140deg, #4c2b1e 0%, #28160f 75%);
            box-shadow:
              0 24px 55px rgba(55, 29, 20, 0.16),
              inset 0 1px 0 rgba(255,255,255,.08);
          }

          .dashboard-welcome::before {
            content: "";
            position: absolute;
            width: 330px;
            height: 330px;
            right: -110px;
            top: -160px;
            border-radius: 50%;
            background: rgba(197, 138, 77, 0.10);
            animation: welcomeGlow 10s ease-in-out infinite;
          }

          .welcome-copy,
          .welcome-side {
            position: relative;
            z-index: 2;
          }

          .welcome-label {
            width: fit-content;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 999px;
            color: #d8ead9;
            background: rgba(95, 119, 95, 0.16);
            border: 1px solid rgba(151, 193, 155, 0.10);
            font-size: 9px;
            font-weight: 850;
            letter-spacing: 1.1px;
            text-transform: uppercase;
          }

          .welcome-label-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #8abb8e;
            animation: statusPulse 2s ease-in-out infinite;
          }

          .dashboard-welcome h1 {
            margin: 18px 0 0;
            max-width: 760px;
            font-family: Georgia, "Times New Roman", serif;
            font-size: clamp(36px, 4vw, 50px);
            line-height: 1.05;
            letter-spacing: -1.5px;
            color: #fffaf3;
          }

          .dashboard-welcome h1 span {
            color: var(--caramel-light);
            font-style: italic;
          }

          .dashboard-welcome p {
            max-width: 720px;
            margin: 14px 0 0;
            color: #bea898;
            font-size: 13px;
            line-height: 1.75;
          }

          .welcome-role {
            margin-top: 22px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 9px 12px;
            border-radius: 11px;
            color: #e6d2bf;
            background: rgba(255,255,255,.055);
            border: 1px solid rgba(255,255,255,.07);
            font-size: 10px;
          }

          .welcome-role strong {
            color: #f1c892;
          }

          .welcome-side {
            display: flex;
            align-items: stretch;
          }

          .role-card {
            width: 100%;
            min-height: 190px;
            padding: 21px;
            border-radius: 19px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: rgba(255,255,255,.065);
            border: 1px solid rgba(255,255,255,.08);
            backdrop-filter: blur(8px);
          }

          .role-card-icon {
            width: 42px;
            height: 42px;
            display: grid;
            place-items: center;
            border-radius: 13px;
            color: #efc18c;
            background: rgba(197,138,77,.12);
          }

          .role-card small {
            display: block;
            margin-top: 19px;
            color: #a99384;
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 1px;
            text-transform: uppercase;
          }

          .role-card strong {
            display: block;
            margin-top: 5px;
            font-size: 13px;
          }

          .role-card p {
            margin-top: 7px;
            color: #a99384;
            font-size: 9px;
            line-height: 1.55;
          }

          .bean-decoration {
            position: absolute;
            right: 35%;
            bottom: 24px;
            z-index: 1;
            color: rgba(239, 193, 140, 0.12);
            font-size: 28px;
            animation: floatBean 5.5s ease-in-out infinite;
          }

          /* ================= SUMMARY ================= */

          .summary-grid {
            margin-top: 22px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }

          .summary-card {
            min-height: 118px;
            padding: 19px 20px;
            border-radius: 18px;
            background: rgba(255,250,243,.93);
            border: 1px solid var(--line);
            box-shadow: 0 10px 28px rgba(43,24,18,.045);
            display: flex;
            align-items: center;
            gap: 15px;
            transition: .22s ease;
          }

          .summary-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 16px 32px rgba(43,24,18,.07);
          }

          .summary-icon {
            width: 46px;
            height: 46px;
            flex-shrink: 0;
            display: grid;
            place-items: center;
            border-radius: 14px;
            color: var(--coffee);
            background: linear-gradient(145deg, #f1e2d1, #f9efe4);
          }

          .summary-card small {
            display: block;
            color: #9c8778;
            font-size: 8.5px;
            font-weight: 800;
            letter-spacing: .9px;
            text-transform: uppercase;
          }

          .summary-card strong {
            display: block;
            margin-top: 5px;
            color: var(--espresso);
            font-size: 17px;
          }

          .summary-card span {
            display: block;
            margin-top: 4px;
            color: #8a7b71;
            font-size: 9px;
            line-height: 1.45;
          }

          /* ================= SECTION HEADER ================= */

          .workspace-section {
            margin-top: 42px;
          }

          .section-title {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 19px;
          }

          .section-title-copy small {
            display: block;
            color: var(--mocha);
            font-size: 9px;
            font-weight: 850;
            letter-spacing: 1.3px;
            text-transform: uppercase;
          }

          .section-title h2 {
            margin: 7px 0 0;
            color: var(--espresso);
            font-family: Georgia, "Times New Roman", serif;
            font-size: 28px;
            letter-spacing: -0.8px;
          }

          .section-title p {
            margin: 7px 0 0;
            color: #88796f;
            font-size: 11px;
          }

          .module-count {
            padding: 8px 11px;
            border-radius: 999px;
            color: var(--leaf-dark);
            background: rgba(95,119,95,.08);
            border: 1px solid rgba(95,119,95,.10);
            font-size: 9px;
            font-weight: 800;
          }

          /* ================= MODULE CARDS ================= */

          .module-dashboard-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 17px;
          }

          .dashboard-module-card {
            min-height: 276px;
            position: relative;
            overflow: hidden;
            padding: 22px;
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            background:
              linear-gradient(180deg, rgba(255,255,255,.97), rgba(252,247,240,.97));
            border: 1px solid var(--line);
            box-shadow: 0 12px 30px rgba(43,24,18,.045);
            transition:
              transform .24s ease,
              box-shadow .24s ease,
              border-color .24s ease;
          }

          .dashboard-module-card::after {
            content: "";
            position: absolute;
            width: 150px;
            height: 150px;
            right: -85px;
            top: -85px;
            border-radius: 50%;
            background: rgba(197,138,77,.055);
            transition: transform .3s ease;
          }

          .dashboard-module-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 42px rgba(43,24,18,.08);
            border-color: rgba(197,138,77,.20);
          }

          .dashboard-module-card:hover::after {
            transform: scale(1.18);
          }

          .module-card-top,
          .dashboard-module-card h3,
          .dashboard-module-card p,
          .module-meta,
          .module-open-button {
            position: relative;
            z-index: 2;
          }

          .module-card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }

          .dashboard-module-icon {
            width: 46px;
            height: 46px;
            border-radius: 14px;
            display: grid;
            place-items: center;
            transition: .22s ease;
          }

          .dashboard-module-card:hover .dashboard-module-icon {
            transform: translateY(-3px) rotate(-2deg);
          }

          .accent-caramel {
            color: #815133;
            background: #f3e4d2;
          }

          .accent-mocha {
            color: #674431;
            background: #eee1d8;
          }

          .accent-leaf {
            color: #48624c;
            background: #e5eee5;
          }

          .accent-gold {
            color: #856238;
            background: #f3ead5;
          }

          .accent-admin {
            color: #574b69;
            background: #ece8f2;
          }

          .module-status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 9px;
            border-radius: 999px;
            color: var(--leaf-dark);
            background: #edf4ed;
            border: 1px solid #dce9dc;
            font-size: 8px;
            font-weight: 850;
            letter-spacing: .5px;
            text-transform: uppercase;
          }

          .module-status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #739877;
          }

          .module-meta {
            margin-top: 18px;
            color: #a08979;
            font-size: 8px;
            font-weight: 850;
            letter-spacing: 1px;
            text-transform: uppercase;
          }

          .dashboard-module-card h3 {
            margin: 7px 0 0;
            color: var(--espresso);
            font-size: 16px;
          }

          .dashboard-module-card p {
            margin: 9px 0 20px;
            color: #7e7066;
            font-size: 11px;
            line-height: 1.7;
            flex: 1;
          }

          .module-open-button {
            min-height: 42px;
            overflow: hidden;
            display: inline-flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 0 13px 0 15px;
            border-radius: 11px;
            color: #fffaf3;
            background: linear-gradient(
              135deg,
              var(--coffee),
              var(--espresso)
            );
            box-shadow: 0 10px 22px rgba(67,35,24,.15);
            text-decoration: none;
            font-size: 10px;
            font-weight: 800;
            transition: .22s ease;
          }

          .module-open-button::before {
            content: "";
            position: absolute;
            top: -30%;
            bottom: -30%;
            left: -28%;
            width: 25%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.20),
              transparent
            );
            animation: buttonShine 5.2s ease-in-out infinite;
          }

          .module-open-button span {
            position: relative;
            z-index: 2;
          }

          .module-arrow {
            display: inline-flex;
            transition: transform .2s ease;
          }

          .module-open-button:hover {
            transform: translateY(-1px);
          }

          .module-open-button:hover .module-arrow {
            transform: translateX(4px);
          }

          /* ================= ACCESS NOTE ================= */

          .access-section {
            margin-top: 38px;
            display: grid;
            grid-template-columns: 1.25fr .75fr;
            gap: 17px;
          }

          .access-panel,
          .workflow-panel {
            padding: 23px;
            border-radius: 19px;
            border: 1px solid var(--line);
            background: rgba(255,250,243,.88);
            box-shadow: 0 10px 28px rgba(43,24,18,.04);
          }

          .access-panel {
            display: flex;
            gap: 16px;
            align-items: flex-start;
          }

          .access-panel-icon {
            width: 44px;
            height: 44px;
            flex-shrink: 0;
            display: grid;
            place-items: center;
            border-radius: 13px;
            color: var(--leaf-dark);
            background: #e7eee7;
          }

          .access-panel small,
          .workflow-panel small {
            display: block;
            color: var(--mocha);
            font-size: 8px;
            font-weight: 850;
            letter-spacing: 1px;
            text-transform: uppercase;
          }

          .access-panel h3,
          .workflow-panel h3 {
            margin: 7px 0 0;
            color: var(--espresso);
            font-size: 14px;
          }

          .access-panel p,
          .workflow-panel p {
            margin: 7px 0 0;
            color: #82746a;
            font-size: 10px;
            line-height: 1.65;
          }

          .flow-line {
            margin-top: 15px;
            padding: 11px 12px;
            border-radius: 11px;
            color: #805d42;
            background: #f2e7d9;
            font-size: 9px;
            font-weight: 850;
            text-align: center;
            letter-spacing: .25px;
          }

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: .001ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: .001ms !important;
            }
          }

          @media (max-width: 1080px) {
            .dashboard-welcome {
              grid-template-columns: 1fr;
            }

            .welcome-side {
              max-width: 520px;
            }

            .summary-grid {
              grid-template-columns: 1fr 1fr;
            }

            .module-dashboard-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .access-section {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 720px) {
            .dashboard-home {
              padding: 20px;
            }

            .dashboard-welcome {
              padding: 28px 24px;
              border-radius: 22px;
            }

            .dashboard-welcome h1 {
              font-size: 34px;
            }

            .summary-grid,
            .module-dashboard-grid {
              grid-template-columns: 1fr;
            }

            .section-title {
              align-items: flex-start;
              flex-direction: column;
            }

            .bean-decoration {
              display: none;
            }
          }

          @media (max-width: 460px) {
            .dashboard-home {
              padding: 14px;
            }

            .dashboard-welcome {
              padding: 24px 20px;
            }

            .dashboard-module-card {
              min-height: 255px;
            }
          }
        `}
      </style>

      <div className="dashboard-home">
        <div className="dashboard-home-wrapper">
          <section className="dashboard-welcome">
            <div className="welcome-copy">
              <div className="welcome-label">
                <span className="welcome-label-dot" />
                Smart Coffee Quality Workspace
              </div>

              <h1>
                Welcome back, <span>{user.first_name}</span>
              </h1>

              <p>
                Access your assigned quality-control workspace, run inspections
                and continue your coffee manufacturing quality workflow from one
                connected platform.
              </p>

              <div className="welcome-role">
                <Icon name="shield" size={14} />
                Signed in as:
                <strong>{roleLabel}</strong>
              </div>
            </div>

            <div className="welcome-side">
              <div className="role-card">
                <div className="role-card-icon">
                  <Icon name="lock" size={20} />
                </div>

                <div>
                  <small>Your Platform Role</small>
                  <strong>{roleLabel}</strong>
                  <p>{getRoleDescription(user.role)}</p>
                </div>
              </div>
            </div>

            <span className="bean-decoration" aria-hidden="true">
              ◒
            </span>
          </section>

          <div className="summary-grid">
            <article className="summary-card">
              <div className="summary-icon">
                <Icon name="grid" size={21} />
              </div>

              <div>
                <small>Workspace Access</small>
                <strong>{modules.length} Modules</strong>
                <span>Available for your assigned role.</span>
              </div>
            </article>

            <article className="summary-card">
              <div className="summary-icon">
                <Icon name="shield" size={21} />
              </div>

              <div>
                <small>Access Level</small>
                <strong>{roleLabel}</strong>
                <span>Role-based system permissions are active.</span>
              </div>
            </article>

            <article className="summary-card">
              <div className="summary-icon">
                <Icon name="spark" size={21} />
              </div>

              <div>
                <small>Platform Workflow</small>
                <strong>Bean → Pack</strong>
                <span>Connected quality-control process.</span>
              </div>
            </article>
          </div>

          <section className="workspace-section">
            <div className="section-title">
              <div className="section-title-copy">
                <small>Your Assigned Tools</small>
                <h2>Your Workspace</h2>
                <p>Select an available module to continue your work.</p>
              </div>

              <div className="module-count">
                {modules.length} accessible{" "}
                {modules.length === 1 ? "module" : "modules"}
              </div>
            </div>

            <div className="module-dashboard-grid">
              {modules.map((module) => (
                <article className="dashboard-module-card" key={module.title}>
                  <div className="module-card-top">
                    <div
                      className={`dashboard-module-icon accent-${module.accent}`}
                    >
                      <Icon name={module.icon} size={21} />
                    </div>

                    <span className="module-status">
                      <span className="module-status-dot" />
                      {module.status}
                    </span>
                  </div>

                  <div className="module-meta">{module.eyebrow}</div>

                  <h3>{module.title}</h3>

                  <p>{module.description}</p>

                  <Link to={module.path} className="module-open-button">
                    <span>Open Module</span>

                    <span className="module-arrow">
                      <Icon name="arrow" size={15} />
                    </span>
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className="access-section">
            <div className="access-panel">
              <div className="access-panel-icon">
                <Icon name="shield" size={20} />
              </div>

              <div>
                <small>Role-Based Access</small>
                <h3>
                  Your workspace is filtered to your assigned responsibility.
                </h3>
                <p>
                  The dashboard only displays modules available to your current
                  account role. Administrative tools are available only to
                  administrator accounts.
                </p>
              </div>
            </div>

            <div className="workflow-panel">
              <small>Manufacturing Quality Flow</small>
              <h3>One connected platform.</h3>
              <p>
                Quality-control modules support different stages of the coffee
                manufacturing process.
              </p>

              <div className="flow-line">BEAN → POWDER → PACK → MARKET</div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default DashboardHomePage;

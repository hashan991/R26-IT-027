import { Link } from "react-router-dom";

import { useAuth } from "../auth/context/AuthContext";

function DashboardHomePage() {
  const { user } = useAuth();

  // =========================================================
  // ROLE LABEL
  // =========================================================

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

  // =========================================================
  // ROLE-BASED MODULES
  // =========================================================

  const getModules = () => {
    const modules = [];

    if (user.role === "ADMIN" || user.role === "BEAN_QUALITY_INSPECTOR") {
      modules.push({
        title: "Bean Quality Inspection",
        description:
          "Analyze raw coffee beans using AI-based image inspection and sensor data.",
        path: "/beans",
        icon: "☕",
        status: "Available",
      });
    }

    if (user.role === "ADMIN" || user.role === "POWDER_QUALITY_INSPECTOR") {
      modules.push({
        title: "Powder Quality Checking",
        description:
          "Evaluate coffee powder quality using moisture, color and granulation analysis.",
        path: "/powder",
        icon: "◉",
        status: "Coming Soon",
      });
    }

    if (user.role === "ADMIN" || user.role === "PACKAGING_QUALITY_INSPECTOR") {
      modules.push({
        title: "Packaging Quality Inspection",
        description:
          "Detect packet seal and packaging defects using real-time AI inspection.",
        path: "/seals",
        icon: "▣",
        status: "Available",
      });
    }

    if (user.role === "ADMIN" || user.role === "SALES_ANALYST") {
      modules.push({
        title: "Sales & Market Analysis",
        description:
          "Analyze product quality and market-related information for decision support.",
        path: "/sales",
        icon: "↗",
        status: "Coming Soon",
      });
    }

    if (user.role === "ADMIN") {
      modules.push({
        title: "User Management",
        description:
          "Approve new registrations, manage roles and control system access.",
        path: "/admin",
        icon: "⚙",
        status: "Available",
      });
    }

    return modules;
  };

  const modules = getModules();

  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          .dashboard-home {
            min-height: 100vh;
            padding: 38px;
            background: #f4f7f5;
            font-family: Arial, sans-serif;
          }

          .dashboard-home-wrapper {
            max-width: 1250px;
            margin: 0 auto;
          }

          .dashboard-welcome {
            padding: 32px;
            border-radius: 18px;
            background:
              linear-gradient(
                135deg,
                #173d2a,
                #2a704b
              );
            color: white;
            margin-bottom: 28px;
            position: relative;
            overflow: hidden;
          }

          .dashboard-welcome::after {
            content: "";
            position: absolute;
            width: 240px;
            height: 240px;
            border-radius: 50%;
            background:
              rgba(255, 255, 255, 0.05);
            right: -80px;
            top: -100px;
          }

          .welcome-label {
            display: inline-block;
            padding: 7px 12px;
            border-radius: 20px;
            background:
              rgba(255, 255, 255, 0.12);
            font-size: 11px;
            font-weight: 700;
            margin-bottom: 15px;
          }

          .dashboard-welcome h1 {
            margin: 0;
            font-size: 32px;
          }

          .dashboard-welcome p {
            margin: 10px 0 0;
            max-width: 650px;
            line-height: 1.7;
            color:
              rgba(255, 255, 255, 0.72);
            font-size: 14px;
          }

          .welcome-role {
            margin-top: 18px;
            font-size: 13px;
            color: #b9e7c8;
          }

          .section-title {
            margin-bottom: 18px;
          }

          .section-title h2 {
            margin: 0;
            font-size: 22px;
            color: #1b3d2b;
          }

          .section-title p {
            margin: 7px 0 0;
            font-size: 13px;
            color: #748078;
          }

          .module-dashboard-grid {
            display: grid;
            grid-template-columns:
              repeat(3, 1fr);
            gap: 20px;
          }

          .dashboard-module-card {
            background: white;
            padding: 24px;
            border-radius: 15px;
            border: 1px solid #e1e7e3;
            min-height: 235px;
            display: flex;
            flex-direction: column;
            transition: 0.2s;
          }

          .dashboard-module-card:hover {
            transform: translateY(-3px);
            box-shadow:
              0 15px 35px
              rgba(24, 65, 43, 0.08);
          }

          .module-card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .dashboard-module-icon {
            width: 46px;
            height: 46px;
            border-radius: 12px;
            background: #e7f3ea;
            color: #1e6843;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 21px;
          }

          .module-status {
            padding: 5px 9px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 700;
          }

          .status-available {
            background: #e6f5eb;
            color: #1f6a43;
          }

          .status-coming {
            background: #fff4da;
            color: #8a6205;
          }

          .dashboard-module-card h3 {
            margin: 20px 0 0;
            font-size: 17px;
            color: #1c3d2c;
          }

          .dashboard-module-card p {
            margin: 10px 0 20px;
            color: #748078;
            font-size: 13px;
            line-height: 1.7;
            flex: 1;
          }

          .module-open-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 41px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
            background: #1f6a43;
            color: white;
          }

          .module-open-button:hover {
            background: #185535;
          }

          .module-disabled-button {
            height: 41px;
            border: none;
            border-radius: 8px;
            background: #edf0ee;
            color: #89938d;
            font-size: 13px;
            font-weight: 600;
            cursor: not-allowed;
          }

          @media (max-width: 1100px) {
            .module-dashboard-grid {
              grid-template-columns:
                repeat(2, 1fr);
            }
          }

          @media (max-width: 700px) {
            .dashboard-home {
              padding: 22px;
            }

            .module-dashboard-grid {
              grid-template-columns: 1fr;
            }

            .dashboard-welcome h1 {
              font-size: 26px;
            }
          }
        `}
      </style>

      <div className="dashboard-home">
        <div className="dashboard-home-wrapper">
          {/* WELCOME */}

          <section className="dashboard-welcome">
            <div className="welcome-label">SMART COFFEE QUALITY AI</div>

            <h1>Welcome back, {user.first_name}</h1>

            <p>
              Access your assigned quality control workspace, run inspections
              and monitor coffee manufacturing quality from one platform.
            </p>

            <div className="welcome-role">
              Signed in as: <strong>{getRoleLabel(user.role)}</strong>
            </div>
          </section>

          {/* MODULES */}

          <section>
            <div className="section-title">
              <h2>Your Workspace</h2>

              <p>Select a module to continue your work.</p>
            </div>

            <div className="module-dashboard-grid">
              {modules.map((module) => (
                <div className="dashboard-module-card" key={module.title}>
                  <div className="module-card-top">
                    <div className="dashboard-module-icon">{module.icon}</div>

                    <span
                      className={
                        module.status === "Available"
                          ? "module-status status-available"
                          : "module-status status-coming"
                      }
                    >
                      {module.status}
                    </span>
                  </div>

                  <h3>{module.title}</h3>

                  <p>{module.description}</p>

                  {module.status === "Available" ? (
                    <Link to={module.path} className="module-open-button">
                      Open Module
                    </Link>
                  ) : (
                    <button className="module-disabled-button" disabled>
                      Coming Soon
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default DashboardHomePage;

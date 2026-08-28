import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/context/AuthContext";

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
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.4" />
        <rect x="14" y="3" width="7" height="7" rx="1.4" />
        <rect x="3" y="14" width="7" height="7" rx="1.4" />
        <rect x="14" y="14" width="7" height="7" rx="1.4" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
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
    bean: (
      <>
        <path d="M14.5 3.5c4.5 1.1 6.8 5.3 5.4 9.8-1.3 4.3-5.5 7.4-9.9 6.8-4.3-.5-6.9-4.1-5.8-8.2C5.4 7.4 9.8 2.5 14.5 3.5Z" />
        <path d="M7.2 17.4c2.5-2.7 3.4-5.2 2.7-7.6-.5-1.7-.1-3.5 1.1-5.2" />
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
    shield: (
      <>
        <path d="M12 3 19 6v5c0 4.5-2.8 7.6-7 10-4.2-2.4-7-5.5-7-10V6l7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    logout: (
      <>
        <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
        <path d="M14 8l4 4-4 4" />
        <path d="M9 12h9" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    spark: (
      <>
        <path d="m12 3 1.5 4.2L17.7 9l-4.2 1.5L12 14.7l-1.5-4.2L6.3 9l4.2-1.8L12 3Z" />
      </>
    ),
  };

  return <svg {...common}>{icons[name] || icons.dashboard}</svg>;
}

function Sidebar() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  const handleOpenProfile = () => {
    navigate("/profile");
  };

  const getRoleLabel = (role) => {
    const labels = {
      ADMIN: "Administrator",
      BEAN_QUALITY_INSPECTOR: "Bean Quality Inspector",
      POWDER_QUALITY_INSPECTOR: "Powder Quality Inspector",
      PACKAGING_QUALITY_INSPECTOR: "Packaging Quality Inspector",
      SALES_ANALYST: "Sales Analyst",
    };

    return labels[role] || role;
  };

  const getMenuItems = () => {
    if (user.role === "ADMIN") {
      return [
        {
          label: "Dashboard",
          path: "/dashboard",
          icon: "dashboard",
        },
        {
          label: "My Profile",
          path: "/profile",
          icon: "user",
        },
        {
          label: "User Management",
          path: "/admin",
          icon: "users",
        },
        {
          label: "Bean Quality",
          path: "/beans",
          icon: "bean",
        },
        {
          label: "Packaging Quality",
          path: "/seals",
          icon: "package",
        },
        {
          label: "Sales Analysis",
          path: "/sales",
          icon: "chart",
        },
        {
          label: "Powder Quality",
          path: "/powder",
          icon: "powder",
        },
      ];
    }

    if (user.role === "BEAN_QUALITY_INSPECTOR") {
      return [
        {
          label: "Dashboard",
          path: "/dashboard",
          icon: "dashboard",
        },
        {
          label: "My Profile",
          path: "/profile",
          icon: "user",
        },
        {
          label: "Bean Quality",
          path: "/beans",
          icon: "bean",
        },
      ];
    }

    if (user.role === "POWDER_QUALITY_INSPECTOR") {
      return [
        {
          label: "Dashboard",
          path: "/dashboard",
          icon: "dashboard",
        },
        {
          label: "My Profile",
          path: "/profile",
          icon: "user",
        },
        {
          label: "Powder Quality",
          path: "/powder",
          icon: "powder",
        },
      ];
    }

    if (user.role === "PACKAGING_QUALITY_INSPECTOR") {
      return [
        {
          label: "Dashboard",
          path: "/dashboard",
          icon: "dashboard",
        },
        {
          label: "My Profile",
          path: "/profile",
          icon: "user",
        },
        {
          label: "Packaging Quality",
          path: "/seals",
          icon: "package",
        },
      ];
    }

    if (user.role === "SALES_ANALYST") {
      return [
        {
          label: "Dashboard",
          path: "/dashboard",
          icon: "dashboard",
        },
        {
          label: "My Profile",
          path: "/profile",
          icon: "user",
        },
        {
          label: "Sales Analysis",
          path: "/sales",
          icon: "chart",
        },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  const initials = `${user.first_name?.[0] || ""}${
    user.last_name?.[0] || ""
  }`.toUpperCase();

  return (
    <>
      <style>
        {`
          @keyframes sidebarPulse {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(131, 180, 135, 0.26);
            }

            50% {
              box-shadow: 0 0 0 7px rgba(131, 180, 135, 0);
            }
          }

          @keyframes sidebarSteam {
            0% {
              transform: translateY(4px);
              opacity: 0;
            }

            30% {
              opacity: .45;
            }

            100% {
              transform: translateY(-9px);
              opacity: 0;
            }
          }

          .sidebar {
            width: 285px;
            height: 100vh;
            min-height: 100vh;
            position: sticky;
            top: 0;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            padding: 18px 16px 16px;
            color: white;
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
                circle at 93% 4%,
                rgba(224, 169, 107, .16),
                transparent 26%
              ),
              radial-gradient(
                circle at 5% 96%,
                rgba(95, 119, 95, .09),
                transparent 28%
              ),
              linear-gradient(180deg, #3b2117 0%, #26140e 72%, #20110d 100%);
            border-right: 1px solid rgba(255, 255, 255, .045);
            box-shadow: 10px 0 38px rgba(42, 21, 13, .08);
          }

          .sidebar::after {
            content: "";
            position: absolute;
            width: 210px;
            height: 210px;
            right: -145px;
            bottom: 90px;
            border-radius: 50%;
            pointer-events: none;
            background: rgba(197, 138, 77, .055);
          }

          /* ================= BRAND ================= */

          .sidebar-logo {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            gap: 11px;
            padding: 7px 7px 17px;
            border-bottom: 1px solid rgba(255, 255, 255, .065);
          }

          .sidebar-logo-mark {
            width: 43px;
            height: 43px;
            position: relative;
            flex-shrink: 0;
            display: grid;
            place-items: center;
            border-radius: 13px;
            color: #efc18c;
            background:
              linear-gradient(
                145deg,
                rgba(255,255,255,.09),
                rgba(255,255,255,.035)
              );
            border: 1px solid rgba(255,255,255,.075);
            box-shadow: inset 0 1px 0 rgba(255,255,255,.05);
          }

          .sidebar-steam {
            position: absolute;
            top: -7px;
            left: 50%;
            width: 24px;
            height: 12px;
            transform: translateX(-50%);
          }

          .sidebar-steam span {
            position: absolute;
            bottom: 0;
            width: 1.5px;
            height: 10px;
            border-radius: 999px;
            background: linear-gradient(
              to top,
              rgba(237,190,137,.42),
              transparent
            );
            animation: sidebarSteam 2.6s ease-in-out infinite;
          }

          .sidebar-steam span:nth-child(1) {
            left: 4px;
          }

          .sidebar-steam span:nth-child(2) {
            left: 11px;
            animation-delay: .65s;
          }

          .sidebar-steam span:nth-child(3) {
            left: 18px;
            animation-delay: 1.25s;
          }

          .sidebar-logo-copy {
            min-width: 0;
          }

          .sidebar-logo-copy strong {
            display: block;
            color: #f8ede2;
            font-size: 13px;
            line-height: 1.28;
            letter-spacing: -.1px;
          }

          .sidebar-logo-copy span {
            display: block;
            margin-top: 4px;
            color: #c5aa97;
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 1.05px;
            text-transform: uppercase;
          }

          /* ================= USER ================= */

          .sidebar-user {
            position: relative;
            z-index: 2;
            margin-top: 15px;
            padding: 12px;
            display: grid;
            grid-template-columns: 39px minmax(0, 1fr) 18px;
            align-items: center;
            gap: 9px;
            border-radius: 14px;
            cursor: pointer;
            background:
              linear-gradient(
                135deg,
                rgba(255,255,255,.065),
                rgba(255,255,255,.035)
              );
            border: 1px solid rgba(255,255,255,.065);
            transition:
              background .2s ease,
              transform .2s ease,
              border-color .2s ease;
          }

          .sidebar-user:hover {
            transform: translateY(-2px);
            background: rgba(255,255,255,.075);
            border-color: rgba(224,169,107,.11);
          }

          .sidebar-avatar {
            width: 39px;
            height: 39px;
            display: grid;
            place-items: center;
            border-radius: 11px;
            color: #fff5e9;
            background:
              linear-gradient(
                145deg,
                #77503a,
                #4d2c20
              );
            border: 1px solid rgba(255,255,255,.07);
            font-size: 9px;
            font-weight: 850;
          }

          .sidebar-user-copy {
            min-width: 0;
          }

          .sidebar-user-name {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            color: #fff4e8;
            font-size: 12px;
            font-weight: 750;
          }

          .sidebar-user-role {
            margin-top: 3px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            color: #d3b9a6;
            font-size: 9px;
          }

          .sidebar-user-chevron {
            display: grid;
            place-items: center;
            color: #7d6657;
            transition: transform .2s ease;
          }

          .sidebar-user:hover .sidebar-user-chevron {
            transform: translateX(2px);
            color: #c6a98f;
          }

          /* ================= STATUS ================= */

          .sidebar-status {
            position: relative;
            z-index: 2;
            margin: 10px 2px 0;
            padding: 8px 10px;
            display: flex;
            align-items: center;
            gap: 7px;
            border-radius: 10px;
            color: #c9ddca;
            background: rgba(95,119,95,.085);
            border: 1px solid rgba(132,171,135,.065);
            font-size: 10.5px;
            font-weight: 750;
          }

          .sidebar-status-dot {
            width: 6px;
            height: 6px;
            flex-shrink: 0;
            border-radius: 50%;
            background: #7ba77f;
            animation: sidebarPulse 2s ease-in-out infinite;
          }

          /* ================= MENU ================= */

          .sidebar-menu {
            position: relative;
            z-index: 2;
            margin-top: 20px;
            min-height: 0;
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,.08) transparent;
          }

          .sidebar-menu::-webkit-scrollbar {
            width: 4px;
          }

          .sidebar-menu::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,.08);
            border-radius: 999px;
          }

          .sidebar-menu-title {
            padding: 0 9px 8px;
            color: #b79b88;
            font-size: 8px;
            font-weight: 850;
            letter-spacing: 1.25px;
            text-transform: uppercase;
          }

          .sidebar-menu-list {
            display: grid;
            gap: 4px;
          }

          .sidebar-link {
            min-height: 46px;
            position: relative;
            display: grid;
            grid-template-columns: 29px minmax(0, 1fr) 18px;
            align-items: center;
            gap: 9px;
            padding: 6px 8px;
            border-radius: 11px;
            color: #d0baaa;
            text-decoration: none;
            font-size: 11px;
            font-weight: 700;
            transition:
              background .2s ease,
              color .2s ease,
              transform .2s ease;
          }

          .sidebar-link::before {
            content: "";
            position: absolute;
            left: -14px;
            top: 50%;
            width: 3px;
            height: 0;
            border-radius: 0 5px 5px 0;
            background: #d9a467;
            transform: translateY(-50%);
            transition: height .2s ease;
          }

          .sidebar-link:hover {
            color: #fff0e3;
            background: rgba(255,255,255,.045);
            transform: translateX(2px);
          }

          .sidebar-link.active {
            color: #fff8ef;
            font-weight: 800;
            background:
              linear-gradient(
                135deg,
                rgba(197,138,77,.17),
                rgba(197,138,77,.065)
              );
            box-shadow:
              inset 0 0 0 1px rgba(224,169,107,.07);
          }

          .sidebar-link.active::before {
            height: 22px;
          }

          .sidebar-link-icon {
            width: 29px;
            height: 29px;
            display: grid;
            place-items: center;
            border-radius: 8px;
            color: #c6a891;
            background: rgba(255,255,255,.035);
            transition: .2s ease;
          }

          .sidebar-link.active .sidebar-link-icon {
            color: #ffd09c;
            background: rgba(197,138,77,.10);
          }

          .sidebar-link:hover .sidebar-link-icon {
            color: #f0c99e;
          }

          .sidebar-link-chevron {
            display: grid;
            place-items: center;
            color: #624f44;
            opacity: 0;
            transform: translateX(-3px);
            transition: .2s ease;
          }

          .sidebar-link:hover .sidebar-link-chevron,
          .sidebar-link.active .sidebar-link-chevron {
            opacity: 1;
            transform: translateX(0);
          }

          /* ================= PLATFORM CARD ================= */

          .sidebar-platform-card {
            position: relative;
            z-index: 2;
            margin-top: 15px;
            padding: 12px;
            border-radius: 13px;
            background:
              linear-gradient(
                135deg,
                rgba(197,138,77,.08),
                rgba(255,255,255,.025)
              );
            border: 1px solid rgba(197,138,77,.07);
          }

          .sidebar-platform-head {
            display: flex;
            align-items: center;
            gap: 7px;
            color: #efc18c;
            font-size: 9px;
            font-weight: 800;
          }

          .sidebar-platform-card p {
            margin: 7px 0 0;
            color: #b79e8d;
            font-size: 8px;
            line-height: 1.55;
          }

          .sidebar-flow {
            margin-top: 9px;
            padding: 7px 8px;
            border-radius: 8px;
            color: #d1b59f;
            background: rgba(255,255,255,.03);
            text-align: center;
            font-size: 7.5px;
            font-weight: 850;
            letter-spacing: .35px;
          }

          /* ================= FOOTER ================= */

          .sidebar-footer {
            position: relative;
            z-index: 2;
            margin-top: 13px;
            padding-top: 13px;
            border-top: 1px solid rgba(255,255,255,.065);
          }

          .sidebar-logout {
            width: 100%;
            min-height: 39px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: 1px solid rgba(255,255,255,.055);
            border-radius: 10px;
            color: #ead7c8;
            background: rgba(255,255,255,.035);
            font-family: inherit;
            font-size: 10.5px;
            font-weight: 750;
            cursor: pointer;
            transition:
              background .2s ease,
              border-color .2s ease,
              color .2s ease,
              transform .2s ease;
          }

          .sidebar-logout:hover {
            transform: translateY(-1px);
            color: #fff0eb;
            background: rgba(158,54,54,.32);
            border-color: rgba(204,91,91,.18);
          }

          .sidebar-version {
            margin-top: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            color: #a28877;
            font-size: 7px;
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

          @media (max-width: 850px) {
            .sidebar {
              width: 245px;
              padding-left: 11px;
              padding-right: 11px;
            }

            .sidebar-logo-copy strong {
              font-size: 11.5px;
            }

            .sidebar-logo-copy span {
              font-size: 7px;
            }

            .sidebar-user {
              grid-template-columns: 36px minmax(0, 1fr) 16px;
              padding: 10px;
            }

            .sidebar-avatar {
              width: 36px;
              height: 36px;
            }
          }
        `}
      </style>

      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <span className="sidebar-steam" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>

            <Icon name="coffee" size={19} />
          </div>

          <div className="sidebar-logo-copy">
            <strong>Smart Coffee Manufacturing</strong>
            <span>AI Quality Control</span>
          </div>
        </div>

        <div
          className="sidebar-user"
          onClick={handleOpenProfile}
          title="Open My Profile"
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              handleOpenProfile();
            }
          }}
        >
          <div className="sidebar-avatar">
            {initials || <Icon name="user" size={16} />}
          </div>

          <div className="sidebar-user-copy">
            <div className="sidebar-user-name">
              {user.first_name} {user.last_name}
            </div>

            <div className="sidebar-user-role">{getRoleLabel(user.role)}</div>
          </div>

          <span className="sidebar-user-chevron">
            <Icon name="chevron" size={13} />
          </span>
        </div>

        <div className="sidebar-status">
          <span className="sidebar-status-dot" />
          Role-based workspace access active
        </div>

        <nav className="sidebar-menu">
          <div className="sidebar-menu-title">Navigation</div>

          <div className="sidebar-menu-list">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                <span className="sidebar-link-icon">
                  <Icon name={item.icon} size={14} />
                </span>

                <span>{item.label}</span>

                <span className="sidebar-link-chevron">
                  <Icon name="chevron" size={12} />
                </span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-platform-card">
          <div className="sidebar-platform-head">
            <Icon name="spark" size={13} />
            Bean-to-Pack Quality Platform
          </div>

          <p>
            Your navigation is automatically filtered according to your approved
            system role.
          </p>

          <div className="sidebar-flow">BEAN → POWDER → PACK → MARKET</div>
        </div>

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <Icon name="logout" size={15} />
            Sign Out
          </button>

          <div className="sidebar-version">
            <Icon name="shield" size={10} />
            Secure Quality Workspace
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

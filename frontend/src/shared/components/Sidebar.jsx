import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/context/AuthContext";

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
        <path d="M15 3c0 1.3 1 1.7 1 3" />
      </>
    ),
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.3" />
        <rect x="14" y="3" width="7" height="7" rx="1.3" />
        <rect x="3" y="14" width="7" height="7" rx="1.3" />
        <rect x="14" y="14" width="7" height="7" rx="1.3" />
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
        <path d="m12 3 1.4 4.2L17.5 9l-4.1 1.5L12 14.7l-1.4-4.2L6.5 9l4.1-1.8L12 3Z" />
        <path d="m19 14 .7 2.2L22 17l-2.3.8L19 20l-.7-2.2L16 17l2.3-.8L19 14Z" />
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
          label: "Powder Quality",
          path: "/powder",
          icon: "powder",
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
      <style>{`
        @keyframes sidebarStatusPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(43, 204, 105, .28);
          }

          50% {
            box-shadow: 0 0 0 8px rgba(43, 204, 105, 0);
          }
        }

        @keyframes sidebarGlow {
          0%, 100% {
            opacity: .50;
          }

          50% {
            opacity: .85;
          }
        }

        @keyframes coffeeSteam {
          0% {
            transform: translateY(5px);
            opacity: 0;
          }

          35% {
            opacity: .7;
          }

          100% {
            transform: translateY(-10px);
            opacity: 0;
          }
        }

        .sidebar,
        .sidebar *,
        .sidebar *::before,
        .sidebar *::after {
          box-sizing: border-box;
        }

        .sidebar {
          width: 310px;
          height: 100vh;
          min-height: 100vh;
          position: sticky;
          top: 0;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 26px 20px 22px;
          color: #fff6e9;
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
              circle at 72% 11%,
              rgba(221, 142, 44, .19),
              transparent 25%
            ),
            radial-gradient(
              circle at 50% 35%,
              rgba(164, 86, 24, .10),
              transparent 42%
            ),
            linear-gradient(
              180deg,
              #231006 0%,
              #180a04 54%,
              #120704 100%
            );
          border-right: 1px solid rgba(231, 163, 75, .10);
          box-shadow:
            16px 0 55px rgba(32, 13, 4, .14);
        }

        .sidebar::before {
          content: "";
          position: absolute;
          top: -90px;
          left: 30px;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          background: rgba(224, 145, 48, .08);
          filter: blur(24px);
          pointer-events: none;
          animation: sidebarGlow 4.5s ease-in-out infinite;
        }

        /* =========================
           BRAND
        ========================= */

        .sidebar-brand {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 6px 8px 23px;
        }

        .sidebar-brand-mark {
          width: 76px;
          height: 76px;
          position: relative;
          display: grid;
          place-items: center;
          margin: 0 auto;
          border-radius: 22px;
          color: white;
          background:
            linear-gradient(
              145deg,
              #f4c451 0%,
              #de951f 52%,
              #b96317 100%
            );
          border: 1px solid rgba(255, 227, 155, .55);
          box-shadow:
            0 15px 34px rgba(215, 131, 30, .26),
            inset 0 1px 0 rgba(255, 255, 255, .35);
        }

        .sidebar-brand-steam {
          position: absolute;
          top: 14px;
          left: 50%;
          width: 30px;
          height: 18px;
          transform: translateX(-50%);
          pointer-events: none;
        }

        .sidebar-brand-steam span {
          position: absolute;
          bottom: 0;
          width: 2px;
          height: 11px;
          border-radius: 99px;
          background:
            linear-gradient(
              to top,
              rgba(255, 255, 255, .80),
              transparent
            );
          animation: coffeeSteam 2.5s ease-in-out infinite;
        }

        .sidebar-brand-steam span:nth-child(1) {
          left: 4px;
        }

        .sidebar-brand-steam span:nth-child(2) {
          left: 13px;
          animation-delay: .55s;
        }

        .sidebar-brand-steam span:nth-child(3) {
          left: 22px;
          animation-delay: 1.1s;
        }

        .sidebar-brand-title {
          margin-top: 22px;
          color: #fff7e8;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 32px;
          font-weight: 700;
          line-height: 1;
          letter-spacing: -1.4px;
        }

        .sidebar-brand-subtitle {
          margin-top: 17px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #e8bd82;
          font-size: 13px;
          font-weight: 700;
        }

        .sidebar-brand-subtitle svg {
          color: #f1b84f;
        }

        /* =========================
           USER
        ========================= */

        .sidebar-user {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 43px minmax(0, 1fr) 18px;
          align-items: center;
          gap: 11px;
          margin: 0 2px 18px;
          padding: 12px 13px;
          border-radius: 15px;
          color: #f7e9da;
          background: rgba(255,255,255,.035);
          border: 1px solid rgba(239, 179, 100, .10);
          cursor: pointer;
          transition:
            transform .18s ease,
            background .18s ease,
            border-color .18s ease;
        }

        .sidebar-user:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,.055);
          border-color: rgba(239,179,100,.18);
        }

        .sidebar-user-avatar {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: #35180a;
          background:
            linear-gradient(
              145deg,
              #f0c059,
              #c97a20
            );
          font-size: 12px;
          font-weight: 900;
        }

        .sidebar-user-copy {
          min-width: 0;
        }

        .sidebar-user-name {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          color: #fff5e8;
          font-size: 14px;
          font-weight: 750;
        }

        .sidebar-user-role {
          margin-top: 3px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          color: #cba98e;
          font-size: 11px;
        }

        .sidebar-user-arrow {
          color: #8f6d58;
          transition: .18s ease;
        }

        .sidebar-user:hover .sidebar-user-arrow {
          color: #e7bc87;
          transform: translateX(2px);
        }

        /* =========================
           MENU
        ========================= */

        .sidebar-menu {
          position: relative;
          z-index: 2;
          min-height: 0;
          flex: 1;
          overflow-y: auto;
          padding: 1px 2px 12px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,.09) transparent;
        }

        .sidebar-menu::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-menu::-webkit-scrollbar-thumb {
          border-radius: 99px;
          background: rgba(255,255,255,.09);
        }

        .sidebar-menu-title {
          margin: 0 0 9px 4px;
          color: #b58b6f;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1.35px;
          text-transform: uppercase;
        }

        .sidebar-menu-list {
          display: grid;
          gap: 11px;
        }

        .sidebar-link {
          min-height: 58px;
          position: relative;
          display: grid;
          grid-template-columns: 38px minmax(0, 1fr) 24px;
          align-items: center;
          gap: 9px;
          padding: 8px 12px;
          border-radius: 16px;
          color: #d8c5b8;
          text-decoration: none;
          font-size: 14px;
          font-weight: 750;
          border: 1px solid rgba(199, 128, 51, .19);
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.018),
              rgba(151,73,19,.035)
            );
          transition:
            transform .18s ease,
            color .18s ease,
            background .18s ease,
            border-color .18s ease,
            box-shadow .18s ease;
        }

        .sidebar-link:hover {
          transform: translateY(-1px);
          color: #fff6e9;
          border-color: rgba(222, 153, 66, .30);
          background:
            linear-gradient(
              135deg,
              rgba(220, 144, 46, .08),
              rgba(255,255,255,.025)
            );
        }

        .sidebar-link.active {
          color: #2e1508;
          border-color: rgba(255, 220, 133, .72);
          background:
            linear-gradient(
              100deg,
              #f4cd64 0%,
              #e9aa31 45%,
              #c46d1f 100%
            );
          box-shadow:
            0 11px 28px rgba(208, 123, 28, .26),
            inset 0 1px 0 rgba(255,255,255,.42);
        }

        .sidebar-link-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          color: #d7b99e;
          background: rgba(255,255,255,.028);
        }

        .sidebar-link.active .sidebar-link-icon {
          color: #281308;
          background: rgba(255,255,255,.14);
        }

        .sidebar-link-dot {
          width: 11px;
          height: 11px;
          justify-self: center;
          border-radius: 50%;
          border: 1.5px solid rgba(213, 171, 127, .26);
          background: transparent;
        }

        .sidebar-link.active .sidebar-link-dot {
          border: none;
          background: #fff;
          box-shadow:
            0 0 0 3px rgba(255,255,255,.13),
            0 3px 8px rgba(72,33,7,.12);
        }

        /* =========================
           SYSTEM CARD
        ========================= */

        .sidebar-system-card {
          position: relative;
          z-index: 2;
          margin: 13px 2px 0;
          padding: 18px 17px;
          display: grid;
          grid-template-columns: 16px 1fr;
          gap: 12px;
          align-items: center;
          border-radius: 18px;
          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.035),
              rgba(116,60,21,.055)
            );
          border: 1px solid rgba(209, 139, 64, .20);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.025);
        }

        .sidebar-system-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: #21c565;
          box-shadow: 0 0 16px rgba(33,197,101,.45);
          animation: sidebarStatusPulse 2s ease-in-out infinite;
        }

        .sidebar-system-title {
          color: #39e17e;
          font-size: 14px;
          font-weight: 800;
        }

        .sidebar-system-text {
          margin-top: 3px;
          color: #cfb9aa;
          font-size: 11px;
          line-height: 1.45;
        }

        /* =========================
           FOOTER
        ========================= */

        .sidebar-footer {
          position: relative;
          z-index: 2;
          margin-top: 16px;
          padding-top: 17px;
          border-top: 1px solid rgba(226, 159, 79, .10);
        }

        .sidebar-footer-brand {
          margin-bottom: 13px;
        }

        .sidebar-footer-brand strong {
          display: block;
          color: #fff5e8;
          font-size: 14px;
        }

        .sidebar-footer-brand span {
          display: block;
          margin-top: 4px;
          color: #a98c79;
          font-size: 10px;
          line-height: 1.45;
        }

        .sidebar-logout {
          width: 100%;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 12px;
          border: 1px solid rgba(225, 151, 77, .14);
          color: #e8d4c5;
          background: rgba(255,255,255,.035);
          font: inherit;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
          transition:
            transform .18s ease,
            color .18s ease,
            background .18s ease,
            border-color .18s ease;
        }

        .sidebar-logout:hover {
          transform: translateY(-1px);
          color: #fff1eb;
          background: rgba(145, 49, 38, .30);
          border-color: rgba(218, 102, 83, .22);
        }

        @media (prefers-reduced-motion: reduce) {
          .sidebar *,
          .sidebar *::before,
          .sidebar *::after {
            animation-duration: .001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .001ms !important;
          }
        }

        @media (max-width: 900px) {
          .sidebar {
            width: 270px;
            padding-left: 14px;
            padding-right: 14px;
          }

          .sidebar-brand-mark {
            width: 68px;
            height: 68px;
          }

          .sidebar-brand-title {
            font-size: 28px;
          }

          .sidebar-link {
            min-height: 54px;
            font-size: 13px;
          }
        }
      `}</style>

      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">
            <div className="sidebar-brand-steam" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>

            <Icon name="coffee" size={37} strokeWidth={1.9} />
          </div>

          <div className="sidebar-brand-title">Bean to Pack</div>

          <div className="sidebar-brand-subtitle">
            <Icon name="spark" size={16} />
            AI Coffee Intelligence
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
          <div className="sidebar-user-avatar">
            {initials || <Icon name="user" size={18} />}
          </div>

          <div className="sidebar-user-copy">
            <div className="sidebar-user-name">
              {user.first_name} {user.last_name}
            </div>

            <div className="sidebar-user-role">{getRoleLabel(user.role)}</div>
          </div>

          <span className="sidebar-user-arrow">
            <Icon name="chevron" size={15} />
          </span>
        </div>

        <nav className="sidebar-menu">
          <div className="sidebar-menu-title">Workspace</div>

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
                  <Icon name={item.icon} size={19} />
                </span>

                <span>{item.label}</span>

                <span className="sidebar-link-dot" />
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-system-card">
          <span className="sidebar-system-dot" />

          <div>
            <div className="sidebar-system-title">System Online</div>
            <div className="sidebar-system-text">
              AI quality workspace active
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-brand">
            <strong>Bean to Pack AI™</strong>
            <span>Industrial coffee quality intelligence platform</span>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <Icon name="logout" size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

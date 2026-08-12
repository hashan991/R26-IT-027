import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/context/AuthContext";

function Sidebar() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  // =========================================================
  // ROLE LABEL
  // =========================================================

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

  // =========================================================
  // ROLE BASED MENU
  // =========================================================

  const getMenuItems = () => {
    if (user.role === "ADMIN") {
      return [
        {
          label: "Home",
          path: "/dashboard",
        },
        {
          label: "User Management",
          path: "/admin",
        },
        {
          label: "Bean Quality",
          path: "/beans",
        },
      ];
    }

    if (user.role === "BEAN_QUALITY_INSPECTOR") {
      return [
        {
          label: "Home",
          path: "/dashboard",
        },
        {
          label: "Bean Quality",
          path: "/beans",
        },
      ];
    }

    if (user.role === "POWDER_QUALITY_INSPECTOR") {
      return [
        {
          label: "Home",
          path: "/",
        },
      ];
    }

    if (user.role === "PACKAGING_QUALITY_INSPECTOR") {
      return [
        {
          label: "Home",
          path: "/",
        },
      ];
    }

    if (user.role === "SALES_ANALYST") {
      return [
        {
          label: "Home",
          path: "/",
        },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return (
    <>
      <style>
        {`
          .sidebar {
            width: 270px;
            min-height: 100vh;

            background: #173d2a;

            color: white;

            display: flex;
            flex-direction: column;

            padding: 25px 18px;

            position: sticky;
            top: 0;
          }

          .sidebar-logo {
            padding: 5px 10px 25px;

            border-bottom:
              1px solid
              rgba(255, 255, 255, 0.12);
          }

          .sidebar-logo h2 {
            margin: 0;

            font-size: 21px;

            line-height: 1.3;
          }

          .sidebar-logo span {
            color: #a7d9b8;
          }

          .sidebar-logo p {
            margin: 7px 0 0;

            font-size: 11px;

            color:
              rgba(255, 255, 255, 0.55);
          }

          .sidebar-user {
            margin-top: 22px;

            padding: 15px;

            border-radius: 12px;

            background:
              rgba(255, 255, 255, 0.07);
          }

          .sidebar-user-name {
            font-size: 14px;
            font-weight: 600;
          }

          .sidebar-user-role {
            margin-top: 5px;

            font-size: 11px;

            color: #aad6b9;
          }

          .sidebar-menu {
            margin-top: 28px;

            display: flex;
            flex-direction: column;

            gap: 7px;

            flex: 1;
          }

          .sidebar-menu-title {
            padding: 0 10px;

            margin-bottom: 5px;

            font-size: 10px;

            text-transform: uppercase;

            letter-spacing: 1px;

            color:
              rgba(255, 255, 255, 0.45);
          }

          .sidebar-link {
            display: flex;
            align-items: center;

            padding: 12px 13px;

            border-radius: 9px;

            color:
              rgba(255, 255, 255, 0.75);

            text-decoration: none;

            font-size: 14px;

            transition: 0.2s;
          }

          .sidebar-link:hover {
            background:
              rgba(255, 255, 255, 0.08);

            color: white;
          }

          .sidebar-link.active {
            background: #2a704b;

            color: white;

            font-weight: 600;
          }

          .coming-soon {
            margin-top: 18px;

            padding: 13px;

            border-radius: 10px;

            background:
              rgba(255, 255, 255, 0.05);

            font-size: 12px;

            color:
              rgba(255, 255, 255, 0.55);

            line-height: 1.5;
          }

          .sidebar-footer {
            padding-top: 20px;

            border-top:
              1px solid
              rgba(255, 255, 255, 0.12);
          }

          .sidebar-logout {
            width: 100%;

            height: 42px;

            border: none;
            border-radius: 8px;

            background:
              rgba(255, 255, 255, 0.08);

            color: white;

            font-size: 13px;
            font-weight: 600;

            cursor: pointer;

            transition: 0.2s;
          }

          .sidebar-logout:hover {
            background: #9e3636;
          }

          @media (max-width: 850px) {
            .sidebar {
              width: 220px;
            }
          }
        `}
      </style>

      <aside className="sidebar">
        {/* LOGO */}

        <div className="sidebar-logo">
          <h2>
            Smart Coffee
            <br />
            <span>Quality AI</span>
          </h2>

          <p>Bean to Pack Quality Control</p>
        </div>

        {/* USER */}

        <div className="sidebar-user">
          <div className="sidebar-user-name">
            {user.first_name} {user.last_name}
          </div>

          <div className="sidebar-user-role">{getRoleLabel(user.role)}</div>
        </div>

        {/* NAVIGATION */}

        <nav className="sidebar-menu">
          <div className="sidebar-menu-title">Navigation</div>

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              {item.label}
            </NavLink>
          ))}

          {user.role === "POWDER_QUALITY_INSPECTOR" && (
            <div className="coming-soon">
              Powder Quality Module
              <br />
              Coming Soon
            </div>
          )}

          {user.role === "PACKAGING_QUALITY_INSPECTOR" && (
            <div className="coming-soon">
              Packaging Quality Module
              <br />
              Coming Soon
            </div>
          )}

          {user.role === "SALES_ANALYST" && (
            <div className="coming-soon">
              Sales Analysis Module
              <br />
              Coming Soon
            </div>
          )}
        </nav>

        {/* LOGOUT */}

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

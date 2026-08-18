import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/context/AuthContext";


function UserMenu() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();


  // ======================================================
  // MY PROFILE
  // ======================================================

  const handleProfile = () => {
    navigate("/profile");
  };


  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };


  if (!user) {
    return null;
  }


  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "10px 16px",
        background: "#ffffff",
        borderRadius: "10px",
        border: "1px solid #e0e5e2",
      }}
    >

      {/* ==================================================
          USER INFORMATION
      ================================================== */}

      <div>

        <div
          style={{
            fontWeight: "600",
            color: "#1d392a",
          }}
        >
          {user.first_name} {user.last_name}
        </div>


        <div
          style={{
            fontSize: "12px",
            color: "#76827b",
            marginTop: "3px",
          }}
        >
          {getRoleLabel(user.role)}
        </div>

      </div>


      {/* ==================================================
          ACTION BUTTONS
      ================================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginLeft: "12px",
        }}
      >

        {/* MY PROFILE */}

        <button
          type="button"
          onClick={handleProfile}
          style={{
            border: "1px solid #d6e2dc",
            borderRadius: "7px",
            padding: "9px 14px",
            background: "#f4f8f6",
            color: "#285c42",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          My Profile
        </button>


        {/* LOGOUT */}

        <button
          type="button"
          onClick={handleLogout}
          style={{
            border: "none",
            borderRadius: "7px",
            padding: "9px 14px",
            background: "#fceaea",
            color: "#a52b2b",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Logout
        </button>

      </div>

    </div>
  );
}


// ======================================================
// ROLE LABEL
// ======================================================

function getRoleLabel(role) {
  const roles = {
    ADMIN: "Administrator",

    BEAN_QUALITY_INSPECTOR:
      "Bean Quality Inspector",

    POWDER_QUALITY_INSPECTOR:
      "Powder Quality Inspector",

    PACKAGING_QUALITY_INSPECTOR:
      "Packaging Quality Inspector",

    SALES_ANALYST:
      "Sales Analyst",
  };

  return roles[role] || role;
}


export default UserMenu;
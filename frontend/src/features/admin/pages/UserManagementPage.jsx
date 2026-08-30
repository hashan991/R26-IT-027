import { useEffect, useMemo, useState } from "react";

import UserMenu from "../../../shared/components/UserMenu";

import {
  getAllUsers,
  approveUser,
  disableUser,
  enableUser,
  changeUserRole,
  deleteUser,
} from "../services/adminService";

function UserManagementPage() {
  // =========================================================
  // USERS
  // =========================================================

  const [users, setUsers] = useState([]);

  // =========================================================
  // UI STATE
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // DELETE MODAL STATE
  // =========================================================

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [deleteError, setDeleteError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllUsers();

      setUsers(data);
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // =========================================================
  // APPROVE USER
  // =========================================================

  const handleApprove = async (userId) => {
    try {
      setActionLoading(userId);

      setError("");
      setSuccess("");

      const result = await approveUser(userId);

      setSuccess(result.message || "User approved successfully.");

      await loadUsers();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to approve user.");
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // DISABLE USER
  // =========================================================

  const handleDisable = async (userId) => {
    try {
      setActionLoading(userId);

      setError("");
      setSuccess("");

      const result = await disableUser(userId);

      setSuccess(result.message || "User disabled successfully.");

      await loadUsers();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to disable user.");
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // ENABLE USER
  // =========================================================

  const handleEnable = async (userId) => {
    try {
      setActionLoading(userId);

      setError("");
      setSuccess("");

      const result = await enableUser(userId);

      setSuccess(result.message || "User enabled successfully.");

      await loadUsers();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to enable user.");
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // CHANGE USER ROLE
  // =========================================================

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionLoading(userId);

      setError("");
      setSuccess("");

      const result = await changeUserRole(userId, newRole);

      setSuccess(result.message || "User role updated successfully.");

      await loadUsers();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to change user role.");

      await loadUsers();
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // OPEN DELETE MODAL
  // =========================================================

  const openDeleteModal = (user) => {
    setDeleteTarget(user);

    setDeleteConfirmText("");

    setDeleteError("");

    setError("");

    setSuccess("");
  };

  // =========================================================
  // CLOSE DELETE MODAL
  // =========================================================

  const closeDeleteModal = () => {
    if (deleteTarget && actionLoading === deleteTarget.id) {
      return;
    }

    setDeleteTarget(null);

    setDeleteConfirmText("");

    setDeleteError("");
  };

  // =========================================================
  // DELETE USER
  // =========================================================

  const handleDeleteUser = async () => {
    if (!deleteTarget) {
      return;
    }

    if (deleteConfirmText.trim() !== "DELETE") {
      setDeleteError('Please type "DELETE" to confirm.');

      return;
    }

    try {
      setActionLoading(deleteTarget.id);

      setDeleteError("");

      setError("");

      setSuccess("");

      const result = await deleteUser(deleteTarget.id);

      setSuccess(result.message || "User deleted successfully.");

      setDeleteTarget(null);

      setDeleteConfirmText("");

      await loadUsers();
    } catch (error) {
      setDeleteError(error.response?.data?.detail || "Failed to delete user.");
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // ROLE LABEL
  // =========================================================

  const getRoleLabel = (role) => {
    const roles = {
      ADMIN: "Admin",

      BEAN_QUALITY_INSPECTOR: "Bean Quality Inspector",

      POWDER_QUALITY_INSPECTOR: "Powder Quality Inspector",

      PACKAGING_QUALITY_INSPECTOR: "Packaging Quality Inspector",

      SALES_ANALYST: "Sales Analyst",
    };

    return roles[role] || "Not Assigned";
  };

  // =========================================================
  // SUMMARY COUNTS
  // =========================================================

  const pendingCount = users.filter((user) => !user.is_approved).length;

  const activeCount = users.filter(
    (user) => user.is_active && user.is_approved,
  ).length;

  const disabledCount = users.filter(
    (user) => user.is_approved && !user.is_active,
  ).length;

  const getUserStatus = (user) => {
    if (!user.is_approved) return "PENDING";
    if (user.is_active) return "ACTIVE";
    return "DISABLED";
  };

  const getInitials = (user) => {
    const first = user?.first_name?.charAt(0) || "";
    const last = user?.last_name?.charAt(0) || "";
    return `${first}${last}`.toUpperCase() || "U";
  };

  const filteredUsers = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return users.filter((user) => {
      const status = getUserStatus(user);
      const name =
        `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const requestedRole = getRoleLabel(user.requested_role).toLowerCase();
      const currentRole = getRoleLabel(user.role).toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        requestedRole.includes(query) ||
        currentRole.includes(query);

      const matchesStatus = statusFilter === "ALL" || status === statusFilter;

      const effectiveRole = user.role || user.requested_role || "";
      const matchesRole = roleFilter === "ALL" || effectiveRole === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchText, statusFilter, roleFilter]);

  const hasFilters =
    Boolean(searchText.trim()) ||
    statusFilter !== "ALL" ||
    roleFilter !== "ALL";

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("ALL");
    setRoleFilter("ALL");
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }


          /* =================================================
             PAGE
          ================================================= */

          .admin-page {
            min-height: 100vh;
            background: #f4f7f5;
            padding: 35px;
            font-family: Arial, sans-serif;
          }


          .admin-wrapper {
            max-width: 1350px;
            margin: 0 auto;
          }


          /* =================================================
             HEADER
          ================================================= */

          .admin-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 30px;
          }


          .admin-header h1 {
            margin: 0;
            color: #183b2a;
            font-size: 32px;
          }


          .admin-header p {
            margin: 8px 0 0;
            color: #6a756f;
            font-size: 14px;
          }


          /* =================================================
             SUMMARY
          ================================================= */

          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 18px;
            margin-bottom: 25px;
          }


          .summary-card {
            background: white;
            border-radius: 14px;
            padding: 20px;
            border: 1px solid #e4e9e6;
          }


          .summary-card span {
            display: block;
            color: #6d7872;
            font-size: 13px;
          }


          .summary-card strong {
            display: block;
            margin-top: 8px;
            color: #193c2a;
            font-size: 28px;
          }


          /* =================================================
             MESSAGES
          ================================================= */

          .message {
            margin-bottom: 18px;
            padding: 12px 15px;
            border-radius: 9px;
            font-size: 14px;
          }


          .error-message {
            background: #fff0f0;
            color: #b42318;
            border: 1px solid #ffd2d2;
          }


          .success-message {
            background: #edf8f1;
            color: #17613a;
            border: 1px solid #bde3ca;
          }


          /* =================================================
             TABLE
          ================================================= */

          .table-card {
            background: white;
            border-radius: 16px;
            border: 1px solid #e2e8e4;
            overflow: hidden;
          }


          .table-header {
            padding: 20px 22px;
            border-bottom: 1px solid #e8ece9;
          }


          .table-header h2 {
            margin: 0;
            color: #213b2f;
            font-size: 19px;
          }


          .table-container {
            overflow-x: auto;
          }


          .user-table {
            width: 100%;
            border-collapse: collapse;
          }


          .user-table th {
            padding: 14px 16px;
            background: #f7f9f8;
            text-align: left;
            color: #59665f;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
          }


          .user-table td {
            padding: 16px;
            border-top: 1px solid #edf0ee;
            color: #35463d;
            font-size: 14px;
            vertical-align: middle;
          }


          .user-name {
            font-weight: 600;
            color: #193b2a;
          }


          .user-email {
            margin-top: 4px;
            font-size: 12px;
            color: #7b8580;
          }


          /* =================================================
             STATUS
          ================================================= */

          .status {
            display: inline-flex;
            padding: 6px 10px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
          }


          .status-pending {
            background: #fff5dd;
            color: #916200;
          }


          .status-active {
            background: #e6f5eb;
            color: #1f6a43;
          }


          .status-disabled {
            background: #feecec;
            color: #a92c2c;
          }


          /* =================================================
             ROLE SELECT
          ================================================= */

          .role-select {
            min-width: 205px;
            height: 38px;
            padding: 0 10px;
            border: 1px solid #d7ddd9;
            border-radius: 8px;
            background: white;
            color: #34463c;
            outline: none;
          }


          .role-select:focus {
            border-color: #2f7d50;
          }


          /* =================================================
             ACTION BUTTONS
          ================================================= */

          .action-buttons {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }


          .action-button {
            border: none;
            border-radius: 7px;
            height: 36px;
            padding: 0 13px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: 0.2s;
          }


          .approve-button {
            background: #1f6a43;
            color: white;
          }


          .approve-button:hover {
            background: #185635;
          }


          .disable-button {
            background: #feecec;
            color: #a52b2b;
          }


          .disable-button:hover {
            background: #fbdada;
          }


          .enable-button {
            background: #e7f2ff;
            color: #1769aa;
          }


          .enable-button:hover {
            background: #d6e8fc;
          }


          .delete-user-button {
            background: #b42318;
            color: white;
          }


          .delete-user-button:hover {
            background: #8f1d14;
          }


          .action-button:disabled,
          .role-select:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }


          .protected-admin {
            color: #7b8580;
            font-size: 12px;
            font-weight: 600;
          }


          /* =================================================
             LOADING
          ================================================= */

          .loading-box,
          .empty-box {
            padding: 50px;
            text-align: center;
            color: #738078;
          }


          /* =================================================
             DELETE MODAL
          ================================================= */

          .admin-delete-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;

            display: grid;
            place-items: center;

            padding: 20px;

            background: rgba(
              14,
              25,
              19,
              0.68
            );

            backdrop-filter: blur(5px);
          }


          .admin-delete-modal {
            width: 100%;
            max-width: 470px;

            padding: 26px;

            border-radius: 16px;

            background: white;

            border: 1px solid #ead4d2;

            box-shadow:
              0 24px 70px
              rgba(20, 34, 26, 0.25);
          }


          .admin-delete-icon {
            width: 48px;
            height: 48px;

            display: grid;
            place-items: center;

            border-radius: 50%;

            background: #feecec;
            color: #b42318;

            font-size: 21px;
            font-weight: 800;
          }


          .admin-delete-modal h2 {
            margin: 16px 0 8px;
            color: #3c201e;
            font-size: 22px;
          }


          .admin-delete-description {
            margin: 0;
            color: #6f6562;
            font-size: 13px;
            line-height: 1.6;
          }


          .admin-delete-user {
            margin-top: 17px;
            padding: 13px;

            border-radius: 9px;

            background: #f7f8f7;

            border: 1px solid #e4e8e5;
          }


          .admin-delete-user strong {
            display: block;
            color: #253c31;
            font-size: 14px;
          }


          .admin-delete-user span {
            display: block;
            margin-top: 4px;
            color: #768078;
            font-size: 12px;
          }


          .admin-delete-label {
            display: block;

            margin-top: 18px;

            color: #4e5e55;

            font-size: 12px;
            font-weight: 600;
          }


          .admin-delete-label strong {
            color: #b42318;
          }


          .admin-delete-input {
            width: 100%;
            height: 42px;

            margin-top: 8px;
            padding: 0 12px;

            border: 1px solid #d8dfdb;
            border-radius: 8px;

            outline: none;

            font-size: 13px;
          }


          .admin-delete-input:focus {
            border-color: #b42318;
          }


          .admin-delete-error {
            margin-top: 12px;

            padding: 10px;

            border-radius: 7px;

            background: #fff0f0;
            color: #b42318;

            font-size: 12px;
          }


          .admin-delete-actions {
            display: flex;
            justify-content: flex-end;
            gap: 9px;

            margin-top: 22px;
          }


          .admin-delete-cancel,
          .admin-delete-confirm {
            height: 40px;

            padding: 0 16px;

            border: none;
            border-radius: 8px;

            cursor: pointer;

            font-size: 12px;
            font-weight: 600;
          }


          .admin-delete-cancel {
            background: #eef1ef;
            color: #405047;
          }


          .admin-delete-cancel:hover {
            background: #e1e6e3;
          }


          .admin-delete-confirm {
            background: #b42318;
            color: white;
          }


          .admin-delete-confirm:hover {
            background: #8f1d14;
          }


          .admin-delete-confirm:disabled,
          .admin-delete-cancel:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }


          /* =================================================
             RESPONSIVE
          ================================================= */


          /* =================================================
             ADVANCED COFFEE ADMIN THEME
          ================================================= */

          @keyframes adminSpin {
            to { transform: rotate(360deg); }
          }

          @keyframes adminPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(95,119,95,.22); }
            50% { box-shadow: 0 0 0 6px rgba(95,119,95,0); }
          }

          .admin-page {
            min-height: 100%;
            padding: 30px 28px 54px;
            background:
              radial-gradient(circle at 94% 2%, rgba(197,138,77,.10), transparent 28%),
              radial-gradient(circle at 3% 92%, rgba(95,119,95,.06), transparent 28%),
              linear-gradient(180deg, #fbf7f1 0%, #f5eee5 100%);
            color: #30231d;
            font-family:
              Inter,
              ui-sans-serif,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
          }

          .admin-wrapper {
            max-width: 1380px;
          }

          .admin-header {
            align-items: flex-start;
            margin-bottom: 22px;
          }

          .admin-kicker,
          .table-kicker {
            color: #8a5b3d;
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 1.2px;
            text-transform: uppercase;
          }

          .admin-header h1 {
            margin-top: 5px;
            color: #2b1812;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 38px;
            line-height: 1.08;
            letter-spacing: -1px;
          }

          .admin-header p {
            max-width: 720px;
            color: #75665d;
            font-size: 14px;
            line-height: 1.65;
          }

          .admin-header-actions {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .refresh-users-button {
            min-height: 42px;
            padding: 0 14px;
            border-radius: 11px;
            border: 1px solid rgba(90,55,38,.12);
            background: rgba(255,253,249,.94);
            color: #5d4234;
            font: inherit;
            font-size: 12px;
            font-weight: 750;
            cursor: pointer;
          }

          .summary-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 14px;
            margin-bottom: 18px;
          }

          .summary-card {
            min-height: 126px;
            display: grid;
            grid-template-columns: 50px 1fr;
            align-items: center;
            gap: 14px;
            padding: 18px;
            border-radius: 17px;
            background: rgba(255,253,249,.96);
            border: 1px solid rgba(90,55,38,.10);
            box-shadow: 0 9px 25px rgba(43,24,18,.045);
          }

          .summary-card-icon {
            width: 50px;
            height: 50px;
            display: grid;
            place-items: center;
            border-radius: 14px;
            color: #6e4934;
            background: #f1e4d5;
            font-size: 19px;
            font-weight: 850;
          }

          .summary-card-icon.pending {
            color: #866438;
            background: #f8efdf;
          }

          .summary-card-icon.active {
            color: #466b4c;
            background: #e9f1e9;
          }

          .summary-card-icon.disabled {
            color: #995047;
            background: #f8e9e6;
          }

          .summary-card span {
            color: #765f52;
            font-size: 12px;
            font-weight: 750;
          }

          .summary-card strong {
            margin-top: 3px;
            color: #2f211b;
            font-size: 29px;
            line-height: 1;
          }

          .summary-card small {
            display: block;
            margin-top: 7px;
            color: #97867b;
            font-size: 10px;
          }

          .message {
            border-radius: 12px;
          }

          .table-card {
            border-radius: 19px;
            background: rgba(255,253,249,.96);
            border: 1px solid rgba(90,55,38,.10);
            box-shadow: 0 12px 32px rgba(43,24,18,.055);
          }

          .table-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            padding: 21px 22px 16px;
            border-bottom: none;
          }

          .table-header h2 {
            margin-top: 4px;
            color: #2b1812;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 25px;
          }

          .table-header p {
            margin: 6px 0 0;
            color: #8a796e;
            font-size: 11px;
          }

          .admin-control-badge {
            min-height: 34px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 0 11px;
            border-radius: 999px;
            color: #4a6b4f;
            background: #edf4ed;
            border: 1px solid #d8e7da;
            font-size: 10px;
            font-weight: 750;
          }

          .admin-control-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #628267;
            animation: adminPulse 2s ease-in-out infinite;
          }

          .admin-toolbar {
            display: grid;
            grid-template-columns: minmax(280px, 1fr) 180px 235px auto;
            gap: 10px;
            padding: 0 22px 18px;
          }

          .admin-search {
            min-height: 45px;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 0 12px;
            border-radius: 11px;
            background: white;
            border: 1px solid rgba(90,55,38,.13);
          }

          .admin-search > span {
            color: #9a7d69;
            font-size: 20px;
          }

          .admin-search input {
            width: 100%;
            height: 42px;
            border: none;
            outline: none;
            background: transparent;
            color: #49352b;
            font: inherit;
            font-size: 12px;
          }

          .toolbar-select {
            min-height: 45px;
            padding: 0 10px;
            border-radius: 11px;
            border: 1px solid rgba(90,55,38,.13);
            outline: none;
            color: #49352b;
            background: white;
            font: inherit;
            font-size: 12px;
          }

          .clear-filter-button,
          .empty-reset-button {
            min-height: 45px;
            padding: 0 13px;
            border-radius: 11px;
            border: 1px solid rgba(90,55,38,.10);
            background: #f4e9de;
            color: #6b4c3d;
            font: inherit;
            font-size: 11px;
            font-weight: 750;
            cursor: pointer;
          }

          .table-container {
            border-top: 1px solid rgba(90,55,38,.08);
          }

          .user-table {
            min-width: 1080px;
          }

          .user-table th {
            background: #f8f2eb;
            color: #7f6b5f;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: .65px;
          }

          .user-table td {
            border-color: rgba(90,55,38,.075);
            color: #4a372e;
            font-size: 12px;
          }

          .user-table tbody tr:hover {
            background: #fcf8f3;
          }

          .user-identity {
            min-width: 235px;
            display: flex;
            align-items: center;
            gap: 11px;
          }

          .user-avatar {
            width: 40px;
            height: 40px;
            flex-shrink: 0;
            display: grid;
            place-items: center;
            border-radius: 11px;
            color: #fff8ef;
            background: linear-gradient(145deg, #8b5a3d, #543226);
            font-size: 11px;
            font-weight: 850;
          }

          .user-name {
            color: #34231c;
            font-size: 13px;
            font-weight: 750;
          }

          .user-email {
            color: #8d7b70;
            font-size: 11px;
          }

          .role-select {
            height: 40px;
            border-radius: 10px;
            border-color: rgba(90,55,38,.13);
            color: #49352b;
            font-size: 11px;
          }

          .role-select:focus {
            border-color: #9a633f;
          }

          .status {
            min-height: 30px;
            align-items: center;
            gap: 7px;
            padding: 0 10px;
            font-size: 10px;
            font-weight: 800;
          }

          .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: currentColor;
          }

          .status-pending {
            color: #816139;
            background: #f8efdf;
          }

          .status-active {
            color: #44694a;
            background: #edf4ed;
          }

          .status-disabled {
            color: #99483f;
            background: #fff0ed;
          }

          .action-button {
            border-radius: 9px;
            height: 35px;
            font-size: 10px;
            font-weight: 800;
          }

          .approve-button {
            background: #4c714f;
          }

          .disable-button {
            color: #805d35;
            background: #f8efdf;
          }

          .enable-button {
            color: #456a4b;
            background: #edf4ed;
          }

          .delete-user-button {
            color: #fff;
            background: #9f473d;
          }

          .loading-box,
          .empty-box {
            min-height: 260px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 6px;
            color: #8a796f;
          }

          .loading-box strong,
          .empty-box strong {
            color: #3d2c24;
            font-size: 14px;
          }

          .loading-box span,
          .empty-box span {
            font-size: 11px;
          }

          .admin-loader {
            width: 34px;
            height: 34px;
            margin-bottom: 8px;
            border-radius: 50%;
            border: 3px solid #e7dcd1;
            border-top-color: #754b35;
            animation: adminSpin .8s linear infinite;
          }

          .empty-state-icon {
            width: 48px;
            height: 48px;
            display: grid;
            place-items: center;
            margin-bottom: 7px;
            border-radius: 14px;
            color: #78533e;
            background: #f2e5d6;
            font-size: 20px;
          }

          .empty-reset-button {
            margin-top: 8px;
            min-height: 38px;
          }

          .admin-delete-overlay {
            background: rgba(43,24,18,.58);
            backdrop-filter: blur(8px);
          }

          .admin-delete-modal {
            border-radius: 20px;
            background: #fffaf6;
            box-shadow: 0 28px 80px rgba(43,24,18,.24);
          }

          .admin-delete-icon {
            border-radius: 14px;
            background: #fff0ed;
            color: #a34b42;
          }

          .admin-delete-modal h2 {
            color: #6f2d27;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 25px;
          }

          .admin-delete-user {
            border-radius: 12px;
            background: #f8f2ec;
            border-color: rgba(90,55,38,.09);
          }

          .admin-delete-input {
            height: 49px;
            border-radius: 11px;
          }

          @media (max-width: 1150px) {
            .summary-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .admin-toolbar {
              grid-template-columns: 1fr 1fr;
            }

            .admin-search {
              grid-column: 1 / -1;
            }
          }

          @media (max-width: 760px) {
            .admin-page {
              padding: 20px 14px 40px;
            }

            .admin-header h1 {
              font-size: 34px;
            }

            .summary-grid,
            .admin-toolbar {
              grid-template-columns: 1fr;
            }

            .admin-search {
              grid-column: auto;
            }

            .table-header {
              flex-direction: column;
            }

            .clear-filter-button {
              width: 100%;
            }
          }

          @media (max-width: 850px) {
            .admin-page {
              padding: 20px;
            }


            .summary-grid {
              grid-template-columns: 1fr;
            }


            .admin-header {
              align-items: flex-start;
              gap: 15px;
              flex-direction: column;
            }
          }
        `}
      </style>

      <div className="admin-page">
        <div className="admin-wrapper">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="admin-header">
            <div>
              <span className="admin-kicker">ADMINISTRATION</span>
              <h1>User Management</h1>
              <p>
                Manage registrations, approvals, roles and account access from
                one secure administrator workspace.
              </p>
            </div>

            <div className="admin-header-actions">
              <button
                type="button"
                className="refresh-users-button"
                onClick={loadUsers}
                disabled={loading}
              >
                {loading ? "Refreshing..." : "↻ Refresh"}
              </button>

              <UserMenu />
            </div>
          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-card-icon total">👥</div>
              <div>
                <span>Total Users</span>
                <strong>{users.length}</strong>
                <small>Registered accounts</small>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-card-icon pending">◷</div>
              <div>
                <span>Pending Approval</span>
                <strong>{pendingCount}</strong>
                <small>Awaiting administrator review</small>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-card-icon active">✓</div>
              <div>
                <span>Active Users</span>
                <strong>{activeCount}</strong>
                <small>Approved with system access</small>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-card-icon disabled">⊘</div>
              <div>
                <span>Disabled</span>
                <strong>{disabledCount}</strong>
                <small>Access currently blocked</small>
              </div>
            </div>
          </div>

          {/* =================================================
              MESSAGES
          ================================================= */}

          {error && <div className="message error-message">{error}</div>}

          {success && <div className="message success-message">{success}</div>}

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="table-card">
            <div className="table-header">
              <div>
                <span className="table-kicker">ACCESS DIRECTORY</span>
                <h2>System Users</h2>
                <p>
                  {loading
                    ? "Loading user accounts..."
                    : `${filteredUsers.length} of ${users.length} accounts shown`}
                </p>
              </div>

              <span className="admin-control-badge">
                <span className="admin-control-dot" />
                Admin Controls Active
              </span>
            </div>

            <div className="admin-toolbar">
              <div className="admin-search">
                <span>⌕</span>
                <input
                  type="search"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search name, email or role..."
                />
              </div>

              <select
                className="toolbar-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="DISABLED">Disabled</option>
              </select>

              <select
                className="toolbar-select"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Administrator</option>
                <option value="BEAN_QUALITY_INSPECTOR">
                  Bean Quality Inspector
                </option>
                <option value="POWDER_QUALITY_INSPECTOR">
                  Powder Quality Inspector
                </option>
                <option value="PACKAGING_QUALITY_INSPECTOR">
                  Packaging Quality Inspector
                </option>
                <option value="SALES_ANALYST">Sales Analyst</option>
              </select>

              {hasFilters && (
                <button
                  type="button"
                  className="clear-filter-button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="loading-box">
                <div className="admin-loader" />
                <strong>Loading users...</strong>
                <span>
                  Retrieving the latest roles, approvals and account status.
                </span>
              </div>
            ) : users.length === 0 ? (
              <div className="empty-box">
                <div className="empty-state-icon">👥</div>
                <strong>No users found</strong>
                <span>Registered accounts will appear here.</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-box">
                <div className="empty-state-icon">⌕</div>
                <strong>No matching users</strong>
                <span>Change the search text or filters and try again.</span>
                <button
                  type="button"
                  className="empty-reset-button"
                  onClick={clearFilters}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>User</th>

                      <th>Requested Role</th>

                      <th>Current Role</th>

                      <th>Status</th>

                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user) => {
                      const isBusy = actionLoading === user.id;

                      const isAdmin = user.role === "ADMIN";

                      return (
                        <tr key={user.id}>
                          {/* ===============================
                              USER
                          =============================== */}

                          <td>
                            <div className="user-name">
                              {user.first_name} {user.last_name}
                            </div>

                            <div className="user-email">{user.email}</div>
                          </td>

                          {/* ===============================
                              REQUESTED ROLE
                          =============================== */}

                          <td>{getRoleLabel(user.requested_role)}</td>

                          {/* ===============================
                              CURRENT ROLE
                          =============================== */}

                          <td>
                            {isAdmin ? (
                              <strong>Admin</strong>
                            ) : (
                              <select
                                className="role-select"
                                value={user.role || ""}
                                disabled={isBusy || !user.is_approved}
                                onChange={(event) =>
                                  handleRoleChange(user.id, event.target.value)
                                }
                              >
                                <option value="">Not Assigned</option>

                                <option value="BEAN_QUALITY_INSPECTOR">
                                  Bean Quality Inspector
                                </option>

                                <option value="POWDER_QUALITY_INSPECTOR">
                                  Powder Quality Inspector
                                </option>

                                <option value="PACKAGING_QUALITY_INSPECTOR">
                                  Packaging Quality Inspector
                                </option>

                                <option value="SALES_ANALYST">
                                  Sales Analyst
                                </option>
                              </select>
                            )}
                          </td>

                          {/* ===============================
                              STATUS
                          =============================== */}

                          <td>
                            {!user.is_approved ? (
                              <span className="status status-pending">
                                Pending
                              </span>
                            ) : user.is_active ? (
                              <span className="status status-active">
                                Active
                              </span>
                            ) : (
                              <span className="status status-disabled">
                                Disabled
                              </span>
                            )}
                          </td>

                          {/* ===============================
                              ACTIONS
                          =============================== */}

                          <td>
                            {isAdmin ? (
                              <span className="protected-admin">
                                Protected Admin
                              </span>
                            ) : (
                              <div className="action-buttons">
                                {/* APPROVE */}

                                {!user.is_approved && (
                                  <button
                                    type="button"
                                    className="
                                      action-button
                                      approve-button
                                    "
                                    disabled={isBusy}
                                    onClick={() => handleApprove(user.id)}
                                  >
                                    {isBusy ? "Processing..." : "Approve"}
                                  </button>
                                )}

                                {/* DISABLE */}

                                {user.is_approved && user.is_active && (
                                  <button
                                    type="button"
                                    className="
                                      action-button
                                      disable-button
                                    "
                                    disabled={isBusy}
                                    onClick={() => handleDisable(user.id)}
                                  >
                                    Disable
                                  </button>
                                )}

                                {/* ENABLE */}

                                {user.is_approved && !user.is_active && (
                                  <button
                                    type="button"
                                    className="
                                      action-button
                                      enable-button
                                    "
                                    disabled={isBusy}
                                    onClick={() => handleEnable(user.id)}
                                  >
                                    Enable
                                  </button>
                                )}

                                {/* DELETE */}

                                <button
                                  type="button"
                                  className="
                                    action-button
                                    delete-user-button
                                  "
                                  disabled={isBusy}
                                  onClick={() => openDeleteModal(user)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          DELETE CONFIRMATION MODAL
      ================================================= */}

      {deleteTarget && (
        <div className="admin-delete-overlay">
          <div className="admin-delete-modal">
            <div className="admin-delete-icon">!</div>

            <h2>Delete User?</h2>

            <p className="admin-delete-description">
              This will permanently remove this user account from the system.
              This action cannot be undone.
            </p>

            <div className="admin-delete-user">
              <strong>
                {deleteTarget.first_name} {deleteTarget.last_name}
              </strong>

              <span>{deleteTarget.email}</span>
            </div>

            <label className="admin-delete-label">
              Type <strong>DELETE</strong> to confirm
            </label>

            <input
              type="text"
              className="admin-delete-input"
              value={deleteConfirmText}
              onChange={(event) => setDeleteConfirmText(event.target.value)}
              placeholder="DELETE"
              autoFocus
            />

            {deleteError && (
              <div className="admin-delete-error">{deleteError}</div>
            )}

            <div className="admin-delete-actions">
              <button
                type="button"
                className="admin-delete-cancel"
                onClick={closeDeleteModal}
                disabled={actionLoading === deleteTarget.id}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-delete-confirm"
                onClick={handleDeleteUser}
                disabled={actionLoading === deleteTarget.id}
              >
                {actionLoading === deleteTarget.id
                  ? "Deleting..."
                  : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserManagementPage;

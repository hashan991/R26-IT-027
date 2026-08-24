import { useEffect, useState } from "react";

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
              <h1>User Management</h1>

              <p>Manage registrations, roles, approvals and account access.</p>
            </div>

            <UserMenu />
          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="summary-grid">
            <div className="summary-card">
              <span>Total Users</span>

              <strong>{users.length}</strong>
            </div>

            <div className="summary-card">
              <span>Pending Approval</span>

              <strong>{pendingCount}</strong>
            </div>

            <div className="summary-card">
              <span>Active Users</span>

              <strong>{activeCount}</strong>
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
              <h2>System Users</h2>
            </div>

            {loading ? (
              <div className="loading-box">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="empty-box">No users found.</div>
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
                    {users.map((user) => {
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

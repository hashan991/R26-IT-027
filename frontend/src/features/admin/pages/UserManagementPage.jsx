import { useEffect, useState } from "react";
import UserMenu from "../../../shared/components/UserMenu";

import {
  getAllUsers,
  approveUser,
  disableUser,
  enableUser,
  changeUserRole,
} from "../services/adminService";

function UserManagementPage() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

      setSuccess(result.message);

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

      setSuccess(result.message);

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

      setSuccess(result.message);

      await loadUsers();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to enable user.");
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // CHANGE ROLE
  // =========================================================

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionLoading(userId);
      setError("");
      setSuccess("");

      const result = await changeUserRole(userId, newRole);

      setSuccess(result.message);

      await loadUsers();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to change user role.");
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

  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

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

          .admin-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
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

          .admin-badge {
            padding: 9px 14px;
            border-radius: 20px;
            background: #dcefe4;
            color: #1f6a43;
            font-size: 13px;
            font-weight: 600;
          }

          .summary-grid {
            display: grid;
            grid-template-columns:
              repeat(3, 1fr);
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

          .enable-button {
            background: #e7f2ff;
            color: #1769aa;
          }

          .action-button:disabled,
          .role-select:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }

          .loading-box,
          .empty-box {
            padding: 50px;
            text-align: center;
            color: #738078;
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
          <div className="admin-header">
            <div>
              <h1>User Management</h1>

              <p>Manage registrations, roles, approvals and account access.</p>
            </div>

            <UserMenu />
          </div>

          <div className="summary-grid">
            <div className="summary-card">
              <span>Total Users</span>

              <strong>{users.length}</strong>
            </div>

            <div className="summary-card">
              <span>Pending Approval</span>

              <strong>
                {users.filter((user) => !user.is_approved).length}
              </strong>
            </div>

            <div className="summary-card">
              <span>Active Users</span>

              <strong>
                {
                  users.filter((user) => user.is_active && user.is_approved)
                    .length
                }
              </strong>
            </div>
          </div>

          {error && <div className="message error-message">{error}</div>}

          {success && <div className="message success-message">{success}</div>}

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

                      return (
                        <tr key={user.id}>
                          <td>
                            <div className="user-name">
                              {user.first_name} {user.last_name}
                            </div>

                            <div className="user-email">{user.email}</div>
                          </td>

                          <td>{getRoleLabel(user.requested_role)}</td>

                          <td>
                            {user.role === "ADMIN" ? (
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

                          <td>
                            {!user.is_approved ? (
                              <span
                                className="
                                  status
                                  status-pending
                                "
                              >
                                Pending
                              </span>
                            ) : user.is_active ? (
                              <span
                                className="
                                  status
                                  status-active
                                "
                              >
                                Active
                              </span>
                            ) : (
                              <span
                                className="
                                  status
                                  status-disabled
                                "
                              >
                                Disabled
                              </span>
                            )}
                          </td>

                          <td>
                            {user.role === "ADMIN" ? (
                              <span>Protected Admin</span>
                            ) : (
                              <div className="action-buttons">
                                {!user.is_approved && (
                                  <button
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

                                {user.is_approved && user.is_active && (
                                  <button
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

                                {user.is_approved && !user.is_active && (
                                  <button
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
    </>
  );
}

export default UserManagementPage;

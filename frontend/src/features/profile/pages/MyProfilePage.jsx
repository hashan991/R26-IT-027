import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  deleteMyAccount,
} from "../services/profileService";

function MyProfilePage() {
  const navigate = useNavigate();

  // ======================================================
  // PROFILE STATE
  // ======================================================

  const [profile, setProfile] = useState(null);

  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
  });

  // ======================================================
  // PASSWORD STATE
  // ======================================================

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ======================================================
  // UI STATE
  // ======================================================

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");

  const [profileError, setProfileError] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");

  const [passwordError, setPasswordError] = useState("");

  const [deleteError, setDeleteError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // ======================================================
  // LOAD PROFILE
  // ======================================================

  const loadProfile = async () => {
    try {
      setLoading(true);

      const data = await getMyProfile();

      setProfile(data);

      setProfileForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
      });
    } catch (error) {
      console.error("Failed to load profile:", error);

      setProfileError(
        error.response?.data?.detail || "Failed to load your profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // ======================================================
  // PROFILE FORM CHANGE
  // ======================================================

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================================
  // UPDATE PROFILE
  // ======================================================

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    setProfileMessage("");
    setProfileError("");

    if (!profileForm.first_name.trim()) {
      setProfileError("First name is required.");
      return;
    }

    if (!profileForm.last_name.trim()) {
      setProfileError("Last name is required.");
      return;
    }

    try {
      setSavingProfile(true);

      const updatedProfile = await updateMyProfile({
        first_name: profileForm.first_name.trim(),

        last_name: profileForm.last_name.trim(),
      });

      setProfile(updatedProfile);

      setProfileForm({
        first_name: updatedProfile.first_name || "",

        last_name: updatedProfile.last_name || "",
      });

      // Update locally stored user information
      // if your application keeps the user there.
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsedUser,
              first_name: updatedProfile.first_name,

              last_name: updatedProfile.last_name,

              email: updatedProfile.email,

              role: updatedProfile.role,
            }),
          );
        } catch (error) {
          console.warn("Could not update local user:", error);
        }
      }

      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update failed:", error);

      setProfileError(
        error.response?.data?.detail || "Failed to update profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // ======================================================
  // PASSWORD FORM
  // ======================================================

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================================
  // CHANGE PASSWORD
  // ======================================================

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError("Please complete all password fields.");

      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");

      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must contain at least 8 characters.");

      return;
    }

    try {
      setChangingPassword(true);

      await changeMyPassword({
        currentPassword: passwordForm.currentPassword,

        newPassword: passwordForm.newPassword,

        confirmPassword: passwordForm.confirmPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordMessage("Password changed successfully.");
    } catch (error) {
      console.error("Password change failed:", error);

      setPasswordError(
        error.response?.data?.detail || "Failed to change password.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // ======================================================
  // DELETE ACCOUNT
  // ======================================================

  const handleDeleteAccount = async () => {
    setDeleteError("");

    if (deleteConfirmation !== "DELETE") {
      setDeleteError('Please type "DELETE" to confirm.');

      return;
    }

    try {
      setDeletingAccount(true);

      await deleteMyAccount();

      // Remove authentication information
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      sessionStorage.removeItem("session_expired");

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Account deletion failed:", error);

      setDeleteError(
        error.response?.data?.detail || "Failed to delete account.",
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  // ======================================================
  // FORMAT ROLE
  // ======================================================

  const formatRole = (role) => {
    if (!role) {
      return "N/A";
    }

    return role
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // ======================================================
  // PROFILE INITIALS
  // ======================================================

  const getInitials = () => {
    const first = profile?.first_name?.charAt(0) || "";

    const last = profile?.last_name?.charAt(0) || "";

    return `${first}${last}`.toUpperCase();
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* ==========================================
            PAGE HEADER
        ========================================== */}

        <div className="profile-page-header">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <div>
            <span className="profile-kicker">ACCOUNT SETTINGS</span>

            <h1>My Profile</h1>

            <p>Manage your personal information and account security.</p>
          </div>
        </div>

        {/* ==========================================
            PROFILE OVERVIEW
        ========================================== */}

        <div className="profile-overview-card">
          <div className="profile-avatar">{getInitials()}</div>

          <div className="profile-overview-info">
            <h2>
              {profile?.first_name} {profile?.last_name}
            </h2>

            <p>{profile?.email}</p>

            <div className="profile-badges">
              <span className="role-badge">{formatRole(profile?.role)}</span>

              <span
                className={
                  profile?.is_active
                    ? "status-badge active"
                    : "status-badge inactive"
                }
              >
                {profile?.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* ==========================================
            PERSONAL INFORMATION
        ========================================== */}

        <div className="profile-card">
          <div className="card-heading">
            <div>
              <span>PERSONAL INFORMATION</span>

              <h2>Profile Details</h2>

              <p>Update your personal name information.</p>
            </div>
          </div>

          {profileMessage && (
            <div className="message success">{profileMessage}</div>
          )}

          {profileError && <div className="message error">{profileError}</div>}

          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-grid">
              <div className="form-group">
                <label>First Name</label>

                <input
                  type="text"
                  name="first_name"
                  value={profileForm.first_name}
                  onChange={handleProfileChange}
                  placeholder="First name"
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>

                <input
                  type="text"
                  name="last_name"
                  value={profileForm.last_name}
                  onChange={handleProfileChange}
                  placeholder="Last name"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>

                <div className="locked-input">
                  <input type="email" value={profile?.email || ""} disabled />

                  <span>🔒</span>
                </div>

                <small>
                  Email address cannot be changed from your profile.
                </small>
              </div>

              <div className="form-group">
                <label>Account Role</label>

                <div className="locked-input">
                  <input
                    type="text"
                    value={formatRole(profile?.role)}
                    disabled
                  />

                  <span>🔒</span>
                </div>

                <small>Role is managed by the administrator.</small>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={savingProfile}
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* ==========================================
            CHANGE PASSWORD
        ========================================== */}

        <div className="profile-card">
          <div className="card-heading">
            <div>
              <span>ACCOUNT SECURITY</span>

              <h2>Change Password</h2>

              <p>Enter your current password before creating a new password.</p>
            </div>
          </div>

          {passwordMessage && (
            <div className="message success">{passwordMessage}</div>
          )}

          {passwordError && (
            <div className="message error">{passwordError}</div>
          )}

          <form onSubmit={handlePasswordSubmit} className="profile-form">
            <div className="form-group full">
              <label>Current Password</label>

              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>New Password</label>

                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="password-note">
              New password must contain at least 8 characters.
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="secondary-button"
                disabled={changingPassword}
              >
                {changingPassword ? "Changing Password..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>

        {/* ==========================================
            ACCOUNT INFORMATION
        ========================================== */}

        <div className="profile-card">
          <div className="card-heading">
            <div>
              <span>ACCOUNT INFORMATION</span>

              <h2>Account Status</h2>
            </div>
          </div>

          <div className="account-info-grid">
            <div>
              <span>Account Status</span>

              <strong>{profile?.is_active ? "Active" : "Inactive"}</strong>
            </div>

            <div>
              <span>Approval Status</span>

              <strong>{profile?.is_approved ? "Approved" : "Pending"}</strong>
            </div>

            <div>
              <span>Role</span>

              <strong>{formatRole(profile?.role)}</strong>
            </div>

            <div>
              <span>Requested Role</span>

              <strong>{formatRole(profile?.requested_role)}</strong>
            </div>
          </div>
        </div>

        {/* ==========================================
            DANGER ZONE
        ========================================== */}

        <div className="danger-card">
          <div>
            <span className="danger-label">DANGER ZONE</span>

            <h2>Delete Account</h2>

            <p>
              Permanently delete your account. This action cannot be undone.
            </p>
          </div>

          <button
            type="button"
            className="delete-button"
            onClick={() => {
              setDeleteConfirmation("");
              setDeleteError("");
              setShowDeleteModal(true);
            }}
          >
            Delete My Account
          </button>
        </div>
      </div>

      {/* ==========================================
          DELETE MODAL
      ========================================== */}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="delete-icon">!</div>

            <h2>Delete Your Account?</h2>

            <p>This permanently removes your account and cannot be undone.</p>

            <label>
              Type <strong>DELETE</strong> to confirm
            </label>

            <input
              type="text"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              placeholder="DELETE"
            />

            {deleteError && <div className="message error">{deleteError}</div>}

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingAccount}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete-button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
              >
                {deletingAccount ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          CSS
      ========================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }


        .profile-page {
          min-height: 100vh;
          padding: 36px 20px 70px;
          background:
            radial-gradient(
              circle at top right,
              rgba(159, 94, 48, 0.16),
              transparent 38%
            ),
            #100c09;
          color: #f7e5ce;
        }


        .profile-container {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
        }


        .profile-page-header {
          display: flex;
          gap: 22px;
          align-items: flex-start;
          margin-bottom: 20px;
        }


        .back-button {
          border: 1px solid
            rgba(255, 223, 184, 0.12);
          border-radius: 11px;
          padding: 9px 13px;
          background:
            rgba(255,255,255,0.025);
          color: #d9b88e;
          cursor: pointer;
        }


        .profile-kicker,
        .card-heading span {
          color: #d69b5b;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }


        .profile-page-header h1 {
          margin: 5px 0;
          font-size: 30px;
          color: #fff0da;
        }


        .profile-page-header p,
        .card-heading p {
          margin: 0;
          color:
            rgba(255, 235, 210, 0.46);
          font-size: 12px;
        }


        .profile-overview-card,
        .profile-card,
        .danger-card {
          border:
            1px solid
            rgba(255, 222, 178, 0.09);
          border-radius: 22px;
          background:
            rgba(255, 255, 255, 0.025);
        }


        .profile-overview-card {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 22px;
          margin-bottom: 16px;
        }


        .profile-avatar {
          width: 70px;
          height: 70px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 50%;
          background:
            linear-gradient(
              135deg,
              #d99d5c,
              #80502f
            );
          color: #201109;
          font-size: 22px;
          font-weight: 900;
        }


        .profile-overview-info h2 {
          margin: 0;
          color: #ffecd3;
          font-size: 22px;
        }


        .profile-overview-info p {
          margin: 4px 0 10px;
          color:
            rgba(255, 235, 210, 0.46);
          font-size: 11px;
        }


        .profile-badges {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }


        .role-badge,
        .status-badge {
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 900;
        }


        .role-badge {
          color: #f2bf7c;
          background:
            rgba(222, 156, 87, 0.08);
          border:
            1px solid
            rgba(222, 156, 87, 0.15);
        }


        .status-badge.active {
          color: #9ed9a8;
          background:
            rgba(80, 180, 100, 0.07);
        }


        .status-badge.inactive {
          color: #ff9a89;
        }


        .profile-card {
          padding: 22px;
          margin-bottom: 16px;
        }


        .card-heading {
          margin-bottom: 18px;
        }


        .card-heading h2 {
          margin: 5px 0;
          color: #ffe9cc;
          font-size: 19px;
        }


        .profile-form {
          margin-top: 15px;
        }


        .form-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 14px;
        }


        .form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }


        .form-group.full {
          margin-bottom: 14px;
        }


        .form-group label,
        .delete-modal label {
          color: #d8bc99;
          font-size: 10px;
          font-weight: 700;
        }


        .form-group input,
        .delete-modal input {
          width: 100%;
          border:
            1px solid
            rgba(255, 225, 190, 0.1);
          border-radius: 11px;
          outline: none;
          padding: 12px 13px;
          background:
            rgba(0, 0, 0, 0.18);
          color: #f4ddc0;
          font-size: 11px;
        }


        .form-group input:focus,
        .delete-modal input:focus {
          border-color:
            rgba(220, 158, 92, 0.55);
        }


        .form-group input:disabled {
          cursor: not-allowed;
          color:
            rgba(244, 221, 192, 0.5);
          background:
            rgba(0, 0, 0, 0.25);
        }


        .locked-input {
          position: relative;
        }


        .locked-input span {
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          font-size: 10px;
        }


        .locked-input input {
          padding-right: 35px;
        }


        .form-group small {
          color:
            rgba(255, 230, 200, 0.3);
          font-size: 8px;
        }


        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 18px;
        }


        .primary-button,
        .secondary-button,
        .delete-button,
        .cancel-button,
        .confirm-delete-button {
          border: none;
          border-radius: 11px;
          padding: 11px 17px;
          cursor: pointer;
          font-size: 10px;
          font-weight: 800;
        }


        .primary-button {
          background: #d99d5c;
          color: #25140b;
        }


        .secondary-button {
          background:
            rgba(217, 157, 92, 0.12);
          color: #f0c187;
          border:
            1px solid
            rgba(217, 157, 92, 0.2);
        }


        button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }


        .message {
          margin: 12px 0;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 10px;
        }


        .message.success {
          color: #a9e1b0;
          background:
            rgba(72, 177, 92, 0.08);
          border:
            1px solid
            rgba(72, 177, 92, 0.16);
        }


        .message.error {
          color: #ff9e8c;
          background:
            rgba(220, 74, 57, 0.08);
          border:
            1px solid
            rgba(220, 74, 57, 0.16);
        }


        .password-note {
          margin-top: 10px;
          color:
            rgba(255, 231, 200, 0.35);
          font-size: 8px;
        }


        .account-info-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 10px;
        }


        .account-info-grid > div {
          padding: 12px;
          border-radius: 12px;
          background:
            rgba(255, 255, 255, 0.025);
        }


        .account-info-grid span {
          display: block;
          color:
            rgba(255, 235, 210, 0.34);
          font-size: 8px;
        }


        .account-info-grid strong {
          display: block;
          margin-top: 4px;
          color: #ebc89e;
          font-size: 10px;
        }


        .danger-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 22px;
          border-color:
            rgba(230, 74, 61, 0.15);
        }


        .danger-label {
          color: #ef7f6f;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }


        .danger-card h2 {
          margin: 5px 0;
          color: #ffb2a5;
          font-size: 18px;
        }


        .danger-card p {
          margin: 0;
          color:
            rgba(255, 211, 204, 0.4);
          font-size: 10px;
        }


        .delete-button {
          flex-shrink: 0;
          color: #ff9887;
          background:
            rgba(223, 68, 51, 0.08);
          border:
            1px solid
            rgba(223, 68, 51, 0.18);
        }


        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          padding: 20px;
          background:
            rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(8px);
        }


        .delete-modal {
          width: min(440px, 100%);
          padding: 25px;
          border-radius: 21px;
          background: #17100c;
          border:
            1px solid
            rgba(239, 92, 73, 0.18);
          box-shadow:
            0 25px 70px
            rgba(0, 0, 0, 0.45);
        }


        .delete-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #ff9c89;
          background:
            rgba(225, 72, 53, 0.1);
          font-weight: 900;
        }


        .delete-modal h2 {
          margin: 14px 0 7px;
          color: #ffb1a3;
        }


        .delete-modal p {
          margin: 0 0 18px;
          color:
            rgba(255, 220, 210, 0.43);
          font-size: 10px;
          line-height: 1.6;
        }


        .delete-modal input {
          margin-top: 7px;
        }


        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          margin-top: 18px;
        }


        .cancel-button {
          background:
            rgba(255,255,255,0.04);
          color: #d9bfa1;
        }


        .confirm-delete-button {
          color: #fff0ed;
          background: #b94d3e;
        }


        .profile-loading {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: #100c09;
          color: #d8b891;
        }


        @media(max-width: 750px) {

          .form-grid,
          .account-info-grid {
            grid-template-columns: 1fr;
          }


          .danger-card,
          .profile-page-header {
            flex-direction: column;
            align-items: stretch;
          }


          .profile-overview-card {
            align-items: flex-start;
          }


          .delete-button {
            width: 100%;
          }
        }

      `}</style>
    </div>
  );
}

export default MyProfilePage;

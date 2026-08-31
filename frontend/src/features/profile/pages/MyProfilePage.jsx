import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  deleteMyAccount,
} from "../services/profileService";

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
    arrowLeft: (
      <>
        <path d="M19 12H5" />
        <path d="m10 17-5-5 5-5" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 19 6v5c0 4.5-2.8 7.6-7 10-4.2-2.4-7-5.5-7-10V6l7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    warning: (
      <>
        <path d="M10.3 4.6 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v5M14 11v5" />
      </>
    ),
    eye: (
      <>
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.6 6.2A10.9 10.9 0 0 1 12 6c6 0 9.5 6 9.5 6a16.8 16.8 0 0 1-3 3.7" />
        <path d="M6.2 6.2C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6a9.8 9.8 0 0 0 3-.5" />
        <path d="M9.9 9.9A3 3 0 0 0 14.1 14.1" />
      </>
    ),
    key: (
      <>
        <circle cx="8" cy="15" r="4" />
        <path d="m11 12 9-9" />
        <path d="m17 6 2 2" />
        <path d="m14 9 2 2" />
      </>
    ),
    badge: (
      <>
        <circle cx="12" cy="8" r="5" />
        <path d="m9 13-1 8 4-2 4 2-1-8" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  };

  return <svg {...common}>{icons[name] || icons.user}</svg>;
}

function MyProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (profileError) {
      setProfileError("");
    }
  };

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

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (passwordError) {
      setPasswordError("");
    }
  };

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

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

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

  const handleDeleteAccount = async () => {
    setDeleteError("");

    if (deleteConfirmation !== "DELETE") {
      setDeleteError('Please type "DELETE" to confirm.');
      return;
    }

    try {
      setDeletingAccount(true);

      await deleteMyAccount();

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

  const formatRole = (role) => {
    if (!role) {
      return "N/A";
    }

    return role
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getInitials = () => {
    const first = profile?.first_name?.charAt(0) || "";
    const last = profile?.last_name?.charAt(0) || "";

    return `${first}${last}`.toUpperCase();
  };

  const passwordStrength = useMemo(() => {
    const password = passwordForm.newPassword;

    if (!password) {
      return { score: 0, label: "Enter a new password" };
    }

    let score = 0;

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score: 1, label: "Basic" };
    if (score <= 4) return { score: 2, label: "Good" };

    return { score: 3, label: "Strong" };
  }, [passwordForm.newPassword]);

  const passwordsMatch =
    passwordForm.confirmPassword.length > 0 &&
    passwordForm.newPassword === passwordForm.confirmPassword;

  const passwordsDiffer =
    passwordForm.confirmPassword.length > 0 &&
    passwordForm.newPassword !== passwordForm.confirmPassword;

  if (loading) {
    return (
      <>
        <style>{styles}</style>

        <div className="profile-loading">
          <div className="loading-spinner" />
          <strong>Loading your profile...</strong>
          <span>Preparing account settings</span>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="profile-page">
        <div className="profile-container">
          <header className="profile-page-header">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate(-1)}
            >
              <Icon name="arrowLeft" size={17} />
              Back
            </button>

            <div className="page-heading-copy">
              <span className="profile-kicker">ACCOUNT SETTINGS</span>
              <h1>My Profile</h1>
              <p>
                Manage your personal information, account access and security
                settings.
              </p>
            </div>
          </header>

          <section className="profile-overview-card">
            <div className="profile-avatar">{getInitials()}</div>

            <div className="profile-overview-info">
              <div className="profile-overview-heading">
                <div>
                  <h2>
                    {profile?.first_name} {profile?.last_name}
                  </h2>
                  <p>{profile?.email}</p>
                </div>

                <div className="profile-badges">
                  <span className="role-badge">
                    <Icon name="badge" size={13} />
                    {formatRole(profile?.role)}
                  </span>

                  <span
                    className={
                      profile?.is_active
                        ? "status-badge active"
                        : "status-badge inactive"
                    }
                  >
                    <span className="status-dot" />
                    {profile?.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="overview-meta-grid">
                <div>
                  <span>Account approval</span>
                  <strong>
                    {profile?.is_approved ? "Approved" : "Pending Approval"}
                  </strong>
                </div>

                <div>
                  <span>Requested role</span>
                  <strong>{formatRole(profile?.requested_role)}</strong>
                </div>

                <div>
                  <span>Access model</span>
                  <strong>Role-Based</strong>
                </div>
              </div>
            </div>
          </section>

          <div className="profile-layout-grid">
            <section className="profile-card profile-details-card">
              <div className="card-heading">
                <div className="card-icon">
                  <Icon name="edit" size={19} />
                </div>

                <div>
                  <span>PERSONAL INFORMATION</span>
                  <h2>Profile Details</h2>
                  <p>Update the name shown across your quality workspace.</p>
                </div>
              </div>

              {profileMessage && (
                <div className="message success" role="status">
                  <Icon name="check" size={16} />
                  {profileMessage}
                </div>
              )}

              {profileError && (
                <div className="message error" role="alert">
                  <Icon name="warning" size={16} />
                  {profileError}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="profile-first-name">First Name</label>

                    <div className="input-shell">
                      <span className="input-icon">
                        <Icon name="user" size={17} />
                      </span>

                      <input
                        id="profile-first-name"
                        type="text"
                        name="first_name"
                        value={profileForm.first_name}
                        onChange={handleProfileChange}
                        placeholder="First name"
                        autoComplete="given-name"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="profile-last-name">Last Name</label>

                    <div className="input-shell">
                      <span className="input-icon">
                        <Icon name="user" size={17} />
                      </span>

                      <input
                        id="profile-last-name"
                        type="text"
                        name="last_name"
                        value={profileForm.last_name}
                        onChange={handleProfileChange}
                        placeholder="Last name"
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>

                    <div className="input-shell locked">
                      <span className="input-icon">
                        <Icon name="mail" size={17} />
                      </span>

                      <input
                        type="email"
                        value={profile?.email || ""}
                        disabled
                      />

                      <span className="locked-icon">
                        <Icon name="lock" size={14} />
                      </span>
                    </div>

                    <small>
                      Email address cannot be changed from your profile.
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Account Role</label>

                    <div className="input-shell locked">
                      <span className="input-icon">
                        <Icon name="shield" size={17} />
                      </span>

                      <input
                        type="text"
                        value={formatRole(profile?.role)}
                        disabled
                      />

                      <span className="locked-icon">
                        <Icon name="lock" size={14} />
                      </span>
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
                    {savingProfile ? (
                      <>
                        <span className="button-spinner" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Icon name="check" size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            <aside className="account-summary-card">
              <div className="summary-icon">
                <Icon name="shield" size={20} />
              </div>

              <span className="summary-kicker">ACCOUNT ACCESS</span>

              <h3>
                {profile?.is_active && profile?.is_approved
                  ? "Your account is ready."
                  : "Account access is limited."}
              </h3>

              <p>
                Platform access is controlled by your account status and
                approved role.
              </p>

              <div className="summary-list">
                <div>
                  <span>Account</span>
                  <strong>
                    {profile?.is_active ? "Active" : "Inactive"}
                  </strong>
                </div>

                <div>
                  <span>Approval</span>
                  <strong>
                    {profile?.is_approved ? "Approved" : "Pending"}
                  </strong>
                </div>

                <div>
                  <span>Role</span>
                  <strong>{formatRole(profile?.role)}</strong>
                </div>
              </div>
            </aside>
          </div>

          <section className="profile-card security-card">
            <div className="card-heading security-heading">
              <div className="card-icon">
                <Icon name="key" size={19} />
              </div>

              <div>
                <span>ACCOUNT SECURITY</span>
                <h2>Change Password</h2>
                <p>
                  Verify your current password before creating a new one.
                </p>
              </div>
            </div>

            {passwordMessage && (
              <div className="message success" role="status">
                <Icon name="check" size={16} />
                {passwordMessage}
              </div>
            )}

            {passwordError && (
              <div className="message error" role="alert">
                <Icon name="warning" size={16} />
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <div className="form-group full">
                <label htmlFor="current-password">Current Password</label>

                <div className="input-shell">
                  <span className="input-icon">
                    <Icon name="lock" size={17} />
                  </span>

                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowCurrentPassword((current) => !current)
                    }
                    aria-label={
                      showCurrentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                  >
                    <Icon
                      name={showCurrentPassword ? "eyeOff" : "eye"}
                      size={17}
                    />
                  </button>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>

                  <div className="input-shell">
                    <span className="input-icon">
                      <Icon name="lock" size={17} />
                    </span>

                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowNewPassword((current) => !current)
                      }
                      aria-label={
                        showNewPassword
                          ? "Hide new password"
                          : "Show new password"
                      }
                    >
                      <Icon
                        name={showNewPassword ? "eyeOff" : "eye"}
                        size={17}
                      />
                    </button>
                  </div>

                  <div className="password-strength">
                    <span>{passwordStrength.label}</span>

                    <div className="strength-bars">
                      {[1, 2, 3].map((level) => (
                        <i
                          key={level}
                          className={
                            passwordStrength.score >= level
                              ? `active strength-${passwordStrength.score}`
                              : ""
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">
                    Confirm New Password
                  </label>

                  <div className="input-shell">
                    <span className="input-icon">
                      <Icon name="lock" size={17} />
                    </span>

                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      <Icon
                        name={showConfirmPassword ? "eyeOff" : "eye"}
                        size={17}
                      />
                    </button>
                  </div>

                  {passwordsMatch && (
                    <div className="password-match match">
                      <Icon name="check" size={13} />
                      Passwords match
                    </div>
                  )}

                  {passwordsDiffer && (
                    <div className="password-match no-match">
                      <Icon name="warning" size={13} />
                      Passwords do not match
                    </div>
                  )}
                </div>
              </div>

              <div className="security-note">
                <Icon name="shield" size={15} />
                Use at least 8 characters. A mix of uppercase, lowercase,
                numbers and symbols improves password strength.
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="secondary-button"
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <>
                      <span className="button-spinner" />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Icon name="key" size={16} />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          <section className="profile-card account-status-card">
            <div className="card-heading">
              <div className="card-icon">
                <Icon name="badge" size={19} />
              </div>

              <div>
                <span>ACCOUNT INFORMATION</span>
                <h2>Account Status</h2>
                <p>
                  Review the access information attached to your account.
                </p>
              </div>
            </div>

            <div className="account-info-grid">
              <div>
                <span>Account Status</span>
                <strong className={profile?.is_active ? "good" : "bad"}>
                  {profile?.is_active ? "Active" : "Inactive"}
                </strong>
              </div>

              <div>
                <span>Approval Status</span>
                <strong className={profile?.is_approved ? "good" : "waiting"}>
                  {profile?.is_approved ? "Approved" : "Pending"}
                </strong>
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
          </section>

          {profile?.role !== "ADMIN" && (
            <section className="danger-card">
              <div className="danger-copy">
                <span className="danger-label">DANGER ZONE</span>

                <h2>Delete Account</h2>

                <p>
                  Permanently remove your account and authentication access.
                  This action cannot be undone.
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
                <Icon name="trash" size={16} />
                Delete My Account
              </button>
            </section>
          )}
        </div>

        {showDeleteModal && (
          <div
            className="modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget &&
                !deletingAccount
              ) {
                setShowDeleteModal(false);
              }
            }}
          >
            <div className="delete-modal" role="dialog" aria-modal="true">
              <div className="delete-icon">
                <Icon name="warning" size={22} />
              </div>

              <span className="delete-kicker">PERMANENT ACTION</span>

              <h2>Delete your account?</h2>

              <p>
                This permanently removes your account and cannot be undone.
                Type <strong>DELETE</strong> below to confirm.
              </p>

              <label htmlFor="delete-confirmation">
                Confirmation
              </label>

              <input
                id="delete-confirmation"
                type="text"
                value={deleteConfirmation}
                onChange={(event) =>
                  setDeleteConfirmation(event.target.value)
                }
                placeholder="Type DELETE"
                autoComplete="off"
              />

              {deleteError && (
                <div className="message error" role="alert">
                  <Icon name="warning" size={16} />
                  {deleteError}
                </div>
              )}

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
                  {deletingAccount ? (
                    <>
                      <span className="button-spinner" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Icon name="trash" size={15} />
                      Delete Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  :root {
    --profile-espresso: #2b1812;
    --profile-coffee: #5a3726;
    --profile-mocha: #7a4b33;
    --profile-caramel: #c58a4d;
    --profile-caramel-soft: #e5bc8b;
    --profile-cream: #fffaf3;
    --profile-paper: #fcf8f2;
    --profile-foam: #f2e7da;
    --profile-leaf: #5f775f;
    --profile-leaf-dark: #3e5b42;
    --profile-text: #30231d;
    --profile-muted: #7d6e64;
    --profile-border: rgba(90, 55, 38, 0.11);
  }

  @keyframes profileSpin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes profilePulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(95, 119, 95, 0.24);
    }

    50% {
      box-shadow: 0 0 0 7px rgba(95, 119, 95, 0);
    }
  }

  .profile-page {
    min-height: 100%;
    padding: 30px 28px 54px;
    color: var(--profile-text);
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
        circle at 94% 2%,
        rgba(197, 138, 77, 0.10),
        transparent 28%
      ),
      radial-gradient(
        circle at 2% 88%,
        rgba(95, 119, 95, 0.07),
        transparent 28%
      ),
      linear-gradient(180deg, #fbf7f1 0%, #f5eee5 100%);
  }

  .profile-container {
    width: min(1180px, 100%);
    margin: 0 auto;
  }

  .profile-page-header {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 22px;
  }

  .back-button {
    min-height: 41px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0 14px;
    border-radius: 11px;
    border: 1px solid var(--profile-border);
    color: var(--profile-coffee);
    background: rgba(255, 255, 255, 0.74);
    font: inherit;
    font-size: 13px;
    font-weight: 750;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .back-button:hover {
    transform: translateY(-1px);
    background: #fff;
    border-color: rgba(197, 138, 77, 0.26);
  }

  .profile-kicker,
  .card-heading > div:last-child > span,
  .summary-kicker,
  .danger-label,
  .delete-kicker {
    color: var(--profile-mocha);
    font-size: 12px;
    font-weight: 850;
    letter-spacing: 1.25px;
    text-transform: uppercase;
  }

  .profile-page-header h1 {
    margin: 5px 0 0;
    color: var(--profile-espresso);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 36px;
    line-height: 1.1;
    letter-spacing: -1px;
  }

  .profile-page-header p {
    margin: 8px 0 0;
    color: var(--profile-muted);
    font-size: 14px;
    line-height: 1.6;
  }

  .profile-overview-card {
    display: grid;
    grid-template-columns: 86px minmax(0, 1fr);
    gap: 20px;
    padding: 24px;
    border-radius: 22px;
    color: #fff8ef;
    background:
      radial-gradient(
        circle at 92% 10%,
        rgba(224, 169, 107, 0.18),
        transparent 28%
      ),
      linear-gradient(140deg, #4a291d 0%, #28160f 78%);
    border: 1px solid rgba(255,255,255,.05);
    box-shadow: 0 18px 42px rgba(43, 24, 18, 0.13);
  }

  .profile-avatar {
    width: 86px;
    height: 86px;
    display: grid;
    place-items: center;
    border-radius: 22px;
    color: #fff7ec;
    background:
      linear-gradient(
        145deg,
        #9b6745,
        #5b3525
      );
    border: 1px solid rgba(255,255,255,.08);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.08),
      0 12px 25px rgba(0,0,0,.12);
    font-size: 26px;
    font-weight: 850;
  }

  .profile-overview-info {
    min-width: 0;
  }

  .profile-overview-heading {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: flex-start;
  }

  .profile-overview-info h2 {
    margin: 1px 0 0;
    color: #fffaf3;
    font-size: 24px;
    line-height: 1.2;
  }

  .profile-overview-info p {
    margin: 6px 0 0;
    color: #bca696;
    font-size: 13px;
  }

  .profile-badges {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .role-badge,
  .status-badge {
    min-height: 31px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
  }

  .role-badge {
    color: #efc28e;
    background: rgba(197, 138, 77, 0.12);
    border: 1px solid rgba(224, 169, 107, 0.10);
  }

  .status-badge {
    border: 1px solid transparent;
  }

  .status-badge.active {
    color: #d6ead7;
    background: rgba(95, 119, 95, 0.16);
    border-color: rgba(126, 164, 130, 0.08);
  }

  .status-badge.inactive {
    color: #f4c3bc;
    background: rgba(176, 75, 65, 0.12);
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    animation: profilePulse 2s ease-in-out infinite;
  }

  .overview-meta-grid {
    margin-top: 21px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .overview-meta-grid > div {
    padding: 12px 13px;
    border-radius: 12px;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.055);
  }

  .overview-meta-grid span {
    display: block;
    color: #927a69;
    font-size: 10px;
    font-weight: 750;
    letter-spacing: .5px;
    text-transform: uppercase;
  }

  .overview-meta-grid strong {
    display: block;
    margin-top: 5px;
    color: #ead6c3;
    font-size: 13px;
    line-height: 1.4;
  }

  .profile-layout-grid {
    margin-top: 18px;
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(270px, .55fr);
    gap: 18px;
    align-items: start;
  }

  .profile-card,
  .account-summary-card,
  .danger-card {
    border-radius: 19px;
    background: rgba(255, 253, 249, 0.94);
    border: 1px solid var(--profile-border);
    box-shadow: 0 10px 28px rgba(43, 24, 18, 0.045);
  }

  .profile-card {
    padding: 23px;
  }

  .profile-details-card {
    min-height: 100%;
  }

  .card-heading {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 20px;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 12px;
    color: var(--profile-coffee);
    background: #f1e5d7;
  }

  .card-heading h2 {
    margin: 5px 0 0;
    color: var(--profile-espresso);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 23px;
    letter-spacing: -.45px;
  }

  .card-heading p {
    margin: 6px 0 0;
    color: var(--profile-muted);
    font-size: 13px;
    line-height: 1.55;
  }

  .profile-form {
    margin-top: 6px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group.full {
    margin-bottom: 16px;
  }

  .form-group label,
  .delete-modal label {
    color: #4f4037;
    font-size: 13px;
    font-weight: 750;
  }

  .input-shell {
    min-height: 52px;
    position: relative;
    display: flex;
    align-items: center;
    border-radius: 13px;
    background: #fff;
    border: 1px solid rgba(90,55,38,.15);
    transition:
      border-color .2s ease,
      box-shadow .2s ease,
      background .2s ease;
  }

  .input-shell:focus-within {
    border-color: rgba(122,75,51,.50);
    box-shadow: 0 0 0 4px rgba(197,138,77,.10);
  }

  .input-shell.locked {
    background: #f5efe8;
  }

  .input-icon {
    width: 43px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    color: #9b7c67;
  }

  .input-shell input {
    width: 100%;
    height: 50px;
    border: none;
    outline: none;
    padding: 0 12px 0 0;
    color: var(--profile-text);
    background: transparent;
    font: inherit;
    font-size: 13px;
  }

  .input-shell input::placeholder {
    color: #b1a199;
  }

  .input-shell input:disabled {
    cursor: not-allowed;
    color: #8c7c72;
  }

  .locked-icon {
    width: 40px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    color: #9a8779;
  }

  .password-toggle {
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    margin-right: 4px;
    border: none;
    border-radius: 10px;
    color: #8d7767;
    background: transparent;
    cursor: pointer;
    transition: .2s ease;
  }

  .password-toggle:hover {
    color: var(--profile-coffee);
    background: rgba(90,55,38,.06);
  }

  .form-group small {
    color: #9a897e;
    font-size: 11.5px;
    line-height: 1.45;
  }

  .form-actions {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .primary-button,
  .secondary-button,
  .delete-button,
  .cancel-button,
  .confirm-delete-button {
    min-height: 43px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 11px;
    padding: 0 16px;
    font: inherit;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    transition: .2s ease;
  }

  .primary-button {
    border: none;
    color: #fff8ef;
    background:
      linear-gradient(
        135deg,
        var(--profile-coffee),
        var(--profile-espresso)
      );
    box-shadow: 0 11px 24px rgba(43,24,18,.16);
  }

  .primary-button:hover:not(:disabled),
  .secondary-button:hover:not(:disabled),
  .delete-button:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .secondary-button {
    color: #fff8ef;
    background:
      linear-gradient(
        135deg,
        #5b744f,
        #3e5b42
      );
    border: none;
    box-shadow: 0 11px 24px rgba(62,91,66,.14);
  }

  .primary-button:disabled,
  .secondary-button:disabled,
  .delete-button:disabled,
  .cancel-button:disabled,
  .confirm-delete-button:disabled {
    opacity: .58;
    cursor: not-allowed;
    transform: none;
  }

  .button-spinner {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,.35);
    border-top-color: #fff;
    animation: profileSpin .8s linear infinite;
  }

  .message {
    margin: 0 0 16px;
    min-height: 43px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 10px 12px;
    border-radius: 11px;
    font-size: 12px;
    line-height: 1.45;
  }

  .message.success {
    color: #3e6545;
    background: #edf6ee;
    border: 1px solid #d6e8d8;
  }

  .message.error {
    color: #94423a;
    background: #fff1ef;
    border: 1px solid #f1d0cb;
  }

  .account-summary-card {
    padding: 22px;
    position: sticky;
    top: 18px;
  }

  .summary-icon {
    width: 43px;
    height: 43px;
    display: grid;
    place-items: center;
    border-radius: 13px;
    color: var(--profile-leaf-dark);
    background: #e7efe7;
  }

  .summary-kicker {
    display: block;
    margin-top: 18px;
  }

  .account-summary-card h3 {
    margin: 7px 0 0;
    color: var(--profile-espresso);
    font-size: 18px;
  }

  .account-summary-card > p {
    margin: 8px 0 0;
    color: var(--profile-muted);
    font-size: 12px;
    line-height: 1.6;
  }

  .summary-list {
    margin-top: 18px;
    display: grid;
    gap: 8px;
  }

  .summary-list > div {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(90,55,38,.07);
  }

  .summary-list > div:last-child {
    border-bottom: none;
  }

  .summary-list span {
    color: #8f7e73;
    font-size: 11px;
  }

  .summary-list strong {
    max-width: 150px;
    color: #4b382f;
    text-align: right;
    font-size: 11px;
    line-height: 1.4;
  }

  .security-card,
  .account-status-card {
    margin-top: 18px;
  }

  .security-heading {
    margin-bottom: 18px;
  }

  .password-strength {
    min-height: 17px;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 10px;
  }

  .password-strength > span {
    min-width: 95px;
    color: #8f7c70;
    font-size: 11px;
    font-weight: 750;
  }

  .strength-bars {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
  }

  .strength-bars i {
    height: 4px;
    border-radius: 999px;
    background: #eadfd5;
  }

  .strength-bars i.active.strength-1 {
    background: #b77861;
  }

  .strength-bars i.active.strength-2 {
    background: var(--profile-caramel);
  }

  .strength-bars i.active.strength-3 {
    background: var(--profile-leaf);
  }

  .password-match {
    min-height: 17px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
  }

  .password-match.match {
    color: var(--profile-leaf-dark);
  }

  .password-match.no-match {
    color: #9a463d;
  }

  .security-note {
    margin-top: 14px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 11px 12px;
    border-radius: 11px;
    color: #71645c;
    background: rgba(95,119,95,.07);
    border: 1px solid rgba(95,119,95,.09);
    font-size: 12px;
    line-height: 1.55;
  }

  .account-info-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .account-info-grid > div {
    min-height: 94px;
    padding: 15px;
    border-radius: 14px;
    background: #fbf6f0;
    border: 1px solid rgba(90,55,38,.075);
  }

  .account-info-grid span {
    display: block;
    color: #927f73;
    font-size: 11px;
    font-weight: 700;
  }

  .account-info-grid strong {
    display: block;
    margin-top: 8px;
    color: #4b352a;
    font-size: 13px;
    line-height: 1.4;
  }

  .account-info-grid strong.good {
    color: var(--profile-leaf-dark);
  }

  .account-info-grid strong.waiting {
    color: #87683d;
  }

  .account-info-grid strong.bad {
    color: #99433a;
  }

  .danger-card {
    margin-top: 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 22px;
    padding: 21px 22px;
    border-color: rgba(177,70,59,.16);
    background:
      linear-gradient(
        135deg,
        rgba(255,252,249,.96),
        rgba(255,245,242,.96)
      );
  }

  .danger-label {
    color: #a34b42;
  }

  .danger-card h2 {
    margin: 6px 0 0;
    color: #7f302a;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 21px;
  }

  .danger-card p {
    margin: 7px 0 0;
    color: #8f6e68;
    font-size: 12px;
    line-height: 1.55;
  }

  .delete-button {
    flex-shrink: 0;
    color: #973f36;
    background: #fff0ed;
    border: 1px solid #efd1cc;
  }

  .delete-button:hover:not(:disabled) {
    background: #fde5e1;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(36, 19, 13, 0.60);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .delete-modal {
    width: min(460px, 100%);
    padding: 26px;
    border-radius: 20px;
    background: #fffaf6;
    border: 1px solid rgba(151,64,54,.15);
    box-shadow: 0 28px 80px rgba(43,24,18,.24);
  }

  .delete-icon {
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    color: #a34b42;
    background: #fff0ed;
  }

  .delete-kicker {
    display: block;
    margin-top: 17px;
    color: #a34b42;
  }

  .delete-modal h2 {
    margin: 6px 0 0;
    color: #6f2d27;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 25px;
  }

  .delete-modal p {
    margin: 10px 0 18px;
    color: #806d65;
    font-size: 12px;
    line-height: 1.65;
  }

  .delete-modal label {
    display: block;
    margin-bottom: 7px;
  }

  .delete-modal input {
    width: 100%;
    height: 49px;
    padding: 0 13px;
    outline: none;
    border-radius: 11px;
    border: 1px solid rgba(90,55,38,.16);
    background: #fff;
    color: var(--profile-text);
    font: inherit;
    font-size: 13px;
  }

  .delete-modal input:focus {
    border-color: rgba(151,64,54,.50);
    box-shadow: 0 0 0 4px rgba(169,84,72,.08);
  }

  .modal-actions {
    margin-top: 19px;
    display: flex;
    justify-content: flex-end;
    gap: 9px;
  }

  .cancel-button {
    color: #65574e;
    background: #f4eee8;
    border: 1px solid rgba(90,55,38,.09);
  }

  .confirm-delete-button {
    color: #fff;
    background: #9f473d;
    border: 1px solid #9f473d;
  }

  .profile-loading {
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--profile-espresso);
    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
    background:
      linear-gradient(180deg, #fbf7f1 0%, #f5eee5 100%);
  }

  .loading-spinner {
    width: 34px;
    height: 34px;
    margin-bottom: 13px;
    border-radius: 50%;
    border: 3px solid #e4d8cc;
    border-top-color: var(--profile-coffee);
    animation: profileSpin .8s linear infinite;
  }

  .profile-loading strong {
    font-size: 14px;
  }

  .profile-loading span {
    margin-top: 5px;
    color: var(--profile-muted);
    font-size: 11.5px;
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

  @media (max-width: 980px) {
    .profile-layout-grid {
      grid-template-columns: 1fr;
    }

    .account-summary-card {
      position: static;
    }

    .account-info-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 720px) {
    .profile-page {
      padding: 20px 16px 40px;
    }

    .profile-page-header {
      flex-direction: column;
    }

    .profile-overview-card {
      grid-template-columns: 1fr;
    }

    .profile-avatar {
      width: 74px;
      height: 74px;
      border-radius: 19px;
    }

    .profile-overview-heading {
      flex-direction: column;
    }

    .profile-badges {
      justify-content: flex-start;
    }

    .overview-meta-grid,
    .form-grid,
    .account-info-grid {
      grid-template-columns: 1fr;
    }

    .danger-card {
      align-items: stretch;
      flex-direction: column;
    }

    .delete-button {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .profile-page {
      padding-left: 12px;
      padding-right: 12px;
    }

    .profile-page-header h1 {
      font-size: 32px;
    }

    .profile-card,
    .account-summary-card,
    .danger-card {
      padding: 18px;
      border-radius: 16px;
    }

    .modal-actions {
      flex-direction: column;
    }

    .modal-actions button {
      width: 100%;
    }
  }
`;

export default MyProfilePage;

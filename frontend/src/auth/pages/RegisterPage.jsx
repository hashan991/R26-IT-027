import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../services/authService";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    requested_role: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
  };

  // =========================================================
  // REGISTER
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.requested_role) {
      setError("Please select your role.");
      return;
    }

    try {
      setLoading(true);

      const data = await registerUser(formData);

      setSuccess(
        data.message || "Registration successful. Waiting for admin approval.",
      );

      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
        requested_role: "",
      });

      // Login page එකට යවන්න තත්පර 2.5කට පස්සේ
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (error) {
      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(detail[0]?.msg || "Please check your registration details.");
      } else {
        setError(detail || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          .register-page {
            min-height: 100vh;
            background: #f3f6f4;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px;
            font-family: Arial, sans-serif;
          }

          .register-container {
            width: 100%;
            max-width: 1150px;
            min-height: 700px;

            display: grid;
            grid-template-columns: 0.9fr 1.1fr;

            background: #ffffff;

            border-radius: 22px;
            overflow: hidden;

            box-shadow:
              0 20px 60px rgba(0, 0, 0, 0.08);
          }

          .register-brand {
            padding: 65px 55px;

            background:
              linear-gradient(
                145deg,
                #123524,
                #1f5a3c
              );

            color: white;

            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .register-badge {
            width: fit-content;

            padding: 8px 14px;

            background:
              rgba(255, 255, 255, 0.12);

            border-radius: 20px;

            font-size: 13px;
            font-weight: 600;

            margin-bottom: 25px;
          }

          .register-brand h1 {
            margin: 0;

            font-size: 46px;
            line-height: 1.08;
          }

          .register-brand h1 span {
            display: block;
            color: #c8e6c9;
          }

          .register-brand > p {
            margin-top: 20px;

            font-size: 17px;
            line-height: 1.7;

            color:
              rgba(255, 255, 255, 0.8);
          }

          .role-info {
            margin-top: 38px;

            padding: 20px;

            border-radius: 14px;

            background:
              rgba(255, 255, 255, 0.08);

            border:
              1px solid
              rgba(255, 255, 255, 0.12);
          }

          .role-info h3 {
            margin:
              0 0 10px;

            font-size: 15px;
          }

          .role-info p {
            margin: 0;

            font-size: 13px;
            line-height: 1.7;

            color:
              rgba(255, 255, 255, 0.72);
          }

          .approval-note {
            margin-top: 20px;

            padding-left: 16px;

            border-left:
              3px solid #9cccaa;

            font-size: 13px;
            line-height: 1.6;

            color:
              rgba(255, 255, 255, 0.75);
          }

          .register-form-section {
            padding: 50px 60px;

            display: flex;
            justify-content: center;
            align-items: center;
          }

          .register-form-wrapper {
            width: 100%;
            max-width: 510px;
          }

          .register-header {
            margin-bottom: 28px;
          }

          .register-header h2 {
            margin: 0;

            color: #1d2923;

            font-size: 32px;
          }

          .register-header p {
            color: #6b756f;

            margin-top: 9px;

            line-height: 1.6;

            font-size: 14px;
          }

          .register-form {
            display: flex;
            flex-direction: column;
            gap: 18px;
          }

          .name-row {
            display: grid;
            grid-template-columns:
              1fr 1fr;
            gap: 16px;
          }

          .register-group {
            display: flex;
            flex-direction: column;
            gap: 7px;
          }

          .register-group label {
            color: #34463c;

            font-size: 13px;
            font-weight: 600;
          }

          .register-group input,
          .register-group select {
            width: 100%;
            height: 47px;

            padding: 0 14px;

            border:
              1px solid #d7ddd9;

            border-radius: 10px;

            background: white;

            color: #26372e;

            outline: none;

            font-size: 14px;

            transition: 0.2s;
          }

          .register-group input:focus,
          .register-group select:focus {
            border-color: #2f7d50;

            box-shadow:
              0 0 0 3px
              rgba(47, 125, 80, 0.1);
          }

          .register-group select {
            cursor: pointer;
          }

          .register-button {
            margin-top: 5px;

            height: 50px;

            border: none;
            border-radius: 10px;

            background: #1f6a43;

            color: white;

            font-size: 15px;
            font-weight: 600;

            cursor: pointer;

            transition: 0.2s;
          }

          .register-button:hover {
            background: #185635;
          }

          .register-button:disabled {
            cursor: not-allowed;
            opacity: 0.65;
          }

          .register-error {
            margin-bottom: 20px;

            background: #fff0f0;

            border:
              1px solid #ffd2d2;

            color: #b42318;

            padding: 12px 14px;

            border-radius: 9px;

            font-size: 14px;
          }

          .register-success {
            margin-bottom: 20px;

            background: #edf8f1;

            border:
              1px solid #bde3ca;

            color: #17613a;

            padding: 13px 14px;

            border-radius: 9px;

            font-size: 14px;
            line-height: 1.5;
          }

          .login-link {
            margin-top: 24px;

            display: flex;
            justify-content: center;

            gap: 6px;

            font-size: 14px;

            color: #66726b;
          }

          .login-link a {
            color: #1f6a43;

            font-weight: 600;

            text-decoration: none;
          }

          .login-link a:hover {
            text-decoration: underline;
          }

          .role-help {
            margin-top: 6px;

            font-size: 12px;

            color: #7b857f;

            line-height: 1.5;
          }

          @media (
            max-width: 900px
          ) {
            .register-container {
              grid-template-columns: 1fr;
            }

            .register-brand {
              display: none;
            }

            .register-form-section {
              padding: 45px 25px;
            }
          }

          @media (
            max-width: 550px
          ) {
            .register-page {
              padding: 0;
              background: white;
            }

            .register-container {
              min-height: 100vh;

              border-radius: 0;

              box-shadow: none;
            }

            .register-form-section {
              padding: 35px 22px;
            }

            .name-row {
              grid-template-columns: 1fr;
            }

            .register-header h2 {
              font-size: 28px;
            }
          }
        `}
      </style>

      <div className="register-page">
        <div className="register-container">
          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="register-brand">
            <div className="register-badge">Smart Manufacturing Platform</div>

            <h1>
              Join Smart Coffee
              <span>Quality Control</span>
            </h1>

            <p>
              Create your account and access the quality control tools assigned
              to your manufacturing role.
            </p>

            <div className="role-info">
              <h3>Role-Based Access</h3>

              <p>
                Each quality inspector gets access only to the tools and records
                related to their assigned responsibility.
              </p>
            </div>

            <div className="approval-note">
              New accounts require administrator approval before system access
              is activated.
            </div>
          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="register-form-section">
            <div className="register-form-wrapper">
              <div className="register-header">
                <h2>Create Account</h2>

                <p>
                  Enter your information and request access to your quality
                  control workspace.
                </p>
              </div>

              {error && <div className="register-error">{error}</div>}

              {success && (
                <div className="register-success">
                  {success}
                  <br />
                  Redirecting to login...
                </div>
              )}

              <form className="register-form" onSubmit={handleSubmit}>
                {/* NAME */}

                <div className="name-row">
                  <div className="register-group">
                    <label htmlFor="first_name">First Name</label>

                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      placeholder="First name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      minLength={2}
                    />
                  </div>

                  <div className="register-group">
                    <label htmlFor="last_name">Last Name</label>

                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      placeholder="Last name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      minLength={2}
                    />
                  </div>
                </div>

                {/* EMAIL */}

                <div className="register-group">
                  <label htmlFor="email">Email Address</label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* ROLE */}

                <div className="register-group">
                  <label htmlFor="requested_role">Requested Role</label>

                  <select
                    id="requested_role"
                    name="requested_role"
                    value={formData.requested_role}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select your role</option>

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

                  <div className="role-help">
                    Administrator accounts cannot be requested through public
                    registration.
                  </div>
                </div>

                {/* PASSWORD */}

                <div className="register-group">
                  <label htmlFor="password">Password</label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                </div>

                {/* CONFIRM PASSWORD */}

                <div className="register-group">
                  <label htmlFor="confirm_password">Confirm Password</label>

                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    placeholder="Re-enter your password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                </div>

                <button
                  type="submit"
                  className="register-button"
                  disabled={loading || success}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              <div className="login-link">
                <span>Already have an account?</span>

                <Link to="/login">Sign in</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;

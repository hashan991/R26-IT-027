import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();

  const { login, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

const handleSubmit = async (event) => {
  event.preventDefault();

  setError("");

  try {
    await login(formData.email, formData.password);

    navigate("/dashboard", {
      replace: true,
    });
  } catch (error) {
    const message =
      error.response?.data?.detail || "Login failed. Please try again.";

    setError(message);
  }
};

  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          .login-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f3f6f4;
            padding: 30px;
            font-family: Arial, sans-serif;
          }

          .login-container {
            width: 100%;
            max-width: 1100px;
            min-height: 650px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            background: white;
            border-radius: 22px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
          }

          .login-brand {
            padding: 70px 60px;
            background: linear-gradient(
              145deg,
              #123524,
              #1f5a3c
            );
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .brand-badge {
            width: fit-content;
            padding: 8px 14px;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.12);
            font-size: 13px;
            margin-bottom: 25px;
          }

          .login-brand h1 {
            font-size: 48px;
            line-height: 1.1;
            margin: 0;
          }

          .login-brand h1 span {
            display: block;
            color: #c8e6c9;
          }

          .login-brand > p {
            margin-top: 20px;
            font-size: 18px;
            line-height: 1.7;
            color: rgba(255, 255, 255, 0.8);
          }

          .login-features {
            margin-top: 45px;
            display: grid;
            gap: 20px;
          }

          .login-features div {
            display: flex;
            flex-direction: column;
            padding-left: 18px;
            border-left: 3px solid rgba(255, 255, 255, 0.3);
          }

          .login-features strong {
            font-size: 15px;
          }

          .login-features span {
            margin-top: 5px;
            color: rgba(255, 255, 255, 0.65);
            font-size: 13px;
          }

          .login-form-section {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 60px;
          }

          .login-form-wrapper {
            width: 100%;
            max-width: 390px;
          }

          .login-header {
            margin-bottom: 35px;
          }

          .login-header h2 {
            margin: 0;
            font-size: 34px;
            color: #1d2923;
          }

          .login-header p {
            margin-top: 10px;
            color: #6b756f;
            line-height: 1.6;
          }

          .login-form {
            display: flex;
            flex-direction: column;
            gap: 22px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .form-group label {
            font-size: 14px;
            font-weight: 600;
            color: #34463c;
          }

          .form-group input {
            height: 48px;
            padding: 0 15px;
            border: 1px solid #d7ddd9;
            border-radius: 10px;
            font-size: 15px;
            outline: none;
            transition: 0.2s;
          }

          .form-group input:focus {
            border-color: #2f7d50;
            box-shadow: 0 0 0 3px rgba(47, 125, 80, 0.1);
          }

          .login-button {
            margin-top: 8px;
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

          .login-button:hover {
            background: #185635;
          }

          .login-button:disabled {
            opacity: 0.65;
            cursor: not-allowed;
          }

          .login-error {
            margin-bottom: 20px;
            padding: 12px 14px;
            border-radius: 8px;
            background: #fff0f0;
            color: #b42318;
            font-size: 14px;
            border: 1px solid #ffd2d2;
          }

          .register-link {
            margin-top: 28px;
            display: flex;
            justify-content: center;
            gap: 6px;
            font-size: 14px;
            color: #66726b;
          }

          .register-link a {
            color: #1f6a43;
            text-decoration: none;
            font-weight: 600;
          }

          .register-link a:hover {
            text-decoration: underline;
          }

          @media (max-width: 850px) {
            .login-container {
              grid-template-columns: 1fr;
            }

            .login-brand {
              display: none;
            }

            .login-form-section {
              padding: 45px 25px;
            }
          }

          @media (max-width: 500px) {
            .login-page {
              padding: 0;
              background: white;
            }

            .login-container {
              min-height: 100vh;
              border-radius: 0;
              box-shadow: none;
            }

            .login-form-section {
              padding: 35px 22px;
            }

            .login-header h2 {
              font-size: 30px;
            }
          }
        `}
      </style>

      <div className="login-page">
        <div className="login-container">
          <div className="login-brand">
            <div className="brand-badge">AI Quality Platform</div>

            <h1>
              Smart Coffee
              <span>Manufacturing</span>
            </h1>

            <p>End-to-End Quality Control from Bean to Pack</p>

            <div className="login-features">
              <div>
                <strong>Bean Quality</strong>

                <span>AI-powered coffee bean inspection</span>
              </div>

              <div>
                <strong>Powder Quality</strong>

                <span>Batch-level quality evaluation</span>
              </div>

              <div>
                <strong>Packaging Quality</strong>

                <span>Real-time seal inspection</span>
              </div>

              <div>
                <strong>Sales Analysis</strong>

                <span>Market suitability insights</span>
              </div>
            </div>
          </div>

          <div className="login-form-section">
            <div className="login-form-wrapper">
              <div className="login-header">
                <h2>Welcome Back</h2>

                <p>Sign in to access your quality control workspace.</p>
              </div>

              {error && <div className="login-error">{error}</div>}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>

                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="register-link">
                <span>Don't have an account?</span>

                <Link to="/register">Create account</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;

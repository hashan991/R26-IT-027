import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../services/authService";

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
    coffee: (
      <>
        <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" />
        <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" />
        <path d="M7 3c0 1.3 1 1.7 1 3" />
        <path d="M11 3c0 1.3 1 1.7 1 3" />
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
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
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
    role: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M8 9h8M8 13h5M8 17h3" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 19 6v5c0 4.5-2.8 7.6-7 10-4.2-2.4-7-5.5-7-10V6l7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    warning: (
      <>
        <path d="M10.3 4.6 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),
    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m14 7 5 5-5 5" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    scan: (
      <>
        <path d="M4 7V5a1 1 0 0 1 1-1h2" />
        <path d="M17 4h2a1 1 0 0 1 1 1v2" />
        <path d="M20 17v2a1 1 0 0 1-1 1h-2" />
        <path d="M7 20H5a1 1 0 0 1-1-1v-2" />
        <circle cx="12" cy="12" r="3.2" />
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
    sensor: (
      <>
        <path d="M5 12a7 7 0 0 1 14 0" />
        <path d="M8 12a4 4 0 0 1 8 0" />
        <circle cx="12" cy="12" r="1.5" />
        <path d="M12 13.5V20" />
      </>
    ),
  };

  return <svg {...common}>{icons[name] || icons.coffee}</svg>;
}

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
  };

  const getPasswordStrength = (password) => {
    if (!password) {
      return {
        level: 0,
        label: "Enter a password",
      };
    }

    let score = 0;

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { level: 1, label: "Basic" };
    if (score <= 4) return { level: 2, label: "Good" };

    return { level: 3, label: "Strong" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const passwordsMatch =
    formData.confirm_password.length > 0 &&
    formData.password === formData.confirm_password;

  const passwordsDiffer =
    formData.confirm_password.length > 0 &&
    formData.password !== formData.confirm_password;

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

          body {
            margin: 0;
          }

          :root {
            --espresso: #2b1812;
            --coffee: #5a3726;
            --mocha: #7a4b33;
            --caramel: #c58a4d;
            --caramel-light: #e0aa6b;
            --cream: #fffaf3;
            --foam: #f8f0e6;
            --leaf: #5f775f;
            --leaf-dark: #3e5b42;
            --text: #30231d;
            --muted: #76685f;
            --line: rgba(90, 55, 38, 0.13);
          }

          @keyframes ambientOne {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
            }

            50% {
              transform: translate3d(25px, -18px, 0) scale(1.07);
            }
          }

          @keyframes ambientTwo {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
            }

            50% {
              transform: translate3d(-18px, 24px, 0) scale(0.95);
            }
          }

          @keyframes steamRise {
            0% {
              transform: translateY(6px) scaleX(0.9);
              opacity: 0;
            }

            25% {
              opacity: 0.55;
            }

            70% {
              opacity: 0.25;
            }

            100% {
              transform: translateY(-14px) scaleX(1.08);
              opacity: 0;
            }
          }

          @keyframes pulseDot {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(136, 191, 141, 0.30);
            }

            50% {
              box-shadow: 0 0 0 8px rgba(136, 191, 141, 0);
            }
          }

          @keyframes buttonShine {
            0% {
              transform: translateX(-170%) skewX(-18deg);
            }

            60%, 100% {
              transform: translateX(260%) skewX(-18deg);
            }
          }

          @keyframes spinner {
            to {
              transform: rotate(360deg);
            }
          }

          .register-page {
            min-height: 100vh;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 34px;
            font-family:
              Inter,
              ui-sans-serif,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
            color: var(--text);
            background:
              radial-gradient(
                circle at 88% 8%,
                rgba(197, 138, 77, 0.16),
                transparent 28%
              ),
              radial-gradient(
                circle at 5% 88%,
                rgba(95, 119, 95, 0.11),
                transparent 30%
              ),
              linear-gradient(145deg, #fffaf4 0%, #f7ede1 100%);
          }

          .ambient-orb {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
          }

          .ambient-orb.one {
            width: 350px;
            height: 350px;
            right: -110px;
            top: -90px;
            background: radial-gradient(
              circle,
              rgba(197, 138, 77, 0.13),
              rgba(197, 138, 77, 0)
            );
            animation: ambientOne 13s ease-in-out infinite;
          }

          .ambient-orb.two {
            width: 300px;
            height: 300px;
            left: -120px;
            bottom: -100px;
            background: radial-gradient(
              circle,
              rgba(95, 119, 95, 0.10),
              rgba(95, 119, 95, 0)
            );
            animation: ambientTwo 15s ease-in-out infinite;
          }

          .back-home {
            position: absolute;
            top: 24px;
            left: 28px;
            z-index: 10;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 13px;
            border-radius: 11px;
            color: var(--coffee);
            background: rgba(255, 250, 243, 0.80);
            border: 1px solid rgba(90, 55, 38, 0.10);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            text-decoration: none;
            font-size: 12px;
            font-weight: 750;
            transition: 0.2s ease;
          }

          .back-home:hover {
            transform: translateY(-1px);
            background: #fffaf3;
          }

          .register-container {
            width: 100%;
            max-width: 1190px;
            min-height: 760px;
            position: relative;
            z-index: 2;
            display: grid;
            grid-template-columns: 0.86fr 1.14fr;
            overflow: hidden;
            border-radius: 30px;
            background: rgba(255, 250, 243, 0.94);
            border: 1px solid rgba(90, 55, 38, 0.09);
            box-shadow:
              0 35px 90px rgba(55, 29, 20, 0.16),
              inset 0 1px 0 rgba(255,255,255,0.65);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
          }

          /* ================= LEFT BRAND PANEL ================= */

          .register-brand {
            position: relative;
            overflow: hidden;
            padding: 54px 50px;
            color: white;
            background:
              radial-gradient(
                circle at 90% 7%,
                rgba(224, 169, 107, 0.20),
                transparent 28%
              ),
              radial-gradient(
                circle at 8% 92%,
                rgba(95, 119, 95, 0.11),
                transparent 30%
              ),
              linear-gradient(145deg, #4a2a1d 0%, #27150f 75%);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .register-brand::before {
            content: "";
            position: absolute;
            width: 320px;
            height: 320px;
            right: -145px;
            bottom: -150px;
            border-radius: 50%;
            background: rgba(197, 138, 77, 0.09);
          }

          .brand-top,
          .brand-bottom {
            position: relative;
            z-index: 2;
          }

          .brand-logo {
            display: inline-flex;
            align-items: center;
            gap: 12px;
          }

          .brand-logo-icon {
            width: 50px;
            height: 50px;
            position: relative;
            display: grid;
            place-items: center;
            border-radius: 15px;
            color: #fff7ed;
            background: rgba(255, 255, 255, 0.09);
            border: 1px solid rgba(255, 255, 255, 0.10);
          }

          .brand-steam {
            position: absolute;
            width: 28px;
            height: 17px;
            left: 50%;
            top: -9px;
            transform: translateX(-50%);
          }

          .brand-steam span {
            position: absolute;
            bottom: 0;
            width: 2px;
            height: 13px;
            border-radius: 999px;
            background: linear-gradient(
              to top,
              rgba(240, 200, 147, 0.45),
              rgba(240, 200, 147, 0)
            );
            animation: steamRise 2.8s ease-in-out infinite;
          }

          .brand-steam span:nth-child(1) {
            left: 4px;
          }

          .brand-steam span:nth-child(2) {
            left: 13px;
            height: 15px;
            animation-delay: 0.7s;
          }

          .brand-steam span:nth-child(3) {
            left: 22px;
            animation-delay: 1.35s;
          }

          .brand-logo-copy strong {
            display: block;
            font-size: 14px;
          }

          .brand-logo-copy span {
            display: block;
            margin-top: 3px;
            color: #bba291;
            font-size: 9px;
            font-weight: 750;
            letter-spacing: 1.2px;
            text-transform: uppercase;
          }

          .register-badge {
            width: fit-content;
            margin-top: 48px;
            padding: 8px 12px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            gap: 7px;
            color: #d9eadb;
            background: rgba(95, 119, 95, 0.14);
            border: 1px solid rgba(152, 193, 156, 0.10);
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 1px;
            text-transform: uppercase;
          }

          .status-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #88bf8d;
            animation: pulseDot 2s ease-in-out infinite;
          }

          .register-brand h1 {
            max-width: 430px;
            margin: 20px 0 0;
            color: #fffaf3;
            font-family: Georgia, "Times New Roman", serif;
            font-size: clamp(43px, 4.4vw, 58px);
            line-height: 1.02;
            letter-spacing: -1.7px;
          }

          .register-brand h1 span {
            display: block;
            margin-top: 4px;
            color: var(--caramel-light);
            font-style: italic;
          }

          .register-brand p {
            max-width: 470px;
            margin: 20px 0 0;
            color: #baa494;
            font-size: 14px;
            line-height: 1.75;
          }

          .approval-card {
            margin-top: 28px;
            padding: 17px;
            border-radius: 16px;
            background: rgba(255,255,255,.055);
            border: 1px solid rgba(255,255,255,.075);
          }

          .approval-card-head {
            display: flex;
            align-items: center;
            gap: 9px;
            color: #efc18c;
            font-size: 11px;
            font-weight: 800;
          }

          .approval-card p {
            margin-top: 8px;
            color: #a99384;
            font-size: 10px;
            line-height: 1.6;
          }

          .role-preview-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 11px;
          }

          .role-preview {
            min-height: 90px;
            padding: 14px;
            border-radius: 15px;
            background: rgba(255,255,255,.055);
            border: 1px solid rgba(255,255,255,.07);
            transition: 0.2s ease;
          }

          .role-preview:hover {
            transform: translateY(-3px);
            background: rgba(255,255,255,.075);
          }

          .role-preview-icon {
            width: 31px;
            height: 31px;
            display: grid;
            place-items: center;
            border-radius: 9px;
            color: #efc18c;
            background: rgba(197,138,77,.12);
          }

          .role-preview strong {
            display: block;
            margin-top: 9px;
            font-size: 10px;
          }

          .role-preview span {
            display: block;
            margin-top: 4px;
            color: #a99384;
            font-size: 8.5px;
            line-height: 1.45;
          }

          /* ================= FORM PANEL ================= */

          .register-form-section {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 52px 58px;
            background:
              radial-gradient(
                circle at 98% 4%,
                rgba(197, 138, 77, 0.07),
                transparent 28%
              ),
              rgba(255, 250, 243, 0.94);
          }

          .register-form-wrapper {
            width: 100%;
            max-width: 535px;
          }

          .mobile-brand {
            display: none;
            align-items: center;
            gap: 10px;
            margin-bottom: 29px;
          }

          .mobile-brand-icon {
            width: 42px;
            height: 42px;
            display: grid;
            place-items: center;
            border-radius: 13px;
            color: #fff;
            background: linear-gradient(
              145deg,
              var(--coffee),
              var(--espresso)
            );
          }

          .mobile-brand strong {
            display: block;
            color: var(--espresso);
            font-size: 14px;
          }

          .mobile-brand span {
            display: block;
            margin-top: 2px;
            color: #9a8272;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
          }

          .register-header {
            margin-bottom: 24px;
          }

          .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            margin-bottom: 11px;
            color: var(--leaf-dark);
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1.1px;
            text-transform: uppercase;
          }

          .register-header h2 {
            margin: 0;
            color: var(--espresso);
            font-family: Georgia, "Times New Roman", serif;
            font-size: 36px;
            line-height: 1.1;
            letter-spacing: -1px;
          }

          .register-header p {
            margin: 10px 0 0;
            color: var(--muted);
            font-size: 13px;
            line-height: 1.65;
          }

          .register-error,
          .register-success {
            margin-bottom: 18px;
            padding: 13px 14px;
            display: flex;
            align-items: flex-start;
            gap: 10px;
            border-radius: 12px;
            font-size: 11px;
            line-height: 1.55;
          }

          .register-error {
            color: #9a342c;
            background: #fff3f0;
            border: 1px solid #f2cec7;
          }

          .register-success {
            color: #386444;
            background: #f0f8f1;
            border: 1px solid #cce3d0;
          }

          .register-error svg,
          .register-success svg {
            flex-shrink: 0;
            margin-top: 1px;
          }

          .register-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .name-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 13px;
          }

          .register-group {
            display: flex;
            flex-direction: column;
            gap: 7px;
          }

          .register-group label {
            color: #4f4037;
            font-size: 11px;
            font-weight: 750;
          }

          .input-shell,
          .select-shell {
            min-height: 50px;
            position: relative;
            display: flex;
            align-items: center;
            border-radius: 13px;
            background: rgba(255,255,255,.84);
            border: 1px solid rgba(90,55,38,.14);
            transition:
              border-color .2s ease,
              box-shadow .2s ease,
              background .2s ease;
          }

          .input-shell:focus-within,
          .select-shell:focus-within {
            border-color: rgba(122,75,51,.58);
            background: #fff;
            box-shadow: 0 0 0 4px rgba(197,138,77,.10);
          }

          .input-icon {
            width: 42px;
            display: grid;
            place-items: center;
            color: #9a7c68;
            flex-shrink: 0;
          }

          .input-shell input,
          .select-shell select {
            width: 100%;
            height: 48px;
            border: none;
            outline: none;
            background: transparent;
            color: var(--text);
            padding: 0 12px 0 0;
            font-family: inherit;
            font-size: 13px;
          }

          .input-shell input::placeholder {
            color: #b6a79d;
          }

          .select-shell select {
            cursor: pointer;
            appearance: none;
            padding-right: 34px;
          }

          .select-chevron {
            position: absolute;
            right: 13px;
            top: 50%;
            width: 8px;
            height: 8px;
            border-right: 1.5px solid #8c7566;
            border-bottom: 1.5px solid #8c7566;
            transform: translateY(-65%) rotate(45deg);
            pointer-events: none;
          }

          .password-toggle {
            width: 42px;
            height: 42px;
            margin-right: 4px;
            display: grid;
            place-items: center;
            border: none;
            border-radius: 10px;
            color: #8a7465;
            background: transparent;
            cursor: pointer;
            transition: .2s ease;
          }

          .password-toggle:hover {
            color: var(--coffee);
            background: rgba(90,55,38,.06);
          }

          .role-help {
            margin-top: 1px;
            display: flex;
            align-items: flex-start;
            gap: 7px;
            color: #948176;
            font-size: 9.5px;
            line-height: 1.5;
          }

          .role-help svg {
            flex-shrink: 0;
            color: var(--leaf);
            margin-top: 1px;
          }

          .password-meta {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 10px;
            align-items: center;
            margin-top: 1px;
          }

          .strength-label {
            min-width: 48px;
            color: #8f7c6f;
            font-size: 9px;
            font-weight: 750;
          }

          .strength-bars {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 4px;
          }

          .strength-bar {
            height: 4px;
            border-radius: 999px;
            background: #eadfd5;
            transition: 0.2s ease;
          }

          .strength-bar.active.level-1 {
            background: #b77a63;
          }

          .strength-bar.active.level-2 {
            background: var(--caramel);
          }

          .strength-bar.active.level-3 {
            background: var(--leaf);
          }

          .match-note {
            margin-top: 2px;
            min-height: 16px;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 9.5px;
          }

          .match-note.match {
            color: var(--leaf-dark);
          }

          .match-note.no-match {
            color: #a84b43;
          }

          .register-button {
            min-height: 51px;
            position: relative;
            overflow: hidden;
            margin-top: 2px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: none;
            border-radius: 13px;
            color: #fffaf3;
            background: linear-gradient(
              135deg,
              var(--coffee),
              var(--espresso)
            );
            box-shadow: 0 14px 30px rgba(67,35,24,.20);
            font-family: inherit;
            font-size: 13px;
            font-weight: 800;
            cursor: pointer;
            transition: .22s ease;
          }

          .register-button::before {
            content: "";
            position: absolute;
            top: -30%;
            bottom: -30%;
            left: -30%;
            width: 28%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.24),
              transparent
            );
            transform: translateX(-170%) skewX(-18deg);
            animation: buttonShine 4.8s ease-in-out infinite;
          }

          .register-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 17px 34px rgba(67,35,24,.25);
          }

          .register-button:disabled {
            cursor: not-allowed;
            opacity: .68;
          }

          .button-content {
            position: relative;
            z-index: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .button-arrow {
            display: inline-flex;
            transition: transform .2s ease;
          }

          .register-button:hover:not(:disabled) .button-arrow {
            transform: translateX(4px);
          }

          .spinner {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,.35);
            border-top-color: #fff;
            animation: spinner .8s linear infinite;
          }

          .approval-note {
            margin-top: 17px;
            padding: 12px 13px;
            display: flex;
            align-items: flex-start;
            gap: 9px;
            border-radius: 12px;
            color: #6d625a;
            background: rgba(95,119,95,.065);
            border: 1px solid rgba(95,119,95,.10);
            font-size: 9.5px;
            line-height: 1.55;
          }

          .approval-note svg {
            flex-shrink: 0;
            color: var(--leaf);
            margin-top: 1px;
          }

          .divider {
            margin: 20px 0 0;
            display: flex;
            align-items: center;
            gap: 12px;
            color: #ad9d92;
            font-size: 9px;
            font-weight: 750;
            letter-spacing: .8px;
            text-transform: uppercase;
          }

          .divider::before,
          .divider::after {
            content: "";
            height: 1px;
            flex: 1;
            background: rgba(90,55,38,.10);
          }

          .login-link {
            margin-top: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 6px;
            color: #84756b;
            font-size: 11px;
          }

          .login-link a {
            color: var(--coffee);
            text-decoration: none;
            font-weight: 800;
          }

          .login-link a:hover {
            text-decoration: underline;
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

          @media (max-width: 960px) {
            .register-page {
              padding: 24px;
            }

            .register-container {
              max-width: 680px;
              min-height: auto;
              grid-template-columns: 1fr;
            }

            .register-brand {
              display: none;
            }

            .register-form-section {
              padding: 48px 42px;
            }

            .mobile-brand {
              display: flex;
            }
          }

          @media (max-width: 580px) {
            .register-page {
              padding: 0;
              align-items: stretch;
              background: var(--cream);
            }

            .ambient-orb {
              opacity: .42;
            }

            .back-home {
              top: 16px;
              left: 16px;
              padding: 9px 11px;
            }

            .register-container {
              min-height: 100vh;
              border: none;
              border-radius: 0;
              box-shadow: none;
              background: transparent;
            }

            .register-form-section {
              min-height: 100vh;
              padding: 87px 22px 38px;
              align-items: flex-start;
            }

            .name-row {
              grid-template-columns: 1fr;
            }

            .register-header h2 {
              font-size: 33px;
            }

            .mobile-brand {
              margin-bottom: 31px;
            }
          }
        `}
      </style>

      <div className="register-page">
        <span className="ambient-orb one" aria-hidden="true" />
        <span className="ambient-orb two" aria-hidden="true" />

        <Link to="/" className="back-home">
          <Icon name="home" size={15} />
          Back to Home
        </Link>

        <div className="register-container">
          <section className="register-brand">
            <div className="brand-top">
              <div className="brand-logo">
                <div className="brand-logo-icon">
                  <span className="brand-steam" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  <Icon name="coffee" size={23} />
                </div>

                <div className="brand-logo-copy">
                  <strong>Smart Coffee Manufacturing</strong>
                  <span>AI Quality Control Platform</span>
                </div>
              </div>

              <div className="register-badge">
                <span className="status-dot" />
                Role-Based Platform Access
              </div>

              <h1>
                Join the coffee
                <span>quality workflow.</span>
              </h1>

              <p>
                Create an account and request access to the quality-control
                tools assigned to your manufacturing responsibility.
              </p>

              <div className="approval-card">
                <div className="approval-card-head">
                  <Icon name="shield" size={17} />
                  Administrator Approval Required
                </div>

                <p>
                  New accounts remain pending until an administrator reviews and
                  approves the requested role.
                </p>
              </div>
            </div>

            <div className="brand-bottom">
              <div className="role-preview-grid">
                <div className="role-preview">
                  <div className="role-preview-icon">
                    <Icon name="scan" size={17} />
                  </div>
                  <strong>Bean Inspector</strong>
                  <span>Raw bean AI and sensor quality analysis.</span>
                </div>

                <div className="role-preview">
                  <div className="role-preview-icon">
                    <Icon name="sensor" size={17} />
                  </div>
                  <strong>Powder Inspector</strong>
                  <span>Batch-level powder quality evaluation.</span>
                </div>

                <div className="role-preview">
                  <div className="role-preview-icon">
                    <Icon name="package" size={17} />
                  </div>
                  <strong>Packaging Inspector</strong>
                  <span>Seal and packaging quality inspection.</span>
                </div>

                <div className="role-preview">
                  <div className="role-preview-icon">
                    <Icon name="chart" size={17} />
                  </div>
                  <strong>Sales Analyst</strong>
                  <span>Quality-aware market decision support.</span>
                </div>
              </div>
            </div>
          </section>

          <section className="register-form-section">
            <div className="register-form-wrapper">
              <div className="mobile-brand">
                <div className="mobile-brand-icon">
                  <Icon name="coffee" size={20} />
                </div>

                <div>
                  <strong>Smart Coffee Manufacturing</strong>
                  <span>Quality Control Platform</span>
                </div>
              </div>

              <div className="register-header">
                <div className="header-badge">
                  <Icon name="shield" size={15} />
                  Request Platform Access
                </div>

                <h2>Create your account.</h2>

                <p>
                  Enter your details, choose your manufacturing role and submit
                  your account for administrator approval.
                </p>
              </div>

              {error && (
                <div className="register-error" role="alert">
                  <Icon name="warning" size={18} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="register-success" role="status">
                  <Icon name="check" size={18} />
                  <span>
                    {success}
                    <br />
                    Redirecting to login...
                  </span>
                </div>
              )}

              <form className="register-form" onSubmit={handleSubmit}>
                <div className="name-row">
                  <div className="register-group">
                    <label htmlFor="first_name">First Name</label>

                    <div className="input-shell">
                      <span className="input-icon">
                        <Icon name="user" size={17} />
                      </span>

                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        placeholder="First name"
                        value={formData.first_name}
                        onChange={handleChange}
                        autoComplete="given-name"
                        required
                        minLength={2}
                      />
                    </div>
                  </div>

                  <div className="register-group">
                    <label htmlFor="last_name">Last Name</label>

                    <div className="input-shell">
                      <span className="input-icon">
                        <Icon name="user" size={17} />
                      </span>

                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        placeholder="Last name"
                        value={formData.last_name}
                        onChange={handleChange}
                        autoComplete="family-name"
                        required
                        minLength={2}
                      />
                    </div>
                  </div>
                </div>

                <div className="register-group">
                  <label htmlFor="email">Email Address</label>

                  <div className="input-shell">
                    <span className="input-icon">
                      <Icon name="mail" size={17} />
                    </span>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="register-group">
                  <label htmlFor="requested_role">Requested Role</label>

                  <div className="select-shell">
                    <span className="input-icon">
                      <Icon name="role" size={17} />
                    </span>

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

                    <span className="select-chevron" aria-hidden="true" />
                  </div>

                  <div className="role-help">
                    <Icon name="shield" size={13} />
                    <span>
                      Administrator accounts cannot be requested through public
                      registration.
                    </span>
                  </div>
                </div>

                <div className="register-group">
                  <label htmlFor="password">Password</label>

                  <div className="input-shell">
                    <span className="input-icon">
                      <Icon name="lock" size={17} />
                    </span>

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword((currentValue) => !currentValue)
                      }
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      <Icon name={showPassword ? "eyeOff" : "eye"} size={17} />
                    </button>
                  </div>

                  <div className="password-meta">
                    <span className="strength-label">
                      {passwordStrength.label}
                    </span>

                    <div
                      className="strength-bars"
                      aria-label={`Password strength: ${passwordStrength.label}`}
                    >
                      {[1, 2, 3].map((level) => (
                        <span
                          className={`strength-bar ${
                            passwordStrength.level >= level
                              ? `active level-${passwordStrength.level}`
                              : ""
                          }`}
                          key={level}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="register-group">
                  <label htmlFor="confirm_password">Confirm Password</label>

                  <div className="input-shell">
                    <span className="input-icon">
                      <Icon name="lock" size={17} />
                    </span>

                    <input
                      id="confirm_password"
                      name="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword((currentValue) => !currentValue)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      title={
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
                    <div className="match-note match">
                      <Icon name="check" size={13} />
                      Passwords match
                    </div>
                  )}

                  {passwordsDiffer && (
                    <div className="match-note no-match">
                      <Icon name="warning" size={13} />
                      Passwords do not match
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="register-button"
                  disabled={loading || Boolean(success)}
                >
                  <span className="button-content">
                    {loading ? (
                      <>
                        <span className="spinner" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <span className="button-arrow">
                          <Icon name="arrow" size={16} />
                        </span>
                      </>
                    )}
                  </span>
                </button>
              </form>

              <div className="approval-note">
                <Icon name="shield" size={16} />
                <span>
                  After registration, your account will remain pending until an
                  administrator approves the requested system role.
                </span>
              </div>

              <div className="divider">Already registered?</div>

              <div className="login-link">
                <span>Already have an account?</span>
                <Link to="/login">Sign in</Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;

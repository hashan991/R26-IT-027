import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

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
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m14 7 5 5-5 5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 19 6v5c0 4.5-2.8 7.6-7 10-4.2-2.4-7-5.5-7-10V6l7-3Z" />
        <path d="m9 12 2 2 4-4" />
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
    sensor: (
      <>
        <path d="M5 12a7 7 0 0 1 14 0" />
        <path d="M8 12a4 4 0 0 1 8 0" />
        <circle cx="12" cy="12" r="1.5" />
        <path d="M12 13.5V20" />
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
    warning: (
      <>
        <path d="M10.3 4.6 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
  };

  return <svg {...common}>{icons[name] || icons.coffee}</svg>;
}

function LoginPage() {
  const navigate = useNavigate();

  const { login, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
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

          body {
            margin: 0;
          }

          :root {
            --espresso: #2b1812;
            --espresso-soft: #3b2117;
            --coffee: #5a3726;
            --mocha: #7a4b33;
            --caramel: #c58a4d;
            --caramel-light: #e0aa6b;
            --cream: #fffaf3;
            --latte: #f2e4d3;
            --foam: #f8f0e6;
            --leaf: #5f775f;
            --leaf-dark: #3e5b42;
            --text: #30231d;
            --muted: #76685f;
            --line: rgba(90, 55, 38, 0.13);
          }

          @keyframes floatOrbOne {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
            }
            50% {
              transform: translate3d(24px, -18px, 0) scale(1.08);
            }
          }

          @keyframes floatOrbTwo {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
            }
            50% {
              transform: translate3d(-22px, 20px, 0) scale(0.95);
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
              box-shadow: 0 0 0 0 rgba(136, 191, 141, 0.28);
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

          .login-page {
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
            width: 340px;
            height: 340px;
            right: -90px;
            top: -90px;
            background: radial-gradient(
              circle,
              rgba(197, 138, 77, 0.13),
              rgba(197, 138, 77, 0)
            );
            animation: floatOrbOne 12s ease-in-out infinite;
          }

          .ambient-orb.two {
            width: 300px;
            height: 300px;
            left: -110px;
            bottom: -100px;
            background: radial-gradient(
              circle,
              rgba(95, 119, 95, 0.10),
              rgba(95, 119, 95, 0)
            );
            animation: floatOrbTwo 14s ease-in-out infinite;
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
            background: rgba(255, 250, 243, 0.78);
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

          .login-container {
            width: 100%;
            max-width: 1120px;
            min-height: 680px;
            position: relative;
            z-index: 2;
            display: grid;
            grid-template-columns: 1.03fr 0.97fr;
            overflow: hidden;
            border-radius: 30px;
            background: rgba(255, 250, 243, 0.92);
            border: 1px solid rgba(90, 55, 38, 0.09);
            box-shadow:
              0 35px 90px rgba(55, 29, 20, 0.16),
              inset 0 1px 0 rgba(255,255,255,0.65);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
          }

          /* ================= BRAND SIDE ================= */

          .login-brand {
            position: relative;
            overflow: hidden;
            padding: 58px 56px;
            color: white;
            background:
              radial-gradient(
                circle at 90% 8%,
                rgba(224, 169, 107, 0.20),
                transparent 28%
              ),
              radial-gradient(
                circle at 5% 92%,
                rgba(95, 119, 95, 0.11),
                transparent 30%
              ),
              linear-gradient(145deg, #4a2a1d 0%, #27150f 75%);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .login-brand::before {
            content: "";
            position: absolute;
            width: 330px;
            height: 330px;
            right: -150px;
            bottom: -165px;
            border-radius: 50%;
            background: rgba(197, 138, 77, 0.09);
          }

          .login-brand::after {
            content: "";
            position: absolute;
            left: 8%;
            right: 8%;
            top: 48%;
            height: 1px;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(240, 200, 147, 0.14),
              transparent
            );
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
            color: white;
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
            box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
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

          .brand-badge {
            width: fit-content;
            margin-top: 58px;
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

          .brand-status-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #88bf8d;
            animation: pulseDot 2s ease-in-out infinite;
          }

          .login-brand h1 {
            max-width: 480px;
            margin: 20px 0 0;
            color: #fffaf3;
            font-family: Georgia, "Times New Roman", serif;
            font-size: clamp(44px, 4.6vw, 61px);
            line-height: 1.01;
            letter-spacing: -1.8px;
          }

          .login-brand h1 span {
            display: block;
            margin-top: 3px;
            color: var(--caramel-light);
            font-style: italic;
          }

          .login-brand > .brand-top > p {
            max-width: 500px;
            margin: 20px 0 0;
            color: #b9a393;
            font-size: 14px;
            line-height: 1.75;
          }

          .platform-flow {
            margin-top: 31px;
            padding: 15px 17px;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            color: #c7ad98;
            background: rgba(197, 138, 77, 0.08);
            border: 1px solid rgba(224, 169, 107, 0.09);
          }

          .platform-flow span {
            font-size: 9px;
          }

          .platform-flow strong {
            color: #efc18c;
            font-size: 10px;
            letter-spacing: 0.4px;
          }

          .login-features {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 11px;
          }

          .feature-mini {
            min-height: 92px;
            padding: 14px;
            border-radius: 15px;
            background: rgba(255, 255, 255, 0.055);
            border: 1px solid rgba(255, 255, 255, 0.07);
            transition: 0.2s ease;
          }

          .feature-mini:hover {
            transform: translateY(-3px);
            background: rgba(255, 255, 255, 0.075);
          }

          .feature-mini-icon {
            width: 31px;
            height: 31px;
            display: grid;
            place-items: center;
            border-radius: 9px;
            color: #efc18c;
            background: rgba(197, 138, 77, 0.12);
          }

          .feature-mini strong {
            display: block;
            margin-top: 10px;
            font-size: 11px;
          }

          .feature-mini span {
            display: block;
            margin-top: 4px;
            color: #a99384;
            font-size: 9px;
            line-height: 1.5;
          }

          /* ================= FORM SIDE ================= */

          .login-form-section {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 64px 62px;
            background:
              radial-gradient(
                circle at 95% 5%,
                rgba(197, 138, 77, 0.08),
                transparent 27%
              ),
              rgba(255, 250, 243, 0.92);
          }

          .login-form-wrapper {
            width: 100%;
            max-width: 405px;
          }

          .mobile-brand {
            display: none;
            align-items: center;
            gap: 10px;
            margin-bottom: 30px;
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
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .login-header {
            margin-bottom: 31px;
          }

          .login-header-badge {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            margin-bottom: 13px;
            color: var(--leaf-dark);
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.1px;
          }

          .login-header h2 {
            margin: 0;
            color: var(--espresso);
            font-family: Georgia, "Times New Roman", serif;
            font-size: 38px;
            line-height: 1.1;
            letter-spacing: -1px;
          }

          .login-header p {
            margin: 11px 0 0;
            color: var(--muted);
            font-size: 14px;
            line-height: 1.7;
          }

          .login-error {
            margin-bottom: 20px;
            padding: 13px 14px;
            display: flex;
            align-items: flex-start;
            gap: 10px;
            border-radius: 12px;
            color: #9a342c;
            background: #fff3f0;
            border: 1px solid #f2cec7;
            font-size: 12px;
            line-height: 1.55;
          }

          .login-error svg {
            flex-shrink: 0;
            margin-top: 1px;
          }

          .login-form {
            display: flex;
            flex-direction: column;
            gap: 19px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .form-group label {
            color: #4f4037;
            font-size: 12px;
            font-weight: 750;
          }

          .input-shell {
            min-height: 52px;
            display: flex;
            align-items: center;
            position: relative;
            border-radius: 13px;
            background: rgba(255, 255, 255, 0.84);
            border: 1px solid rgba(90, 55, 38, 0.14);
            transition:
              border-color 0.2s ease,
              box-shadow 0.2s ease,
              background 0.2s ease;
          }

          .input-shell:focus-within {
            border-color: rgba(122, 75, 51, 0.58);
            background: #fff;
            box-shadow: 0 0 0 4px rgba(197, 138, 77, 0.10);
          }

          .input-icon {
            width: 44px;
            display: grid;
            place-items: center;
            color: #9a7c68;
            flex-shrink: 0;
          }

          .input-shell input {
            width: 100%;
            height: 50px;
            border: none;
            outline: none;
            background: transparent;
            color: var(--text);
            padding: 0 13px 0 0;
            font-family: inherit;
            font-size: 14px;
          }

          .input-shell input::placeholder {
            color: #b5a69c;
          }

          .password-toggle {
            width: 43px;
            height: 43px;
            margin-right: 4px;
            display: grid;
            place-items: center;
            border: none;
            border-radius: 10px;
            color: #8a7465;
            background: transparent;
            cursor: pointer;
            transition: 0.2s ease;
          }

          .password-toggle:hover {
            color: var(--coffee);
            background: rgba(90, 55, 38, 0.06);
          }

          .form-meta {
            margin-top: -4px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            min-height: 18px;
          }

          .secure-note {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: #948176;
            font-size: 10px;
          }

          .login-button {
            min-height: 52px;
            position: relative;
            overflow: hidden;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            margin-top: 2px;
            border: none;
            border-radius: 13px;
            color: #fffaf3;
            background: linear-gradient(
              135deg,
              var(--coffee),
              var(--espresso)
            );
            box-shadow: 0 14px 30px rgba(67, 35, 24, 0.20);
            font-family: inherit;
            font-size: 13px;
            font-weight: 800;
            cursor: pointer;
            transition: 0.22s ease;
          }

          .login-button::before {
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

          .login-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 17px 34px rgba(67, 35, 24, 0.25);
          }

          .login-button:disabled {
            opacity: 0.68;
            cursor: not-allowed;
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
            transition: transform 0.2s ease;
          }

          .login-button:hover:not(:disabled) .button-arrow {
            transform: translateX(4px);
          }

          .spinner {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,.35);
            border-top-color: #fff;
            animation: spinner 0.8s linear infinite;
          }

          .divider {
            margin: 25px 0 0;
            display: flex;
            align-items: center;
            gap: 12px;
            color: #ad9d92;
            font-size: 9px;
            font-weight: 750;
            letter-spacing: 0.8px;
            text-transform: uppercase;
          }

          .divider::before,
          .divider::after {
            content: "";
            height: 1px;
            flex: 1;
            background: rgba(90, 55, 38, 0.10);
          }

          .register-link {
            margin-top: 19px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 6px;
            color: #84756b;
            font-size: 12px;
          }

          .register-link a {
            color: var(--coffee);
            text-decoration: none;
            font-weight: 800;
          }

          .register-link a:hover {
            text-decoration: underline;
          }

          .access-note {
            margin-top: 27px;
            padding: 13px 14px;
            display: flex;
            align-items: flex-start;
            gap: 10px;
            border-radius: 12px;
            color: #6d625a;
            background: rgba(95, 119, 95, 0.065);
            border: 1px solid rgba(95, 119, 95, 0.10);
            font-size: 10px;
            line-height: 1.55;
          }

          .access-note svg {
            flex-shrink: 0;
            color: var(--leaf);
            margin-top: 1px;
          }

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.001ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.001ms !important;
            }
          }

          @media (max-width: 900px) {
            .login-page {
              padding: 24px;
            }

            .login-container {
              max-width: 620px;
              min-height: auto;
              grid-template-columns: 1fr;
            }

            .login-brand {
              display: none;
            }

            .login-form-section {
              padding: 52px 44px;
            }

            .mobile-brand {
              display: flex;
            }
          }

          @media (max-width: 560px) {
            .login-page {
              padding: 0;
              align-items: stretch;
              background: var(--cream);
            }

            .ambient-orb {
              opacity: 0.45;
            }

            .back-home {
              top: 16px;
              left: 16px;
              padding: 9px 11px;
            }

            .login-container {
              min-height: 100vh;
              border: none;
              border-radius: 0;
              box-shadow: none;
              background: transparent;
            }

            .login-form-section {
              min-height: 100vh;
              padding: 88px 22px 38px;
              align-items: flex-start;
            }

            .mobile-brand {
              margin-bottom: 36px;
            }

            .login-header h2 {
              font-size: 34px;
            }
          }
        `}
      </style>

      <div className="login-page">
        <span className="ambient-orb one" aria-hidden="true" />
        <span className="ambient-orb two" aria-hidden="true" />

        <Link to="/" className="back-home">
          <Icon name="home" size={15} />
          Back to Home
        </Link>

        <div className="login-container">
          <section className="login-brand">
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

              <div className="brand-badge">
                <span className="brand-status-dot" />
                Quality Intelligence Online
              </div>

              <h1>
                Control quality
                <span>from bean to pack.</span>
              </h1>

              <p>
                Access the connected workspace for AI inspection, sensor-based
                analysis, production quality monitoring and decision support.
              </p>

              <div className="platform-flow">
                <span>Manufacturing Quality Flow</span>
                <strong>BEAN → POWDER → PACK → MARKET</strong>
              </div>
            </div>

            <div className="brand-bottom">
              <div className="login-features">
                <div className="feature-mini">
                  <div className="feature-mini-icon">
                    <Icon name="scan" size={17} />
                  </div>
                  <strong>Bean Quality</strong>
                  <span>Vision AI and sensor-supported inspection.</span>
                </div>

                <div className="feature-mini">
                  <div className="feature-mini-icon">
                    <Icon name="sensor" size={17} />
                  </div>
                  <strong>Powder Quality</strong>
                  <span>Batch-level quality monitoring and analysis.</span>
                </div>

                <div className="feature-mini">
                  <div className="feature-mini-icon">
                    <Icon name="package" size={17} />
                  </div>
                  <strong>Packaging Quality</strong>
                  <span>Real-time packaging and seal inspection.</span>
                </div>

                <div className="feature-mini">
                  <div className="feature-mini-icon">
                    <Icon name="chart" size={17} />
                  </div>
                  <strong>Sales Analysis</strong>
                  <span>Quality-aware market decision support.</span>
                </div>
              </div>
            </div>
          </section>

          <section className="login-form-section">
            <div className="login-form-wrapper">
              <div className="mobile-brand">
                <div className="mobile-brand-icon">
                  <Icon name="coffee" size={20} />
                </div>
                <div>
                  <strong>Smart Coffee Manufacturing</strong>
                  <span>Quality Control Platform</span>
                </div>
              </div>

              <div className="login-header">
                <div className="login-header-badge">
                  <Icon name="shield" size={15} />
                  Secure Platform Access
                </div>

                <h2>Welcome back.</h2>

                <p>
                  Sign in with your approved account to access your quality
                  control workspace.
                </p>
              </div>

              {error && (
                <div className="login-error" role="alert">
                  <Icon name="warning" size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>

                  <div className="input-shell">
                    <span className="input-icon">
                      <Icon name="mail" size={18} />
                    </span>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>

                  <div className="input-shell">
                    <span className="input-icon">
                      <Icon name="lock" size={18} />
                    </span>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      <Icon
                        name={showPassword ? "eyeOff" : "eye"}
                        size={18}
                      />
                    </button>
                  </div>
                </div>

                <div className="form-meta">
                  <span className="secure-note">
                    <Icon name="shield" size={13} />
                    Secure role-based access
                  </span>
                </div>

                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  <span className="button-content">
                    {loading ? (
                      <>
                        <span className="spinner" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <span className="button-arrow">
                          <Icon name="arrow" size={16} />
                        </span>
                      </>
                    )}
                  </span>
                </button>
              </form>

              <div className="divider">New to the platform?</div>

              <div className="register-link">
                <span>Don't have an account?</span>
                <Link to="/register">Create account</Link>
              </div>

              <div className="access-note">
                <Icon name="shield" size={17} />
                <span>
                  New accounts may require administrator approval before system
                  access is granted.
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default LoginPage;

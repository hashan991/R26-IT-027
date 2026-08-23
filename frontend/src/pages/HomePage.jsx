import { Link } from "react-router-dom";

function HomePage() {
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

          .startup-page {
            min-height: 100vh;
            background:
              radial-gradient(
                circle at 85% 10%,
                rgba(87, 171, 116, 0.16),
                transparent 28%
              ),
              radial-gradient(
                circle at 10% 80%,
                rgba(42, 112, 75, 0.10),
                transparent 30%
              ),
              #f7faf8;

            font-family:
              Inter,
              Arial,
              sans-serif;

            color: #173426;
          }


          /* ================================================
             NAVBAR
          ================================================= */

          .startup-navbar {
            width: 100%;
            max-width: 1240px;

            margin: 0 auto;

            padding: 24px 30px;

            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .startup-logo {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .logo-icon {
            width: 44px;
            height: 44px;

            border-radius: 12px;

            display: flex;
            align-items: center;
            justify-content: center;

            background: #1c6440;

            color: white;

            font-size: 22px;
          }

          .logo-text strong {
            display: block;

            font-size: 16px;

            color: #153a27;
          }

          .logo-text span {
            display: block;

            margin-top: 3px;

            font-size: 11px;

            color: #718078;
          }

          .navbar-actions {
            display: flex;
            align-items: center;
            gap: 11px;
          }

          .nav-login {
            padding: 10px 18px;

            color: #1d5f3d;

            text-decoration: none;

            font-size: 14px;
            font-weight: 600;

            border-radius: 8px;

            transition: 0.2s;
          }

          .nav-login:hover {
            background: #eaf3ed;
          }

          .nav-register {
            padding: 11px 19px;

            background: #1e6843;

            color: white;

            text-decoration: none;

            border-radius: 9px;

            font-size: 14px;
            font-weight: 600;

            transition: 0.2s;
          }

          .nav-register:hover {
            background: #175334;
          }


          /* ================================================
             HERO
          ================================================= */

          .startup-hero {
            width: 100%;
            max-width: 1240px;

            margin: 0 auto;

            padding:
              65px 30px 90px;

            display: grid;

            grid-template-columns:
              1.05fr 0.95fr;

            gap: 70px;

            align-items: center;
          }

          .hero-badge {
            display: inline-flex;

            padding: 8px 14px;

            border-radius: 30px;

            background: #e5f3e9;

            color: #246542;

            font-size: 12px;
            font-weight: 700;

            letter-spacing: 0.3px;

            margin-bottom: 22px;
          }

          .hero-content h1 {
            margin: 0;

            max-width: 680px;

            font-size: 58px;

            line-height: 1.07;

            letter-spacing: -2px;

            color: #153a27;
          }

          .hero-content h1 span {
            color: #2b8054;
          }

          .hero-description {
            margin:
              26px 0 0;

            max-width: 620px;

            color: #64726a;

            font-size: 17px;

            line-height: 1.8;
          }

          .hero-actions {
            display: flex;

            gap: 13px;

            margin-top: 34px;
          }

          .primary-action {
            min-width: 150px;

            padding: 14px 24px;

            background: #1d6842;

            color: white;

            border-radius: 10px;

            text-decoration: none;

            text-align: center;

            font-size: 14px;
            font-weight: 700;

            transition: 0.2s;

            box-shadow:
              0 8px 20px
              rgba(29, 104, 66, 0.18);
          }

          .primary-action:hover {
            background: #165333;

            transform: translateY(-1px);
          }

          .secondary-action {
            min-width: 150px;

            padding: 13px 24px;

            background: white;

            color: #24543a;

            border:
              1px solid #cfdcd4;

            border-radius: 10px;

            text-decoration: none;

            text-align: center;

            font-size: 14px;
            font-weight: 700;

            transition: 0.2s;
          }

          .secondary-action:hover {
            border-color: #6e9b7f;

            background: #f7faf8;
          }

          .hero-note {
            margin-top: 20px;

            color: #89938e;

            font-size: 12px;
          }


          /* ================================================
             HERO SYSTEM CARD
          ================================================= */

          .system-preview {
            position: relative;

            background:
              linear-gradient(
                145deg,
                #123524,
                #1c5b3b
              );

            padding: 28px;

            min-height: 460px;

            border-radius: 26px;

            box-shadow:
              0 30px 70px
              rgba(21, 61, 40, 0.18);

            overflow: hidden;
          }

          .system-preview::before {
            content: "";

            position: absolute;

            width: 260px;
            height: 260px;

            border-radius: 50%;

            background:
              rgba(255, 255, 255, 0.04);

            top: -100px;
            right: -80px;
          }

          .preview-top {
            position: relative;

            display: flex;
            justify-content: space-between;
            align-items: center;

            color: white;

            margin-bottom: 27px;
          }

          .preview-top strong {
            font-size: 14px;
          }

          .live-badge {
            padding: 6px 10px;

            border-radius: 20px;

            background:
              rgba(134, 226, 163, 0.14);

            color: #b5efc7;

            font-size: 10px;
            font-weight: 700;
          }

          .module-grid {
            position: relative;

            display: grid;
            grid-template-columns:
              1fr 1fr;

            gap: 14px;
          }

          .module-card {
            min-height: 150px;

            padding: 18px;

            border-radius: 16px;

            background:
              rgba(255, 255, 255, 0.08);

            border:
              1px solid
              rgba(255, 255, 255, 0.09);

            backdrop-filter: blur(8px);

            color: white;
          }

          .module-icon {
            width: 38px;
            height: 38px;

            border-radius: 10px;

            background:
              rgba(255, 255, 255, 0.12);

            display: flex;
            align-items: center;
            justify-content: center;

            font-size: 18px;

            margin-bottom: 16px;
          }

          .module-card strong {
            display: block;

            font-size: 14px;

            margin-bottom: 7px;
          }

          .module-card p {
            margin: 0;

            color:
              rgba(255, 255, 255, 0.58);

            font-size: 11px;
            line-height: 1.6;
          }

          .quality-bar {
            position: relative;

            margin-top: 15px;

            padding: 15px 17px;

            background:
              rgba(255, 255, 255, 0.08);

            border-radius: 14px;

            display: flex;
            align-items: center;
            justify-content: space-between;

            color: white;
          }

          .quality-bar span {
            color:
              rgba(255, 255, 255, 0.6);

            font-size: 11px;
          }

          .quality-bar strong {
            color: #b9efca;

            font-size: 17px;
          }


          /* ================================================
             FEATURES
          ================================================= */

          .startup-features {
            padding:
              80px 30px 90px;

            background: white;
          }

          .features-wrapper {
            max-width: 1180px;

            margin: 0 auto;
          }

          .section-heading {
            max-width: 650px;

            margin:
              0 auto 45px;

            text-align: center;
          }

          .section-heading span {
            color: #2c7a50;

            font-size: 12px;
            font-weight: 700;

            text-transform: uppercase;

            letter-spacing: 1.4px;
          }

          .section-heading h2 {
            margin:
              12px 0 0;

            color: #173b29;

            font-size: 35px;

            letter-spacing: -0.8px;
          }

          .section-heading p {
            margin:
              15px auto 0;

            color: #758078;

            font-size: 14px;
            line-height: 1.7;
          }

          .feature-grid {
            display: grid;

            grid-template-columns:
              repeat(4, 1fr);

            gap: 18px;
          }

          .feature-card {
            padding: 25px;

            min-height: 220px;

            border:
              1px solid #e1e8e3;

            border-radius: 16px;

            background: #fbfcfb;

            transition: 0.2s;
          }

          .feature-card:hover {
            transform:
              translateY(-4px);

            box-shadow:
              0 15px 35px
              rgba(32, 77, 50, 0.08);

            border-color: #cbdacf;
          }

          .feature-icon {
            width: 45px;
            height: 45px;

            display: flex;
            align-items: center;
            justify-content: center;

            background: #e7f3ea;

            color: #1d6842;

            border-radius: 12px;

            font-size: 20px;

            margin-bottom: 19px;
          }

          .feature-card h3 {
            margin: 0;

            color: #1c412e;

            font-size: 16px;
          }

          .feature-card p {
            margin:
              10px 0 0;

            color: #77827b;

            line-height: 1.65;

            font-size: 13px;
          }


          /* ================================================
             ACCESS SECTION
          ================================================= */

          .access-section {
            padding:
              75px 30px;

            background: #edf4ef;
          }

          .access-card {
            width: 100%;
            max-width: 950px;

            margin: 0 auto;

            padding: 45px;

            background: white;

            border-radius: 20px;

            display: flex;
            align-items: center;
            justify-content: space-between;

            gap: 40px;

            box-shadow:
              0 15px 40px
              rgba(32, 77, 50, 0.06);
          }

          .access-card h2 {
            margin: 0;

            color: #173b29;

            font-size: 28px;
          }

          .access-card p {
            margin:
              10px 0 0;

            color: #77827b;

            font-size: 14px;
            line-height: 1.6;
          }

          .access-buttons {
            display: flex;
            gap: 10px;

            flex-shrink: 0;
          }


          /* ================================================
             FOOTER
          ================================================= */

          .startup-footer {
            padding: 28px 30px;

            background: #123524;

            color:
              rgba(255, 255, 255, 0.55);

            text-align: center;

            font-size: 12px;
          }

          .startup-footer strong {
            color:
              rgba(255, 255, 255, 0.82);
          }


          /* ================================================
             RESPONSIVE
          ================================================= */

          @media (max-width: 1000px) {

            .startup-hero {
              grid-template-columns: 1fr;

              padding-top: 45px;
            }

            .hero-content {
              text-align: center;
            }

            .hero-description {
              margin-left: auto;
              margin-right: auto;
            }

            .hero-actions {
              justify-content: center;
            }

            .system-preview {
              max-width: 650px;

              width: 100%;

              margin: 0 auto;
            }

            .feature-grid {
              grid-template-columns:
                1fr 1fr;
            }
          }


          @media (max-width: 650px) {

            .startup-navbar {
              padding: 18px 20px;
            }

            .logo-text span {
              display: none;
            }

            .nav-login {
              display: none;
            }

            .startup-hero {
              padding:
                45px 20px 65px;
            }

            .hero-content h1 {
              font-size: 40px;

              letter-spacing: -1px;
            }

            .hero-description {
              font-size: 15px;
            }

            .hero-actions {
              flex-direction: column;
            }

            .primary-action,
            .secondary-action {
              width: 100%;
            }

            .system-preview {
              padding: 20px;

              min-height: auto;
            }

            .module-grid {
              grid-template-columns: 1fr;
            }

            .feature-grid {
              grid-template-columns: 1fr;
            }

            .startup-features {
              padding:
                60px 20px;
            }

            .access-section {
              padding:
                55px 20px;
            }

            .access-card {
              padding: 30px;

              flex-direction: column;

              text-align: center;
            }

            .access-buttons {
              width: 100%;

              flex-direction: column;
            }
          }
        `}
      </style>

      <div className="startup-page">
        {/* ================================================
            NAVBAR
        ================================================= */}

        <nav className="startup-navbar">
          <div className="startup-logo">
            <div className="logo-icon">☕</div>

            <div className="logo-text">
              <strong>Smart Coffee Manufacturing</strong>

              <span>AI Quality Control Platform</span>
            </div>
          </div>

          <div className="navbar-actions">
            <Link to="/login" className="nav-login">
              Sign In
            </Link>

            <Link to="/register" className="nav-register">
              Create Account
            </Link>
          </div>
        </nav>

        {/* ================================================
            HERO
        ================================================= */}

        <main className="startup-hero">
          <section className="hero-content">
            <div className="hero-badge">AI-POWERED QUALITY CONTROL</div>

            <h1>
              Smarter Coffee Manufacturing,
              <span> From Bean to Pack.</span>
            </h1>

            <p className="hero-description">
              An intelligent end-to-end platform for monitoring coffee quality
              across raw beans, powder production, packaging inspection, and
              market analysis.
            </p>

            <div className="hero-actions">
              <Link to="/login" className="primary-action">
                Sign In
              </Link>

              <Link to="/register" className="secondary-action">
                Create Account
              </Link>
            </div>

            <div className="hero-note">
              Secure role-based access for quality inspectors, analysts and
              administrators.
            </div>
          </section>

          {/* SYSTEM PREVIEW */}

          <section className="system-preview">
            <div className="preview-top">
              <strong>Quality Control System</strong>

              <div className="live-badge">AI ENABLED</div>
            </div>

            <div className="module-grid">
              <div className="module-card">
                <div className="module-icon">☕</div>

                <strong>Bean Quality</strong>

                <p>
                  AI-based defect detection, sensor analysis and raw bean
                  quality evaluation.
                </p>
              </div>

              <div className="module-card">
                <div className="module-icon">◉</div>

                <strong>Powder Quality</strong>

                <p>
                  Batch-level moisture, color and granulation quality
                  evaluation.
                </p>
              </div>

              <div className="module-card">
                <div className="module-icon">▣</div>

                <strong>Packaging Quality</strong>

                <p>Real-time seal and packaging defect identification.</p>
              </div>

              <div className="module-card">
                <div className="module-icon">↗</div>

                <strong>Sales Analysis</strong>

                <p>
                  Product and market suitability analysis for decision support.
                </p>
              </div>
            </div>

            <div className="quality-bar">
              <span>End-to-End Quality Monitoring</span>

              <strong>Bean → Pack</strong>
            </div>
          </section>
        </main>
      </div>

      {/* ================================================
          SYSTEM MODULES
      ================================================= */}

      <section className="startup-features">
        <div className="features-wrapper">
          <div className="section-heading">
            <span>Platform Capabilities</span>

            <h2>One Platform. Four Quality Stages.</h2>

            <p>
              Intelligent tools support quality inspection and decision-making
              throughout the coffee manufacturing process.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">☕</div>

              <h3>Raw Bean Quality</h3>

              <p>
                Detect bean defects and evaluate raw coffee quality using
                computer vision and sensor-based analysis.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">◉</div>

              <h3>Powder Quality</h3>

              <p>
                Monitor batch quality using moisture, color and particle
                uniformity information.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">▣</div>

              <h3>Packaging Inspection</h3>

              <p>
                Identify packaging and seal defects before products reach the
                final distribution stage.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">↗</div>

              <h3>Sales & Market Analysis</h3>

              <p>
                Support product suitability and market-related decisions using
                production and quality data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================
          LOGIN / REGISTER CTA
      ================================================= */}

      <section className="access-section">
        <div className="access-card">
          <div>
            <h2>Access the Quality Control Platform</h2>

            <p>
              Sign in with your approved account or request a new role-based
              account to access the system.
            </p>
          </div>

          <div className="access-buttons">
            <Link to="/login" className="primary-action">
              Sign In
            </Link>

            <Link to="/register" className="secondary-action">
              Register
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================
          FOOTER
      ================================================= */}

      <footer className="startup-footer">
        <strong>Smart Coffee Manufacturing</strong> — End-to-End Quality Control
        from Bean to Pack
      </footer>
    </>
  );
}

export default HomePage;

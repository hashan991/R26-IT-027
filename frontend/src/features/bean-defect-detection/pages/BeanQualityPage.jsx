import { useState } from "react";

import BeanQualityStepper from "../components/stepper/BeanQualityStepper";
import SensorAnalysis from "../components/sensor/SensorAnalysis";
import PhysicalAnalysis from "../components/physical/PhysicalAnalysis";
import FinalQualityReport from "../components/report/FinalQualityReport";

function CoffeeBeanIcon({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15.8 3.3c3.9 1.4 5.8 5.5 4.3 9.4-1.7 4.4-6.3 7.9-10.8 7.1-4.3-.8-6.5-4.7-5.1-8.7 1.6-4.5 7-9.3 11.6-7.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 18c2.1-2.1 3.1-4.2 3-6.3-.1-2.4.8-4.8 3.1-7.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CoffeeCupIcon({ size = 26 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7 3c0 1.3 1 1.7 1 3M11 3c0 1.3 1 1.7 1 3M15 3c0 1.3 1 1.7 1 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BeanQualityPage() {
  const [currentStep, setCurrentStep] = useState(1);

  const [sensorResult, setSensorResult] = useState(null);
  const [physicalResult, setPhysicalResult] = useState(null);
  const [finalResult, setFinalResult] = useState(null);

  const goToStep = (step) => {
    setCurrentStep(step);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const getStepLabel = () => {
    if (currentStep === 1) {
      return "Sensor Intelligence";
    }

    if (currentStep === 2) {
      return "Physical AI Inspection";
    }

    return "Final Quality Report";
  };

  return (
    <div className="bean-quality-page">
      <div className="coffee-noise" />

      <div className="background-glow glow-left" />
      <div className="background-glow glow-right" />
      <div className="background-glow glow-center" />

      <div className="floating-bean bean-one">
        <CoffeeBeanIcon size={54} />
      </div>

      <div className="floating-bean bean-two">
        <CoffeeBeanIcon size={40} />
      </div>

      <div className="floating-bean bean-three">
        <CoffeeBeanIcon size={46} />
      </div>

      <main className="quality-container">
        {/* ==================================================
            PREMIUM COFFEE HERO
        ================================================== */}

        <section className="quality-hero">
          <div className="hero-coffee-mark">
            <CoffeeCupIcon size={32} />
          </div>

          <div className="hero-copy">
            <div className="hero-eyebrow">
              <span className="eyebrow-dot" />
              RAW COFFEE BEAN INTELLIGENCE
            </div>

            <h1>
              Coffee Bean
              <span>Quality Control</span>
            </h1>

            <p>
              Analyze raw coffee bean quality using sensor intelligence
              and computer vision AI, then generate a complete pre-roast
              quality assessment and decision-support report.
            </p>

            <div className="hero-meta">
              <div className="hero-meta-item">
                <span>WORKFLOW</span>
                <strong>3-Stage Inspection</strong>
              </div>

              <div className="hero-meta-divider" />

              <div className="hero-meta-item">
                <span>CURRENT STAGE</span>
                <strong>{getStepLabel()}</strong>
              </div>

              <div className="hero-meta-divider" />

              <div className="hero-meta-item">
                <span>SYSTEM</span>

                <strong className="system-ready">
                  <i />
                  AI Ready
                </strong>
              </div>
            </div>
          </div>

          <div className="hero-bean-cluster">
            <span className="bean-orbit orbit-one">
              <CoffeeBeanIcon size={34} />
            </span>

            <span className="bean-orbit orbit-two">
              <CoffeeBeanIcon size={26} />
            </span>

            <span className="bean-orbit orbit-three">
              <CoffeeBeanIcon size={40} />
            </span>

            <div className="hero-bean-core">
              <CoffeeBeanIcon size={72} />
            </div>
          </div>
        </section>

        {/* ==================================================
            WORKFLOW TITLE
        ================================================== */}

        <section className="workflow-heading">
          <div>
            <span>QUALITY WORKFLOW</span>
            <h2>Bean Inspection Pipeline</h2>
          </div>

          <div className="workflow-step-number">
            <span>STEP</span>

            <strong>
              {String(currentStep).padStart(2, "0")}
              <small>/03</small>
            </strong>
          </div>
        </section>

        {/* ==================================================
            STEPPER
        ================================================== */}

        <div className="stepper-shell">
          <div className="stepper-accent" />

          <BeanQualityStepper
            currentStep={currentStep}
            onStepChange={goToStep}
          />
        </div>

        {/* ==================================================
            ANALYSIS AREA
        ================================================== */}

        <section className="analysis-shell">
          

          {/* STEP 1 */}
          {currentStep === 1 && (
            <SensorAnalysis
              onComplete={(data) => {
                setSensorResult(data);
                goToStep(2);
              }}
            />
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <PhysicalAnalysis
              onBack={() => goToStep(1)}
              onComplete={(data) => {
                setPhysicalResult(data);
                goToStep(3);
              }}
            />
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <FinalQualityReport
              sensorResult={sensorResult}
              physicalResult={physicalResult}
              onBack={() => goToStep(2)}
              onNewAnalysis={() => {
                setSensorResult(null);
                setPhysicalResult(null);
                setFinalResult(null);
                goToStep(1);
              }}
            />
          )}
        </section>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <section className="quality-footer-strip">
          <div>
            <CoffeeBeanIcon size={18} />
            <span>Bean to Pack AI</span>
          </div>

          <p>
            Sensor Intelligence · Computer Vision · Processing Intelligence
          </p>
        </section>
      </main>

      <style>{`
        .bean-quality-page,
        .bean-quality-page *,
        .bean-quality-page *::before,
        .bean-quality-page *::after {
          box-sizing: border-box;
        }

        .bean-quality-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          color: #fff7e8;
          font-family:
            Inter,
            Poppins,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          background:
            radial-gradient(
              circle at 7% 8%,
              rgba(215, 144, 65, 0.19),
              transparent 30%
            ),
            radial-gradient(
              circle at 94% 88%,
              rgba(145, 73, 32, 0.23),
              transparent 34%
            ),
            radial-gradient(
              circle at 52% 44%,
              rgba(119, 61, 29, 0.13),
              transparent 40%
            ),
            linear-gradient(
              140deg,
              #100805 0%,
              #190c07 32%,
              #251208 68%,
              #140905 100%
            );
        }

        .bean-quality-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(
              rgba(255, 255, 255, 0.014) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.012) 1px,
              transparent 1px
            );
          background-size: 46px 46px;
          mask-image:
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.45),
              transparent 82%
            );
        }

        .coffee-noise {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.05;
          background-image:
            radial-gradient(
              rgba(255, 255, 255, 0.8) 0.5px,
              transparent 0.5px
            );
          background-size: 6px 6px;
        }

        .background-glow {
          position: fixed;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          opacity: 0.27;
        }

        .glow-left {
          width: 420px;
          height: 420px;
          top: 100px;
          left: -190px;
          background: #c98243;
        }

        .glow-right {
          width: 500px;
          height: 500px;
          right: -230px;
          bottom: -80px;
          background: #783e22;
        }

        .glow-center {
          width: 340px;
          height: 340px;
          top: 42%;
          left: 45%;
          opacity: 0.10;
          background: #dca15a;
        }

        .floating-bean {
          position: fixed;
          z-index: 0;
          color: rgba(233, 168, 98, 0.10);
          pointer-events: none;
          animation: beanFloat 7s ease-in-out infinite;
        }

        .bean-one {
          top: 14%;
          left: 3%;
          transform: rotate(-24deg);
        }

        .bean-two {
          top: 52%;
          right: 3%;
          transform: rotate(34deg);
          animation-delay: 1.5s;
        }

        .bean-three {
          bottom: 9%;
          left: 8%;
          transform: rotate(17deg);
          animation-delay: 3s;
        }

        @keyframes beanFloat {
          0%,
          100% {
            translate: 0 0;
          }

          50% {
            translate: 0 -14px;
          }
        }

        .quality-container {
          width: min(1220px, calc(100% - 34px));
          margin: 0 auto;
          padding: 42px 0 60px;
          position: relative;
          z-index: 1;
        }

        /* ==================================================
           HERO
        ================================================== */

        .quality-hero {
          position: relative;
          min-height: 310px;
          display: grid;
          grid-template-columns: 72px minmax(0, 1fr) 250px;
          align-items: center;
          gap: 24px;
          padding: 34px 38px;
          overflow: hidden;
          border: 1px solid rgba(241, 180, 105, 0.15);
          border-radius: 30px;
          background:
            radial-gradient(
              circle at 84% 25%,
              rgba(229, 155, 66, 0.17),
              transparent 35%
            ),
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.075),
              rgba(255, 255, 255, 0.018)
            ),
            rgba(38, 18, 9, 0.82);
          backdrop-filter: blur(24px);
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }

        .quality-hero::after {
          content: "";
          position: absolute;
          inset: auto -8% -56% 36%;
          height: 260px;
          border-radius: 50%;
          background: rgba(213, 137, 61, 0.09);
          filter: blur(42px);
        }

        .hero-coffee-mark {
          width: 70px;
          height: 70px;
          position: relative;
          z-index: 2;
          display: grid;
          place-items: center;
          align-self: start;
          margin-top: 5px;
          border: 1px solid rgba(255, 222, 151, 0.38);
          border-radius: 21px;
          color: #fff8e8;
          background:
            linear-gradient(
              145deg,
              #edae38,
              #cc731d
            );
          box-shadow:
            0 16px 35px rgba(209, 119, 27, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.28);
        }

        .hero-copy {
          position: relative;
          z-index: 2;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 14px;
          color: #d9aa70;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.7px;
        }

        .eyebrow-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #dda85e;
          box-shadow: 0 0 0 5px rgba(221, 168, 94, 0.08);
        }

        .hero-copy h1 {
          margin: 0;
          max-width: 720px;
          color: #fff6e9;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: clamp(42px, 5.2vw, 68px);
          line-height: 0.98;
          letter-spacing: -2.8px;
        }

        .hero-copy h1 span {
          display: block;
          margin-top: 8px;
          color: #e2a765;
        }

        .hero-copy > p {
          max-width: 690px;
          margin: 19px 0 0;
          color: rgba(255, 237, 213, 0.62);
          font-size: 14px;
          line-height: 1.75;
        }

        .hero-meta {
          margin-top: 27px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .hero-meta-item span {
          display: block;
          margin-bottom: 5px;
          color: rgba(224, 187, 145, 0.52);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .hero-meta-item strong {
          color: #f4dbc0;
          font-size: 11px;
          font-weight: 800;
        }

        .hero-meta-divider {
          width: 1px;
          height: 30px;
          background: rgba(240, 190, 130, 0.12);
        }

        .system-ready {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .system-ready i {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4ad67b;
          box-shadow: 0 0 12px rgba(74, 214, 123, 0.45);
        }

        .hero-bean-cluster {
          width: 215px;
          height: 215px;
          position: relative;
          z-index: 2;
          justify-self: end;
        }

        .hero-bean-cluster::before {
          content: "";
          position: absolute;
          inset: 20px;
          border-radius: 50%;
          border: 1px solid rgba(231, 170, 96, 0.10);
          box-shadow:
            inset 0 0 50px rgba(226, 147, 55, 0.05);
        }

        .hero-bean-core {
          width: 116px;
          height: 116px;
          position: absolute;
          top: 50px;
          left: 50px;
          display: grid;
          place-items: center;
          border-radius: 38px;
          color: #f2b76f;
          background:
            linear-gradient(
              145deg,
              rgba(239, 174, 90, 0.11),
              rgba(255, 255, 255, 0.025)
            );
          border: 1px solid rgba(244, 188, 116, 0.13);
          transform: rotate(10deg);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.20);
        }

        .bean-orbit {
          position: absolute;
          color: rgba(238, 173, 94, 0.44);
        }

        .orbit-one {
          top: 12px;
          left: 50px;
          transform: rotate(-25deg);
        }

        .orbit-two {
          right: 10px;
          top: 80px;
          transform: rotate(25deg);
        }

        .orbit-three {
          left: 22px;
          bottom: 6px;
          transform: rotate(52deg);
        }

        /* ==================================================
           WORKFLOW
        ================================================== */

        .workflow-heading {
          margin-top: 26px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          padding: 0 4px;
        }

        .workflow-heading > div:first-child > span {
          display: block;
          color: #d39350;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.6px;
        }

        .workflow-heading h2 {
          margin: 6px 0 0;
          color: #f9e8d4;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 25px;
          letter-spacing: -0.4px;
        }

        .workflow-step-number {
          text-align: right;
        }

        .workflow-step-number > span {
          display: block;
          margin-bottom: 2px;
          color: rgba(230, 195, 160, 0.48);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .workflow-step-number strong {
          color: #e7a55d;
          font-size: 22px;
        }

        .workflow-step-number small {
          margin-left: 2px;
          color: rgba(236, 205, 176, 0.42);
          font-size: 10px;
        }

        .stepper-shell {
          position: relative;
          margin-top: 13px;
          padding: 10px;
          border: 1px solid rgba(239, 178, 108, 0.10);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.025);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
        }

        .stepper-accent {
          position: absolute;
          top: -1px;
          left: 40px;
          width: 120px;
          height: 1px;
          background:
            linear-gradient(
              90deg,
              transparent,
              #dfa15d,
              transparent
            );
        }

        /* ==================================================
           ANALYSIS PANEL
        ================================================== */

        .analysis-shell {
          margin-top: 20px;
          padding: 18px;
          border: 1px solid rgba(245, 188, 117, 0.11);
          border-radius: 28px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.038),
              rgba(255, 255, 255, 0.014)
            ),
            rgba(26, 12, 6, 0.34);
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.16);
        }

        .analysis-shell-top {
          min-height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 8px;
          padding: 3px 4px 14px;
          border-bottom:
            1px solid rgba(240, 183, 112, 0.08);
        }

        .analysis-status {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .analysis-status-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: #e1a45f;
          background: rgba(224, 154, 76, 0.08);
          border: 1px solid rgba(228, 164, 90, 0.10);
        }

        .analysis-status > div > span {
          display: block;
          margin-bottom: 3px;
          color: rgba(225, 187, 145, 0.50);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.2px;
        }

        .analysis-status strong {
          color: #f5dfc7;
          font-size: 12px;
        }

        .analysis-stage-pill {
          padding: 7px 11px;
          border-radius: 999px;
          color: #e0b27e;
          background: rgba(217, 145, 69, 0.07);
          border: 1px solid rgba(228, 169, 101, 0.11);
          font-size: 9px;
          font-weight: 850;
        }

        /* ==================================================
           SHARED EXISTING COMPONENT SUPPORT
        ================================================== */

        .step-content {
          margin-top: 30px;
        }

        .temporary-card {
          border-radius: 24px;
          padding: 30px;
          border: 1px solid rgba(255, 222, 178, 0.13);
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.075),
              rgba(255, 255, 255, 0.025)
            ),
            rgba(42, 22, 12, 0.72);
          backdrop-filter: blur(20px);
          box-shadow:
            0 22px 60px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }

        .step-label {
          display: block;
          margin-bottom: 8px;
          color: #e8a45c;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.8px;
        }

        .temporary-card h2 {
          margin: 0 0 12px;
          color: #fff5e5;
          font-size: 29px;
        }

        .temporary-card > p {
          max-width: 650px;
          color: rgba(255, 239, 214, 0.65);
          line-height: 1.7;
        }

        .button-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-top: 30px;
        }

        .primary-button,
        .secondary-button {
          border: none;
          border-radius: 14px;
          padding: 13px 21px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .primary-button {
          margin-top: 25px;
          color: #28150b;
          background:
            linear-gradient(
              135deg,
              #ffe0a3,
              #d68d48,
              #a55c31
            );
          box-shadow:
            0 14px 32px rgba(198, 119, 58, 0.25);
        }

        .button-row .primary-button {
          margin-top: 0;
        }

        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow:
            0 18px 36px rgba(198, 119, 58, 0.31);
        }

        .secondary-button {
          color: #ffe2b8;
          background: rgba(255, 255, 255, 0.055);
          border:
            1px solid rgba(255, 221, 174, 0.13);
        }

        .secondary-button:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 221, 174, 0.24);
        }

        .result-debug {
          margin-top: 25px;
          padding: 20px;
          border-radius: 18px;
          background: rgba(0, 0, 0, 0.20);
          border:
            1px solid rgba(255, 220, 170, 0.10);
        }

        .result-debug p {
          margin: 8px 0;
          color: rgba(255, 239, 214, 0.70);
        }

        .result-debug strong {
          color: #ffd493;
        }

        /* ==================================================
           FOOTER
        ================================================== */

        .quality-footer-strip {
          margin-top: 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 13px 4px 0;
          border-top:
            1px solid rgba(235, 177, 110, 0.08);
        }

        .quality-footer-strip > div {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #dba05c;
        }

        .quality-footer-strip > div span {
          color: #e4c5a5;
          font-size: 10px;
          font-weight: 850;
        }

        .quality-footer-strip p {
          margin: 0;
          color: rgba(224, 196, 168, 0.40);
          font-size: 9px;
        }



        /* ==================================================
           WHITE BACKGROUND + DARK COFFEE CARDS
           Screenshot-inspired Bean to Pack theme
        ================================================== */

        .bean-quality-page {
          min-height: 100vh;
          color: #34231c;
          background:
            radial-gradient(
              circle at 4% 5%,
              rgba(197, 138, 77, 0.08),
              transparent 24%
            ),
            radial-gradient(
              circle at 96% 88%,
              rgba(95, 119, 95, 0.04),
              transparent 28%
            ),
            linear-gradient(
              180deg,
              #fffdf9 0%,
              #fbf6ef 52%,
              #f7efe6 100%
            );
        }

        .bean-quality-page::before {
          position: absolute;
          background:
            linear-gradient(
              rgba(90, 55, 38, 0.018) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(90, 55, 38, 0.014) 1px,
              transparent 1px
            );
          background-size: 52px 52px;
          mask-image:
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.12),
              transparent 72%
            );
        }

        .coffee-noise {
          position: absolute;
          opacity: 0.012;
          background-image:
            radial-gradient(
              rgba(90, 55, 38, 0.55) 0.5px,
              transparent 0.5px
            );
        }

        .background-glow,
        .floating-bean {
          position: absolute;
        }

        .background-glow {
          opacity: 0.08;
          filter: blur(140px);
        }

        .glow-left {
          background: #d1a16d;
        }

        .glow-right {
          background: #8d6348;
        }

        .glow-center {
          background: #d6b48b;
          opacity: 0.05;
        }

        .floating-bean {
          color: rgba(122, 75, 51, 0.075);
        }

        .quality-container {
          width: min(1280px, calc(100% - 40px));
          padding: 36px 0 62px;
        }

        /* ==================================================
           HERO — LARGE DARK CARD
        ================================================== */

        .quality-hero {
          min-height: 315px;
          padding: 38px 42px;
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.055);
          background:
            radial-gradient(
              circle at 87% 22%,
              rgba(217, 146, 70, 0.16),
              transparent 32%
            ),
            linear-gradient(
              140deg,
              #4a291d 0%,
              #3b2218 54%,
              #29160f 100%
            );
          box-shadow:
            0 18px 44px rgba(43, 24, 18, 0.14),
            inset 0 1px 0 rgba(255,255,255,.07);
        }

        .hero-coffee-mark {
          width: 72px;
          height: 72px;
          border-color: rgba(255, 229, 175, 0.36);
          color: #fffaf3;
          background:
            linear-gradient(
              145deg,
              #dea54d 0%,
              #c57825 100%
            );
          box-shadow:
            0 15px 31px rgba(185,109,40,.23),
            inset 0 1px 0 rgba(255,255,255,.24);
        }

        .hero-eyebrow {
          color: #e4b77d;
          font-size: 11px;
          letter-spacing: 1.55px;
        }

        .eyebrow-dot {
          background: #dca65e;
          box-shadow: 0 0 0 5px rgba(220,166,94,.08);
        }

        .hero-copy h1 {
          color: #fffaf3;
          font-size: clamp(44px, 5vw, 66px);
        }

        .hero-copy h1 span {
          color: #e8b473;
        }

        .hero-copy > p {
          color: rgba(255, 241, 226, 0.70);
          font-size: 15px;
          line-height: 1.75;
        }

        .hero-meta-item span {
          color: rgba(226, 192, 158, 0.55);
          font-size: 9px;
        }

        .hero-meta-item strong {
          color: #f6e4d0;
          font-size: 12px;
        }

        .hero-meta-divider {
          background: rgba(240, 194, 140, 0.13);
        }

        .system-ready i {
          background: #4fbf72;
          box-shadow: 0 0 10px rgba(79,191,114,.38);
        }

        .hero-bean-core {
          color: #efb473;
          background:
            linear-gradient(
              145deg,
              rgba(239,180,116,.11),
              rgba(255,255,255,.022)
            );
          border-color: rgba(239,180,116,.14);
        }

        .bean-orbit {
          color: rgba(239,180,116,.46);
        }

        /* ==================================================
           LIGHT SECTION HEADING
        ================================================== */

        .workflow-heading {
          margin-top: 30px;
          padding: 0 5px;
        }

        .workflow-heading > div:first-child > span {
          color: #8a5b3d;
          font-size: 10px;
          letter-spacing: 1.45px;
        }

        .workflow-heading h2 {
          color: #2b1812;
          font-size: 29px;
          line-height: 1.15;
        }

        .workflow-step-number > span {
          color: #9c8b81;
          font-size: 9px;
        }

        .workflow-step-number strong {
          color: #9a6338;
          font-size: 24px;
        }

        .workflow-step-number small {
          color: #a59387;
        }

        /* ==================================================
           STEPPER — DARK CARD
        ================================================== */

        .stepper-shell {
          margin-top: 16px;
          padding: 12px;
          border-radius: 23px;
          border: 1px solid rgba(255,255,255,.045);
          background:
            radial-gradient(
              circle at 92% 10%,
              rgba(197, 138, 77, 0.09),
              transparent 30%
            ),
            linear-gradient(
              140deg,
              #40251a,
              #2c1811
            );
          box-shadow:
            0 13px 32px rgba(43,24,18,.11),
            inset 0 1px 0 rgba(255,255,255,.05);
        }

        .stepper-accent {
          background:
            linear-gradient(
              90deg,
              transparent,
              #d29a58,
              transparent
            );
        }

        /* ==================================================
           MAIN ANALYSIS — DARK CARD
        ================================================== */

        .analysis-shell {
          margin-top: 22px;
          padding: 20px;
          border-radius: 27px;
          border: 1px solid rgba(255,255,255,.05);
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(197,138,77,.08),
              transparent 30%
            ),
            linear-gradient(
              145deg,
              #3c2218 0%,
              #28160f 100%
            );
          box-shadow:
            0 18px 42px rgba(43,24,18,.13),
            inset 0 1px 0 rgba(255,255,255,.055);
        }

        .analysis-shell-top {
          border-bottom-color: rgba(235, 183, 123, 0.09);
        }

        .analysis-status-icon {
          color: #e2aa68;
          background: rgba(224,154,76,.09);
          border-color: rgba(228,164,90,.11);
        }

        .analysis-status > div > span {
          color: rgba(225,187,145,.54);
          font-size: 9px;
        }

        .analysis-status strong {
          color: #f5dfc8;
          font-size: 13px;
        }

        .analysis-stage-pill {
          color: #e2b27d;
          background: rgba(217,145,69,.08);
          border-color: rgba(228,169,101,.11);
          font-size: 10px;
        }

        /* Child component colors are controlled inside SensorAnalysis. */

        /* ==================================================
           FOOTER ON LIGHT BACKGROUND
        ================================================== */

        .quality-footer-strip {
          border-top-color: rgba(90,55,38,.09);
        }

        .quality-footer-strip > div {
          color: #9a6338;
        }

        .quality-footer-strip > div span {
          color: #6c5548;
          font-size: 11px;
        }

        .quality-footer-strip p {
          color: #9b897f;
          font-size: 10px;
        }

        @media (max-width: 680px) {
          .quality-container {
            width: calc(100% - 22px);
          }

          .quality-hero {
            padding: 23px;
          }

          .analysis-shell {
            padding: 12px;
          }
        }




        /* ==================================================
           FINAL LIKED LOOK
           Light page -> light module heading -> one dark card
        ================================================== */

        .analysis-shell {
          margin-top: 28px;
          padding: 0;
          border: none;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
        }

        .analysis-shell-top {
          min-height: 60px;
          margin-bottom: 14px;
          padding: 0 6px 13px;
          border-bottom: 1px solid rgba(90,55,38,.09);
        }

        .analysis-status-icon {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          color: #7a4b33;
          background: #f1e4d5;
          border: 1px solid rgba(90,55,38,.08);
        }

        .analysis-status > div > span {
          color: #9a765f;
          font-size: 10px;
          letter-spacing: 1.25px;
        }

        .analysis-status strong {
          color: #3b2921;
          font-size: 14px;
        }

        .analysis-stage-pill {
          padding: 8px 12px;
          color: #7d5439;
          background: #f3e7da;
          border: 1px solid #e6d3bf;
          font-size: 10px;
        }

        .analysis-shell > .sensor-analysis {
          margin-top: 0;
        }

        /* SensorAnalysis controls its own main card background. */


        @media (max-width: 680px) {
          .analysis-shell {
            margin-top: 22px;
          }

          .analysis-shell-top {
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
          }

          .analysis-stage-pill {
            align-self: flex-start;
          }
        }


        /* ==================================================
           RESPONSIVE
        ================================================== */

        @media (max-width: 980px) {
          .quality-hero {
            grid-template-columns: 64px minmax(0, 1fr);
            padding: 30px;
          }

          .hero-bean-cluster {
            display: none;
          }

          .hero-copy h1 {
            font-size: clamp(40px, 7vw, 58px);
          }
        }

        @media (max-width: 680px) {
          .quality-container {
            width: calc(100% - 22px);
            padding: 22px 0 42px;
          }

          .quality-hero {
            min-height: 0;
            grid-template-columns: 1fr;
            gap: 16px;
            padding: 22px;
            border-radius: 24px;
          }

          .hero-coffee-mark {
            width: 56px;
            height: 56px;
            border-radius: 17px;
          }

          .hero-copy h1 {
            font-size: clamp(37px, 12vw, 50px);
            letter-spacing: -2px;
          }

          .hero-copy > p {
            font-size: 13px;
          }

          .hero-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .hero-meta-divider {
            display: none;
          }

          .workflow-heading {
            align-items: center;
          }

          .workflow-heading h2 {
            font-size: 21px;
          }

          .analysis-shell {
            padding: 11px;
            border-radius: 22px;
          }

          .analysis-shell-top {
            align-items: flex-start;
            flex-direction: column;
          }

          .temporary-card {
            padding: 21px;
            border-radius: 20px;
          }

          .temporary-card h2 {
            font-size: 24px;
          }

          .button-row {
            flex-direction: column;
          }

          .button-row button {
            width: 100%;
          }

          .quality-footer-strip {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .floating-bean {
            animation: none;
          }

          .bean-quality-page *,
          .bean-quality-page *::before,
          .bean-quality-page *::after {
            scroll-behavior: auto !important;
            transition-duration: 0.001ms !important;
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
          }
        }


        /* ==================================================
           REMOVE EXTRA OUTER ANALYSIS CARD
           Keep module heading on the light page background.
        ================================================== */

        .analysis-shell {
          margin-top: 28px !important;
          padding: 0 !important;
          border: none !important;
          border-radius: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }

        .analysis-shell-top {
          min-height: 58px;
          margin: 0 4px 18px;
          padding: 0 0 14px !important;
          border: none !important;
          border-bottom: 1px solid rgba(90, 55, 38, 0.09) !important;
          border-radius: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
        }

        .analysis-shell > .sensor-analysis {
          margin-top: 0 !important;
        }

        @media (max-width: 680px) {
          .analysis-shell {
            padding: 0 !important;
            border-radius: 0 !important;
          }

          .analysis-shell-top {
            margin-left: 0;
            margin-right: 0;
          }
        }

      `}</style>
    </div>
  );
}

export default BeanQualityPage;

import { useState } from "react";
import BeanQualityStepper from "../components/stepper/BeanQualityStepper";
import SensorAnalysis from "../components/sensor/SensorAnalysis";
import PhysicalAnalysis from "../components/physical/PhysicalAnalysis";
import FinalQualityReport from "../components/report/FinalQualityReport";

function BeanQualityPage() {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 result
  const [sensorResult, setSensorResult] = useState(null);

  // Step 2 result
  const [physicalResult, setPhysicalResult] = useState(null);

  // Step 3 result
  const [finalResult, setFinalResult] = useState(null);

  const goToStep = (step) => {
    setCurrentStep(step);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="bean-quality-page">
      <div className="background-glow glow-left"></div>
      <div className="background-glow glow-right"></div>

      <main className="quality-container">
        {/* Header */}
        <section className="quality-header">
          <span className="page-badge">AI QUALITY CONTROL</span>

          <h1>Beans Quality Checking</h1>

          <p>
            Analyze coffee bean quality using sensor-based inspection and
            computer vision AI to generate a complete quality report.
          </p>
        </section>

        {/* Stepper */}
        <BeanQualityStepper currentStep={currentStep} onStepChange={goToStep} />

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

              // දැනට Step 3ට යනවා.
              // පස්සේ මෙතන quality fusion API call එක දානවා.
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
      </main>

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .bean-quality-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background:
            radial-gradient(
              circle at 10% 20%,
              rgba(205, 135, 70, 0.22),
              transparent 35%
            ),
            radial-gradient(
              circle at 90% 80%,
              rgba(113, 72, 42, 0.35),
              transparent 35%
            ),
            linear-gradient(
              135deg,
              #130b07 0%,
              #24130b 50%,
              #3a2115 100%
            );

          color: #fff7e8;
          font-family: Inter, Poppins, Arial, sans-serif;
        }

        .background-glow {
          position: fixed;
          width: 380px;
          height: 380px;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          opacity: 0.35;
        }

        .glow-left {
          top: 80px;
          left: -100px;
          background: #c78143;
        }

        .glow-right {
          right: -100px;
          bottom: 30px;
          background: #8f542e;
        }

        .quality-container {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
          padding: 55px 0 80px;
          position: relative;
          z-index: 1;
        }

        .quality-header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 40px;
        }

        .page-badge {
          display: inline-flex;
          padding: 8px 15px;
          margin-bottom: 18px;
          border: 1px solid rgba(255, 213, 159, 0.22);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.07);
          color: #efb976;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.8px;
        }

        .quality-header h1 {
          margin: 0;
          font-size: clamp(38px, 6vw, 66px);
          letter-spacing: -2px;
          background: linear-gradient(
            90deg,
            #fff1d9,
            #db9b5a,
            #ffe1ab
          );
          -webkit-background-clip: text;
          color: transparent;
        }

        .quality-header p {
          max-width: 720px;
          margin: 18px auto 0;
          color: rgba(255, 241, 218, 0.68);
          font-size: 16px;
          line-height: 1.7;
        }

        .step-content {
          margin-top: 30px;
        }

        .temporary-card {
          border-radius: 28px;
          padding: 35px;
          border: 1px solid rgba(255, 222, 178, 0.15);
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.1),
              rgba(255, 255, 255, 0.035)
            ),
            rgba(39, 22, 13, 0.78);

          backdrop-filter: blur(20px);

          box-shadow:
            0 25px 70px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .step-label {
          display: block;
          margin-bottom: 8px;
          color: #e8a45c;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .temporary-card h2 {
          margin: 0 0 12px;
          color: #fff5e5;
          font-size: 30px;
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
          border-radius: 15px;
          padding: 14px 22px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .primary-button {
          margin-top: 25px;
          color: #28150b;
          background: linear-gradient(
            135deg,
            #ffe0a3,
            #d68d48,
            #a55c31
          );

          box-shadow: 0 14px 32px rgba(198, 119, 58, 0.25);
        }

        .button-row .primary-button {
          margin-top: 0;
        }

        .primary-button:hover {
          transform: translateY(-2px);
        }

        .secondary-button {
          color: #ffe2b8;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 221, 174, 0.15);
        }

        .result-debug {
          margin-top: 25px;
          padding: 20px;
          border-radius: 18px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 220, 170, 0.1);
        }

        .result-debug p {
          margin: 8px 0;
          color: rgba(255, 239, 214, 0.7);
        }

        .result-debug strong {
          color: #ffd493;
        }

        @media (max-width: 640px) {
          .quality-container {
            width: calc(100% - 22px);
            padding-top: 35px;
          }

          .temporary-card {
            padding: 22px;
            border-radius: 22px;
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
        }
      `}</style>
    </div>
  );
}

export default BeanQualityPage;

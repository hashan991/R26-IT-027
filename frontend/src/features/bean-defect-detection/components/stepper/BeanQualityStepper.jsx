function BeanQualityStepper({ currentStep, onStepChange }) {
  const steps = [
    {
      number: 1,
      title: "Sensor Analysis",
      subtitle: "Connect, baseline & sample scan",
    },
    {
      number: 2,
      title: "Physical AI Analysis",
      subtitle: "Inspect bean appearance",
    },
    {
      number: 3,
      title: "Final Report",
      subtitle: "Decision & recommendations",
    },
  ];

  return (
    <div className="quality-stepper">
      {steps.map((step, index) => {
        const completed = currentStep > step.number;
        const active = currentStep === step.number;

        return (
          <div className="stepper-item-wrap" key={step.number}>
            <button
              className={`stepper-item ${
                active ? "active-step" : ""
              } ${completed ? "completed-step" : ""}`}
              onClick={() => {
                // future step direct open කරන්න දෙන්නේ නැහැ
                if (step.number <= currentStep) {
                  onStepChange(step.number);
                }
              }}
            >
              <div className="step-circle">{completed ? "✓" : step.number}</div>

              <div className="step-text">
                <strong>{step.title}</strong>
                <span>{step.subtitle}</span>
              </div>
            </button>

            {index < steps.length - 1 && (
              <div
                className={`step-line ${
                  currentStep > step.number ? "line-completed" : ""
                }`}
              ></div>
            )}
          </div>
        );
      })}

      <style>{`
        .quality-stepper {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-radius: 24px;
          padding: 18px;
          border: 1px solid rgba(255, 221, 176, 0.13);
          background: rgba(255, 255, 255, 0.055);
          backdrop-filter: blur(16px);
        }

        .stepper-item-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .stepper-item {
          position: relative;
          z-index: 2;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 10px;
          border: none;
          border-radius: 17px;
          background: transparent;
          color: rgba(255, 237, 210, 0.5);
          text-align: left;
        }

        .stepper-item:not(:disabled) {
          cursor: pointer;
        }

        .step-circle {
          flex: 0 0 44px;
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 1px solid rgba(255, 218, 164, 0.18);
          background: rgba(255, 255, 255, 0.06);
          font-weight: 900;
        }

        .step-text {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .step-text strong {
          font-size: 14px;
        }

        .step-text span {
          font-size: 11px;
          color: rgba(255, 238, 211, 0.42);
        }

        .active-step {
          color: #fff1da;
          background: rgba(222, 147, 77, 0.12);
        }

        .active-step .step-circle {
          color: #2c170c;
          border-color: transparent;
          background: linear-gradient(
            135deg,
            #ffe1a7,
            #d18b48
          );

          box-shadow: 0 0 24px rgba(223, 151, 80, 0.25);
        }

        .completed-step {
          color: #ffd9a6;
        }

        .completed-step .step-circle {
          color: #2b170c;
          background: #d99550;
        }

        .step-line {
          position: absolute;
          top: 50%;
          right: -50%;
          width: 100%;
          height: 2px;
          background: rgba(255, 220, 174, 0.1);
          z-index: 0;
        }

        .line-completed {
          background: linear-gradient(
            90deg,
            #d99450,
            rgba(217, 148, 80, 0.2)
          );
        }

        @media (max-width: 760px) {
          .quality-stepper {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .step-line {
            display: none;
          }

          .stepper-item {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default BeanQualityStepper;

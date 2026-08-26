import { useState, useRef, useEffect, useMemo } from "react";

import {
  predictSealDefects,
  getLeakDeviceStatus,
  runLeakDeviceTest,
  startRealtimeSealInspection,
  getRealtimeSealResult,
  stopRealtimeSealInspection,
  getRealtimeVideoUrl,
  getLeakTestHistory,
  getSealInspectionHistory,

  // Final inspection report
  getInspectionReportStatus,
  generateInspectionReport,
  getReportDownloadUrl,
} from "../services/sealService";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html,
  body,
  #root {
    width: 100%;
    min-height: 100%;
    margin: 0 !important;
    padding: 0 !important;
    max-width: none !important;
    overflow-x: hidden;
  }

  body {
    background: #fbf7f1;
  }

  :root {
    --seal-bg: #fbf7f1;
    --seal-panel: rgba(255, 255, 255, 0.78);
    --seal-panel-strong: rgba(255, 255, 255, 0.92);
    --seal-border: rgba(120, 72, 36, 0.16);
    --seal-border-soft: rgba(120, 72, 36, 0.10);
    --seal-text: #2a1710;
    --seal-muted: #7a5f51;
    --seal-dim: #9b8375;
    --seal-brown: #7c3f1d;
    --seal-brown-dark: #4a2412;
    --seal-caramel: #c7833f;
    --seal-gold: #d9a441;
    --seal-cream: #fff7ed;
    --seal-green: #198754;
    --seal-amber: #d97706;
    --seal-red: #dc2626;
  }

  .seal-root {
    min-height: 100vh;
    width: 100%;
    background:
      radial-gradient(circle at 12% 10%, rgba(199, 131, 63, 0.20), transparent 32%),
      radial-gradient(circle at 88% 8%, rgba(124, 63, 29, 0.14), transparent 30%),
      radial-gradient(circle at 50% 95%, rgba(217, 164, 65, 0.16), transparent 34%),
      linear-gradient(135deg, #fffaf3 0%, #fbf2e7 45%, #f8eadb 100%);
    font-family: 'DM Sans', sans-serif;
    color: var(--seal-text);
    position: relative;
    overflow: hidden;
  }

  .seal-root::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(rgba(124,63,29,0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,63,29,0.045) 1px, transparent 1px);
    background-size: 52px 52px;
    mask-image: radial-gradient(circle at center, black 0%, transparent 78%);
    z-index: 0;
  }

  .seal-root::after {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle, rgba(124,63,29,0.055) 1px, transparent 1px);
    background-size: 34px 34px;
    opacity: 0.45;
    z-index: 0;
  }

  .seal-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .orb {
    position: absolute;
    border-radius: 999px;
    filter: blur(28px);
    opacity: 0.58;
    animation: floatOrb 12s ease-in-out infinite alternate;
  }

  .orb-1 {
    width: 430px;
    height: 430px;
    background: radial-gradient(circle, rgba(199,131,63,0.34), transparent 68%);
    top: -120px;
    left: -120px;
  }

  .orb-2 {
    width: 390px;
    height: 390px;
    background: radial-gradient(circle, rgba(124,63,29,0.22), transparent 70%);
    right: -130px;
    top: 80px;
    animation-delay: -3s;
  }

  .orb-3 {
    width: 470px;
    height: 470px;
    background: radial-gradient(circle, rgba(217,164,65,0.22), transparent 72%);
    left: 36%;
    bottom: -220px;
    animation-delay: -7s;
  }

  @keyframes floatOrb {
    from { transform: translate3d(0, 0, 0) scale(1); }
    to { transform: translate3d(38px, 28px, 0) scale(1.12); }
  }

  .scan-line {
    position: fixed;
    left: 0;
    right: 0;
    top: -20%;
    height: 180px;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(199,131,63,0.08) 45%,
      rgba(124,63,29,0.10) 50%,
      rgba(217,164,65,0.08) 55%,
      transparent 100%
    );
    z-index: 0;
    pointer-events: none;
    animation: scanMove 8s linear infinite;
  }

  @keyframes scanMove {
    0% { transform: translateY(-20vh); opacity: 0; }
    15% { opacity: 1; }
    80% { opacity: 1; }
    100% { transform: translateY(130vh); opacity: 0; }
  }

  .seal-shell {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: none;
    margin: 0;
    padding: 28px clamp(28px, 3vw, 56px);
  }

  .top-nav {
    width: 100%;
    min-height: 74px;
    border: 1px solid rgba(124,63,29,0.14);
    background: rgba(255, 255, 255, 0.76);
    backdrop-filter: blur(22px);
    border-radius: 24px;
    padding: 14px 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    box-shadow: 0 18px 60px rgba(90, 49, 24, 0.12);
    animation: fadeDown 0.75s ease both;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 13px;
    min-width: 0;
  }

  .brand-logo {
    width: 48px;
    height: 48px;
    border-radius: 17px;
    display: grid;
    place-items: center;
    background:
      linear-gradient(135deg, #7c3f1d, #c7833f),
      radial-gradient(circle at 30% 20%, rgba(255,255,255,0.65), transparent 30%);
    box-shadow:
      0 14px 32px rgba(124,63,29,0.24),
      inset 0 1px 0 rgba(255,255,255,0.42);
    font-size: 23px;
    flex: 0 0 auto;
  }

  .brand-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 800;
    color: #2a1710;
    letter-spacing: -0.02em;
    white-space: nowrap;
  }

  .brand-subtitle {
    font-size: 12px;
    color: var(--seal-muted);
    margin-top: 2px;
    white-space: nowrap;
  }

  .nav-pills {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 9px;
    flex-wrap: wrap;
  }

  .nav-pill {
    border: 1px solid rgba(124,63,29,0.14);
    background: rgba(255,247,237,0.78);
    color: #5a2d17;
    border-radius: 999px;
    padding: 8px 13px;
    font-size: 12px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    white-space: nowrap;
  }

  .nav-pill-live {
    color: #166534;
    border-color: rgba(25,135,84,0.22);
    background: rgba(25,135,84,0.08);
  }

  .live-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: var(--seal-green);
    box-shadow: 0 0 16px rgba(25,135,84,0.8);
    animation: dotPulse 1.8s ease-in-out infinite;
  }

  @keyframes dotPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(0.72); opacity: 0.45; }
  }

  .hero-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(430px, 0.85fr);
    gap: 32px;
    align-items: stretch;
    padding: 34px 0 28px;
    min-height: calc(100vh - 135px);
  }

  .hero-left {
    min-height: calc(100vh - 165px);
    border: 1px solid rgba(124,63,29,0.14);
    background:
      linear-gradient(135deg, rgba(255,255,255,0.88), rgba(255,247,237,0.70)),
      radial-gradient(circle at 20% 10%, rgba(199,131,63,0.18), transparent 35%),
      radial-gradient(circle at 90% 82%, rgba(124,63,29,0.11), transparent 32%);
    backdrop-filter: blur(24px);
    border-radius: 34px;
    padding: 38px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 24px 80px rgba(90, 49, 24, 0.14);
    animation: fadeUp 0.85s 0.08s ease both;
  }

  .hero-left::before {
    content: "";
    position: absolute;
    inset: 1px;
    border-radius: 33px;
    border: 1px solid rgba(255,255,255,0.70);
    pointer-events: none;
  }

  .hero-left::after {
    content: "";
    position: absolute;
    width: 280px;
    height: 280px;
    right: -80px;
    top: -95px;
    background: conic-gradient(from 180deg, rgba(199,131,63,0.28), rgba(124,63,29,0.14), rgba(217,164,65,0.22), rgba(199,131,63,0.28));
    border-radius: 999px;
    filter: blur(18px);
    opacity: 0.75;
    animation: rotateSoft 18s linear infinite;
  }

  @keyframes rotateSoft {
    to { transform: rotate(360deg); }
  }

  .hero-content {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .seal-badge {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    gap: 9px;
    background: rgba(124,63,29,0.08);
    border: 1px solid rgba(124,63,29,0.20);
    color: #7c3f1d;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    padding: 9px 15px;
    border-radius: 999px;
    margin-bottom: 22px;
    box-shadow: 0 12px 28px rgba(124,63,29,0.08);
  }

  .seal-badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #c7833f;
    box-shadow: 0 0 18px rgba(199,131,63,0.90);
    animation: dotPulse 1.8s ease-in-out infinite;
  }

  .seal-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(42px, 6vw, 78px);
    line-height: 0.96;
    font-weight: 800;
    letter-spacing: -0.07em;
    margin-bottom: 22px;
    color: #2a1710;
  }

  .seal-title span {
    display: block;
  }

  .gradient-word {
    background: linear-gradient(135deg, #2a1710 0%, #7c3f1d 42%, #c7833f 75%, #d9a441 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .seal-subtitle {
    max-width: 650px;
    font-size: 17px;
    line-height: 1.82;
    color: #6f5548;
    font-weight: 500;
    margin-bottom: 28px;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 28px;
  }

  .hero-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(124,63,29,0.14);
    background: rgba(255,255,255,0.62);
    color: #5a2d17;
    border-radius: 15px;
    padding: 11px 14px;
    font-size: 13px;
    font-weight: 800;
    backdrop-filter: blur(14px);
    box-shadow: 0 8px 20px rgba(90,49,24,0.06);
  }

  .metrics-strip {
    margin-top: auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .metric-card {
    border: 1px solid rgba(124,63,29,0.13);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.86), rgba(255,247,237,0.68));
    border-radius: 22px;
    padding: 18px;
    min-height: 112px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 16px 36px rgba(90,49,24,0.08);
  }

  .metric-card::before {
    content: "";
    position: absolute;
    inset: auto 14px 0 14px;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(199,131,63,0.85), transparent);
  }

  .metric-icon {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    background: rgba(199,131,63,0.13);
    border: 1px solid rgba(199,131,63,0.20);
    margin-bottom: 12px;
  }

  .metric-value {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: #3b1d0f;
  }

  .metric-label {
    font-size: 12px;
    color: #7a5f51;
    margin-top: 4px;
    line-height: 1.4;
  }

  .hero-right {
    display: flex;
    flex-direction: column;
    gap: 18px;
    animation: fadeUp 0.85s 0.18s ease both;
  }

  .upload-panel {
    border: 1px solid rgba(124,63,29,0.15);
    background:
      linear-gradient(145deg, rgba(255,255,255,0.90), rgba(255,247,237,0.70)),
      radial-gradient(circle at 50% 0%, rgba(199,131,63,0.14), transparent 45%);
    backdrop-filter: blur(28px);
    border-radius: 34px;
    padding: 22px;
    min-height: calc(100vh - 165px);
    box-shadow: 0 24px 80px rgba(90,49,24,0.14);
    position: relative;
    overflow: hidden;
  }

  .upload-panel::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.62) 30%, transparent 60%);
    transform: translateX(-120%);
    animation: shinePanel 7s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes shinePanel {
    0%, 38% { transform: translateX(-120%); }
    58%, 100% { transform: translateX(120%); }
  }

  .panel-top {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    margin-bottom: 18px;
  }

  .panel-eyebrow {
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #c7833f;
    margin-bottom: 5px;
  }

  .panel-title {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 800;
    color: #2a1710;
    letter-spacing: -0.03em;
  }

  .panel-status {
    flex: 0 0 auto;
    border: 1px solid rgba(25,135,84,0.22);
    background: rgba(25,135,84,0.08);
    color: #166534;
    border-radius: 999px;
    padding: 9px 12px;
    font-size: 12px;
    font-weight: 900;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .upload-zone {
    position: relative;
    z-index: 2;
    min-height: 380px;
    border: 2px dashed rgba(124,63,29,0.26);
    border-radius: 28px;
    background:
      radial-gradient(circle at 50% 0%, rgba(199,131,63,0.13), transparent 50%),
      rgba(255,255,255,0.58);
    padding: 28px;
    text-align: center;
    cursor: pointer;
    transition: all 0.35s cubic-bezier(.2,.8,.2,1);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .upload-zone::before {
    content: "";
    position: absolute;
    inset: 14px;
    border-radius: 23px;
    border: 1px solid rgba(124,63,29,0.10);
    pointer-events: none;
  }

  .upload-zone::after {
    content: "";
    position: absolute;
    width: 160px;
    height: 160px;
    background: rgba(199,131,63,0.18);
    border-radius: 999px;
    filter: blur(24px);
    bottom: -80px;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.35s ease;
  }

  .upload-zone:hover,
  .upload-zone.drag-over {
    border-color: rgba(124,63,29,0.60);
    transform: translateY(-3px);
    box-shadow:
      0 22px 60px rgba(90,49,24,0.14),
      inset 0 0 0 1px rgba(255,255,255,0.55);
    background:
      radial-gradient(circle at 50% 0%, rgba(199,131,63,0.20), transparent 52%),
      rgba(255,247,237,0.78);
  }

  .upload-zone:hover::after,
  .upload-zone.drag-over::after {
    opacity: 1;
  }

  .upload-inner {
    position: relative;
    z-index: 2;
    width: 100%;
  }

  .upload-icon-wrap {
    width: 98px;
    height: 98px;
    margin: 0 auto 22px;
    border-radius: 31px;
    display: grid;
    place-items: center;
    font-size: 42px;
    background:
      linear-gradient(135deg, rgba(124,63,29,0.18), rgba(199,131,63,0.20)),
      rgba(255,255,255,0.72);
    border: 1px solid rgba(124,63,29,0.18);
    box-shadow:
      0 18px 44px rgba(90,49,24,0.12),
      inset 0 1px 0 rgba(255,255,255,0.80);
    transition: all 0.35s ease;
  }

  .upload-zone:hover .upload-icon-wrap,
  .upload-zone.drag-over .upload-icon-wrap {
    transform: scale(1.06) rotate(-4deg);
    box-shadow:
      0 24px 64px rgba(90,49,24,0.18),
      inset 0 1px 0 rgba(255,255,255,0.92);
  }

  .upload-label {
    font-family: 'Syne', sans-serif;
    font-size: 23px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #2a1710;
    margin-bottom: 9px;
  }

  .upload-hint {
    color: #70584b;
    font-size: 14px;
    line-height: 1.65;
    max-width: 320px;
    margin: 0 auto 20px;
    font-weight: 500;
  }

  .upload-btn-fake {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    height: 44px;
    padding: 0 22px;
    border-radius: 14px;
    background: linear-gradient(135deg, #7c3f1d, #c7833f);
    border: 1px solid rgba(255,255,255,0.55);
    color: white;
    font-size: 13px;
    font-weight: 900;
    box-shadow: 0 14px 34px rgba(124,63,29,0.24);
    transition: all 0.25s ease;
  }

  .upload-zone:hover .upload-btn-fake {
    transform: translateY(-1px);
    box-shadow: 0 18px 44px rgba(124,63,29,0.32);
  }

  .upload-formats {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 18px;
  }

  .format-pill {
    font-size: 11px;
    font-weight: 900;
    color: #7c3f1d;
    border: 1px solid rgba(124,63,29,0.16);
    background: rgba(255,247,237,0.82);
    border-radius: 999px;
    padding: 5px 9px;
  }

  .upload-input {
    display: none;
  }

  .preview-section {
    position: relative;
    z-index: 2;
  }

  .preview-card {
    border: 1px solid rgba(124,63,29,0.14);
    background:
      linear-gradient(145deg, rgba(255,255,255,0.88), rgba(255,247,237,0.70));
    border-radius: 28px;
    padding: 16px;
    overflow: hidden;
    animation: zoomFade 0.45s ease both;
    box-shadow: 0 16px 42px rgba(90,49,24,0.10);
  }

  .preview-image-box {
    width: 100%;
    height: 330px;
    border-radius: 23px;
    overflow: hidden;
    border: 1px solid rgba(124,63,29,0.14);
    background: rgba(255,247,237,0.70);
    position: relative;
  }

  .preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .preview-glow {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, transparent 42%, rgba(42,23,16,0.28) 100%),
      radial-gradient(circle at 50% 0%, rgba(199,131,63,0.10), transparent 55%);
    pointer-events: none;
  }

  .preview-floating-tag {
    position: absolute;
    left: 14px;
    top: 14px;
    border: 1px solid rgba(25,135,84,0.26);
    background: rgba(255,255,255,0.78);
    backdrop-filter: blur(12px);
    color: #166534;
    font-size: 12px;
    font-weight: 900;
    border-radius: 999px;
    padding: 8px 11px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .preview-info {
    padding: 17px 4px 4px;
  }

  .preview-info-label {
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: #c7833f;
    margin-bottom: 8px;
  }

  .preview-info-name {
    font-family: 'Syne', sans-serif;
    font-size: 19px;
    font-weight: 800;
    color: #2a1710;
    line-height: 1.35;
    word-break: break-word;
    margin-bottom: 8px;
  }

  .preview-meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .preview-meta {
    border: 1px solid rgba(124,63,29,0.14);
    background: rgba(255,247,237,0.82);
    color: #5a2d17;
    border-radius: 999px;
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 800;
  }

  .preview-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .soft-btn {
    height: 44px;
    border-radius: 14px;
    border: 1px solid rgba(124,63,29,0.14);
    background: rgba(255,255,255,0.72);
    color: #5a2d17;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    transition: all 0.25s ease;
  }

  .soft-btn:hover {
    transform: translateY(-1px);
    background: rgba(255,247,237,0.94);
    border-color: rgba(124,63,29,0.30);
  }

  .soft-btn.danger:hover {
    background: rgba(220,38,38,0.08);
    border-color: rgba(220,38,38,0.24);
    color: #b91c1c;
  }

  .detect-wrap {
    position: relative;
    z-index: 2;
    margin-top: 17px;
  }

  .detect-btn {
    width: 100%;
    min-height: 66px;
    border: none;
    border-radius: 22px;
    cursor: pointer;
    color: #ffffff;
    font-family: 'Syne', sans-serif;
    font-size: 17px;
    font-weight: 900;
    letter-spacing: -0.01em;
    position: relative;
    overflow: hidden;
    background:
      linear-gradient(135deg, #4a2412 0%, #7c3f1d 48%, #c7833f 100%);
    box-shadow:
      0 22px 52px rgba(124,63,29,0.30),
      inset 0 1px 0 rgba(255,255,255,0.30);
    transition: all 0.28s cubic-bezier(.2,.8,.2,1);
  }

  .detect-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.36) 35%, transparent 70%);
    transform: translateX(-120%);
    transition: transform 0.7s ease;
  }

  .detect-btn::after {
    content: "";
    position: absolute;
    inset: 1px;
    border-radius: 21px;
    border: 1px solid rgba(255,255,255,0.28);
    pointer-events: none;
  }

  .detect-btn:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow:
      0 28px 70px rgba(124,63,29,0.40),
      inset 0 1px 0 rgba(255,255,255,0.36);
  }

  .detect-btn:hover:not(:disabled)::before {
    transform: translateX(120%);
  }

  .detect-btn:active:not(:disabled) {
    transform: translateY(-1px) scale(0.995);
  }

  .detect-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
  }

  .detect-btn span {
    position: relative;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 11px;
  }

  .spinner {
    width: 21px;
    height: 21px;
    border: 2px solid rgba(255,255,255,0.32);
    border-top-color: white;
    border-radius: 999px;
    animation: spin 0.65s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .quick-guide {
    position: relative;
    z-index: 2;
    margin-top: 17px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .guide-item {
    border: 1px solid rgba(124,63,29,0.12);
    background: rgba(255,255,255,0.58);
    border-radius: 18px;
    padding: 14px 12px;
    text-align: center;
    box-shadow: 0 10px 24px rgba(90,49,24,0.06);
  }

  .guide-icon {
    font-size: 20px;
    margin-bottom: 7px;
  }

  .guide-text {
    font-size: 11px;
    color: #6f5548;
    font-weight: 800;
    line-height: 1.35;
  }

  .results-section {
    margin-top: 4px;
    border: 1px solid rgba(124,63,29,0.14);
    background:
      linear-gradient(145deg, rgba(255,255,255,0.90), rgba(255,247,237,0.70)),
      radial-gradient(circle at 16% 0%, rgba(25,135,84,0.07), transparent 32%),
      radial-gradient(circle at 90% 0%, rgba(199,131,63,0.12), transparent 36%);
    backdrop-filter: blur(24px);
    border-radius: 34px;
    padding: 24px;
    box-shadow: 0 24px 80px rgba(90,49,24,0.14);
    animation: fadeUp 0.7s ease both;
    overflow: hidden;
    position: relative;
  }

  .results-section::before {
    content: "";
    position: absolute;
    top: 0;
    left: 24px;
    right: 24px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(124,63,29,0.22), transparent);
  }

  .results-head {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    margin-bottom: 20px;
  }

  .results-kicker {
    color: #198754;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-size: 11px;
    font-weight: 900;
    margin-bottom: 7px;
  }

  .results-main-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: #2a1710;
  }

  .results-summary-pill {
    border: 1px solid rgba(124,63,29,0.12);
    background: rgba(255,247,237,0.82);
    color: #5a2d17;
    border-radius: 999px;
    padding: 10px 13px;
    font-size: 12px;
    font-weight: 900;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }

  .status-cards {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1.1fr 0.9fr 0.9fr;
    gap: 14px;
    margin-bottom: 18px;
  }

  .status-card {
    min-height: 132px;
    border: 1px solid rgba(124,63,29,0.13);
    background:
      linear-gradient(145deg, rgba(255,255,255,0.86), rgba(255,247,237,0.68));
    border-radius: 24px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 14px 34px rgba(90,49,24,0.08);
  }

  .history-panel{

    margin-top:20px;

    width:100%;

}


.history-table-container{

    max-height:450px;

    overflow-y:auto;

    overflow-x:auto;

    border-radius:20px;

}

  .status-card::before {
    content: "";
    position: absolute;
    inset: auto 16px 0 16px;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(199,131,63,0.78), transparent);
  }

  .status-card.good {
    border-color: rgba(25,135,84,0.22);
    background:
      linear-gradient(145deg, rgba(25,135,84,0.08), rgba(255,255,255,0.82));
  }

  .status-card.bad {
    border-color: rgba(220,38,38,0.22);
    background:
      linear-gradient(145deg, rgba(220,38,38,0.08), rgba(255,255,255,0.82));
  }

  .status-card.good::before {
    background: linear-gradient(90deg, transparent, rgba(25,135,84,0.70), transparent);
  }

  .status-card.bad::before {
    background: linear-gradient(90deg, transparent, rgba(220,38,38,0.70), transparent);
  }

  .sc-label {
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: #8a6b5b;
    margin-bottom: 10px;
  }

  .sc-value {
    font-family: 'Syne', sans-serif;
    font-size: 30px;
    line-height: 1.05;
    font-weight: 800;
    color: #2a1710;
    letter-spacing: -0.04em;
    word-break: break-word;
  }

  .sc-value.good {
    color: #198754;
  }

  .sc-value.bad {
    color: #dc2626;
  }

  .sc-icon {
    position: absolute;
    right: 18px;
    top: 17px;
    font-size: 28px;
    opacity: 0.82;
  }

  .sc-caption {
    margin-top: 11px;
    color: #70584b;
    font-size: 12px;
    line-height: 1.45;
    font-weight: 500;
  }

  .results-grid {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
    gap: 16px;
  }

  .result-block {
    border: 1px solid rgba(124,63,29,0.13);
    background: rgba(255,255,255,0.66);
    border-radius: 26px;
    overflow: hidden;
    box-shadow: 0 14px 34px rgba(90,49,24,0.08);
  }

  .block-header {
    padding: 15px 18px;
    border-bottom: 1px solid rgba(124,63,29,0.10);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: rgba(255,247,237,0.78);
  }

  .block-title {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.11em;
    color: #5a2d17;
    display: inline-flex;
    align-items: center;
    gap: 9px;
  }

  .block-dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: var(--seal-green);
    box-shadow: 0 0 18px rgba(25,135,84,0.70);
  }

  .block-body {
    padding: 18px;
  }

  .pred-img-frame {
    width: 100%;
    min-height: 430px;
    border-radius: 20px;
    background:
      linear-gradient(135deg, rgba(255,247,237,0.82), rgba(255,255,255,0.72)),
      repeating-linear-gradient(45deg, rgba(124,63,29,0.045) 0px, rgba(124,63,29,0.045) 1px, transparent 1px, transparent 12px);
    border: 1px solid rgba(124,63,29,0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    overflow: hidden;
  }

  .pred-img {
    width: 100%;
    height: auto;
    max-height: 560px;
    object-fit: contain;
    display: block;
    border-radius: 16px;
    box-shadow: 0 20px 50px rgba(90,49,24,0.18);
  }

  .analysis-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .table-wrap {
    width: 100%;
    overflow: hidden;
  }

  .defect-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  .defect-table thead tr {
    background: rgba(199,131,63,0.10);
  }

  .defect-table th {
    padding: 14px 16px;
    text-align: left;
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.10em;
    color: #8a6b5b;
    border-bottom: 1px solid rgba(124,63,29,0.10);
  }

  .defect-table td {
    padding: 15px 16px;
    border-bottom: 1px solid rgba(124,63,29,0.08);
    color: #2a1710;
    vertical-align: middle;
    font-weight: 600;
  }

  .defect-table tbody tr:last-child td {
    border-bottom: none;
  }

  .defect-table tbody tr {
    transition: background 0.22s ease;
  }

  .defect-table tbody tr:hover {
    background: rgba(255,247,237,0.86);
  }

  .defect-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 34px;
    height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    background: rgba(220,38,38,0.08);
    border: 1px solid rgba(220,38,38,0.20);
    color: #b91c1c;
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 900;
  }

  .good-badge {
    background: rgba(25,135,84,0.10);
    border-color: rgba(25,135,84,0.24);
    color: #166534;
  }

  .row-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(199,131,63,0.13);
    border: 1px solid rgba(199,131,63,0.20);
    border-radius: 9px;
    font-size: 12px;
    font-weight: 900;
    font-family: 'Syne', sans-serif;
    color: #7c3f1d;
  }

  .class-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-weight: 900;
    color: #2a1710;
  }

  .class-pill::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: var(--seal-red);
    box-shadow: 0 0 14px rgba(220,38,38,0.55);
  }

  .conf-bar-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 170px;
  }

  .conf-bar-track {
    flex: 1;
    height: 8px;
    background: rgba(124,63,29,0.10);
    border-radius: 999px;
    overflow: hidden;
    border: 1px solid rgba(124,63,29,0.08);
  }

  .conf-bar-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #7c3f1d, #c7833f, #d9a441);
    transition: width 0.85s cubic-bezier(.2,.8,.2,1);
    box-shadow: 0 0 16px rgba(199,131,63,0.45);
  }

  .conf-text {
    min-width: 48px;
    text-align: right;
    font-size: 13px;
    font-weight: 900;
    color: #7c3f1d;
  }

  .empty-state {
    padding: 28px;
    text-align: center;
    color: #70584b;
    font-size: 14px;
    line-height: 1.65;
    font-weight: 600;
  }

  .empty-icon {
    font-size: 32px;
    margin-bottom: 10px;
  }

  .insight-box {
    border: 1px solid rgba(124,63,29,0.13);
    background:
      linear-gradient(145deg, rgba(255,247,237,0.88), rgba(255,255,255,0.72));
    border-radius: 22px;
    padding: 16px;
    color: #5f493d;
    font-size: 13px;
    line-height: 1.6;
    font-weight: 500;
    box-shadow: 0 14px 34px rgba(90,49,24,0.08);
  }

  .insight-title {
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    color: #2a1710;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .error-box {
    margin-top: 14px;
    position: relative;
    z-index: 2;
    border: 1px solid rgba(220,38,38,0.24);
    background: rgba(220,38,38,0.08);
    color: #b91c1c;
    border-radius: 18px;
    padding: 13px 15px;
    font-size: 13px;
    line-height: 1.5;
    font-weight: 700;
    animation: shakeSoft 0.45s ease both;
  }

  @keyframes shakeSoft {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-3px); }
    50% { transform: translateX(3px); }
    75% { transform: translateX(-2px); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-18px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes zoomFade {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }


  .mode-tabs {
    margin: 22px 0 0;
    display: flex;
    justify-content: center;
    position: relative;
    z-index: 2;
  }

    .mode-tabs-inner {
    width: min(980px, 100%);
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 8px;
    border-radius: 22px;
    border: 1px solid rgba(124,63,29,0.14);
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(20px);
    box-shadow: 0 14px 38px rgba(90,49,24,0.09);
}

  .mode-tab {
    min-height: 48px;
    border: 1px solid transparent;
    border-radius: 16px;
    background: transparent;
    color: #725548;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    transition: all 0.25s ease;
  }

  .mode-tab:hover {
    background: rgba(199,131,63,0.08);
    color: #5a2d17;
  }

  .mode-tab.active {
    color: white;
    border-color: rgba(255,255,255,0.45);
    background: linear-gradient(135deg, #4a2412, #7c3f1d 58%, #c7833f);
    box-shadow: 0 12px 30px rgba(124,63,29,0.24);
  }

  .device-page {
    padding: 34px 0 28px;
    animation: fadeUp 0.65s ease both;
  }

  .device-hero {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(460px, 1.1fr);
    gap: 24px;
    align-items: stretch;
  }

  .device-info-card,
  .device-control-card {
    border: 1px solid rgba(124,63,29,0.14);
    background:
      linear-gradient(145deg, rgba(255,255,255,0.91), rgba(255,247,237,0.72)),
      radial-gradient(circle at 12% 0%, rgba(199,131,63,0.14), transparent 40%);
    backdrop-filter: blur(24px);
    border-radius: 32px;
    padding: 28px;
    box-shadow: 0 24px 80px rgba(90,49,24,0.13);
    position: relative;
    overflow: hidden;
  }

  .device-info-card::before,
  .device-control-card::before {
    content: "";
    position: absolute;
    inset: 1px;
    border-radius: 31px;
    border: 1px solid rgba(255,255,255,0.66);
    pointer-events: none;
  }

  .device-kicker {
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #c7833f;
    margin-bottom: 10px;
  }

  .device-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(32px, 4vw, 52px);
    line-height: 1.02;
    letter-spacing: -0.055em;
    color: #2a1710;
    margin-bottom: 16px;
  }

  .device-description {
    color: #6f5548;
    font-size: 15px;
    line-height: 1.75;
    font-weight: 500;
    margin-bottom: 22px;
  }

  .device-flow {
    display: grid;
    gap: 10px;
    margin-top: 20px;
  }

  .device-flow-item {
    display: grid;
    grid-template-columns: 38px 1fr;
    gap: 12px;
    align-items: center;
    border: 1px solid rgba(124,63,29,0.11);
    background: rgba(255,255,255,0.58);
    border-radius: 16px;
    padding: 12px 14px;
  }

  .device-flow-num {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    background: rgba(199,131,63,0.13);
    border: 1px solid rgba(199,131,63,0.20);
    color: #7c3f1d;
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 900;
  }

  .device-flow-text {
    color: #5f493d;
    font-size: 13px;
    line-height: 1.45;
    font-weight: 700;
  }

  .device-status-row {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .device-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    min-height: 40px;
    padding: 0 13px;
    border-radius: 999px;
    border: 1px solid rgba(124,63,29,0.14);
    background: rgba(255,247,237,0.78);
    color: #7a5f51;
    font-size: 12px;
    font-weight: 900;
  }

  .device-status-badge.connected {
    color: #166534;
    border-color: rgba(25,135,84,0.22);
    background: rgba(25,135,84,0.08);
  }

  .device-status-badge.disconnected {
    color: #b91c1c;
    border-color: rgba(220,38,38,0.22);
    background: rgba(220,38,38,0.08);
  }

  .device-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #9b8375;
  }

  .device-status-badge.connected .device-dot {
    background: #198754;
    box-shadow: 0 0 16px rgba(25,135,84,0.72);
  }

  .device-status-badge.disconnected .device-dot {
    background: #dc2626;
    box-shadow: 0 0 16px rgba(220,38,38,0.55);
  }

  .refresh-device-btn {
    min-height: 40px;
    padding: 0 14px;
    border-radius: 13px;
    border: 1px solid rgba(124,63,29,0.14);
    background: rgba(255,255,255,0.72);
    color: #5a2d17;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
    transition: all 0.22s ease;
  }

  .refresh-device-btn:hover {
    transform: translateY(-1px);
    border-color: rgba(124,63,29,0.28);
    background: rgba(255,247,237,0.95);
  }

  .device-ready-box {
    position: relative;
    z-index: 2;
    border-radius: 22px;
    border: 1px solid rgba(124,63,29,0.13);
    background:
      linear-gradient(135deg, rgba(255,247,237,0.88), rgba(255,255,255,0.70));
    padding: 18px;
    margin-bottom: 16px;
  }

  .device-ready-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 900;
    color: #2a1710;
    margin-bottom: 7px;
  }

  .device-ready-text {
    color: #70584b;
    font-size: 13px;
    line-height: 1.6;
    font-weight: 600;
  }

  .device-warning {
    margin-top: 12px;
    border: 1px solid rgba(217,119,6,0.22);
    background: rgba(217,119,6,0.07);
    color: #92400e;
    border-radius: 14px;
    padding: 11px 12px;
    font-size: 12px;
    line-height: 1.5;
    font-weight: 800;
  }

  .device-test-btn {
    position: relative;
    z-index: 2;
    width: 100%;
    min-height: 66px;
    border: 0;
    border-radius: 20px;
    cursor: pointer;
    color: white;
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 900;
    background: linear-gradient(135deg, #4a2412, #7c3f1d 55%, #c7833f);
    box-shadow: 0 20px 48px rgba(124,63,29,0.28);
    transition: all 0.25s ease;
  }

  .device-test-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 25px 60px rgba(124,63,29,0.36);
  }

  .device-test-btn:disabled {
    cursor: not-allowed;
    opacity: 0.52;
    box-shadow: none;
  }

  .device-test-btn-content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .device-error {
    position: relative;
    z-index: 2;
    margin-top: 14px;
    border: 1px solid rgba(220,38,38,0.22);
    background: rgba(220,38,38,0.08);
    color: #b91c1c;
    border-radius: 16px;
    padding: 12px 14px;
    font-size: 12px;
    line-height: 1.55;
    font-weight: 800;
  }

  .device-result-section {
    margin-top: 20px;
    border: 1px solid rgba(124,63,29,0.14);
    background:
      linear-gradient(145deg, rgba(255,255,255,0.91), rgba(255,247,237,0.74));
    border-radius: 28px;
    padding: 22px;
    position: relative;
    z-index: 2;
    animation: zoomFade 0.4s ease both;
  }

  .device-result-banner {
    border-radius: 22px;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }

  .device-result-banner.good {
    border: 1px solid rgba(25,135,84,0.24);
    background: rgba(25,135,84,0.08);
  }

  .device-result-banner.leak {
    border: 1px solid rgba(220,38,38,0.24);
    background: rgba(220,38,38,0.08);
  }

  .device-result-label {
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: #8a6b5b;
    margin-bottom: 7px;
  }

  .device-result-value {
    font-family: 'Syne', sans-serif;
    font-size: 30px;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  .device-result-banner.good .device-result-value {
    color: #198754;
  }

  .device-result-banner.leak .device-result-value {
    color: #dc2626;
  }

  .device-result-icon {
    font-size: 38px;
  }

  .device-metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .device-metric {
    border: 1px solid rgba(124,63,29,0.11);
    background: rgba(255,255,255,0.68);
    border-radius: 17px;
    padding: 14px;
  }

  .device-metric-label {
    color: #8a6b5b;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 7px;
  }

  .device-metric-value {
    font-family: 'Syne', sans-serif;
    color: #2a1710;
    font-size: 18px;
    font-weight: 900;
    word-break: break-word;
  }

  .readings-box {
    margin-top: 12px;
    border: 1px solid rgba(124,63,29,0.10);
    background: rgba(255,247,237,0.65);
    border-radius: 17px;
    padding: 14px;
  }

  .readings-title {
    color: #5a2d17;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 9px;
  }

  .readings-list {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .reading-pill {
    border: 1px solid rgba(124,63,29,0.12);
    background: rgba(255,255,255,0.72);
    color: #5a2d17;
    border-radius: 999px;
    padding: 6px 9px;
    font-size: 11px;
    font-weight: 800;
  }



  .realtime-page {
    padding: 34px 0 28px;
    animation: fadeUp 0.65s ease both;
  }

  .realtime-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(360px, 0.75fr);
    gap: 22px;
    align-items: start;
  }

  .realtime-camera-card,
  .realtime-info-card {
    border: 1px solid rgba(124,63,29,0.14);
    background:
      linear-gradient(145deg, rgba(255,255,255,0.92), rgba(255,247,237,0.74));
    border-radius: 30px;
    padding: 22px;
    box-shadow: 0 24px 80px rgba(90,49,24,0.13);
  }

  .realtime-card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
  }

  .realtime-kicker {
    color: #c7833f;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 5px;
  }

  .realtime-title {
    font-family: 'Syne', sans-serif;
    color: #2a1710;
    font-size: 24px;
    font-weight: 900;
    letter-spacing: -0.035em;
  }

  .realtime-status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border-radius: 999px;
    padding: 9px 12px;
    border: 1px solid rgba(124,63,29,0.14);
    background: rgba(255,247,237,0.78);
    color: #7a5f51;
    font-size: 12px;
    font-weight: 900;
    white-space: nowrap;
  }

  .realtime-status.running {
    color: #166534;
    border-color: rgba(25,135,84,0.22);
    background: rgba(25,135,84,0.08);
  }

  .realtime-video-frame {
    width: 100%;
    min-height: 520px;
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid rgba(124,63,29,0.14);
    background:
      radial-gradient(circle at 50% 10%, rgba(199,131,63,0.13), transparent 45%),
      #1d120d;
    display: grid;
    place-items: center;
    position: relative;
  }

  .realtime-video {
    width: 100%;
    height: 100%;
    min-height: 520px;
    max-height: 680px;
    object-fit: contain;
    display: block;
    background: #111;
  }

  .realtime-empty {
    text-align: center;
    color: #d7c3b6;
    padding: 42px 24px;
  }

  .realtime-empty-icon {
    font-size: 54px;
    margin-bottom: 14px;
  }

  .realtime-empty-title {
    font-family: 'Syne', sans-serif;
    font-size: 21px;
    font-weight: 900;
    color: #fff7ed;
    margin-bottom: 8px;
  }

  .realtime-empty-text {
    font-size: 13px;
    line-height: 1.65;
    max-width: 440px;
  }

  .realtime-controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 14px;
  }

  .realtime-btn {
    min-height: 52px;
    border-radius: 16px;
    border: 1px solid rgba(124,63,29,0.14);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    transition: all 0.22s ease;
  }

  .realtime-btn.start {
    color: white;
    background: linear-gradient(135deg, #4a2412, #7c3f1d 58%, #c7833f);
    box-shadow: 0 14px 30px rgba(124,63,29,0.22);
  }

  .realtime-btn.stop {
    color: #b91c1c;
    background: rgba(220,38,38,0.07);
    border-color: rgba(220,38,38,0.20);
  }

  .realtime-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .realtime-btn:disabled {
    opacity: 0.48;
    cursor: not-allowed;
    box-shadow: none;
  }

  .realtime-error {
    margin-top: 12px;
    border: 1px solid rgba(220,38,38,0.22);
    background: rgba(220,38,38,0.08);
    color: #b91c1c;
    border-radius: 15px;
    padding: 11px 13px;
    font-size: 12px;
    font-weight: 800;
    line-height: 1.55;
  }

  .realtime-result-banner {
    border-radius: 21px;
    padding: 18px;
    margin-bottom: 14px;
    border: 1px solid rgba(124,63,29,0.13);
    background: rgba(255,247,237,0.72);
  }

  .realtime-result-banner.overheat {
    border-color: rgba(220,38,38,0.24);
    background: rgba(220,38,38,0.08);
  }

  .realtime-result-banner.clear {
    border-color: rgba(25,135,84,0.24);
    background: rgba(25,135,84,0.08);
  }

  .realtime-result-label {
    color: #8a6b5b;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 7px;
  }

  .realtime-result-value {
    font-family: 'Syne', sans-serif;
    font-size: 25px;
    font-weight: 900;
    letter-spacing: -0.035em;
    color: #2a1710;
  }

  .realtime-result-banner.overheat .realtime-result-value {
    color: #dc2626;
  }

  .realtime-result-banner.clear .realtime-result-value {
    color: #198754;
  }

  .realtime-metrics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 14px;
  }

  .realtime-metric {
    border: 1px solid rgba(124,63,29,0.11);
    background: rgba(255,255,255,0.68);
    border-radius: 17px;
    padding: 14px;
  }

  .realtime-metric-label {
    color: #8a6b5b;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 6px;
  }

  .realtime-metric-value {
    font-family: 'Syne', sans-serif;
    color: #2a1710;
    font-size: 18px;
    font-weight: 900;
  }

  .realtime-seals {
    display: grid;
    gap: 10px;
  }

  .realtime-seal-card {
    border: 1px solid rgba(124,63,29,0.11);
    background: rgba(255,255,255,0.65);
    border-radius: 17px;
    padding: 13px;
  }

  .realtime-seal-head {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
    margin-bottom: 7px;
  }

  .realtime-seal-name {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 900;
    color: #2a1710;
  }

  .realtime-seal-status {
    font-size: 10px;
    font-weight: 900;
    padding: 5px 8px;
    border-radius: 999px;
    background: rgba(25,135,84,0.08);
    color: #166534;
  }

  .realtime-seal-status.overheat {
    background: rgba(220,38,38,0.08);
    color: #b91c1c;
  }

  .realtime-seal-meta {
    color: #70584b;
    font-size: 11px;
    line-height: 1.55;
    font-weight: 700;
  }

  .realtime-note {
    margin-top: 14px;
    border: 1px solid rgba(217,119,6,0.20);
    background: rgba(217,119,6,0.07);
    color: #92400e;
    border-radius: 15px;
    padding: 11px 12px;
    font-size: 11px;
    line-height: 1.55;
    font-weight: 800;
  }

  @media (max-width: 1120px) {
    .device-hero,
    .realtime-layout {
      grid-template-columns: 1fr;
    }

    .device-metrics {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 1120px) {
    .seal-shell {
      padding: 20px;
    }

    .hero-layout {
      grid-template-columns: 1fr;
      min-height: auto;
    }

    .hero-left,
    .upload-panel {
      min-height: auto;
    }

    .metrics-strip {
      margin-top: 24px;
    }

    .results-grid {
      grid-template-columns: 1fr;
    }

    .pred-img-frame {
      min-height: 340px;
    }
  }


  @media (max-width: 760px) {
    .mode-tabs-inner {
      grid-template-columns: 1fr;
    }

    .device-info-card,
    .device-control-card {
      border-radius: 26px;
      padding: 20px;
    }

    .device-status-row {
      align-items: stretch;
      flex-direction: column;
    }

    .device-metrics {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 760px) {
    .seal-shell {
      padding: 16px;
    }

    .top-nav {
      align-items: flex-start;
      flex-direction: column;
      border-radius: 22px;
    }

    .nav-pills {
      justify-content: flex-start;
    }

    .hero-left {
      padding: 26px;
      border-radius: 28px;
    }

    .upload-panel {
      border-radius: 28px;
      padding: 17px;
    }

    .seal-title {
      font-size: clamp(38px, 12vw, 58px);
    }

    .seal-subtitle {
      font-size: 15px;
    }

    .metrics-strip,
    .status-cards,
    .quick-guide {
      grid-template-columns: 1fr;
    }

    .results-head {
      flex-direction: column;
    }

    .results-main-title {
      font-size: 24px;
    }

    .preview-image-box {
      height: 270px;
    }

    .preview-actions {
      grid-template-columns: 1fr;
    }

    .defect-table {
      min-width: 520px;
    }

    .table-wrap {
      overflow-x: auto;
    }
  }

  @media (max-width: 460px) {
  .seal-shell {
    padding: 12px;
  }

  .hero-left,
  .upload-panel,
  .results-section {
    border-radius: 24px;
  }

  .hero-left {
    padding: 22px;
  }

  .upload-zone {
    padding: 20px;
    min-height: 330px;
  }

  .upload-icon-wrap {
    width: 82px;
    height: 82px;
    font-size: 36px;
    border-radius: 26px;
  }

  .upload-label {
    font-size: 20px;
  }

  .detect-btn {
    min-height: 60px;
    font-size: 15px;
  }

  .brand-title,
  .brand-subtitle {
    white-space: normal;
  }
}


/* ==================================================
   FINAL REPORT
   ================================================== */

.report-page {
  padding: 34px 0 28px;
  animation: fadeUp 0.65s ease both;
}

.report-card {
  max-width: 1100px;
  margin: 0 auto;
  border: 1px solid rgba(124,63,29,0.14);
  background:
    linear-gradient(
      145deg,
      rgba(255,255,255,0.92),
      rgba(255,247,237,0.74)
    );
  border-radius: 32px;
  padding: 30px;
  box-shadow: 0 24px 80px rgba(90,49,24,0.13);
}

.report-kicker {
  color: #c7833f;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.report-title {
  font-family: 'Syne', sans-serif;
  font-size: 34px;
  font-weight: 900;
  color: #2a1710;
  letter-spacing: -0.04em;
  margin-bottom: 8px;
}

.report-description {
  color: #70584b;
  font-size: 14px;
  line-height: 1.7;
  margin-bottom: 24px;
}

.report-status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.report-status-card {
  border: 1px solid rgba(124,63,29,0.12);
  background: rgba(255,255,255,0.70);
  border-radius: 18px;
  padding: 17px;
}

.report-status-card.ready {
  border-color: rgba(25,135,84,0.22);
  background: rgba(25,135,84,0.08);
}

.report-status-card.missing {
  border-color: rgba(217,119,6,0.22);
  background: rgba(217,119,6,0.07);
}

.report-status-label {
  color: #8a6b5b;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 7px;
}

.report-status-value {
  font-family: 'Syne', sans-serif;
  font-size: 17px;
  font-weight: 900;
  color: #2a1710;
}

.report-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 18px;
}

.report-btn {
  min-height: 56px;
  border-radius: 17px;
  border: 1px solid rgba(124,63,29,0.15);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.22s ease;
}

.report-btn.generate {
  color: white;
  background: linear-gradient(
    135deg,
    #4a2412,
    #7c3f1d 58%,
    #c7833f
  );
}

.report-btn.refresh {
  color: #5a2d17;
  background: rgba(255,255,255,0.75);
}

.report-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.report-btn:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.report-error {
  margin-top: 15px;
  border: 1px solid rgba(220,38,38,0.22);
  background: rgba(220,38,38,0.08);
  color: #b91c1c;
  border-radius: 15px;
  padding: 13px;
  font-size: 12px;
  font-weight: 800;
}

.report-success {
  margin-top: 20px;
  border: 1px solid rgba(25,135,84,0.22);
  background: rgba(25,135,84,0.07);
  border-radius: 20px;
  padding: 20px;
}

.report-success-title {
  font-family: 'Syne', sans-serif;
  font-size: 20px;
  font-weight: 900;
  color: #166534;
  margin-bottom: 8px;
}

.report-success-meta {
  color: #5f493d;
  font-size: 13px;
  line-height: 1.7;
}

.report-download-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  margin-top: 15px;
  border-radius: 15px;
  background: #198754;
  color: white;
  text-decoration: none;
  font-weight: 900;
}

@media (max-width: 760px) {
  .report-status-grid,
  .report-actions {
    grid-template-columns: 1fr;
  }
}

.history-panel{

    margin-top:20px;

    width:100%;

}


.history-table-container{

    max-height:450px;

    overflow-y:auto;

    overflow-x:auto;

    border-radius:20px;

}


.history-table-container table{

    width:100%;

}


.history-table-container thead{

    position:sticky;

    top:0;

    z-index:2;

}


.history-image{

    width:90px;

    height:60px;

    object-fit:cover;

    border-radius:10px;

}

.history-header{

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:15px;

}


.history-header h3{

font-family:'Syne',sans-serif;

font-size:18px;

font-weight:900;

}


.history-count{

background:rgba(199,131,63,0.12);

border:1px solid rgba(199,131,63,0.25);

padding:6px 12px;

border-radius:999px;

font-size:12px;

font-weight:800;

color:#7c3f1d;

}


`;

function SealUploadPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Main page tabs
  const [activeTab, setActiveTab] = useState("realtime");

  // Packet leak device state
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [deviceResult, setDeviceResult] = useState(null);
  const [deviceLoading, setDeviceLoading] = useState(false);
  const [deviceError, setDeviceError] = useState("");
  const [leakHistory, setLeakHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [sealHistory, setSealHistory] = useState([]);
  const [sealHistoryLoading, setSealHistoryLoading] = useState(false);

  // Real-time two-stage AI state
  const [realtimeRunning, setRealtimeRunning] = useState(false);
  const [realtimeStarting, setRealtimeStarting] = useState(false);
  const [realtimeResult, setRealtimeResult] = useState(null);
  const [realtimeError, setRealtimeError] = useState("");
  const [realtimeVideoUrl, setRealtimeVideoUrl] = useState("");

  // Final inspection report state
  const [reportStatus, setReportStatus] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  const checkReportStatus = async () => {
  try {
    setReportError("");

    const data = await getInspectionReportStatus();

    setReportStatus(data);
  } catch (error) {
    console.error(error);

    setReportStatus(null);

    setReportError(
      error?.response?.data?.detail ||
        "Could not check final report status."
    );
  }
};


const handleGenerateReport = async () => {
  try {
    setReportLoading(true);
    setReportError("");
    setGeneratedReport(null);

    const data = await generateInspectionReport();

    setGeneratedReport(data);

    // Refresh report status after generation
    await checkReportStatus();
  } catch (error) {
    console.error(error);

    setReportError(
      error?.response?.data?.detail ||
        "Could not generate the final inspection report."
    );
  } finally {
    setReportLoading(false);
  }
};
useEffect(() => {

  if (activeTab === "device") {

    checkLeakDeviceStatus();

    loadLeakHistory();

  }


  if (activeTab === "report") {

    checkReportStatus();

  }

  if (activeTab === "realtime") {

    loadSealHistory();

  }

}, [activeTab]);

  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "";

  const defectCounts = useMemo(() => result?.defect_counts || {}, [result]);
  const detections = useMemo(() => result?.detections || [], [result]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload a valid image file. JPG, PNG or WEBP is recommended.");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMessage("Image size is too large. Please upload an image below 10MB.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setErrorMessage("");
  };

  const handleImageChange = (e) => {
    handleFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview);
    setSelectedImage(null);
    setPreview(null);
    setResult(null);
    setErrorMessage("");
  };

  const handlePredict = async () => {
    if (!selectedImage) {
      setErrorMessage("Please select a packet seal image first.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      const data = await predictSealDefects(selectedImage);
      setResult(data.result);
    } catch (error) {
      console.error(error);
      setErrorMessage("Packet seal prediction failed. Please check backend connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkLeakDeviceStatus = async () => {
    try {
      setDeviceError("");
      const data = await getLeakDeviceStatus();
      setDeviceStatus(data);

      if (!data?.connected) {
        setDeviceError(
          data?.error || "Leak detection device is not connected."
        );
      }
    } catch (error) {
      console.error(error);
      setDeviceStatus({ connected: false });
      setDeviceError(
        "Leak detection device is not connected. Check the Arduino USB connection and backend.."
      );
    }
  };

  // ======================================
// loadLeakHistory() function
// ======================================

const loadLeakHistory = async () => {

  try {

    setHistoryLoading(true);

    const data = await getLeakTestHistory();

    setLeakHistory(
      data?.history || []
    );


  } catch(error){

    console.error(error);

  } finally {

    setHistoryLoading(false);

  }

};

// ======================================
// LOAD SEAL INSPECTION HISTORY
// ======================================

const loadSealHistory = async () => {

  try {

    setSealHistoryLoading(true);

    const data = await getSealInspectionHistory();

    setSealHistory(
      data?.history || []
    );


  } catch(error){

    console.error(error);

  } finally {

    setSealHistoryLoading(false);

  }

};

  const handleLeakDeviceTest = async () => {
    if (!deviceStatus?.connected) {
      setDeviceError(
        "Device is not connected. Connect the Arduino and refresh the device status first."
      );
      return;
    }

    try {
      setDeviceLoading(true);
      setDeviceError("");
      setDeviceResult(null);

      const data = await runLeakDeviceTest();

      setDeviceResult(data.result || null);


      // refresh history after new test
      await loadLeakHistory();

      if (data?.result?.error) {
        setDeviceError(`Device error: ${data.result.error}`);
      }
    } catch (error) {
      console.error(error);
      const apiMessage =
        error?.response?.data?.detail ||
        "Packet leak test failed. Check the Arduino connection, HX711, and backend.";
      setDeviceError(apiMessage);
    } finally {
      setDeviceLoading(false);
    }
  };

  const handleStartRealtime = async () => {
    try {
      setRealtimeStarting(true);
      setRealtimeError("");
      setRealtimeResult(null);

      const data = await startRealtimeSealInspection();

      if (!data?.started) {
        setRealtimeRunning(false);
        setRealtimeError(
          data?.message || "Could not start real-time seal inspection."
        );
        return;
      }

      setRealtimeRunning(true);
      setRealtimeVideoUrl(`${getRealtimeVideoUrl()}?t=${Date.now()}`);
    } catch (error) {
      console.error(error);
      setRealtimeRunning(false);
      setRealtimeError(
        error?.response?.data?.detail ||
          "Could not start the IP Webcam real-time inspection."
      );
    } finally {
      setRealtimeStarting(false);
    }
  };

  const handleStopRealtime = async () => {
    try {
      setRealtimeError("");
      await stopRealtimeSealInspection();
    } catch (error) {
      console.error(error);
      setRealtimeError(
        error?.response?.data?.detail ||
          "Could not stop the real-time inspection cleanly."
      );
    } finally {
      setRealtimeRunning(false);
      setRealtimeVideoUrl("");
    }
  };

  const handleTabChange = async (nextTab) => {
    if (activeTab === "realtime" && nextTab !== "realtime" && realtimeRunning) {
      await handleStopRealtime();
    }

    setActiveTab(nextTab);
  };

  

  useEffect(() => {
    if (!realtimeRunning) return undefined;

    let cancelled = false;

    const loadLatestResult = async () => {
      try {
        const data = await getRealtimeSealResult();
        if (!cancelled) {
          setRealtimeResult(data?.result || null);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setRealtimeError(
            error?.response?.data?.detail ||
              "Could not read the latest real-time AI result."
          );
        }
      }
    };

    loadLatestResult();
    const intervalId = window.setInterval(loadLatestResult, 1200);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [realtimeRunning]);

  const getStatusClass = (status) => {
    if (!status) return "";
    const s = String(status).toLowerCase();

    if (
      s.includes("no defect") ||
      s.includes("good") ||
      s.includes("pass") ||
      s.includes("accepted") ||
      s.includes("normal")
    ) {
      return "good";
    }

    return "bad";
  };

  const parseConfidence = (conf) => {
    if (typeof conf === "number") return conf;
    const num = parseFloat(conf);
    return Number.isNaN(num) ? 0 : num;
  };

  const buildImageUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;

    const cleanBase = API_URL.replace(/\/$/, "");
    const cleanPath = String(url).replace(/^\//, "");

    if (!cleanBase) return `/${cleanPath}`;
    return `${cleanBase}/${cleanPath}`;
  };

  const formatRealtimeConfidence = (value) => {
    const num = Number(value || 0);
    const pct = num <= 1 ? num * 100 : num;
    return `${pct.toFixed(1)}%`;
  };

  const formatRealtimeStatus = (status) => {
    if (!status) return "WAITING FOR RESULT";
    return String(status).replaceAll("_", " ");
  };

  const statusClass = getStatusClass(result?.status);
  const totalDefects = Number(result?.total_defects || 0);
  const predictedImageUrl = buildImageUrl(result?.predicted_image_url);
  const realtimeOverheat = Boolean(realtimeResult?.overheat_detected);
  const realtimeSeals = Array.isArray(realtimeResult?.seals)
    ? realtimeResult.seals
    : [];

  return (
    <>
      <style>{styles}</style>

      <main className="seal-root">
        <div className="seal-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>

        <div className="scan-line" />

        <div className="seal-shell">
          <nav className="top-nav">
            <div className="brand">
              <div className="brand-logo">📦</div>
              <div className="brand-text">
                <div className="brand-title">Coffee Seal Vision AI</div>
                <div className="brand-subtitle">Industrial packet seal quality inspection</div>
              </div>
            </div>

            <div className="nav-pills">
              <div className="nav-pill nav-pill-live">
                <span className="live-dot" />
                AI Ready
              </div>
              <div className="nav-pill">YOLO Detection</div>
              <div className="nav-pill">Seal QC</div>
            </div>
          </nav>

          <div className="mode-tabs">
            <div className="mode-tabs-inner">
              {/*<button
                type="button"
                className={`mode-tab ${activeTab === "ai" ? "active" : ""}`}
                onClick={() => handleTabChange("ai")}
              >
                🤖 AI Seal Detection
              </button>*/}

              <button
                type="button"
                className={`mode-tab ${activeTab === "realtime" ? "active" : ""}`}
                onClick={() => handleTabChange("realtime")}
              >
                📹 Real-Time Seal Inspection
              </button>

              <button
                type="button"
                className={`mode-tab ${activeTab === "device" ? "active" : ""}`}
                onClick={() => handleTabChange("device")}
              >
                ⚙️ Packet Leak Detection
              </button>

              <button
                type="button"
                className={`mode-tab ${activeTab === "report" ? "active" : ""}`}
                onClick={() => handleTabChange("report")}
              >
                📄 Final Inspection Report
              </button>

            </div>
          </div>

          {activeTab === "ai" ? (
            <>
          <section className="hero-layout">
            <div className="hero-left">
              <div className="hero-content">
                <div className="seal-badge">
                  <span className="seal-badge-dot" />
                  AI-Powered Inspection
                </div>

                <h1 className="seal-title">
                  <span>Packet Seal</span>
                  <span className="gradient-word">Defect Detection</span>
                </h1>

                <p className="seal-subtitle">
                  Upload a coffee packet seal image and let the AI model analyze
                  packaging quality, identify possible seal defects, and generate
                  a visual prediction overlay for inspection support.
                </p>

                <div className="hero-actions">
                  <div className="hero-chip">⚡ Fast inspection</div>
                  <div className="hero-chip">🎯 Defect classification</div>
                  <div className="hero-chip">🖼️ Annotated output</div>
                  <div className="hero-chip">📊 Confidence view</div>
                </div>

                <div className="metrics-strip">
                  <div className="metric-card">
                    <div className="metric-icon">🔍</div>
                    <div className="metric-value">Detect</div>
                    <div className="metric-label">Analyze uploaded seal image</div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon">🧠</div>
                    <div className="metric-value">Classify</div>
                    <div className="metric-label">Identify defect categories</div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon">✅</div>
                    <div className="metric-value">Decide</div>
                    <div className="metric-label">Support quality inspection</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-right">
              <div className="upload-panel">
                <div className="panel-top">
                  <div>
                    <div className="panel-eyebrow">Image Input</div>
                    <div className="panel-title">Upload Seal Image</div>
                  </div>

                  <div className="panel-status">
                    <span className="live-dot" />
                    Online
                  </div>
                </div>

                {!preview ? (
                  <div
                    className={`upload-zone${dragOver ? " drag-over" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <div className="upload-inner">
                      <div className="upload-icon-wrap">📸</div>
                      <div className="upload-label">Drop your seal image here</div>
                      <div className="upload-hint">
                        Upload a clear packet seal image for AI-based defect
                        detection and visual prediction overlay.
                      </div>
                      <div className="upload-btn-fake">Browse Image</div>

                      <div className="upload-formats">
                        <span className="format-pill">JPG</span>
                        <span className="format-pill">PNG</span>
                        <span className="format-pill">WEBP</span>
                        <span className="format-pill">MAX 10MB</span>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      className="upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                ) : (
                  <div className="preview-section">
                    <div className="preview-card">
                      <div className="preview-image-box">
                        <img src={preview} alt="Selected seal" className="preview-img" />
                        <div className="preview-glow" />
                        <div className="preview-floating-tag">
                          <span className="live-dot" />
                          Image Loaded
                        </div>
                      </div>

                      <div className="preview-info">
                        <div className="preview-info-label">Selected Image</div>
                        <div className="preview-info-name">{selectedImage?.name}</div>

                        <div className="preview-meta-row">
                          <span className="preview-meta">
                            {formatFileSize(selectedImage?.size)}
                          </span>
                          <span className="preview-meta">
                            {selectedImage?.type || "Image file"}
                          </span>
                        </div>

                        <div className="preview-actions">
                          <button
                            type="button"
                            className="soft-btn"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            🔁 Replace
                          </button>

                          <button
                            type="button"
                            className="soft-btn danger"
                            onClick={handleRemove}
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      className="upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                )}

                <div className="detect-wrap">
                  <button
                    type="button"
                    className="detect-btn"
                    onClick={handlePredict}
                    disabled={loading || !selectedImage}
                  >
                    <span>
                      {loading ? (
                        <>
                          <div className="spinner" />
                          Analyzing Seal Image...
                        </>
                      ) : (
                        <>🔍 Detect Seal Defects</>
                      )}
                    </span>
                  </button>
                </div>

                {errorMessage && (
                  <div className="error-box">
                    ⚠️ {errorMessage}
                  </div>
                )}

                <div className="quick-guide">
                  <div className="guide-item">
                    <div className="guide-icon">1️⃣</div>
                    <div className="guide-text">Upload image</div>
                  </div>
                  <div className="guide-item">
                    <div className="guide-icon">2️⃣</div>
                    <div className="guide-text">Run AI scan</div>
                  </div>
                  <div className="guide-item">
                    <div className="guide-icon">3️⃣</div>
                    <div className="guide-text">Review result</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {result && (
            <section className="results-section">
              <div className="results-head">
                <div>
                  <div className="results-kicker">Inspection Completed</div>
                  <h2 className="results-main-title">AI Detection Results</h2>
                </div>

                <div className="results-summary-pill">
                  <span className="live-dot" />
                  Result generated successfully
                </div>
              </div>

              <div className="status-cards">
                <div className={`status-card ${statusClass}`}>
                  <div className="sc-label">Final Status</div>
                  <div className={`sc-value ${statusClass}`}>{result.status || "Unknown"}</div>
                  <div className="sc-caption">
                    Overall seal quality decision from the AI inspection output.
                  </div>
                  <div className="sc-icon">{statusClass === "good" ? "✅" : "⚠️"}</div>
                </div>

                <div className={`status-card ${totalDefects > 0 ? "bad" : "good"}`}>
                  <div className="sc-label">Total Defects</div>
                  <div className={`sc-value ${totalDefects > 0 ? "bad" : "good"}`}>
                    {totalDefects}
                  </div>
                  <div className="sc-caption">
                    Number of detected defect regions in the image.
                  </div>
                  <div className="sc-icon">{totalDefects > 0 ? "🚨" : "🎉"}</div>
                </div>

                <div className="status-card">
                  <div className="sc-label">Detections</div>
                  <div className="sc-value">{detections.length}</div>
                  <div className="sc-caption">
                    Detailed predictions with confidence scores.
                  </div>
                  <div className="sc-icon">📊</div>
                </div>
              </div>

              <div className="results-grid">
                <div className="result-block">
                  <div className="block-header">
                    <div className="block-title">
                      <span className="block-dot" />
                      Annotated Output
                    </div>
                  </div>

                  <div className="block-body">
                    <div className="pred-img-frame">
                      {predictedImageUrl ? (
                        <img
                          src={predictedImageUrl}
                          alt="Predicted seal"
                          className="pred-img"
                        />
                      ) : (
                        <div className="empty-state">
                          <div className="empty-icon">🖼️</div>
                          Annotated image is not available.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="analysis-column">
                  <div className="result-block">
                    <div className="block-header">
                      <div className="block-title">
                        <span className="block-dot" />
                        Defect Breakdown
                      </div>
                    </div>

                    <div className="table-wrap">
                      {Object.keys(defectCounts).length > 0 ? (
                        <table className="defect-table">
                          <thead>
                            <tr>
                              <th>Defect Type</th>
                              <th>Count</th>
                            </tr>
                          </thead>

                          <tbody>
                            {Object.entries(defectCounts).map(([defect, count]) => (
                              <tr key={defect}>
                                <td>{defect}</td>
                                <td>
                                  <span className="defect-badge">{count}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="empty-state">
                          <div className="empty-icon">✅</div>
                          No defect breakdown available.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="result-block">
                    <div className="block-header">
                      <div className="block-title">
                        <span className="block-dot" />
                        Detection Details
                      </div>
                    </div>

                    <div className="table-wrap">
                      {detections.length > 0 ? (
                        <table className="defect-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Class</th>
                              <th>Confidence</th>
                            </tr>
                          </thead>

                          <tbody>
                            {detections.map((item, index) => {
                              const conf = parseConfidence(item.confidence);
                              const pct = conf <= 1 ? conf * 100 : conf;
                              const safePct = Math.max(0, Math.min(100, pct));

                              return (
                                <tr key={`${item.class_name}-${index}`}>
                                  <td>
                                    <span className="row-num">{index + 1}</span>
                                  </td>

                                  <td>
                                    <span className="class-pill">
                                      {item.class_name || "Unknown"}
                                    </span>
                                  </td>

                                  <td>
                                    <div className="conf-bar-wrap">
                                      <div className="conf-bar-track">
                                        <div
                                          className="conf-bar-fill"
                                          style={{ width: `${safePct}%` }}
                                        />
                                      </div>
                                      <span className="conf-text">
                                        {safePct.toFixed(1)}%
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div className="empty-state">
                          <div className="empty-icon">📭</div>
                          No detection details available.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="insight-box">
                    <div className="insight-title">💡 Inspection Note</div>
                    This result is designed as a fast quality-control support tool.
                    For explanation, The model detects seal
                    defect regions and displays confidence values with an annotated
                    output image.
                  </div>
                </div>
              </div>
            </section>
          )}
            </>
          ) : activeTab === "realtime" ? (
            <section className="realtime-page">
              <div className="realtime-layout">
                <div className="realtime-camera-card">
                  <div className="realtime-card-head">
                    <div>
                      <div className="realtime-kicker">Two-Stage Vision AI</div>
                      <div className="realtime-title">Live Packet Inspection</div>
                    </div>

                    <div
                      className={`realtime-status ${
                        realtimeRunning ? "running" : ""
                      }`}
                    >
                      <span className="device-dot" />
                      {realtimeRunning ? "Camera Running" : "Camera Stopped"}
                    </div>
                  </div>

                  <div className="realtime-video-frame">
                    {realtimeRunning && realtimeVideoUrl ? (
                      <img
                        src={realtimeVideoUrl}
                        alt="Real-time coffee packet AI inspection"
                        className="realtime-video"
                      />
                    ) : (
                      <div className="realtime-empty">
                        <div className="realtime-empty-icon">📹</div>
                        <div className="realtime-empty-title">IP Webcam is ready to connect</div>
                        <div className="realtime-empty-text">
                          Start the phone IP Webcam server first, then press Start Live Inspection.
                          The full packet video will be displayed here with seal and exact overheat bounding boxes.
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="realtime-controls">
                    <button
                      type="button"
                      className="realtime-btn start"
                      onClick={handleStartRealtime}
                      disabled={realtimeRunning || realtimeStarting}
                    >
                      {realtimeStarting ? "Connecting Camera..." : "▶ Start Live Inspection"}
                    </button>

                    <button
                      type="button"
                      className="realtime-btn stop"
                      onClick={handleStopRealtime}
                      disabled={!realtimeRunning}
                    >
                      ■ Stop Live Inspection
                    </button>
                  </div>

                  {realtimeError && (
                    <div className="realtime-error">⚠️ {realtimeError}</div>
                  )}
                </div>

                <div className="realtime-info-card">
                  <div className="realtime-card-head">
                    <div>
                      <div className="realtime-kicker">Live AI Result</div>
                      <div className="realtime-title">Inspection Summary</div>
                    </div>
                  </div>

                  <div
                    className={`realtime-result-banner ${
                      realtimeResult
                        ? realtimeOverheat
                          ? "overheat"
                          : "clear"
                        : ""
                    }`}
                  >
                    <div className="realtime-result-label">Packet Status</div>
                    <div className="realtime-result-value">
                      {formatRealtimeStatus(realtimeResult?.final_status)}
                    </div>
                  </div>

                  <div className="realtime-metrics">
                    <div className="realtime-metric">
                      <div className="realtime-metric-label">Camera</div>
                      <div className="realtime-metric-value">
                        {realtimeResult?.camera_connected ? "Connected" : realtimeRunning ? "Connecting" : "Stopped"}
                      </div>
                    </div>

                    <div className="realtime-metric">
                      <div className="realtime-metric-label">Seals Detected</div>
                      <div className="realtime-metric-value">
                        {realtimeResult?.seal_count ?? 0}
                      </div>
                    </div>

                    <div className="realtime-metric">
                      <div className="realtime-metric-label">Overheat</div>
                      <div className="realtime-metric-value">
                        {realtimeResult ? (realtimeOverheat ? "Detected" : "Not Detected") : "—"}
                      </div>
                    </div>

                    <div className="realtime-metric">
                      <div className="realtime-metric-label">Highest Overheat Confidence</div>
                      <div className="realtime-metric-value">
                        {realtimeResult
                          ? formatRealtimeConfidence(
                              realtimeResult.highest_overheat_confidence
                            )
                          : "—"}
                      </div>
                    </div>
                  </div>

                  <div className="realtime-seals">
                    {realtimeSeals.length > 0 ? (
                      realtimeSeals.map((seal, index) => {
                        const isOverheat =
                          String(seal.status || "").toUpperCase() === "OVERHEAT";

                        return (
                          <div className="realtime-seal-card" key={`seal-${index}`}>
                            <div className="realtime-seal-head">
                              <div className="realtime-seal-name">
                                Seal {seal.seal_number ?? index + 1}
                              </div>
                              <div
                                className={`realtime-seal-status ${
                                  isOverheat ? "overheat" : ""
                                }`}
                              >
                                {formatRealtimeStatus(seal.status)}
                              </div>
                            </div>

                            <div className="realtime-seal-meta">
                              Seal confidence: {formatRealtimeConfidence(seal.seal_confidence)}
                              <br />
                              Defect boxes: {Array.isArray(seal.defects) ? seal.defects.length : 0}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="realtime-seal-card">
                        <div className="realtime-seal-name">Waiting for seal detections...</div>
                        <div className="realtime-seal-meta">
                          Show the full coffee packet clearly to the phone camera.
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="realtime-note">
                    AI 1 detects and crops each seal region. AI 2 runs object detection on each crop,
                    and the overheat defect coordinates are mapped back onto the full packet frame.
                  </div>



                  </div>

                </div>
              <div className="history-panel">

  <div className="history-header">

    <h3>
      📋 Previous AI Seal Inspection History
    </h3>

    <span className="history-count">
      {sealHistory.length} Records
    </span>

  </div>


  <div className="history-table-container">

    <table className="defect-table">

      <thead>

        <tr>

          <th>Packet ID</th>
          <th>Date</th>
          <th>Result</th>
          <th>Status</th>
          <th>Defect</th>
          <th>Screenshot</th>

        </tr>

      </thead>


      <tbody>

      {
        sealHistory.length > 0 ?

        [...sealHistory]
        .sort(
          (a,b)=>
          new Date(b.created_at) -
          new Date(a.created_at)
        )
        .map((item,index)=>(

          <tr key={index}>

            <td>
              {item.packet_id || `PKT-${index+1}`}
            </td>


            <td>
              {
                new Date(
                  item.created_at
                ).toLocaleString()
              }
            </td>


            <td>

              <span
                className={
                  item.result_type === "PASS"
                  ?
                  "good-badge defect-badge"
                  :
                  "defect-badge"
                }
              >

              {
                item.result_type || "DEFECT"
              }

              </span>

            </td>


            <td>
              {item.final_status || "UNKNOWN"}
            </td>


            <td>

            {
              item.overheat_result?.detected

              ?

              "🔥 Overheat"

              :

              "✅ Normal"

            }

            </td>


            <td>

            {
              item.image_path ?

              <img
                src={buildImageUrl(item.image_path)}
                className="history-image"
                alt="packet result"
              />

              :

              "Not Available"

            }

            </td>


          </tr>

        ))

        :

        <tr>

          <td colSpan="6">

            <div className="empty-state">

              📭 No previous inspection records

            </div>

          </td>

        </tr>

      }


      </tbody>

    </table>

  </div>

</div>

            
              
          </section>
          ) : activeTab === "device" ? (
            <section className="device-page">
              <div className="device-hero">
                <div className="device-info-card">
                  <div className="device-kicker">Physical Quality Control</div>
                  <h2 className="device-title">
                    Coffee Packet
                    <br />
                    Leak Detection
                  </h2>

                  <p className="device-description">
                    Run the physical leak test directly from the web application.
                    The backend sends a START command to the Arduino Uno, applies
                    pressure using the motor, collects HX711 load-cell readings,
                    classifies the packet, and returns the result to this page.
                  </p>

                  <div className="device-flow">
                    <div className="device-flow-item">
                      <div className="device-flow-num">01</div>
                      <div className="device-flow-text">
                        Place the coffee packet correctly inside the leak-detection device.
                      </div>
                    </div>

                    <div className="device-flow-item">
                      <div className="device-flow-num">02</div>
                      <div className="device-flow-text">
                        Connect the Arduino USB cable and switch on the 12V motor adapter.
                      </div>
                    </div>

                    <div className="device-flow-item">
                      <div className="device-flow-num">03</div>
                      <div className="device-flow-text">
                        Start the test. The motor moves down until the bottom limit switch is reached.
                      </div>
                    </div>

                    <div className="device-flow-item">
                      <div className="device-flow-num">04</div>
                      <div className="device-flow-text">
                        Load-cell readings are collected and compared with the 286000 threshold.
                      </div>
                    </div>

                    <div className="device-flow-item">
                      <div className="device-flow-num">05</div>
                      <div className="device-flow-text">
                        GOOD or LEAK is shown here and the motor returns to the top limit switch.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="device-control-card">
                  <div className="device-status-row">
                    <div
                      className={`device-status-badge ${
                        deviceStatus?.connected
                          ? "connected"
                          : deviceStatus
                            ? "disconnected"
                            : ""
                      }`}
                    >
                      <span className="device-dot" />
                      {deviceStatus?.connected
                        ? `Connected • ${deviceStatus.port || "Arduino"}`
                        : deviceStatus
                          ? "Device Disconnected"
                          : "Checking Device..."}
                    </div>

                    <button
                      type="button"
                      className="refresh-device-btn"
                      onClick={checkLeakDeviceStatus}
                      disabled={deviceLoading}
                    >
                      ↻ Refresh Status
                    </button>
                  </div>

                  <div className="device-ready-box">
                    <div className="device-ready-title">
                      {deviceStatus?.connected
                        ? "Device is ready for communication"
                        : "Connect the leak-detection device"}
                    </div>

                    <div className="device-ready-text">
                      {deviceStatus?.connected
                        ? "FastAPI can communicate with the Arduino through the configured serial port. Before starting, place a packet in the device and plug in the 12V motor adapter."
                        : "Keep the Arduino connected by USB, close Arduino Serial Monitor, start the backend, and refresh the status."}
                    </div>

                    <div className="device-warning">
                      ⚠️ Before pressing Start Leak Test, keep hands clear of the moving mechanism and make sure the top/bottom limit switches are positioned correctly.
                    </div>
                  </div>

                  <button
                    type="button"
                    className="device-test-btn"
                    onClick={handleLeakDeviceTest}
                    disabled={deviceLoading || !deviceStatus?.connected}
                  >
                    <span className="device-test-btn-content">
                      {deviceLoading ? (
                        <>
                          <span className="spinner" />
                          Running Physical Leak Test...
                        </>
                      ) : (
                        <>▶ Start Leak Test</>
                      )}
                    </span>
                  </button>

                  {deviceError && (
                    <div className="device-error">
                      ⚠️ {deviceError}
                    </div>
                  )}

                  {deviceResult && (
                    <div className="device-result-section">
                      <div
                        className={`device-result-banner ${
                          String(deviceResult.status || "").toUpperCase() === "GOOD"
                            ? "good"
                            : "leak"
                        }`}
                      >
                        <div>
                          <div className="device-result-label">Packet Result</div>
                          <div className="device-result-value">
                            {deviceResult.status
                              ? `${deviceResult.status} PACKET`
                              : "TEST COMPLETED"}
                          </div>
                        </div>

                        <div className="device-result-icon">
                          {String(deviceResult.status || "").toUpperCase() === "GOOD"
                            ? "✅"
                            : "🚨"}
                        </div>
                      </div>

                      <div className="device-metrics">
                        <div className="device-metric">
                          <div className="device-metric-label">Average</div>
                          <div className="device-metric-value">
                            {deviceResult.average ?? "—"}
                          </div>
                        </div>

                        <div className="device-metric">
                          <div className="device-metric-label">Threshold</div>
                          <div className="device-metric-value">
                            {deviceResult.threshold ?? "—"}
                          </div>
                        </div>

                        <div className="device-metric">
                          <div className="device-metric-label">Minimum</div>
                          <div className="device-metric-value">
                            {deviceResult.minimum ?? "—"}
                          </div>
                        </div>

                        <div className="device-metric">
                          <div className="device-metric-label">Maximum</div>
                          <div className="device-metric-value">
                            {deviceResult.maximum ?? "—"}
                          </div>
                        </div>

                        <div className="device-metric">
                          <div className="device-metric-label">Range</div>
                          <div className="device-metric-value">
                            {deviceResult.range ?? "—"}
                          </div>
                        </div>

                        <div className="device-metric">
                          <div className="device-metric-label">Readings</div>
                          <div className="device-metric-value">
                            {deviceResult.reading_count ??
                              deviceResult.readings?.length ??
                              "—"}
                          </div>
                        </div>

                        <div className="device-metric">
                          <div className="device-metric-label">Initial Value</div>
                          <div className="device-metric-value">
                            {deviceResult.initial_value ?? "—"}
                          </div>
                        </div>

                        <div className="device-metric">
                          <div className="device-metric-label">Final Position</div>
                          <div className="device-metric-value">
                            {deviceResult.device_status || "—"}
                          </div>
                        </div>
                      </div>

                      {Array.isArray(deviceResult.readings) &&
                        deviceResult.readings.length > 0 && (
                          <div className="readings-box">
                            <div className="readings-title">
                              Load Cell Readings
                            </div>

                            <div className="readings-list">
                              {deviceResult.readings.map((reading, index) => (
                                <span
                                  className="reading-pill"
                                  key={`${reading}-${index}`}
                                >
                                  {index + 1}: {reading}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* ======================================
    PREVIOUS LEAK TEST HISTORY
====================================== */}

{leakHistory.length > 0 && (

<div className="history-panel">

    <h3>
        📋 Previous AI Seal Inspection History
    </h3>


    <div className="history-table-container">

        <table className="defect-table">

<thead>

<tr>
<th>Date</th>
<th>Status</th>
<th>Average</th>
<th>Range</th>
</tr>

</thead>


<tbody>

{
leakHistory.map((item,index)=>(

<tr key={index}>

<td>
{
new Date(
item.created_at
).toLocaleString()
}
</td>


<td>

<span className={
item.status === "GOOD"
?
"good-badge defect-badge"
:
"defect-badge"
}>

{item.status}

</span>

</td>


<td>
{item.average}
</td>


<td>
{item.range}
</td>


</tr>

))

}

</tbody>

</table>

</div>

</div>

)}


                </div>
              </div>
                        </section>

          ) : (
            <section className="report-page">
              <div className="report-card">

                <div className="report-kicker">
                  Final Quality Control
                </div>

                <h2 className="report-title">
                  Coffee Packet Inspection Report
                </h2>

                <p className="report-description">
                  This final report combines the Real-Time Two-Stage
                  AI Seal Inspection and the Physical Packet Leak
                  Detection result.
                </p>

                <div className="report-status-grid">

                  <div
                    className={`report-status-card ${
                      reportStatus?.has_realtime_result
                        ? "ready"
                        : "missing"
                    }`}
                  >
                    <div className="report-status-label">
                      Real-Time AI
                    </div>

                    <div className="report-status-value">
                      {reportStatus?.has_realtime_result
                        ? "✅ Completed"
                        : "⚠️ Required"}
                    </div>
                  </div>

                  <div
                    className={`report-status-card ${
                      reportStatus?.has_leak_result
                        ? "ready"
                        : "missing"
                    }`}
                  >
                    <div className="report-status-label">
                      Physical Leak Test
                    </div>

                    <div className="report-status-value">
                      {reportStatus?.has_leak_result
                        ? "✅ Completed"
                        : "⚠️ Required"}
                    </div>
                  </div>

                  <div
                    className={`report-status-card ${
                      reportStatus?.ready
                        ? "ready"
                        : "missing"
                    }`}
                  >
                    <div className="report-status-label">
                      Report Readiness
                    </div>

                    <div className="report-status-value">
                      {reportStatus?.ready
                        ? "✅ Ready"
                        : "⏳ Not Ready"}
                    </div>
                  </div>

                </div>

                <div className="report-actions">

                  <button
                    type="button"
                    className="report-btn refresh"
                    onClick={checkReportStatus}
                    disabled={reportLoading}
                  >
                    ↻ Refresh Report Status
                  </button>

                  <button
                    type="button"
                    className="report-btn generate"
                    onClick={handleGenerateReport}
                    disabled={
                      reportLoading ||
                      !reportStatus?.ready
                    }
                  >
                    {reportLoading
                      ? "Generating PDF..."
                      : "📄 Generate Final PDF Report"}
                  </button>

                </div>

                {reportError && (
                  <div className="report-error">
                    ⚠️ {reportError}
                  </div>
                )}

                {generatedReport && (
                  <div className="report-success">

                    <div className="report-success-title">
                      ✅ Final Report Generated
                    </div>

                    <div className="report-success-meta">
                      Report ID:{" "}
                      <strong>
                        {generatedReport.report_id}
                      </strong>
                      <br />

                      Final Decision:{" "}
                      <strong>
                        {generatedReport.final_decision}
                      </strong>
                      <br />

                      {generatedReport.reason}
                    </div>

                    {generatedReport.download_url && (
                      <a
                        className="report-download-btn"
                        href={getReportDownloadUrl(
                          generatedReport.download_url
                        )}
                        target="_blank"
                        rel="noreferrer"
                        download
                      >
                        ⬇ Download Final PDF Report
                      </a>
                    )}

                  </div>
                )}

              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export default SealUploadPage;
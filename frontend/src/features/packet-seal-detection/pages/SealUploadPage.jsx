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

  // Packet inspection session
  startInspectionSession,
  getCurrentInspectionSession,

  // Final inspection report
  getInspectionReportStatus,
  generateInspectionReport,
  getReportDownloadUrl,
} from "../services/sealService";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

  .seal-root,
  .seal-root *,
  .seal-root *::before,
  .seal-root *::after {
    box-sizing: border-box;
  }

  :root {
    --bg:
      radial-gradient(1100px 560px at 12% -10%, rgba(213, 139, 70, 0.16), transparent 60%),
      radial-gradient(900px 520px at 100% 0%, rgba(159, 88, 47, 0.12), transparent 55%),
      linear-gradient(180deg, #201209 0%, #170d07 100%);
    --surface:
      linear-gradient(145deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.03)),
      rgba(39, 22, 13, 0.78);
    --surface-alt: rgba(255, 255, 255, 0.04);
    --border: rgba(255, 220, 170, 0.09);
    --border-strong: rgba(255, 220, 170, 0.2);
    --text: #fff3e1;
    --text-muted: rgba(255, 237, 211, 0.56);
    --text-faint: rgba(255, 237, 211, 0.36);

    --accent: #c17a3f;
    --accent-2: #dfa15d;
    --accent-soft: rgba(223, 161, 93, 0.12);
    --accent-gradient: linear-gradient(135deg, #ffe0a3, #d58b46, #9f582f);
    --accent-ink: #2a160c;

    --good: #a8e8b0;
    --good-solid: #3fa94e;
    --good-bg: rgba(64, 169, 78, 0.1);
    --good-border: rgba(93, 199, 106, 0.18);

    --bad: #ffaaa0;
    --bad-bg: rgba(200, 60, 50, 0.1);
    --bad-border: rgba(225, 90, 75, 0.18);

    --warn: #ffd18c;
    --warn-bg: rgba(215, 145, 52, 0.09);
    --warn-border: rgba(230, 158, 89, 0.17);

    --radius-lg: 24px;
    --radius-md: 16px;
    --radius-sm: 10px;
    --shadow-card: 0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06);
  }

  .seal-root {
    min-height: 100vh;
    width: 100%;
    background: var(--bg);
    font-family: 'Inter', sans-serif;
    color: var(--text);
  }

  .seal-shell {
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    padding: 24px clamp(20px, 3vw, 40px) 60px;
  }

  /* ---------- Top nav ---------- */

  .top-nav {
    width: 100%;
    border: 1px solid var(--border);
    background: var(--surface);
    backdrop-filter: blur(20px);
    border-radius: var(--radius-lg);
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    box-shadow: var(--shadow-card);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .brand-logo {
    width: 42px;
    height: 42px;
    border-radius: var(--radius-sm);
    display: grid;
    place-items: center;
    background: var(--accent-gradient);
    font-size: 20px;
    flex: 0 0 auto;
  }

  .brand-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.01em;
    white-space: nowrap;
  }

  .brand-subtitle {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 2px;
    white-space: nowrap;
  }

  .nav-pills {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
  }

  .nav-pill {
    border: 1px solid var(--border);
    background: var(--surface-alt);
    color: var(--text-muted);
    border-radius: 999px;
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    white-space: nowrap;
  }

  .nav-pill-live {
    color: var(--good);
    border-color: var(--good-border);
    background: var(--good-bg);
  }

  .live-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: var(--good);
    box-shadow: 0 0 10px rgba(112, 216, 126, 0.5);
  }

  /* ---------- Mode tabs ---------- */

  .mode-tabs {
    margin: 18px 0 0;
    display: flex;
    justify-content: center;
  }

  .mode-tabs-inner {
    width: min(980px, 100%);
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    padding: 6px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--surface);
    backdrop-filter: blur(20px);
    box-shadow: var(--shadow-card);
  }

  .mode-tab {
    min-height: 44px;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text-muted);
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .mode-tab:hover {
    background: var(--surface-alt);
    color: var(--text);
  }

  .mode-tab.active {
    color: var(--accent-ink);
    background: var(--accent-gradient);
  }

  /* ---------- Hero / upload ---------- */

  .hero-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(400px, 0.85fr);
    gap: 20px;
    align-items: stretch;
    padding: 22px 0;
  }

  .hero-left {
    border: 1px solid var(--border);
    background: var(--surface);
    backdrop-filter: blur(20px);
    border-radius: var(--radius-lg);
    padding: 32px;
    box-shadow: var(--shadow-card);
  }

  .hero-content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .seal-badge {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    gap: 8px;
    background: var(--accent-soft);
    border: 1px solid var(--border);
    color: var(--accent-2);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 8px 13px;
    border-radius: 999px;
    margin-bottom: 20px;
  }

  .seal-badge-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: var(--accent-2);
  }

  .seal-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(32px, 4vw, 46px);
    line-height: 1.08;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 16px;
    color: var(--text);
  }

  .seal-title span { display: block; }

  .gradient-word {
    color: var(--accent-2);
  }

  .seal-subtitle {
    max-width: 620px;
    font-size: 15px;
    line-height: 1.7;
    color: var(--text-muted);
    margin-bottom: 22px;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 24px;
  }

  .hero-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    border: 1px solid var(--border);
    background: var(--surface-alt);
    color: var(--text);
    border-radius: var(--radius-sm);
    padding: 9px 12px;
    font-size: 12px;
    font-weight: 600;
  }

  .metrics-strip {
    margin-top: auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .metric-card {
    border: 1px solid var(--border);
    background: var(--surface-alt);
    border-radius: var(--radius-md);
    padding: 16px;
  }

  .metric-icon {
    width: 30px;
    height: 30px;
    border-radius: var(--radius-sm);
    display: grid;
    place-items: center;
    background: var(--surface);
    border: 1px solid var(--border);
    margin-bottom: 10px;
    font-size: 14px;
  }

  .metric-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }

  .metric-label {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 3px;
    line-height: 1.4;
  }

  .hero-right {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .upload-panel {
    border: 1px solid var(--border);
    background: var(--surface);
    backdrop-filter: blur(20px);
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: var(--shadow-card);
  }

  .panel-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
  }

  .panel-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent-2);
    margin-bottom: 4px;
  }

  .panel-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 19px;
    font-weight: 700;
    color: var(--text);
  }

  .panel-status {
    flex: 0 0 auto;
    border: 1px solid var(--good-border);
    background: var(--good-bg);
    color: var(--good);
    border-radius: 999px;
    padding: 8px 11px;
    font-size: 12px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  .upload-zone {
    min-height: 340px;
    border: 1.5px dashed var(--border-strong);
    border-radius: var(--radius-md);
    background: var(--surface-alt);
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s ease, background 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .upload-zone:hover, .upload-zone.drag-over {
    border-color: var(--accent-2);
    background: var(--accent-soft);
  }

  .upload-inner { width: 100%; }

  .upload-icon-wrap {
    width: 76px;
    height: 76px;
    margin: 0 auto 18px;
    border-radius: var(--radius-md);
    display: grid;
    place-items: center;
    font-size: 32px;
    background: var(--surface);
    border: 1px solid var(--border);
  }

  .upload-label {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 8px;
  }

  .upload-hint {
    color: var(--text-muted);
    font-size: 13px;
    line-height: 1.6;
    max-width: 300px;
    margin: 0 auto 18px;
  }

  .upload-btn-fake {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 42px;
    padding: 0 20px;
    border-radius: var(--radius-sm);
    background: var(--accent-gradient);
    color: var(--accent-ink);
    font-size: 13px;
    font-weight: 700;
  }

  .upload-formats {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 16px;
  }

  .format-pill {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    border: 1px solid var(--border);
    background: var(--surface);
    border-radius: 999px;
    padding: 5px 9px;
  }

  .upload-input { display: none; }

  .preview-card {
    border: 1px solid var(--border);
    background: var(--surface-alt);
    border-radius: var(--radius-md);
    padding: 14px;
  }

  .preview-image-box {
    width: 100%;
    height: 300px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--surface);
    position: relative;
  }

  .preview-img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .preview-glow { display: none; }

  .preview-floating-tag {
    position: absolute;
    left: 12px;
    top: 12px;
    border: 1px solid var(--good-border);
    background: rgba(20, 12, 8, 0.85);
    color: var(--good);
    font-size: 12px;
    font-weight: 700;
    border-radius: 999px;
    padding: 7px 10px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  .preview-info { padding: 14px 2px 2px; }

  .preview-info-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent-2);
    margin-bottom: 6px;
  }

  .preview-info-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
    line-height: 1.3;
    word-break: break-word;
    margin-bottom: 8px;
  }

  .preview-meta-row { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 14px; }

  .preview-meta {
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-muted);
    border-radius: 999px;
    padding: 6px 9px;
    font-size: 12px;
    font-weight: 600;
  }

  .preview-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

  .soft-btn {
    height: 40px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .soft-btn:hover { background: var(--surface-alt); border-color: var(--border-strong); }
  .soft-btn.danger:hover { background: var(--bad-bg); border-color: var(--bad-border); color: var(--bad); }

  .detect-wrap { margin-top: 14px; }

  .detect-btn {
    width: 100%;
    min-height: 56px;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    color: var(--accent-ink);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    font-weight: 700;
    background: var(--accent-gradient);
    box-shadow: 0 14px 30px rgba(200, 119, 56, 0.18);
    transition: opacity 0.15s ease, transform 0.1s ease;
  }

  .detect-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
  .detect-btn:active:not(:disabled) { transform: translateY(0); }
  .detect-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .detect-btn span { display: inline-flex; align-items: center; justify-content: center; gap: 10px; }

  .spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(42, 22, 12, 0.25);
    border-top-color: var(--accent-ink);
    border-radius: 999px;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .quick-guide {
    margin-top: 14px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .guide-item {
    border: 1px solid var(--border);
    background: var(--surface-alt);
    border-radius: var(--radius-sm);
    padding: 12px;
    text-align: center;
  }

  .guide-icon { font-size: 16px; margin-bottom: 5px; }
  .guide-text { font-size: 11px; color: var(--text-muted); font-weight: 600; line-height: 1.35; }

  /* ---------- Results ---------- */

  .results-section {
    margin-top: 4px;
    border: 1px solid var(--border);
    background: var(--surface);
    backdrop-filter: blur(20px);
    border-radius: var(--radius-lg);
    padding: 22px;
    box-shadow: var(--shadow-card);
  }

  .results-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 18px;
  }

  .results-kicker {
    color: var(--good);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 11px;
    font-weight: 700;
    margin-bottom: 6px;
  }

  .results-main-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 23px;
    font-weight: 700;
    color: var(--text);
  }

  .results-summary-pill {
    border: 1px solid var(--good-border);
    background: var(--good-bg);
    color: var(--good);
    border-radius: 999px;
    padding: 9px 12px;
    font-size: 12px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    white-space: nowrap;
  }

  .status-cards {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr 0.9fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  .status-card {
    min-height: 118px;
    border: 1px solid var(--border);
    background: var(--surface-alt);
    border-radius: var(--radius-md);
    padding: 18px;
    position: relative;
  }

  .status-card.good { border-color: var(--good-border); background: var(--good-bg); }
  .status-card.bad { border-color: var(--bad-border); background: var(--bad-bg); }

  .sc-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 8px;
  }

  .sc-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 25px;
    line-height: 1.1;
    font-weight: 700;
    color: var(--text);
    word-break: break-word;
  }

  .sc-value.good { color: var(--good); }
  .sc-value.bad { color: var(--bad); }

  .sc-icon { position: absolute; right: 16px; top: 16px; font-size: 22px; }

  .sc-caption { margin-top: 9px; color: var(--text-muted); font-size: 12px; line-height: 1.45; }

  .results-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(340px, 0.95fr);
    gap: 14px;
  }

  .result-block {
    border: 1px solid var(--border);
    background: var(--surface);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .block-header {
    padding: 13px 16px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: var(--surface-alt);
  }

  .block-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text);
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .block-dot { width: 7px; height: 7px; border-radius: 999px; background: var(--good); }

  .block-body { padding: 16px; }

  .pred-img-frame {
    width: 100%;
    min-height: 400px;
    border-radius: var(--radius-sm);
    background: var(--surface-alt);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    overflow: hidden;
  }

  .pred-img {
    width: 100%; height: auto; max-height: 540px;
    object-fit: contain; display: block; border-radius: var(--radius-sm);
  }

  .analysis-column { display: flex; flex-direction: column; gap: 14px; }

  .table-wrap { width: 100%; overflow: hidden; }

  .defect-table { width: 100%; border-collapse: collapse; font-size: 13px; }

  .defect-table thead tr { background: var(--surface-alt); }

  .defect-table th {
    padding: 12px 14px;
    text-align: left;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    border-bottom: 1px solid var(--border);
  }

  .defect-table td {
    padding: 13px 14px;
    border-bottom: 1px solid var(--border);
    color: var(--text);
    vertical-align: middle;
    font-weight: 500;
  }

  .defect-table tbody tr:last-child td { border-bottom: none; }
  .defect-table tbody tr:hover { background: var(--surface-alt); }

  .defect-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 26px;
    padding: 0 9px;
    border-radius: 999px;
    background: var(--bad-bg);
    border: 1px solid var(--bad-border);
    color: var(--bad);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    font-weight: 600;
  }

  .good-badge { background: var(--good-bg); border-color: var(--good-border); color: var(--good); }

  .row-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px; height: 26px;
    background: var(--surface-alt);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 11px;
    font-weight: 700;
    font-family: 'IBM Plex Mono', monospace;
    color: var(--text-muted);
  }

  .class-pill { display: inline-flex; align-items: center; gap: 7px; font-weight: 700; color: var(--text); }
  .class-pill::before { content: ""; width: 7px; height: 7px; border-radius: 999px; background: var(--bad); }

  .conf-bar-wrap { display: flex; align-items: center; gap: 10px; min-width: 160px; }

  .conf-bar-track {
    flex: 1; height: 7px; background: var(--surface-alt);
    border-radius: 999px; overflow: hidden; border: 1px solid var(--border);
  }

  .conf-bar-fill { height: 100%; border-radius: 999px; background: var(--accent-2); transition: width 0.5s ease; }

  .conf-text {
    min-width: 46px; text-align: right; font-size: 12px; font-weight: 700;
    font-family: 'IBM Plex Mono', monospace; color: var(--accent-2);
  }

  .empty-state { padding: 26px; text-align: center; color: var(--text-muted); font-size: 13px; line-height: 1.6; }
  .empty-icon { font-size: 26px; margin-bottom: 8px; }

  .insight-box {
    border: 1px solid var(--border);
    background: var(--surface-alt);
    border-radius: var(--radius-md);
    padding: 15px;
    color: var(--text-muted);
    font-size: 13px;
    line-height: 1.6;
  }

  .insight-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: var(--text); margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }

  .error-box {
    margin-top: 14px;
    border: 1px solid var(--bad-border);
    background: var(--bad-bg);
    color: var(--bad);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.5;
  }

  /* ---------- Device page ---------- */

  .device-page { padding: 22px 0; }

  .device-hero {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(440px, 1.1fr);
    gap: 18px;
    align-items: stretch;
  }

  .device-info-card, .device-control-card {
    border: 1px solid var(--border);
    background: var(--surface);
    backdrop-filter: blur(20px);
    border-radius: var(--radius-lg);
    padding: 26px;
    box-shadow: var(--shadow-card);
  }

  .device-kicker {
    font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--accent-2); margin-bottom: 10px;
  }

  .device-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(26px, 3vw, 36px);
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: var(--text);
    margin-bottom: 14px;
  }

  .device-description { color: var(--text-muted); font-size: 14px; line-height: 1.7; margin-bottom: 20px; }

  .device-flow { display: grid; gap: 8px; margin-top: 18px; }

  .device-flow-item {
    display: grid; grid-template-columns: 34px 1fr; gap: 12px; align-items: center;
    border: 1px solid var(--border); background: var(--surface-alt);
    border-radius: var(--radius-sm); padding: 11px 13px;
  }

  .device-flow-num {
    width: 30px; height: 30px; border-radius: var(--radius-sm);
    display: grid; place-items: center; background: var(--surface); border: 1px solid var(--border);
    color: var(--accent-2); font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 700;
  }

  .device-flow-text { color: var(--text-muted); font-size: 13px; line-height: 1.45; font-weight: 500; }

  .device-status-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 18px; }

  .device-status-badge {
    display: inline-flex; align-items: center; gap: 8px; min-height: 38px; padding: 0 12px;
    border-radius: 999px; border: 1px solid var(--border); background: var(--surface-alt);
    color: var(--text-muted); font-size: 12px; font-weight: 700;
  }

  .device-status-badge.connected { color: var(--good); border-color: var(--good-border); background: var(--good-bg); }
  .device-status-badge.disconnected { color: var(--bad); border-color: var(--bad-border); background: var(--bad-bg); }

  .device-dot { width: 7px; height: 7px; border-radius: 999px; background: var(--text-faint); }
  .device-status-badge.connected .device-dot { background: var(--good); }
  .device-status-badge.disconnected .device-dot { background: var(--bad); }

  .refresh-device-btn {
    min-height: 38px; padding: 0 13px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: var(--surface);
    color: var(--text); font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700;
    cursor: pointer; transition: background 0.15s ease;
  }

  .refresh-device-btn:hover { background: var(--surface-alt); }

  .device-ready-box {
    border-radius: var(--radius-md); border: 1px solid var(--border);
    background: var(--surface-alt); padding: 17px; margin-bottom: 16px;
  }

  .device-ready-title { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .device-ready-text { color: var(--text-muted); font-size: 13px; line-height: 1.6; }

  .device-warning {
    margin-top: 12px; border: 1px solid var(--warn-border); background: var(--warn-bg);
    color: var(--warn); border-radius: var(--radius-sm); padding: 10px 12px; font-size: 12px; line-height: 1.5; font-weight: 600;
  }

  .device-test-btn {
    width: 100%; min-height: 56px; border: 0; border-radius: var(--radius-md);
    cursor: pointer; color: var(--accent-ink); font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700;
    background: var(--accent-gradient); box-shadow: 0 14px 30px rgba(200, 119, 56, 0.18); transition: opacity 0.15s ease;
  }

  .device-test-btn:hover:not(:disabled) { opacity: 0.92; }
  .device-test-btn:disabled { cursor: not-allowed; opacity: 0.45; }

  .device-test-btn-content { display: inline-flex; align-items: center; justify-content: center; gap: 9px; }

  .device-error {
    margin-top: 14px; border: 1px solid var(--bad-border); background: var(--bad-bg);
    color: var(--bad); border-radius: var(--radius-sm); padding: 11px 13px; font-size: 12px; line-height: 1.5; font-weight: 600;
  }

  .device-result-section {
    margin-top: 18px; border: 1px solid var(--border); background: var(--surface-alt);
    border-radius: var(--radius-md); padding: 20px;
  }

  .device-result-banner {
    border-radius: var(--radius-md); padding: 18px; display: flex; justify-content: space-between;
    align-items: center; gap: 16px; margin-bottom: 14px;
  }

  .device-result-banner.good { border: 1px solid var(--good-border); background: var(--good-bg); }
  .device-result-banner.leak { border: 1px solid var(--bad-border); background: var(--bad-bg); }

  .device-result-label { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; }
  .device-result-value { font-family: 'Space Grotesk', sans-serif; font-size: 25px; font-weight: 700; }

  .device-result-banner.good .device-result-value { color: var(--good); }
  .device-result-banner.leak .device-result-value { color: var(--bad); }

  .device-result-icon { font-size: 32px; }

  .device-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }

  .device-metric { border: 1px solid var(--border); background: var(--surface); border-radius: var(--radius-sm); padding: 13px; }
  .device-metric-label { color: var(--text-muted); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
  .device-metric-value { font-family: 'IBM Plex Mono', monospace; color: var(--text); font-size: 16px; font-weight: 600; word-break: break-word; }

  .readings-box { margin-top: 12px; border: 1px solid var(--border); background: var(--surface); border-radius: var(--radius-sm); padding: 13px; }
  .readings-title { color: var(--text); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
  .readings-list { display: flex; flex-wrap: wrap; gap: 6px; }
  .reading-pill {
    border: 1px solid var(--border); background: var(--surface-alt); color: var(--text-muted);
    border-radius: 999px; padding: 5px 8px; font-size: 11px; font-weight: 600; font-family: 'IBM Plex Mono', monospace;
  }

  /* ---------- Realtime page ---------- */

  .realtime-page { padding: 22px 0; }

  .realtime-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(340px, 0.75fr);
    gap: 18px;
    align-items: start;
  }

  .realtime-camera-card, .realtime-info-card {
    border: 1px solid var(--border); background: var(--surface);
    backdrop-filter: blur(20px);
    border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow-card);
  }

  .realtime-card-head { display: flex; justify-content: space-between; align-items: center; gap: 14px; margin-bottom: 14px; }

  .realtime-kicker { color: var(--accent-2); font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 4px; }

  .realtime-title { font-family: 'Space Grotesk', sans-serif; color: var(--text); font-size: 20px; font-weight: 700; }

  .realtime-status {
    display: inline-flex; align-items: center; gap: 7px; border-radius: 999px; padding: 8px 11px;
    border: 1px solid var(--border); background: var(--surface-alt); color: var(--text-muted);
    font-size: 12px; font-weight: 700; white-space: nowrap;
  }

  .realtime-status.running { color: var(--good); border-color: var(--good-border); background: var(--good-bg); }

  .realtime-video-frame {
    width: 100%; min-height: 460px; border-radius: var(--radius-md); overflow: hidden;
    border: 1px solid var(--border); background: #150d08;
    display: grid; place-items: center; position: relative;
  }

  .realtime-video { width: 100%; height: 100%; min-height: 460px; max-height: 640px; object-fit: contain; display: block; background: #120b06; }

  .realtime-empty { text-align: center; color: rgba(255, 237, 211, 0.55); padding: 40px 24px; }
  .realtime-empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.8; }
  .realtime-empty-title { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; color: #fff3e1; margin-bottom: 8px; }
  .realtime-empty-text { font-size: 13px; line-height: 1.65; max-width: 420px; margin: 0 auto; }

  .realtime-cycle-card {
    margin-top: 14px; border: 1px solid var(--border); background: var(--surface-alt);
    border-radius: var(--radius-md); padding: 14px 16px;
  }

  .realtime-cycle-top { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 11px; }

  .realtime-cycle-kicker { color: var(--accent-2); font-size: 9px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 4px; }
  .realtime-cycle-title { color: var(--text); font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 700; }

  .realtime-cycle-phase {
    display: inline-flex; align-items: center; gap: 7px; border: 1px solid var(--good-border);
    background: var(--good-bg); color: var(--good); border-radius: 999px; padding: 6px 9px;
    font-size: 9px; font-weight: 700; letter-spacing: 0.04em; white-space: nowrap;
  }

  .realtime-cycle-phase-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--good); }

  .realtime-progress-track {
    width: 100%; height: 7px; border-radius: 999px; overflow: hidden;
    background: var(--surface); border: 1px solid var(--border);
  }

  .realtime-progress-fill { height: 100%; border-radius: inherit; background: var(--accent-2); transition: width 0.12s linear; }

  .realtime-cycle-bottom { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 9px; }

  .realtime-cycle-time { color: var(--text-muted); font-size: 11px; font-weight: 600; }
  .realtime-cycle-time strong { color: var(--accent-2); font-family: 'IBM Plex Mono', monospace; font-size: 12px; }

  .realtime-cycle-number { color: var(--text-faint); font-size: 10px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }

  .realtime-result-refresh-line { margin-top: 10px; display: flex; align-items: center; gap: 7px; color: var(--text-faint); font-size: 10px; font-weight: 600; }
  .realtime-result-refresh-line .refresh-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--accent-2); }

  .realtime-current-result {
    margin-bottom: 12px; border-radius: var(--radius-md); padding: 12px 13px;
    border: 1px solid var(--border); background: var(--surface-alt);
  }

  .realtime-current-result.ready { border-color: var(--good-border); background: var(--good-bg); }
  .realtime-current-result.waiting { border-color: var(--warn-border); background: var(--warn-bg); }

  .realtime-current-result-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }

  .realtime-current-result-label { color: var(--text-muted); font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
  .realtime-current-result-value { color: var(--text); font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; margin-top: 4px; }

  .realtime-current-result.ready .realtime-current-result-value { color: var(--good); }
  .realtime-current-result.waiting .realtime-current-result-value { color: var(--warn); }

  .realtime-cycle-check {
    width: 24px; height: 24px; display: grid; place-items: center; border-radius: var(--radius-sm);
    background: var(--good-bg); color: var(--good); font-size: 11px; flex: 0 0 auto;
  }

  .realtime-cycle-check.waiting { background: var(--warn-bg); color: var(--warn); }

  .realtime-validation-strip {
    margin-top: 13px; display: flex; align-items: center; gap: 11px; padding: 11px 12px;
    border-radius: var(--radius-sm); border: 1px solid var(--good-border); background: var(--good-bg);
  }

  .realtime-validation-icon {
    width: 28px; height: 28px; display: grid; place-items: center; border-radius: var(--radius-sm);
    background: var(--surface); color: var(--good); font-size: 13px; font-weight: 700; flex: 0 0 auto;
  }

  .realtime-validation-copy { min-width: 0; flex: 1; }
  .realtime-validation-label { color: var(--text-muted); font-size: 9px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; }
  .realtime-validation-value { margin-top: 2px; color: var(--text); font-size: 12px; font-weight: 700; }
  .realtime-validation-status { color: var(--good); font-size: 9px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; white-space: nowrap; }

  .realtime-snapshot-card { margin-top: 14px; padding: 13px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--surface-alt); }
  .realtime-snapshot-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
  .realtime-snapshot-title { margin-top: 3px; color: var(--text); font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 700; }

  .realtime-snapshot-badge {
    border-radius: 999px; padding: 5px 8px; background: var(--accent-soft); color: var(--accent-2);
    font-size: 8px; font-weight: 700; letter-spacing: 0.06em; white-space: nowrap;
  }

  .realtime-snapshot-frame {
    position: relative; overflow: hidden; border-radius: var(--radius-sm); background: #150d08;
    border: 1px solid var(--border); min-height: 200px; display: flex; align-items: center; justify-content: center;
  }

  .realtime-snapshot-image { display: block; width: 100%; max-height: 420px; object-fit: contain; }
  .realtime-snapshot-caption { margin-top: 8px; color: var(--text-faint); font-size: 10px; line-height: 1.5; }

  .realtime-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-top: 14px; }

  .realtime-btn {
    min-height: 48px; border-radius: var(--radius-sm); border: 1px solid var(--border);
    font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer;
    transition: opacity 0.15s ease, background 0.15s ease;
  }

  .realtime-btn.start { color: var(--accent-ink); background: var(--accent-gradient); border-color: #d58b46; }
  .realtime-btn.stop { color: var(--bad); background: var(--bad-bg); border-color: var(--bad-border); }

  .realtime-btn:hover:not(:disabled) { opacity: 0.9; }
  .realtime-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .realtime-error {
    margin-top: 12px; border: 1px solid var(--bad-border); background: var(--bad-bg);
    color: var(--bad); border-radius: var(--radius-sm); padding: 11px 13px; font-size: 12px; font-weight: 600; line-height: 1.5;
  }

  .realtime-result-banner { border-radius: var(--radius-md); padding: 17px; margin-bottom: 14px; border: 1px solid var(--border); background: var(--surface-alt); }
  .realtime-result-banner.overheat { border-color: var(--bad-border); background: var(--bad-bg); }
  .realtime-result-banner.clear { border-color: var(--good-border); background: var(--good-bg); }

  .realtime-result-label { color: var(--text-muted); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 7px; }
  .realtime-result-value { font-family: 'Space Grotesk', sans-serif; font-size: 21px; font-weight: 700; color: var(--text); }

  .realtime-result-banner.overheat .realtime-result-value { color: var(--bad); }
  .realtime-result-banner.clear .realtime-result-value { color: var(--good); }

  .realtime-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-bottom: 14px; }

  .realtime-metric { border: 1px solid var(--border); background: var(--surface-alt); border-radius: var(--radius-sm); padding: 13px; }
  .realtime-metric-label { color: var(--text-muted); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
  .realtime-metric-value { font-family: 'IBM Plex Mono', monospace; color: var(--text); font-size: 16px; font-weight: 600; }

  .realtime-seals { display: grid; gap: 9px; }

  .realtime-seal-card { border: 1px solid var(--border); background: var(--surface-alt); border-radius: var(--radius-sm); padding: 12px; }
  .realtime-seal-head { display: flex; justify-content: space-between; gap: 10px; align-items: center; margin-bottom: 6px; }
  .realtime-seal-name { font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 700; color: var(--text); }

  .realtime-seal-status { font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 999px; background: var(--good-bg); color: var(--good); }
  .realtime-seal-status.overheat { background: var(--bad-bg); color: var(--bad); }

  .realtime-seal-meta { color: var(--text-muted); font-size: 11px; line-height: 1.55; font-weight: 500; }

  .realtime-note {
    margin-top: 14px; border: 1px solid var(--warn-border); background: var(--warn-bg);
    color: var(--warn); border-radius: var(--radius-sm); padding: 11px 12px; font-size: 11px; line-height: 1.55; font-weight: 600;
  }

    /* ---------- Session bar ---------- */

  .session-bar {
    margin-top: 18px;
    width: 100%;
    border: 1px solid var(--border);
    background: var(--surface);
    backdrop-filter: blur(20px);
    border-radius: var(--radius-lg);
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    box-shadow: var(--shadow-card);
  }

  .session-bar.active { border-color: var(--good-border); background: var(--good-bg); }

  .session-left { display: flex; align-items: center; gap: 14px; min-width: 0; }

  .session-icon {
    width: 42px; height: 42px; border-radius: var(--radius-sm);
    display: grid; place-items: center; font-size: 20px;
    background: var(--surface-alt); border: 1px solid var(--border); flex: 0 0 auto;
  }

  .session-bar.active .session-icon { background: var(--surface); border-color: var(--good-border); }

  .session-label { font-size: 11px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 3px; }

  .session-value { font-family: 'IBM Plex Mono', monospace; font-size: 15px; font-weight: 700; color: var(--text); word-break: break-all; }

  .session-bar.active .session-value { color: var(--good); }

  .session-right { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }

  .session-stage { display: flex; align-items: center; gap: 7px; }

  .session-stage-dot { width: 8px; height: 8px; border-radius: 999px; background: var(--border-strong); }

  .session-stage-dot.done { background: var(--good); }

  .session-stage-text { font-size: 12px; font-weight: 600; color: var(--text-muted); }

  .session-start-btn {
    min-height: 42px; padding: 0 18px; border-radius: var(--radius-sm);
    border: none; background: var(--accent-gradient); color: var(--accent-ink);
    font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer;
    transition: opacity 0.15s ease;
  }

  .session-start-btn:hover:not(:disabled) { opacity: 0.9; }
  .session-start-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .session-error {
    width: 100%; margin-top: 4px; border: 1px solid var(--bad-border); background: var(--bad-bg);
    color: var(--bad); border-radius: var(--radius-sm); padding: 10px 12px; font-size: 12px; font-weight: 600;
  }


  /* ---------- History ---------- */

  .history-panel { margin-top: 18px; width: 100%; border: 1px solid var(--border); background: var(--surface); backdrop-filter: blur(20px); border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow-card); }

  .history-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
  .history-header h3 { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700; color: var(--text); }
  .history-header > div { display: flex; align-items: center; gap: 10px; }

  .history-count {
    background: var(--accent-soft); border: 1px solid var(--border); padding: 6px 11px;
    border-radius: 999px; font-size: 11px; font-weight: 700; color: var(--accent-2);
    font-family: 'IBM Plex Mono', monospace;
  }

  .history-table-container { max-height: 440px; overflow-y: auto; overflow-x: auto; border-radius: var(--radius-md); border: 1px solid var(--border); }
  .history-table-container table { width: 100%; }
  .history-table-container thead { position: sticky; top: 0; z-index: 2; }
  .history-image { width: 84px; height: 56px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border); }

  /* ---------- Report ---------- */

  .report-page { padding: 22px 0; }

  .report-card {
    max-width: 1000px; margin: 0 auto; border: 1px solid var(--border); background: var(--surface);
    backdrop-filter: blur(20px);
    border-radius: var(--radius-lg); padding: 28px; box-shadow: var(--shadow-card);
  }

  .report-kicker { color: var(--accent-2); font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }
  .report-title { font-family: 'Space Grotesk', sans-serif; font-size: 27px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .report-description { color: var(--text-muted); font-size: 14px; line-height: 1.7; margin-bottom: 22px; }

  .report-status-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }

  .report-status-card { border: 1px solid var(--border); background: var(--surface-alt); border-radius: var(--radius-md); padding: 16px; }
  .report-status-card.ready { border-color: var(--good-border); background: var(--good-bg); }
  .report-status-card.missing { border-color: var(--warn-border); background: var(--warn-bg); }

  .report-status-label { color: var(--text-muted); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 7px; }
  .report-status-value { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 700; color: var(--text); }

  .report-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px; }

  .report-btn {
    min-height: 52px; border-radius: var(--radius-md); border: 1px solid var(--border);
    font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: opacity 0.15s ease;
  }

  .report-btn.generate { color: var(--accent-ink); background: var(--accent-gradient); border-color: #d58b46; box-shadow: 0 14px 30px rgba(200, 119, 56, 0.18); }
  .report-btn.refresh { color: var(--text); background: var(--surface); }

  .report-btn:hover:not(:disabled) { opacity: 0.9; }
  .report-btn:disabled { cursor: not-allowed; opacity: 0.45; }

  .report-error {
    margin-top: 15px; border: 1px solid var(--bad-border); background: var(--bad-bg);
    color: var(--bad); border-radius: var(--radius-sm); padding: 13px; font-size: 12px; font-weight: 600;
  }

  .report-success { margin-top: 18px; border: 1px solid var(--good-border); background: var(--good-bg); border-radius: var(--radius-md); padding: 20px; }
  .report-success-title { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; color: var(--good); margin-bottom: 8px; }
  .report-success-meta { color: var(--text-muted); font-size: 13px; line-height: 1.7; }

  .report-download-btn {
    display: flex; align-items: center; justify-content: center; min-height: 48px; margin-top: 14px;
    border-radius: var(--radius-sm); background: var(--good-solid); color: #fff; text-decoration: none; font-weight: 700;
  }

  /* ---------- Responsive ---------- */

  @media (max-width: 1120px) {
    .device-hero, .realtime-layout { grid-template-columns: 1fr; }
    .device-metrics { grid-template-columns: repeat(2, 1fr); }
    .hero-layout { grid-template-columns: 1fr; }
    .results-grid { grid-template-columns: 1fr; }
    .pred-img-frame { min-height: 320px; }
  }

  @media (max-width: 760px) {
    .mode-tabs-inner { grid-template-columns: 1fr; }
    .device-status-row { align-items: stretch; flex-direction: column; }
    .device-metrics { grid-template-columns: 1fr 1fr; }
    .realtime-cycle-top, .realtime-cycle-bottom { align-items: flex-start; flex-direction: column; }
    .top-nav { align-items: flex-start; flex-direction: column; }
    .nav-pills { justify-content: flex-start; }
    .metrics-strip, .status-cards, .quick-guide { grid-template-columns: 1fr; }
    .results-head { flex-direction: column; }
    .preview-image-box { height: 240px; }
    .preview-actions { grid-template-columns: 1fr; }
    .defect-table { min-width: 520px; }
    .table-wrap { overflow-x: auto; }
    .report-status-grid, .report-actions { grid-template-columns: 1fr; }
  }


  /* ==========================================================
     PROFESSIONAL COFFEE QUALITY THEME
     Dashboard-compatible / readability-first
  ========================================================== */

  .seal-root {
    --bg:
      radial-gradient(
        900px 480px at 7% -8%,
        rgba(197, 138, 77, 0.15),
        transparent 62%
      ),
      radial-gradient(
        780px 460px at 100% 5%,
        rgba(95, 119, 95, 0.09),
        transparent 58%
      ),
      linear-gradient(180deg, #fbf7f1 0%, #f4ece2 100%);

    --surface: rgba(255, 253, 249, 0.96);
    --surface-alt: #fbf5ed;

    --border: rgba(90, 55, 38, 0.11);
    --border-strong: rgba(122, 75, 51, 0.25);

    --text: #30231d;
    --text-muted: #75665d;
    --text-faint: #9a897f;

    --accent: #8a5b3d;
    --accent-2: #a66f43;
    --accent-soft: rgba(197, 138, 77, 0.11);

    --accent-gradient:
      linear-gradient(
        135deg,
        #4a2a1d 0%,
        #754631 55%,
        #b97843 100%
      );

    --accent-ink: #fffaf3;

    --good: #466b4c;
    --good-solid: #4f7755;
    --good-bg: #edf4ed;
    --good-border: #d5e5d7;

    --bad: #9c493f;
    --bad-bg: #fff0ed;
    --bad-border: #efcec8;

    --warn: #866438;
    --warn-bg: #f8efdf;
    --warn-border: #ead8b9;

    --radius-lg: 22px;
    --radius-md: 15px;
    --radius-sm: 10px;

    --shadow-card:
      0 12px 32px rgba(43, 24, 18, 0.07),
      inset 0 1px 0 rgba(255, 255, 255, 0.86);

    min-height: 100%;
    background: var(--bg);
    color: var(--text);
  }

  .seal-shell {
    max-width: 1380px;
    padding: 28px clamp(18px, 2.8vw, 38px) 58px;
  }

  /* ---------- Module header ---------- */

  .top-nav {
    padding: 18px 20px;
    border-color: rgba(255, 255, 255, 0.06);
    background:
      radial-gradient(
        circle at 88% 0%,
        rgba(224, 169, 107, 0.18),
        transparent 30%
      ),
      linear-gradient(135deg, #4a291d 0%, #28160f 82%);
    box-shadow: 0 18px 42px rgba(43, 24, 18, 0.13);
  }

  .brand-logo {
    width: 46px;
    height: 46px;
    background:
      linear-gradient(
        145deg,
        #c58a4d,
        #e6b97d
      );
    box-shadow: inset 0 1px 0 rgba(255,255,255,.25);
  }

  .brand-title {
    color: #fffaf3;
    font-size: 17px;
  }

  .brand-subtitle {
    color: #bca696;
    font-size: 13px;
  }

  .nav-pill {
    min-height: 34px;
    padding: 0 12px;
    color: #d3bfae;
    border-color: rgba(255,255,255,.08);
    background: rgba(255,255,255,.055);
    font-size: 12px;
  }

  .nav-pill-live {
    color: #d8ead9;
    border-color: rgba(133,172,137,.18);
    background: rgba(95,119,95,.20);
  }

  .live-dot {
    background: #89b08c;
    box-shadow: 0 0 0 4px rgba(137,176,140,.10);
  }

  /* ---------- Active inspection session ---------- */

  .session-bar {
    margin-top: 16px;
    padding: 16px 18px;
    background: rgba(255, 253, 249, 0.96);
  }

  .session-bar.active {
    border-color: #d5e5d7;
    background:
      linear-gradient(135deg, #f7fbf7, #edf4ed);
  }

  .session-icon {
    width: 44px;
    height: 44px;
    color: #78513a;
    background: #f1e4d5;
  }

  .session-label {
    color: #806b5f;
    font-size: 11px;
  }

  .session-value {
    margin-top: 3px;
    color: #3b2921;
    font-size: 14px;
  }

  .session-bar.active .session-value {
    color: #416348;
  }

  .session-stage-text {
    color: #706159;
    font-size: 12px;
  }

  .session-stage-dot {
    background: #ddd0c5;
  }

  .session-stage-dot.done {
    background: #628267;
  }

  .session-start-btn {
    min-height: 44px;
    border-radius: 11px;
    padding: 0 17px;
    color: #fffaf3;
    background:
      linear-gradient(
        135deg,
        #5a3726,
        #8a5b3d
      );
    box-shadow: 0 9px 20px rgba(43,24,18,.12);
    font-size: 12px;
  }

  /* ---------- Primary mode navigation ---------- */

  .mode-tabs {
    margin-top: 16px;
  }

  .mode-tabs-inner {
    width: min(1040px, 100%);
    gap: 7px;
    padding: 7px;
    background: rgba(255, 253, 249, 0.96);
    box-shadow: 0 8px 24px rgba(43,24,18,.05);
  }

  .mode-tab {
    min-height: 48px;
    border-radius: 11px;
    color: #6f6057;
    font-size: 13px;
    font-weight: 700;
  }

  .mode-tab:hover {
    color: #4b3328;
    background: #f5ece2;
  }

  .mode-tab.active {
    color: #fffaf3;
    background:
      linear-gradient(
        135deg,
        #4e2d20,
        #855339
      );
    box-shadow: 0 8px 18px rgba(43,24,18,.13);
  }

  /* ---------- Upload / AI page ---------- */

  .hero-layout {
    gap: 18px;
    padding: 20px 0;
  }

  .hero-left,
  .upload-panel,
  .results-section,
  .device-info-card,
  .device-control-card,
  .realtime-camera-card,
  .realtime-info-card,
  .history-panel,
  .report-card {
    border-color: var(--border);
    background: rgba(255, 253, 249, 0.96);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    box-shadow: var(--shadow-card);
  }

  .hero-left {
    padding: 30px;
  }

  .seal-badge {
    margin-bottom: 18px;
    color: #83583c;
    border-color: rgba(197,138,77,.16);
    background: #f5eadc;
    font-size: 11px;
  }

  .seal-badge-dot {
    background: #b97843;
  }

  .seal-title {
    color: #2b1812;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(36px, 4vw, 50px);
    line-height: 1.03;
    letter-spacing: -0.035em;
  }

  .gradient-word {
    color: #9a6338;
  }

  .seal-subtitle {
    max-width: 650px;
    color: #716159;
    font-size: 15px;
    line-height: 1.72;
  }

  .hero-chip {
    padding: 10px 12px;
    color: #60483c;
    background: #fbf5ed;
    border-color: var(--border);
    font-size: 12px;
  }

  .metric-card {
    padding: 17px;
    background: #fbf5ed;
  }

  .metric-icon {
    color: #74503c;
    background: #f1e4d5;
  }

  .metric-value {
    color: #36251e;
    font-size: 17px;
  }

  .metric-label {
    color: #7f6e64;
    font-size: 12px;
  }

  .upload-panel {
    padding: 22px;
  }

  .panel-eyebrow {
    color: #8c5c3c;
    font-size: 11px;
  }

  .panel-title {
    color: #30231d;
    font-size: 21px;
  }

  .panel-status {
    color: #45694b;
    border-color: #d5e5d7;
    background: #edf4ed;
    font-size: 12px;
  }

  .upload-zone {
    min-height: 340px;
    color: #4d3a30;
    background:
      linear-gradient(
        145deg,
        #fffdf9,
        #f9f1e8
      );
    border-color: rgba(122,75,51,.24);
  }

  .upload-zone:hover,
  .upload-zone.drag-over {
    border-color: #b97843;
    background: #f7ecdf;
  }

  .upload-icon-wrap {
    color: #754d37;
    background: #f2e5d6;
  }

  .upload-label {
    color: #34231c;
    font-size: 19px;
  }

  .upload-hint {
    color: #7c6a60;
    font-size: 13px;
  }

  .upload-btn-fake,
  .detect-btn,
  .device-test-btn,
  .realtime-btn.start,
  .report-btn.generate {
    color: #fffaf3;
    background:
      linear-gradient(
        135deg,
        #4e2d20,
        #7a4933,
        #a86c40
      );
    border-color: transparent;
    box-shadow: 0 12px 26px rgba(43,24,18,.14);
  }

  .format-pill {
    color: #806d61;
    background: #fffdf9;
    font-size: 11px;
  }

  .preview-card {
    background: #fbf5ed;
  }

  .preview-image-box {
    background: #2d1b14;
  }

  .preview-floating-tag {
    color: #e1efe2;
    background: rgba(44, 28, 20, .88);
  }

  .preview-info-label {
    color: #8b5d40;
    font-size: 11px;
  }

  .preview-info-name {
    color: #34231c;
    font-size: 17px;
  }

  .preview-meta {
    color: #78675d;
    background: #fffdf9;
    font-size: 12px;
  }

  .soft-btn {
    color: #594239;
    background: #fffdf9;
    font-size: 13px;
  }

  .soft-btn:hover {
    background: #f4eadf;
  }

  /* ---------- Vision results ---------- */

  .results-section {
    padding: 24px;
  }

  .results-kicker {
    color: #527158;
    font-size: 11px;
  }

  .results-main-title {
    color: #2b1812;
    font-size: 25px;
  }

  .results-summary-pill {
    color: #416548;
    border-color: #d5e5d7;
    background: #edf4ed;
  }

  .status-card {
    padding: 18px;
    background: #fbf5ed;
  }

  .status-card.good {
    border-color: #d5e5d7;
    background: #edf4ed;
  }

  .status-card.bad {
    border-color: #efcec8;
    background: #fff0ed;
  }

  .sc-label {
    color: #806e63;
    font-size: 11px;
  }

  .sc-value {
    color: #30231d;
    font-size: 26px;
  }

  .sc-value.good {
    color: #446b4b;
  }

  .sc-value.bad {
    color: #9b473e;
  }

  .sc-caption {
    color: #7b6a60;
    font-size: 12px;
  }

  .result-block {
    background: #fffdf9;
  }

  .block-header {
    background: #f8f1e8;
  }

  .block-title {
    color: #4a342a;
    font-size: 12px;
  }

  .pred-img-frame {
    background: #2d1b14;
  }

  .defect-table {
    font-size: 13px;
  }

  .defect-table thead tr {
    background: #f7efe6;
  }

  .defect-table th {
    color: #76645a;
    font-size: 11px;
  }

  .defect-table td {
    color: #423028;
    font-size: 13px;
  }

  .defect-table tbody tr:hover {
    background: #fbf5ed;
  }

  .row-num {
    color: #725f54;
    background: #f6ede4;
  }

  .class-pill {
    color: #3d2b23;
  }

  .conf-bar-track {
    background: #eadfd4;
  }

  .conf-bar-fill {
    background:
      linear-gradient(
        90deg,
        #7b4c34,
        #c58a4d
      );
  }

  .conf-text {
    color: #8b5a3d;
  }

  .empty-state,
  .insight-box {
    color: #78685f;
  }

  .insight-box {
    background: #fbf5ed;
  }

  .insight-title {
    color: #3d2c24;
  }

  /* ---------- Physical leak detection ---------- */

  .device-page,
  .realtime-page,
  .report-page {
    padding: 20px 0;
  }

  .device-info-card,
  .device-control-card {
    padding: 26px;
  }

  .device-kicker,
  .realtime-kicker,
  .report-kicker {
    color: #8b5a3d;
    font-size: 11px;
  }

  .device-title {
    color: #2b1812;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(30px, 3vw, 39px);
  }

  .device-description,
  .report-description {
    color: #726159;
    font-size: 14px;
  }

  .device-flow-item {
    background: #fbf5ed;
  }

  .device-flow-num {
    color: #85583d;
    background: #f1e4d5;
  }

  .device-flow-text {
    color: #6e5d54;
    font-size: 13px;
  }

  .device-status-badge {
    color: #75645b;
    background: #fbf5ed;
  }

  .device-status-badge.connected {
    color: #45684b;
    border-color: #d5e5d7;
    background: #edf4ed;
  }

  .device-status-badge.disconnected {
    color: #9c493f;
    border-color: #efcec8;
    background: #fff0ed;
  }

  .refresh-device-btn {
    color: #574137;
    background: #fffdf9;
    font-size: 12px;
  }

  .refresh-device-btn:hover {
    background: #f6ede4;
  }

  .device-ready-box {
    background: #fbf5ed;
  }

  .device-ready-title {
    color: #3b2921;
    font-size: 16px;
  }

  .device-ready-text {
    color: #74635a;
    font-size: 13px;
  }

  .device-warning {
    color: #7b5c34;
    background: #f8efdf;
  }

  .device-result-section {
    background: #fbf5ed;
  }

  .device-result-label {
    color: #7c6b61;
    font-size: 11px;
  }

  .device-result-value {
    font-size: 26px;
  }

  .device-result-banner.good .device-result-value {
    color: #456a4b;
  }

  .device-result-banner.leak .device-result-value {
    color: #9b463e;
  }

  .device-metric {
    background: #fffdf9;
  }

  .device-metric-label {
    color: #806f64;
    font-size: 10px;
  }

  .device-metric-value {
    color: #3d2c24;
  }

  .readings-box {
    background: #fffdf9;
  }

  .readings-title {
    color: #49342a;
  }

  .reading-pill {
    color: #75655b;
    background: #f7efe6;
  }

  /* ---------- Real-time AI inspection ---------- */

  .realtime-camera-card,
  .realtime-info-card {
    padding: 22px;
  }

  .realtime-title {
    color: #30231d;
    font-size: 21px;
  }

  .realtime-status {
    color: #736158;
    background: #fbf5ed;
  }

  .realtime-status.running {
    color: #45694b;
    border-color: #d5e5d7;
    background: #edf4ed;
  }

  .realtime-video-frame,
  .realtime-snapshot-frame {
    background:
      radial-gradient(
        circle at 50% 50%,
        #342119,
        #1e120d
      );
    border-color: rgba(90,55,38,.18);
  }

  .realtime-empty {
    color: #c6b4a8;
  }

  .realtime-empty-title {
    color: #fff3e8;
    font-size: 19px;
  }

  .realtime-empty-text {
    color: #c4b1a5;
    font-size: 13px;
  }

  .realtime-cycle-card,
  .realtime-current-result,
  .realtime-snapshot-card,
  .realtime-metric,
  .realtime-seal-card {
    background: #fbf5ed;
  }

  .realtime-cycle-kicker {
    color: #8b5a3d;
    font-size: 10px;
  }

  .realtime-cycle-title {
    color: #3d2b23;
    font-size: 14px;
  }

  .realtime-cycle-phase {
    color: #44694a;
    background: #edf4ed;
    border-color: #d5e5d7;
    font-size: 10px;
  }

  .realtime-progress-track {
    background: #e9ddd1;
  }

  .realtime-progress-fill {
    background:
      linear-gradient(
        90deg,
        #78503a,
        #c58a4d
      );
  }

  .realtime-cycle-time {
    color: #74635a;
    font-size: 11px;
  }

  .realtime-cycle-time strong {
    color: #8b5a3d;
  }

  .realtime-cycle-number,
  .realtime-result-refresh-line {
    color: #948278;
    font-size: 10px;
  }

  .realtime-current-result-label,
  .realtime-validation-label {
    color: #806e64;
    font-size: 10px;
  }

  .realtime-current-result-value,
  .realtime-validation-value {
    color: #3b2921;
    font-size: 13px;
  }

  .realtime-validation-strip {
    border-color: #d5e5d7;
    background: #edf4ed;
  }

  .realtime-validation-status {
    color: #456a4b;
    font-size: 10px;
  }

  .realtime-snapshot-title {
    color: #3c2a22;
    font-size: 14px;
  }

  .realtime-snapshot-badge {
    color: #83563b;
    background: #f2e4d4;
    font-size: 9px;
  }

  .realtime-snapshot-caption {
    color: #8d7a6f;
    font-size: 11px;
  }

  .realtime-btn {
    font-size: 13px;
  }

  .realtime-btn.stop {
    color: #9c493f;
    background: #fff0ed;
    border-color: #efcec8;
  }

  .realtime-result-label {
    color: #7e6c62;
    font-size: 10px;
  }

  .realtime-result-value {
    color: #382720;
    font-size: 22px;
  }

  .realtime-metric-label {
    color: #7c6b61;
    font-size: 10px;
  }

  .realtime-metric-value {
    color: #392821;
    font-size: 16px;
  }

  .realtime-seal-name {
    color: #392820;
    font-size: 14px;
  }

  .realtime-seal-meta {
    color: #78675e;
    font-size: 12px;
  }

  .realtime-note {
    color: #775b36;
    background: #f8efdf;
    border-color: #ead8b9;
    font-size: 12px;
  }

  /* ---------- Histories ---------- */

  .history-panel {
    padding: 22px;
  }

  .history-header h3 {
    color: #34231c;
    font-size: 17px;
  }

  .history-count {
    color: #82573d;
    background: #f3e6d7;
    font-size: 11px;
  }

  .history-table-container {
    border-color: var(--border);
    background: #fffdf9;
  }

  .history-image {
    border-color: rgba(90,55,38,.12);
    box-shadow: 0 4px 12px rgba(43,24,18,.07);
  }

  /* ---------- Final report ---------- */

  .report-card {
    max-width: 1080px;
    padding: 30px;
  }

  .report-title {
    color: #2b1812;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 31px;
  }

  .report-status-card {
    background: #fbf5ed;
  }

  .report-status-card.ready {
    border-color: #d5e5d7;
    background: #edf4ed;
  }

  .report-status-card.missing {
    border-color: #ead8b9;
    background: #f8efdf;
  }

  .report-status-label {
    color: #7c6b61;
    font-size: 11px;
  }

  .report-status-value {
    color: #3c2a22;
    font-size: 17px;
  }

  .report-btn {
    font-size: 13px;
  }

  .report-btn.refresh {
    color: #584238;
    background: #fffdf9;
  }

  .report-success {
    border-color: #d5e5d7;
    background: #edf4ed;
  }

  .report-success-title {
    color: #426649;
    font-size: 19px;
  }

  .report-success-meta {
    color: #657267;
    font-size: 13px;
  }

  .report-download-btn {
    background:
      linear-gradient(
        135deg,
        #45694b,
        #628167
      );
  }

  /* ---------- Errors ---------- */

  .error-box,
  .device-error,
  .realtime-error,
  .session-error,
  .report-error {
    color: #94443c;
    background: #fff0ed;
    border-color: #efcec8;
    font-size: 12px;
  }

  /* ---------- Readability / polish ---------- */

  .seal-root button,
  .seal-root a {
    font-family: 'Inter', sans-serif;
  }

  .seal-root button {
    transition:
      transform .18s ease,
      box-shadow .18s ease,
      background .18s ease,
      border-color .18s ease,
      opacity .18s ease;
  }

  .detect-btn:hover:not(:disabled),
  .device-test-btn:hover:not(:disabled),
  .session-start-btn:hover:not(:disabled),
  .realtime-btn.start:hover:not(:disabled),
  .report-btn.generate:hover:not(:disabled) {
    opacity: 1;
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(43,24,18,.18);
  }

  .hero-left,
  .upload-panel,
  .results-section,
  .device-info-card,
  .device-control-card,
  .realtime-camera-card,
  .realtime-info-card,
  .history-panel,
  .report-card,
  .session-bar {
    transition:
      box-shadow .2s ease,
      border-color .2s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    .seal-root *,
    .seal-root *::before,
    .seal-root *::after {
      animation-duration: .001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .001ms !important;
    }
  }

  @media (max-width: 760px) {
    .seal-shell {
      padding: 16px 13px 38px;
    }

    .top-nav {
      padding: 16px;
    }

    .brand-title {
      font-size: 16px;
    }

    .brand-subtitle {
      white-space: normal;
    }

    .mode-tab {
      font-size: 13px;
    }

    .hero-left,
    .device-info-card,
    .device-control-card,
    .realtime-camera-card,
    .realtime-info-card,
    .report-card {
      padding: 20px;
    }

    .seal-title {
      font-size: 36px;
    }

    .device-title {
      font-size: 31px;
    }

    .report-title {
      font-size: 27px;
    }

    .session-right {
      width: 100%;
    }

    .session-start-btn {
      width: 100%;
    }
  }

`;

function SealUploadPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

    // Packet inspection session
  const [activePacketId, setActivePacketId] = useState(null);
  const [sessionStarting, setSessionStarting] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [visionStageDone, setVisionStageDone] = useState(false);
  const [leakStageDone, setLeakStageDone] = useState(false);

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

  const [finalInspectionImage, setFinalInspectionImage] = useState(null);

  // Real-time two-stage AI state
  const [realtimeRunning, setRealtimeRunning] = useState(false);
  const [realtimeStarting, setRealtimeStarting] = useState(false);
  const [realtimeResult, setRealtimeResult] = useState(null);
  const [realtimeError, setRealtimeError] = useState("");
  const [realtimeVideoUrl, setRealtimeVideoUrl] = useState("");

  // Real-time 3-second inspection cycle UI
  const REALTIME_CYCLE_MS = 3000;
  const [realtimeElapsed, setRealtimeElapsed] = useState(0);
  const [realtimeCycle, setRealtimeCycle] = useState(1);
  const latestRealtimeResultRef = useRef(null);

  // Final inspection report state
  const [reportStatus, setReportStatus] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

    const refreshSessionStatus = async () => {
    try {
      const data = await getCurrentInspectionSession();

      if (data?.active && data?.inspection) {
        setActivePacketId(data.inspection.packet_id);
        setVisionStageDone(Boolean(data.inspection.vision_result));
        setLeakStageDone(Boolean(data.inspection.leak_result));
      } else {
        setActivePacketId(null);
        setVisionStageDone(false);
        setLeakStageDone(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartInspectionSession = async () => {
    try {
      setSessionStarting(true);
      setSessionError("");

      const data = await startInspectionSession();

      setActivePacketId(data.packet_id);
      setVisionStageDone(false);
      setLeakStageDone(false);
    } catch (error) {
      console.error(error);
      setSessionError(
        error?.response?.data?.detail ||
          "Could not start a new inspection session."
      );
    } finally {
      setSessionStarting(false);
    }
  };

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

  const formatInspectionDateTime = (value) => {
    if (!value) return "—";

    // The backend stores/serialises timestamps as naive UTC strings
    // (e.g. "2026-08-26T21:24:10.928000") with no trailing "Z" and no
    // timezone offset. When a string like that is handed straight to
    // `new Date()`, the browser treats it as LOCAL time instead of UTC,
    // which silently shifts every displayed date/time by the local UTC
    // offset (+5:30 for Sri Lanka) and can even roll the date over to
    // the next/previous day. Normalise to a real UTC string first.
    let normalized = String(value).trim();

    const hasTimezoneInfo = /Z$|[+-]\d{2}:?\d{2}$/.test(normalized);

    if (!hasTimezoneInfo) {
      normalized = `${normalized}Z`;
    }

    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-LK", {
      timeZone: "Asia/Colombo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const handleGenerateReport = async () => {
    try {
      setReportLoading(true);
      setReportError("");
      setGeneratedReport(null);

      const data = await generateInspectionReport();

      setGeneratedReport(data);

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
  refreshSessionStatus();
}, []);

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

    const history = Array.isArray(data?.history)
      ? [...data.history].sort(
          (a, b) =>
            new Date(b?.created_at || 0).getTime() -
            new Date(a?.created_at || 0).getTime()
        )
      : [];

    setSealHistory(history);


    // Always keep the newest saved inspection image in sync.
    if (history.length > 0 && history[0]?.image_path) {

      setFinalInspectionImage(
        buildImageUrl(history[0].image_path)
      );

    }

    return history;

  } catch(error){

    console.error(error);
    return [];

  } finally {

    setSealHistoryLoading(false);

  }

};

const refreshRealtimeHistory = async () => {

  // The backend saves the completed inspection in a background task.
  // Give that save a short window, then verify that the newest record
  // has appeared instead of showing stale historical data.

  for (let attempt = 0; attempt < 4; attempt += 1) {

    const history = await loadSealHistory();

    if (history.length > 0) {
      return history;
    }

    await new Promise((resolve) =>
      window.setTimeout(resolve, 350)
    );

  }

  return [];

};


      const handleLeakDeviceTest = async () => {
    if (!activePacketId) {
      setDeviceError("Please start a new inspection (Packet ID) first.");
      return;
    }

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
      refreshSessionStatus();
    }
  };

  

      const handleStartRealtime = async () => {
    if (!activePacketId) {
      setRealtimeError("Please start a new inspection (Packet ID) first.");
      return;
    }

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
      setRealtimeElapsed(0);
      setRealtimeCycle(1);
      latestRealtimeResultRef.current = null;
      setRealtimeResult(null);
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
      refreshSessionStatus();
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
        setRealtimeElapsed(0);
        setRealtimeCycle(1);
        latestRealtimeResultRef.current = null;


        // Get the latest completed inspection history after stopping.
        await refreshRealtimeHistory();

      }
  };

  const handleTabChange = async (nextTab) => {
    if (activeTab === "realtime" && nextTab !== "realtime" && realtimeRunning) {
      await handleStopRealtime();
    }

    setActiveTab(nextTab);
  };

  

  // ==================================================
  // REAL-TIME 3-SECOND INSPECTION CYCLE
  // ==================================================
  useEffect(() => {
    if (!realtimeRunning) return undefined;

    let cancelled = false;
    let resultPollId = null;
    let cycleTimerId = null;
    let elapsedTimerId = null;

    const loadLatestResult = async () => {
      try {
        const data = await getRealtimeSealResult();

        if (!cancelled && data?.result) {
          latestRealtimeResultRef.current = data.result;
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

    // Read the backend frequently, but do not visually replace the
    // completed inspection summary until the 3-second cycle ends.
    resultPollId = window.setInterval(loadLatestResult, 500);

    const cycleStartedAt = Date.now();

    elapsedTimerId = window.setInterval(() => {
      if (cancelled) return;

      const elapsed = Date.now() - cycleStartedAt;
      setRealtimeElapsed(
        Math.min(elapsed, REALTIME_CYCLE_MS)
      );
    }, 100);

    cycleTimerId = window.setInterval(async () => {
      if (cancelled) return;

      const newestResult = latestRealtimeResultRef.current;

      if (newestResult) {
        setRealtimeResult(newestResult);
        setRealtimeError("");

        // Show the exact annotated image returned by the completed
        // inspection in the Inspection Summary.
        if (newestResult.inspection_image) {
          setFinalInspectionImage(
            `${buildImageUrl(newestResult.inspection_image)}?cycle=${Date.now()}`
          );
        }
      }

      setRealtimeElapsed(0);
      setRealtimeCycle((previous) => previous + 1);

      // Backend history insertion happens in the background.
      // Retry briefly so the new record appears immediately after save.
      await refreshRealtimeHistory();

    }, REALTIME_CYCLE_MS);

    return () => {
      cancelled = true;

      if (resultPollId) {
        window.clearInterval(resultPollId);
      }

      if (cycleTimerId) {
        window.clearInterval(cycleTimerId);
      }

      if (elapsedTimerId) {
        window.clearInterval(elapsedTimerId);
      }
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

  const formatSriLankaDateTime = (value) => formatInspectionDateTime(value);

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

  const realtimeProgress = Math.min(
    100,
    Math.max(0, (realtimeElapsed / REALTIME_CYCLE_MS) * 100)
  );

  const realtimeRemaining = Math.max(
    0,
    (REALTIME_CYCLE_MS - realtimeElapsed) / 1000
  );

  const realtimeCyclePhase =
    realtimeElapsed < 900
      ? "CAPTURING FRAMES"
      : realtimeElapsed < 1900
        ? "ANALYSING SEALS"
        : realtimeElapsed < 2600
          ? "VALIDATING RESULT"
          : "FINALISING INSPECTION";

  return (
    <>
      <style>{styles}</style>

      <main className="seal-root">
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

                    <div className={`session-bar ${activePacketId ? "active" : ""}`}>
            <div className="session-left">
              <div className="session-icon">🏷️</div>
              <div>
                <div className="session-label">Active Inspection Session</div>
                <div className="session-value">
                  {activePacketId || "No active packet — start a new inspection"}
                </div>
              </div>
            </div>

            <div className="session-right">
              <div className="session-stage">
                <span className={`session-stage-dot ${visionStageDone ? "done" : ""}`} />
                <span className="session-stage-text">AI Vision</span>
              </div>

              <div className="session-stage">
                <span className={`session-stage-dot ${leakStageDone ? "done" : ""}`} />
                <span className="session-stage-text">Leak Test</span>
              </div>

              <button
                type="button"
                className="session-start-btn"
                onClick={handleStartInspectionSession}
                disabled={sessionStarting}
              >
                {sessionStarting ? "Starting..." : "＋ Start New Inspection"}
              </button>
            </div>

            {sessionError && (
              <div className="session-error">⚠️ {sessionError}</div>
            )}
          </div>

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

                  {realtimeRunning && (
                    <div className="realtime-cycle-card">
                      <div className="realtime-cycle-top">
                        <div className="realtime-cycle-left">
                          <div className="realtime-cycle-kicker">
                            Automatic Inspection Cycle
                          </div>

                          <div className="realtime-cycle-title">
                            New AI result every 3 seconds
                          </div>
                        </div>

                        <div className="realtime-cycle-phase">
                          <span className="realtime-cycle-phase-dot" />
                          {realtimeCyclePhase}
                        </div>
                      </div>

                      <div className="realtime-progress-track">
                        <div
                          className="realtime-progress-fill"
                          style={{ width: `${realtimeProgress}%` }}
                        />
                      </div>

                      <div className="realtime-cycle-bottom">
                        <div className="realtime-cycle-time">
                          Next update in{" "}
                          <strong>{realtimeRemaining.toFixed(1)}s</strong>
                        </div>

                        <div className="realtime-cycle-number">
                          Inspection Cycle #{realtimeCycle}
                        </div>
                      </div>

                      <div className="realtime-result-refresh-line">
                        <span className="refresh-dot" />
                        Camera and AI processing continue automatically.
                        The current result updates when this cycle completes.
                      </div>
                    </div>
                  )}

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

                    {realtimeRunning && (
                      <div className="realtime-status running">
                        <span className="device-dot" />
                        Cycle #{realtimeCycle}
                      </div>
                    )}
                  </div>

                  <div
                    className={`realtime-current-result ${
                      realtimeResult ? "ready" : "waiting"
                    }`}
                  >
                    <div className="realtime-current-result-head">
                      <div>
                        <div className="realtime-current-result-label">
                          Current AI Result
                        </div>

                        <div className="realtime-current-result-value">
                          {realtimeResult
                            ? "Latest completed inspection is displayed"
                            : "Waiting for the first completed inspection"}
                        </div>
                      </div>

                      <div
                        className={`realtime-cycle-check ${
                          realtimeResult ? "" : "waiting"
                        }`}
                      >
                        {realtimeResult ? "✓" : "…"}
                      </div>
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

                  {realtimeResult && (
                    <div className="realtime-validation-strip">
                      <div className="realtime-validation-icon">✓</div>

                      <div className="realtime-validation-copy">
                        <div className="realtime-validation-label">
                          Frame Validation
                        </div>

                        <div className="realtime-validation-value">
                          {realtimeResult.validation?.confirmed_frames ?? 0}
                          {" / "}
                          {realtimeResult.validation?.required_frames ?? 5}
                          {" frames"}
                        </div>
                      </div>

                      <div className="realtime-validation-status">
                        {realtimeResult.validation?.status || "CHECKING"}
                      </div>
                    </div>
                  )}

                  {realtimeResult?.inspection_image && (
                    <div className="realtime-snapshot-card">
                      <div className="realtime-snapshot-head">
                        <div>
                          <div className="realtime-kicker">
                            Completed Inspection Evidence
                          </div>
                          <div className="realtime-snapshot-title">
                            Latest Annotated Snapshot
                          </div>
                        </div>

                        <div className="realtime-snapshot-badge">
                          3s RESULT
                        </div>
                      </div>

                      <div className="realtime-snapshot-frame">
                        <img
                          src={`${buildImageUrl(
                            realtimeResult.inspection_image
                          )}?cycle=${realtimeCycle}`}
                          alt="Latest AI annotated seal inspection"
                          className="realtime-snapshot-image"
                        />
                      </div>

                      <div className="realtime-snapshot-caption">
                        Seal and defect boundary boxes shown from the
                        completed AI inspection cycle.
                      </div>
                    </div>
                  )}

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


<div>

<button
type="button"
className="refresh-device-btn"
onClick={loadSealHistory}
disabled={sealHistoryLoading}
>

{
sealHistoryLoading
?
"Refreshing..."
:
"↻ Refresh"
}

</button>


<span className="history-count">

{sealHistory.length} Records

</span>


</div>


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

          <tr key={item._id || item.id || item.packet_id || `${item.created_at}-${index}`}>

            <td>
              {item.packet_id || `PKT-${index+1}`}
            </td>


            <td>
              {formatSriLankaDateTime(item.created_at)}
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

              src={`${buildImageUrl(item.image_path)}?history=${encodeURIComponent(
                item.created_at || item.packet_id || index
              )}`}

              className="history-image"

              alt="AI final inspection"

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
formatInspectionDateTime(item.created_at)
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

import TOKEN from "./TOKEN";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
 
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${TOKEN.bg}; color: ${TOKEN.text}; font-family: ${TOKEN.fontBody}; }
    input, select, textarea, button { font-family: inherit; }
 
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: ${TOKEN.bg}; }
    ::-webkit-scrollbar-thumb { background: ${TOKEN.borderMid}; border-radius: 2px; }
 
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
 
    .fade-up { animation: fadeUp 0.28s ease forwards; }
 
    .skeleton {
      background: linear-gradient(90deg, #1a2236 25%, #243044 50%, #1a2236 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      border-radius: 6px;
    }
 
    /* Buttons */
    .btn {
      border: none; padding: 8px 18px; border-radius: 8px;
      cursor: pointer; font-weight: 600; font-size: 13px;
      transition: all 0.18s; white-space: nowrap;
    }
    .btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-primary { background: ${TOKEN.accent}; color: #fff; }
    .btn-primary:hover:not(:disabled) { background: ${TOKEN.accentHover}; transform: translateY(-1px); }
    .btn-ghost {
      background: transparent; color: ${TOKEN.textMid};
      border: 1px solid ${TOKEN.border};
    }
    .btn-ghost:hover:not(:disabled) { border-color: ${TOKEN.borderMid}; color: ${TOKEN.text}; }
    .btn-danger { background: #ef444422; color: #ef4444; border: 1px solid #ef444444; }
    .btn-danger:hover:not(:disabled) { background: #ef444433; }
 
    /* Inputs */
    .inp {
      background: ${TOKEN.surfaceAlt}; border: 1px solid ${TOKEN.border};
      color: ${TOKEN.text}; padding: 9px 13px; border-radius: 8px;
      font-size: 13px; width: 100%; outline: none; transition: border-color 0.18s;
    }
    .inp:focus { border-color: ${TOKEN.accent}; }
    select.inp option { background: ${TOKEN.surfaceAlt}; }
 
    /* Tags */
    .tag {
      display: inline-block; background: #1e293b; border: 1px solid #334155;
      border-radius: 4px; padding: 2px 8px; font-size: 11px;
      color: ${TOKEN.textMid}; margin: 2px;
    }
 
    /* Cards */
    .prospect-card {
      background: ${TOKEN.surface}; border: 1px solid ${TOKEN.border};
      border-radius: ${TOKEN.radius}; padding: 18px;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      cursor: pointer; animation: fadeUp 0.25s ease forwards;
    }
    .prospect-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      border-color: ${TOKEN.borderMid};
    }
 
    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.88);
      z-index: 100; display: flex; align-items: center; justify-content: center;
      padding: 16px;
    }
    .modal-box {
      background: ${TOKEN.surfaceAlt}; border: 1px solid ${TOKEN.border};
      border-radius: ${TOKEN.radiusLg}; width: 100%; max-width: 660px;
      max-height: 90vh; display: flex; flex-direction: column;
      animation: fadeUp 0.2s ease;
    }
 
    /* Nav */
    .nav-tab {
      background: transparent; border: none; color: ${TOKEN.textDim};
      padding: 18px 16px; cursor: pointer; font-size: 13px; font-weight: 500;
      border-bottom: 2px solid transparent; transition: all 0.18s;
    }
    .nav-tab:hover { color: ${TOKEN.textMid}; }
    .nav-tab.active { color: ${TOKEN.text}; border-bottom-color: ${TOKEN.accent}; }
 
    /* Score chip */
    .score-chip {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 3px 10px; border-radius: 6px; font-weight: 700; font-size: 12px;
      font-family: ${TOKEN.fontMono};
    }
 
    /* Status badge */
    .status-badge {
      display: inline-block; padding: 2px 9px; border-radius: 4px;
      font-size: 11px; font-weight: 600;
    }
 
    /* Section heading */
    .section-title {
      font-family: ${TOKEN.fontDisplay}; font-weight: 700; font-size: 22px;
      color: ${TOKEN.text}; margin-bottom: 6px;
    }
    .section-sub { color: ${TOKEN.textDim}; font-size: 14px; }
 
    /* Divider */
    .divider { border: none; border-top: 1px solid ${TOKEN.border}; margin: 0; }
 
    /* Info grid in modals */
    .info-cell {
      background: ${TOKEN.surface}; border-radius: 8px; padding: 10px 14px;
    }
    .info-cell .label {
      color: ${TOKEN.textDim}; font-size: 10px; text-transform: uppercase;
      letter-spacing: 0.08em; margin-bottom: 3px;
    }
    .info-cell .value { font-size: 13px; font-weight: 500; color: ${TOKEN.text}; }
  `}</style>
);
export default GlobalStyles;
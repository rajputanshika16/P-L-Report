import React, { useState, useRef, useEffect, useCallback } from "react";

/* ───────────────────────── Helpers ───────────────────────── */
const fmt = (n) => "$" + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const fmtSigned = (n) => (n < 0 ? `(${fmt(n)})` : fmt(n));
const parseNum = (s) => parseFloat(String(s).replace(/[$,()]/g, "")) || 0;

const tabMeta = {
  bank: {
    bold: "Bank",
    rest: " Deposits",
    sub: "View and manage all bank deposits and reconciliations",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="6" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <circle cx="17" cy="14" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  rent: {
    bold: "Rent",
    rest: "",
    sub: "View and track all active, future and past leases",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  deposits: {
    bold: "Deposits",
    rest: " Held",
    sub: "Manage and track all security deposits held",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  pl: {
    bold: "Finance",
    rest: "",
    sub: "Profit and loss overview for all properties",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  txn: {
    bold: "Payments",
    rest: "",
    sub: "View all payment transactions across properties",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
};

/* ───────────────────────── CSS (verbatim from source, scoped) ───────────────────────── */
const css = `
.rpt-root *{box-sizing:border-box;margin:0;padding:0;}
.rpt-root{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f5f6f8;color:#1a1a2e;font-size:14px;min-height:100vh;position:relative;}
.rpt-root{
  --orange:#e8450a; --orange-light:#fff2ee; --orange-mid:#ffddd4;
  --green:#1a7a4a; --green-light:#eaf7f0; --green-mid:#c6edd9;
}
.top-header{display:flex;align-items:center;background:#fff;padding:14px 28px;border-bottom:1px solid #f0f0f0;gap:14px;}
.header-icon{width:42px;height:42px;border-radius:10px;background:var(--orange);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.header-icon svg{color:#fff;}
.header-text h1{font-size:18px;font-weight:800;line-height:1.1;}
.header-text h1 span.org{color:var(--orange);}
.header-text p{font-size:12px;color:#8a94a6;margin-top:2px;}
.header-right{margin-left:auto;display:flex;align-items:center;gap:16px;}
.notif-btn{width:36px;height:36px;border-radius:50%;border:1px solid #e8ebf0;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;}
.notif-btn svg{color:#7a8fa6;}
.user-pill{display:flex;align-items:center;gap:10px;cursor:pointer;}
.user-avatar{width:36px;height:36px;border-radius:50%;background:var(--orange);color:#fff;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;}
.user-info{line-height:1.3;}
.user-pill svg{color:#8a94a6;}
.tabbar-wrap{background:#fff;padding:0 28px;}
.tabbar{display:flex;gap:2px;background:var(--orange-light);border-radius:12px;padding:6px;margin:16px 0;}
.tab{padding:10px 22px;font-size:13px;font-weight:600;color:#7a8fa6;cursor:pointer;border-radius:8px;transition:all .18s;white-space:nowrap;user-select:none;}
.tab:hover{color:#e8450a;background:rgba(232,69,10,.07);}
.tab.active{color:var(--orange);background:#fff;box-shadow:0 2px 8px rgba(232,69,10,.12);font-weight:700;}
.page{padding:20px 28px 60px;}
.toolbar{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;position:relative;z-index:300;}
.toolbar-left{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.filter-wrap{position:relative;}
.filter-pill{display:inline-flex;align-items:center;gap:8px;border:1.5px solid #e2e5ea;border-radius:8px;padding:9px 16px;background:#fff;cursor:pointer;min-width:160px;user-select:none;transition:border-color .15s;font-size:13px;color:#555;font-weight:500;}
.filter-pill svg{color:#7a8fa6;}
.filter-pill .chev{margin-left:auto;transition:transform .2s;color:#9ca3af;}
.filter-open .filter-pill{border-color:var(--orange);box-shadow:0 0 0 3px rgba(232,69,10,.08);}
.filter-open .filter-pill .chev{transform:rotate(180deg);}
.filter-panel{display:none;position:absolute;top:calc(100% + 6px);left:0;background:#fff;border:1.5px solid #e2e5ea;border-radius:14px;box-shadow:0 10px 36px rgba(0,0,0,.12);padding:22px 22px 18px;z-index:400;min-width:480px;}
.filter-open .filter-panel{display:block;}
.fp-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px 20px;margin-bottom:18px;}
.fp-full{grid-column:1/-1;}
.fp-lbl{font-size:12px;font-weight:700;color:#374151;margin-bottom:6px;}
.fp-lbl.blue{color:#1a6fa8;}
.fp-input,.fp-sel{width:100%;padding:8px 11px;border:1.5px solid #e2e5ea;border-radius:8px;background:#fff;font-size:13px;color:#374151;font-family:inherit;transition:border-color .15s;outline:none;}
.fp-sel{appearance:none;-webkit-appearance:none;padding-right:32px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;cursor:pointer;}
.fp-input:focus,.fp-sel:focus{border-color:var(--orange);box-shadow:0 0 0 3px rgba(232,69,10,.08);}
.fp-3col{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
.fp-2col{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.fp-chk-row{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
.fp-chk-row input[type=checkbox]{width:16px;height:16px;accent-color:var(--orange);cursor:pointer;}
.fp-chk-row label{font-size:13px;color:#5a7a9a;cursor:pointer;}
.fp-footer{display:flex;align-items:center;justify-content:space-between;padding-top:14px;border-top:1px solid #f0f2f5;}
.clear-btn{display:flex;align-items:center;gap:6px;background:none;border:none;color:#e05252;font-size:13px;font-weight:700;cursor:pointer;}
.apply-btn{background:var(--orange);color:#fff;border:none;border-radius:8px;padding:9px 22px;font-size:13px;font-weight:700;cursor:pointer;transition:background .15s;}
.apply-btn:hover{background:#c93a08;}
.export-btn{display:inline-flex;align-items:center;gap:7px;border:1.5px solid #e2e5ea;border-radius:8px;padding:9px 18px;font-size:13px;font-weight:700;color:var(--orange);background:#fff;cursor:pointer;transition:border-color .15s;}
.export-btn:hover{border-color:var(--orange);background:var(--orange-light);}
.export-btn svg{color:var(--orange);}
.content-card{background:#fff;border-radius:14px;border:1px solid #ebebeb;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.04);}
.bd-layout{display:flex;gap:16px;align-items:flex-start;}
.bd-table-wrap{flex:1;min-width:0;}
.bd-side{display:flex;flex-direction:column;gap:14px;min-width:200px;max-width:220px;}
.bd-card{border-radius:14px;padding:20px 18px;}
.bd-card.orange-card{background:var(--orange-light);}
.bd-card.green-card{background:var(--green-light);}
.bd-card-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;}
.bd-card.orange-card .bd-card-icon{background:var(--orange);}
.bd-card.green-card .bd-card-icon{background:var(--green);}
.bd-card-icon svg{color:#fff;}
.bd-card-amt{font-size:26px;font-weight:800;margin-bottom:4px;}
.bd-card.orange-card .bd-card-amt{color:var(--orange);}
.bd-card.green-card .bd-card-amt{color:var(--green);}
.bd-card-lbl{font-size:11px;font-weight:700;letter-spacing:.5px;color:#8a94a6;}
.tbl-wrap{overflow-x:auto;}
.rpt-root table{width:100%;border-collapse:collapse;}
.rpt-root thead tr{background:#fafbfc;}
.rpt-root th{padding:11px 16px;font-size:12px;font-weight:600;color:#9ca3af;text-align:left;white-space:nowrap;border-bottom:1px solid #f0f2f5;}
.rpt-root th.sort{cursor:pointer;user-select:none;}
.rpt-root th.sort:hover{color:var(--orange);}
.rpt-root td{padding:13px 16px;font-size:13px;color:#374151;border-bottom:1px solid #f7f8fa;vertical-align:top;}
.rpt-root tr:last-child td{border-bottom:none;}
.rpt-root tr:hover td{background:#fdfefe;}
.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:70px 20px;}
.empty-icon-wrap{width:70px;height:70px;border-radius:50%;background:var(--orange-light);display:flex;align-items:center;justify-content:center;margin-bottom:18px;}
.empty-icon-wrap svg{color:var(--orange);}
.empty-title{font-size:15px;font-weight:700;color:#374151;margin-bottom:6px;}
.empty-sub{font-size:13px;color:#9ca3af;}
.showing-row{display:flex;align-items:center;gap:10px;margin-bottom:14px;font-size:13px;color:#555;}
.showing-row b{color:#1a1a2e;}
.refresh-link{color:var(--orange);font-weight:600;cursor:pointer;}
.subtabs{display:flex;gap:6px;margin-bottom:16px;}
.stab{padding:7px 18px;font-size:13px;font-weight:600;color:#7a8fa6;cursor:pointer;border-radius:7px;transition:all .15s;}
.stab:hover{background:var(--orange-light);color:var(--orange);}
.stab.active{background:var(--orange-light);color:var(--orange);font-weight:700;}
.badge{display:inline-block;padding:3px 11px;border-radius:20px;font-size:12px;font-weight:700;}
.badge.success{background:#e8faf2;color:#1a7a4a;}
.badge.pending{background:#fff3e0;color:#c27a10;}
.badge.failed{background:#fdecea;color:#c0392b;}
.prop-name{font-weight:700;color:#1a1a2e;}
.prop-addr{font-size:12px;color:#8a94a6;margin-top:2px;}
.act-btn{border:1.5px solid var(--orange);color:var(--orange);background:#fff;border-radius:6px;padding:5px 12px;font-size:12px;font-weight:600;cursor:pointer;margin-left:4px;transition:background .15s;}
.act-btn:hover{background:var(--orange-light);}
.pl-summary{display:grid;grid-template-columns:1fr 1fr 1fr 2.1fr;gap:14px;margin-bottom:22px;}
.pl-card{border-radius:12px;padding:16px 14px 18px;text-align:center;background:#fff;border:1.5px solid #f0f2f5;}
.pl-card-icon{width:34px;height:34px;border-radius:9px;margin:0 auto 10px;display:flex;align-items:center;justify-content:center;}
.pl-card-icon.orange-bg{background:var(--orange);}
.pl-card-icon.amber-bg{background:#f59e0b;}
.pl-card-icon.blue-bg{background:#3b82f6;}
.pl-card-icon svg{color:#fff;}
.pl-card-lbl{font-size:11px;font-weight:700;letter-spacing:.6px;color:#9ca3af;margin-bottom:5px;}
.pl-card-val{font-size:21px;font-weight:800;}
.pl-card-val.neg{color:#ef4444;}
.pl-card-val.pos{color:#1a1a2e;}
.ov-card{border:1.5px solid #f0f2f5;border-radius:12px;padding:14px 16px;background:#fff;}
.ov-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.ov-top h3{font-size:11px;font-weight:800;letter-spacing:.5px;color:#9ca3af;}
.mini-dd{position:relative;}
.mini-btn{display:inline-flex;align-items:center;gap:6px;border:1.5px solid #e2e5ea;border-radius:7px;padding:5px 10px;font-size:12px;font-weight:600;color:#374151;cursor:pointer;background:#fff;user-select:none;}
.mini-btn .chev{transition:transform .2s;}
.mini-dd.open .mini-btn .chev{transform:rotate(180deg);}
.mini-menu{display:none;position:absolute;top:calc(100% + 4px);right:0;background:#fff;border:1.5px solid #e2e5ea;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.10);min-width:190px;z-index:200;overflow:hidden;}
.mini-dd.open .mini-menu{display:block;}
.mini-item{padding:9px 14px;font-size:13px;cursor:pointer;color:#374151;}
.mini-item:hover{background:var(--orange-light);color:var(--orange);}
.mini-sep{height:1px;background:#f0f1f3;}
.cmp-row{display:grid;grid-template-columns:62px 10px 40px 1fr 70px;align-items:center;gap:8px;margin-bottom:10px;}
.cmp-row:last-child{margin-bottom:0;}
.dot{width:9px;height:9px;border-radius:50%;}
.dot.cur{background:var(--orange);}
.dot.pri{background:#c8cdd5;}
.yr-lbl{font-size:12px;font-weight:700;}
.bar-track{height:10px;background:#f0f2f5;border-radius:6px;overflow:hidden;}
.bar-fill{height:100%;border-radius:6px;transition:width .6s;}
.bar-fill.cur{background:var(--orange);}
.bar-fill.pri{background:#d1d5db;}
.bar-val{font-size:12px;color:#9ca3af;text-align:right;}
.pl-sec{background:#fff;border:1.5px solid #f0f2f5;border-radius:12px;margin-bottom:14px;overflow:hidden;}
.pl-sec-hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid #f7f8fa;background:#fafbfc;}
.pl-sec-title{font-size:12px;font-weight:800;letter-spacing:.5px;color:#374151;}
.add-row-btn{display:inline-flex;align-items:center;gap:5px;background:none;border:1.5px solid #e2e5ea;border-radius:7px;padding:5px 11px;font-size:12px;font-weight:700;color:#7a8fa6;cursor:pointer;transition:all .15s;}
.add-row-btn:hover{border-color:var(--orange);color:var(--orange);}
.pl-row{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:8px;padding:9px 18px;border-bottom:1px solid #f7f8fa;}
.pl-row:last-child{border-bottom:none;}
.pl-name{border:none;background:transparent;outline:none;font-size:13px;color:#374151;width:100%;font-family:inherit;}
.pl-name::placeholder{color:#c0c4cc;}
.pl-amt{border:1.5px solid transparent;border-radius:7px;padding:4px 8px;font-size:13px;font-weight:500;color:#1a1a2e;text-align:right;width:130px;font-family:inherit;outline:none;transition:border-color .15s;}
.pl-amt:focus{border-color:var(--orange);background:#fffaf8;}
.pl-amt.neg{color:#ef4444;}
.del-btn{background:none;border:none;cursor:pointer;color:#d1d5db;padding:3px;border-radius:4px;display:flex;align-items:center;transition:color .15s;}
.del-btn:hover{color:#ef4444;}
.pl-total-row{display:flex;justify-content:flex-end;padding:10px 18px;background:#fafbfc;border-top:1px solid #f0f2f5;}
.pl-total{font-size:14px;font-weight:800;min-width:130px;text-align:right;}
.pl-total.neg{color:#ef4444;}
.net-card{background:#fff;border:1.5px solid #f0f2f5;border-radius:12px;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;}
.net-lbl{font-size:14px;font-weight:800;}
.net-val{font-size:20px;font-weight:800;}
.net-val.neg{color:#ef4444;}
.net-val.pos{color:var(--orange);}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(60px);background:#1a1a2e;color:#fff;border-radius:9px;padding:9px 20px;font-size:13px;font-weight:600;opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;z-index:999;}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
.chat-fab{position:fixed;bottom:24px;right:24px;width:46px;height:46px;border-radius:50%;background:#6c5ce7;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.2);}
.chat-fab svg{color:#fff;}
.date-lbl{font-size:13px;font-weight:700;color:#8a94a6;letter-spacing:.3px;margin-bottom:20px;}
@media(max-width:900px){
  .pl-summary{grid-template-columns:1fr 1fr;}
  .filter-panel{min-width:calc(100vw - 48px);}
}
`;

/* ───────────────────────── Reusable bits ───────────────────────── */
function Icon({ name }) {
  const icons = {
    filter: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 4h18l-7 8.5V20l-4 2v-9.5z" />
      </svg>
    ),
    chev: (
      <svg className="chev" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M6 9l6 6 6-6" />
      </svg>
    ),
    x: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    ),
    download: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    plus: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
    trash: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
      </svg>
    ),
    inbox: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    clock: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    file: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    bell: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    chat: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    invoice: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="6" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <circle cx="17" cy="14" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    expense: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 8h14a3 3 0 0 1 3 3v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M3 8l4-4h7" />
      </svg>
    ),
    bank: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="12" cy="6" rx="8" ry="3" />
        <path d="M4 6v5c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
        <path d="M4 11v5c0 1.66 3.58 3 8 3s8-1.34 8-3v-5" />
      </svg>
    ),
  };
  return icons[name] || null;
}

/* ───────────────────────── Filter Pill component ───────────────────────── */
function FilterWrap({ id, openId, setOpenId, label, panelStyle, children, onApply, onClear }) {
  const ref = useRef(null);
  const open = openId === id;

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpenId((cur) => (cur === id ? null : cur));
      }
    }
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [id, setOpenId]);

  return (
    <div className={`filter-wrap${open ? " filter-open" : ""}`} ref={ref}>
      <div className="filter-pill" onClick={() => setOpenId(open ? null : id)}>
        <Icon name="filter" />
        {label}
        <Icon name="chev" />
      </div>
      <div className="filter-panel" style={panelStyle}>
        {children}
        <div className="fp-footer">
          <button
            className="clear-btn"
            onClick={() => {
              onClear && onClear();
            }}
          >
            <Icon name="x" /> Clear Filters
          </button>
          <button
            className="apply-btn"
            onClick={() => {
              setOpenId(null);
              onApply && onApply();
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Main component ───────────────────────── */
export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState("bank");
  const [openFilter, setOpenFilter] = useState(null);
  const [stab, setStab] = useState("Active Leases");
  const [leaseStatus, setLeaseStatus] = useState(["Active"]);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  // PL state
  const [plInc, setPlInc] = useState([
    { id: 1, name: "Rent", amt: 69500 },
    { id: 2, name: "Late Fee Charge", amt: 23600 },
    { id: 3, name: "Water", amt: 454 },
  ]);
  const [plExp, setPlExp] = useState([
    { id: 4, name: "Advertising", amt: 100 },
    { id: 5, name: "Appliance", amt: 200 },
  ]);
  const plIdRef = useRef(6);
  const [plPrior] = useState(0);
  const [plRange, setPlRange] = useState("year");
  const [plYear, setPlYear] = useState("2026");
  const [period, setPeriod] = useState({ label: "Same Period Last Year", year: "2025" });
  const [openMini, setOpenMini] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  /* ── PL calculations ── */
  const incTotal = plInc.reduce((s, r) => s + r.amt, 0);
  const expTotal = plExp.reduce((s, r) => s + r.amt, 0);
  const net = incTotal - expTotal;
  const maxBar = Math.max(Math.abs(net), Math.abs(plPrior), 1);

  const dateLabel = (() => {
    if (plRange === "year") return `JANUARY 1, ${plYear} – DECEMBER 31, ${plYear}`;
    if (plRange === "quarter") return `OCTOBER 1, ${plYear} – DECEMBER 31, ${plYear}`;
    return `DECEMBER 1, ${plYear} – DECEMBER 31, ${plYear}`;
  })();

  const addPlRow = (type) => {
    const row = { id: plIdRef.current++, name: "", amt: 0 };
    if (type === "income") setPlInc((r) => [...r, row]);
    else setPlExp((r) => [...r, row]);
  };
  const delPlRow = (type, id) => {
    if (type === "income") setPlInc((r) => r.filter((x) => x.id !== id));
    else setPlExp((r) => r.filter((x) => x.id !== id));
  };
  const updateName = (type, id, val) => {
    const setter = type === "income" ? setPlInc : setPlExp;
    setter((rows) => rows.map((r) => (r.id === id ? { ...r, name: val } : r)));
  };
  const updateAmt = (type, id, val) => {
    const setter = type === "income" ? setPlInc : setPlExp;
    setter((rows) => rows.map((r) => (r.id === id ? { ...r, amt: parseNum(val) } : r)));
  };

  /* ── Export ── */
  const csvCell = (value) => {
    const text = String(value ?? "").replace(/\r?\n|\r/g, " ").trim();
    return `"${text.replace(/"/g, '""')}"`;
  };
  const downloadCsv = (filename, rows) => {
    const csvStr = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const financeRows = () => {
    const rows = [["Section", "Name", "Amount"]];
    plInc.forEach((item) => rows.push(["Income", item.name || "Untitled", fmt(item.amt)]));
    rows.push(["Income Total", "", fmt(incTotal)]);
    plExp.forEach((item) => rows.push(["Expense", item.name || "Untitled", item.amt > 0 ? `(${fmt(item.amt)})` : "$0.00"]));
    rows.push(["Expense Total", "", expTotal > 0 ? `(${fmt(expTotal)})` : "($0.00)"]);
    rows.push(["Net Profit / Loss", "", fmtSigned(net)]);
    rows.push(["Date Range", "", dateLabel]);
    return rows;
  };

  const tableRefs = useRef({});
  const tableToRows = (panelId) => {
    const table = tableRefs.current[panelId];
    if (!table) return [];
    const headers = Array.from(table.querySelectorAll("thead th"))
      .map((th) => th.textContent.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    const bodyRows = Array.from(table.querySelectorAll("tbody tr"))
      .map((tr) => {
        const cells = Array.from(tr.children);
        if (cells.length === 1) {
          const emptyState = tr.querySelector(".empty-state");
          if (emptyState) return [emptyState.textContent.replace(/\s+/g, " ").trim()];
        }
        return cells.map((td) => td.textContent.replace(/\s+/g, " ").trim());
      })
      .filter((row) => row.length && row.some(Boolean));
    return headers.length ? [headers, ...bodyRows] : bodyRows;
  };

  const exportReport = (panelId) => {
    const fileMap = { bank: "deposits", rent: "rent", deposits: "deposits-held", pl: "finance", txn: "payments" };
    const rows = panelId === "pl" ? financeRows() : tableToRows(panelId);
    if (!rows.length) {
      showToast("Nothing to export");
      return;
    }
    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`${fileMap[panelId] || panelId}-${dateStamp}.csv`, rows);
    showToast("Export downloaded");
  };

  const meta = tabMeta[activeTab];

  /* ───────── render ───────── */
  return (
    <div className="rpt-root">
      <style>{css}</style>

      {/* HEADER */}
      <div className="top-header">
        <div className="header-icon">{meta.icon}</div>
        <div className="header-text">
          <h1>
            <span className="org">{meta.bold}</span>
            {meta.rest}
          </h1>
          <p>{meta.sub}</p>
        </div>
        <div className="header-right">
          <div className="notif-btn">
            <Icon name="bell" />
          </div>
          <div className="user-pill">
            <div className="user-avatar">AR</div>
            <Icon name="chev" />
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabbar-wrap">
        <div className="tabbar">
          {Object.keys(tabMeta).map((key) => (
            <div
              key={key}
              className={`tab${activeTab === key ? " active" : ""}`}
              onClick={() => {
                setActiveTab(key);
                setOpenFilter(null);
              }}
            >
              {tabMeta[key].bold}
              {tabMeta[key].rest}
            </div>
          ))}
        </div>
      </div>

      <div className="page">
        {/* ══ BANK DEPOSITS ══ */}
        {activeTab === "bank" && (
          <div>
            <div className="toolbar">
              <FilterWrap
                id="bank"
                openId={openFilter}
                setOpenId={setOpenFilter}
                label="Filter..."
                onApply={() => showToast("Filters applied")}
                onClear={() => showToast("Filters cleared")}
              >
                <div className="fp-grid">
                  <div className="fp-full">
                    <div className="fp-lbl">Property</div>
                    <select className="fp-sel" defaultValue="">
                      <option value="">Select</option>
                      <option>Sunrise Apartments</option>
                      <option>Maple Street</option>
                      <option>Green Valley</option>
                    </select>
                  </div>
                  <div>
                    <div className="fp-lbl">Tenant Name</div>
                    <select className="fp-sel" defaultValue="">
                      <option value="">Select</option>
                      <option>CB Tiwari</option>
                      <option>Priyanka V.</option>
                    </select>
                  </div>
                  <div>
                    <div className="fp-lbl">Invoice #</div>
                    <input className="fp-input" type="text" placeholder="Invoice Id" />
                  </div>
                  <div>
                    <div className="fp-lbl">Bank Account</div>
                    <select className="fp-sel" defaultValue="">
                      <option value="">Select</option>
                      <option>Chase ••4521</option>
                      <option>Wells Fargo ••8832</option>
                    </select>
                  </div>
                  <div>
                    <div className="fp-lbl">Invoice Type</div>
                    <select className="fp-sel" defaultValue="">
                      <option value="">Select</option>
                      <option>Rent</option>
                      <option>Deposit</option>
                      <option>Late Fee</option>
                    </select>
                  </div>
                  <div className="fp-full">
                    <div className="fp-3col">
                      <div>
                        <div className="fp-lbl">Date Range</div>
                        <select className="fp-sel" defaultValue="Month">
                          <option>Month</option>
                          <option>Quarter</option>
                          <option>Year</option>
                        </select>
                      </div>
                      <div>
                        <div className="fp-lbl">Select Month</div>
                        <select className="fp-sel" defaultValue="June">
                          {["Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                            (m) => (
                              <option key={m}>{m}</option>
                            )
                          )}
                        </select>
                      </div>
                      <div>
                        <div className="fp-lbl">Select Year</div>
                        <select className="fp-sel" defaultValue="2026">
                          <option>2026</option>
                          <option>2025</option>
                          <option>2024</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="fp-full">
                    <div className="fp-chk-row">
                      <input type="checkbox" id="cb1" defaultChecked />
                      <label htmlFor="cb1">Include Unmapped transactions</label>
                    </div>
                    <div className="fp-chk-row">
                      <input type="checkbox" id="cb2" />
                      <label htmlFor="cb2">Include Offline Payments Only</label>
                    </div>
                  </div>
                </div>
              </FilterWrap>
              <button className="export-btn" onClick={() => exportReport("bank")}>
                <Icon name="download" /> Export
              </button>
            </div>

            <div className="bd-layout">
              <div className="bd-table-wrap">
                <div className="content-card">
                  <div className="tbl-wrap">
                    <table ref={(el) => (tableRefs.current.bank = el)}>
                      <thead>
                        <tr>
                          <th>Account Name</th>
                          <th>Account Number</th>
                          <th>Date of Deposit</th>
                          <th>Collected</th>
                          <th>Transaction Fee</th>
                          <th>Deposited</th>
                          <th>Reconciled</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={7}>
                            <div className="empty-state">
                              <div className="empty-icon-wrap">
                                <Icon name="inbox" />
                              </div>
                              <div className="empty-title">No Records Found</div>
                              <div className="empty-sub">Try adjusting your filters or check back later.</div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="bd-side">
                <div className="bd-card orange-card">
                  <div className="bd-card-icon">
                    <Icon name="clock" />
                  </div>
                  <div className="bd-card-amt">$0.00</div>
                  <div className="bd-card-lbl">PROCESSING</div>
                </div>
                <div className="bd-card green-card">
                  <div className="bd-card-icon">
                    <Icon name="file" />
                  </div>
                  <div className="bd-card-amt">$0.00</div>
                  <div className="bd-card-lbl">TOTAL DEPOSITED</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ RENT ══ */}
        {activeTab === "rent" && (
          <div>
            <div className="toolbar">
              <FilterWrap
                id="rent"
                openId={openFilter}
                setOpenId={setOpenFilter}
                label={
                  <span>
                    Filter... <b style={{ color: "#1a1a2e" }}>Term Status: {leaseStatus.join(", ") || "None"} ;</b>
                  </span>
                }
                panelStyle={{ minWidth: 360 }}
                onApply={() => showToast("Filters applied")}
                onClear={() => showToast("Filters cleared")}
              >
                <div className="fp-grid" style={{ gridTemplateColumns: "1fr" }}>
                  <div>
                    <div className="fp-lbl">Property</div>
                    <select className="fp-sel" defaultValue="">
                      <option value="">Select</option>
                      <option>Villa Rock Graden</option>
                      <option>Rental House</option>
                      <option>Ashiyana</option>
                    </select>
                  </div>
                  <div>
                    <div className="fp-lbl">Bank Account</div>
                    <select className="fp-sel" defaultValue="">
                      <option value="">Select</option>
                      <option>Chase ••4521</option>
                      <option>Wells Fargo ••8832</option>
                    </select>
                  </div>
                  <div>
                    <div className="fp-lbl">Lease Status</div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 2 }}>
                      {["Active", "Future", "Past"].map((s) => (
                        <label
                          key={s}
                          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#5a7a9a", cursor: "pointer" }}
                        >
                          <input
                            type="checkbox"
                            checked={leaseStatus.includes(s)}
                            onChange={(e) => {
                              setLeaseStatus((prev) =>
                                e.target.checked ? [...prev, s] : prev.filter((x) => x !== s)
                              );
                            }}
                            style={{ accentColor: "var(--orange)" }}
                          />
                          {s}
                        </label>
                      ))}
                    </div>
                    <div className="fp-chk-row" style={{ marginTop: 10 }}>
                      <input type="checkbox" id="rr-arch" />
                      <label htmlFor="rr-arch">View Archived Leases Only</label>
                    </div>
                  </div>
                  <div>
                    <div className="fp-lbl">Property Unit Type</div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 2 }}>
                      {["Employee", "Down", "Model"].map((s) => (
                        <label
                          key={s}
                          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#5a7a9a", cursor: "pointer" }}
                        >
                          <input type="checkbox" style={{ accentColor: "var(--orange)" }} />
                          {s}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </FilterWrap>
              <button className="export-btn" onClick={() => exportReport("rent")}>
                <Icon name="download" /> Export
              </button>
            </div>

            <div className="subtabs">
              {["Active Leases", "Future Leases", "Past Leases", "All"].map((s) => (
                <div key={s} className={`stab${stab === s ? " active" : ""}`} onClick={() => setStab(s)}>
                  {s}
                </div>
              ))}
            </div>

            <div className="content-card">
              <div className="tbl-wrap">
                <table ref={(el) => (tableRefs.current.rent = el)}>
                  <thead>
                    <tr>
                      <th>Property Details</th>
                      <th>Unit</th>
                      <th className="sort">Lease Start ⇅</th>
                      <th className="sort">Lease End ⇅</th>
                      <th>Tenants</th>
                      <th className="sort">
                        Rent ⇅
                        <br />
                        <small style={{ fontWeight: 400, color: "#bbb" }}>(Total - $14,000)</small>
                      </th>
                      <th className="sort">
                        Other Recurring ⇅
                        <br />
                        <small style={{ fontWeight: 400, color: "#bbb" }}>(Total - $0.00)</small>
                      </th>
                      <th className="sort">
                        Total Due ⇅
                        <br />
                        <small style={{ fontWeight: 400, color: "#bbb" }}>(Total - $240,254)</small>
                      </th>
                      <th className="sort">
                        Deposit ⇅
                        <br />
                        <small style={{ fontWeight: 400, color: "#bbb" }}>(Total - $4,600)</small>
                      </th>
                      <th className="sort">
                        Balance Owed ⇅
                        <br />
                        <small style={{ fontWeight: 400, color: "#bbb" }}>(Total - $178,300)</small>
                      </th>
                      <th className="sort">
                        Total Credits ⇅
                        <br />
                        <small style={{ fontWeight: 400, color: "#bbb" }}>(Total - $0.00)</small>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        name: "Villa Rock Graden",
                        addr: "15 Emerson Ave, Mayville, New York 14757",
                        unit: "unit 405",
                        start: "Nov 1, 2025",
                        end: "Jan 31, 2027",
                        tenants: "CB Tiwari ...",
                        rent: "$5,000.00",
                        other: "$0.00",
                        total: "$91,500.00",
                        deposit: "$600.00",
                        balance: "$50,000.00",
                        credits: "$0.00",
                      },
                      {
                        name: "Rental House",
                        addr: "Pinkham Road, Bristol, Maine 04554",
                        unit: "Tower A",
                        start: "Dec 3, 2025",
                        end: "Nov 11, 2026",
                        tenants: "Priyanka V...",
                        rent: "$4,000.00",
                        other: "$0.00",
                        total: "$60,054.00",
                        deposit: "$0.00",
                        balance: "$39,600.00",
                        credits: "$0.00",
                      },
                      {
                        name: "Ashiyana",
                        addr: "Carolina Ave NW, Winston-Salem, NC 27101",
                        unit: "Ashiyana Suits",
                        start: "Oct 25, 2025",
                        end: "Jan 29, 2027",
                        tenants: "Niketan C...",
                        rent: "$5,000.00",
                        other: "$0.00",
                        total: "$88,700.00",
                        deposit: "$4,000.00",
                        balance: "$88,700.00",
                        credits: "$0.00",
                      },
                    ].map((r) => (
                      <tr key={r.name}>
                        <td>
                          <div className="prop-name">{r.name}</div>
                          <div className="prop-addr">{r.addr}</div>
                        </td>
                        <td>{r.unit}</td>
                        <td>{r.start}</td>
                        <td>{r.end}</td>
                        <td>{r.tenants}</td>
                        <td>{r.rent}</td>
                        <td>{r.other}</td>
                        <td>{r.total}</td>
                        <td>{r.deposit}</td>
                        <td>{r.balance}</td>
                        <td>{r.credits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ DEPOSITS HELD ══ */}
        {activeTab === "deposits" && (
          <div>
            <div className="toolbar">
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <FilterWrap
                  id="deposits"
                  openId={openFilter}
                  setOpenId={setOpenFilter}
                  label="Filter..."
                  panelStyle={{ minWidth: 460 }}
                  onApply={() => showToast("Filters applied")}
                  onClear={() => showToast("Filters cleared")}
                >
                  <div className="fp-grid">
                    <div className="fp-full">
                      <div className="fp-lbl">Invoice</div>
                      <input className="fp-input" type="text" placeholder="Enter ID" />
                    </div>
                    <div>
                      <div className="fp-lbl">Property</div>
                      <select className="fp-sel" defaultValue="">
                        <option value="">Select</option>
                        <option>5E</option>
                        <option>Ashiyana</option>
                      </select>
                    </div>
                    <div>
                      <div className="fp-lbl">Unit</div>
                      <select className="fp-sel" defaultValue="">
                        <option value="">Select</option>
                        <option>5E-212</option>
                        <option>Ashiyana Suits</option>
                      </select>
                    </div>
                    <div>
                      <div className="fp-lbl">From</div>
                      <input className="fp-input" type="date" />
                    </div>
                    <div>
                      <div className="fp-lbl">To</div>
                      <input className="fp-input" type="date" />
                    </div>
                    <div className="fp-full">
                      <div className="fp-lbl">Payment Method</div>
                      <select className="fp-sel" defaultValue="">
                        <option value="">Select</option>
                        <option>Cash</option>
                        <option>Bank Transfer</option>
                        <option>Cheque</option>
                      </select>
                    </div>
                  </div>
                </FilterWrap>
                <span className="showing-row">
                  Showing <b>2 of 2</b>
                </span>
              </div>
              <button className="export-btn" onClick={() => exportReport("deposits")}>
                <Icon name="download" /> Export
              </button>
            </div>

            <div className="showing-row">
              (This data is 5 minutes old){" "}
              <span className="refresh-link" onClick={() => showToast("Refreshed!")}>
                Refresh Now
              </span>
            </div>

            <div className="content-card">
              <div className="tbl-wrap">
                <table ref={(el) => (tableRefs.current.deposits = el)}>
                  <thead>
                    <tr>
                      <th className="sort">ID ▼</th>
                      <th className="sort">Due On ⇅</th>
                      <th className="sort">Property ⇅</th>
                      <th className="sort">Property Unit ⇅</th>
                      <th className="sort">Amount ⇅</th>
                      <th className="sort">Lease End Date ⇅</th>
                      <th className="sort">Tenant Name ⇅</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        id: "∨ 11435509",
                        due: "Oct 28, 2025",
                        prop: "5E",
                        unit: "5E-212",
                        amt: "$2,000.00",
                        end: "M to M",
                        tenant: "Jai Kishan",
                      },
                      {
                        id: "∨ 11416270",
                        due: "Oct 31, 2025",
                        prop: "Ashiyana",
                        unit: "Ashiyana Suits",
                        amt: "$4,000.00",
                        end: "Jan 29, 2027",
                        tenant: "Jai Kishan + 1",
                      },
                    ].map((r) => (
                      <tr key={r.id}>
                        <td>{r.id}</td>
                        <td>{r.due}</td>
                        <td>{r.prop}</td>
                        <td>{r.unit}</td>
                        <td>{r.amt}</td>
                        <td>{r.end}</td>
                        <td>{r.tenant}</td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <button className="act-btn">View</button>
                          <button className="act-btn">Return</button>
                          <button className="act-btn">Apply</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ FINANCE (P/L) ══ */}
        {activeTab === "pl" && (
          <div>
            <div className="toolbar">
              <FilterWrap
                id="pl"
                openId={openFilter}
                setOpenId={setOpenFilter}
                label="Filter"
                panelStyle={{ minWidth: 540 }}
                onApply={() => showToast("Filters applied")}
                onClear={() => showToast("Filters cleared")}
              >
                <div className="fp-grid">
                  <div>
                    <div className="fp-lbl">Property</div>
                    <select className="fp-sel" defaultValue="">
                      <option value="">Select</option>
                      <option>Sunrise Apartments</option>
                      <option>Maple Street</option>
                    </select>
                  </div>
                  <div>
                    <div className="fp-lbl">Unit</div>
                    <select className="fp-sel" defaultValue="">
                      <option value="">Select</option>
                      <option>Unit 101</option>
                      <option>Unit 201</option>
                    </select>
                  </div>
                  <div className="fp-full">
                    <div className="fp-lbl">Taxable Entity</div>
                    <select className="fp-sel" style={{ backgroundColor: "#fafbfc" }} defaultValue="All">
                      <option>All</option>
                      <option>Entity A</option>
                      <option>Entity B</option>
                    </select>
                  </div>
                  <div className="fp-full">
                    <div className="fp-lbl">Bank Account</div>
                    <select className="fp-sel" style={{ backgroundColor: "#fafbfc" }} defaultValue="All">
                      <option>All</option>
                      <option>Chase ••4521</option>
                      <option>Wells Fargo ••8832</option>
                    </select>
                  </div>
                  <div className="fp-full">
                    <div className="fp-2col">
                      <div>
                        <div className="fp-lbl">Date Range</div>
                        <select className="fp-sel" value={plRange} onChange={(e) => setPlRange(e.target.value)}>
                          <option value="year">Year</option>
                          <option value="quarter">Quarter</option>
                          <option value="month">Month</option>
                        </select>
                      </div>
                      <div>
                        <div className="fp-lbl blue">Select Year</div>
                        <select className="fp-sel" value={plYear} onChange={(e) => setPlYear(e.target.value)}>
                          <option>2026</option>
                          <option>2025</option>
                          <option>2024</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </FilterWrap>
              <button className="export-btn" onClick={() => exportReport("pl")}>
                <Icon name="download" /> Export
              </button>
            </div>

            <div className="date-lbl">{dateLabel}</div>

            <div className="pl-summary">
              <div className="pl-card">
                <div className="pl-card-icon orange-bg">
                  <Icon name="invoice" />
                </div>
                <div className="pl-card-lbl">INCOME</div>
                <div className={`pl-card-val ${incTotal < 0 ? "neg" : "pos"}`}>{fmtSigned(incTotal)}</div>
              </div>
              <div className="pl-card">
                <div className="pl-card-icon amber-bg">
                  <Icon name="expense" />
                </div>
                <div className="pl-card-lbl">EXPENSES</div>
                <div className={`pl-card-val ${expTotal > 0 ? "neg" : ""}`}>{expTotal > 0 ? `(${fmt(expTotal)})` : "$0.00"}</div>
              </div>
              <div className="pl-card">
                <div className="pl-card-icon blue-bg">
                  <Icon name="bank" />
                </div>
                <div className="pl-card-lbl">NET PROFIT/LOSS</div>
                <div className={`pl-card-val ${net < 0 ? "neg" : "pos"}`}>{fmtSigned(net)}</div>
              </div>
              <div className="ov-card">
                <div className="ov-top">
                  <h3>OVERVIEW</h3>
                  <div className={`mini-dd${openMini ? " open" : ""}`}>
                    <div
                      className="mini-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMini((o) => !o);
                      }}
                    >
                      <span>{period.label}</span>
                      <Icon name="chev" />
                    </div>
                    <div className="mini-menu">
                      {[
                        ["Same Period Last Year", "2025"],
                        ["Previous Quarter", "Q3 2025"],
                        ["Previous Month", "Dec 2025"],
                      ].map(([lbl, yr]) => (
                        <div
                          key={lbl}
                          className="mini-item"
                          onClick={() => {
                            setPeriod({ label: lbl, year: yr });
                            setOpenMini(false);
                          }}
                        >
                          {lbl}
                        </div>
                      ))}
                      <div className="mini-sep" />
                      <div
                        className="mini-item"
                        onClick={() => {
                          setPeriod({ label: "No Comparison", year: "—" });
                          setOpenMini(false);
                        }}
                      >
                        No Comparison
                      </div>
                    </div>
                  </div>
                </div>
                <div className="cmp-row">
                  <span className="bar-val" style={{ textAlign: "right" }}>
                    {fmtSigned(net)}
                  </span>
                  <span className="dot cur"></span>
                  <span className="yr-lbl">{plYear}</span>
                  <div className="bar-track">
                    <div className="bar-fill cur" style={{ width: `${(Math.abs(net) / maxBar) * 100}%` }}></div>
                  </div>
                  <span className="bar-val">{fmtSigned(net)}</span>
                </div>
                <div className="cmp-row">
                  <span className="bar-val" style={{ textAlign: "right" }}>
                    {fmtSigned(plPrior)}
                  </span>
                  <span className="dot pri"></span>
                  <span className="yr-lbl">{period.year}</span>
                  <div className="bar-track">
                    <div className="bar-fill pri" style={{ width: `${(Math.abs(plPrior) / maxBar) * 100}%` }}></div>
                  </div>
                  <span className="bar-val">{fmtSigned(plPrior)}</span>
                </div>
              </div>
            </div>

            <div className="pl-sec">
              <div className="pl-sec-hdr">
                <span className="pl-sec-title">INCOME</span>
                <button className="add-row-btn" onClick={() => addPlRow("income")}>
                  <Icon name="plus" /> Add Income
                </button>
              </div>
              <div>
                {plInc.map((r) => (
                  <div className="pl-row" key={r.id}>
                    <input
                      className="pl-name"
                      type="text"
                      placeholder="Enter description…"
                      value={r.name}
                      onChange={(e) => updateName("income", r.id, e.target.value)}
                    />
                    <input
                      className="pl-amt"
                      type="text"
                      placeholder="$0.00"
                      value={r.amt ? fmt(r.amt) : ""}
                      onChange={(e) => updateAmt("income", r.id, e.target.value)}
                    />
                    <button className="del-btn" onClick={() => delPlRow("income", r.id)}>
                      <Icon name="trash" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="pl-total-row">
                <span className="pl-total">{fmt(incTotal)}</span>
              </div>
            </div>

            <div className="pl-sec">
              <div className="pl-sec-hdr">
                <span className="pl-sec-title">EXPENSES</span>
                <button className="add-row-btn" onClick={() => addPlRow("expense")}>
                  <Icon name="plus" /> Add Expense
                </button>
              </div>
              <div>
                {plExp.map((r) => (
                  <div className="pl-row" key={r.id}>
                    <input
                      className="pl-name"
                      type="text"
                      placeholder="Enter description…"
                      value={r.name}
                      onChange={(e) => updateName("expense", r.id, e.target.value)}
                    />
                    <input
                      className="pl-amt neg"
                      type="text"
                      placeholder="$0.00"
                      value={r.amt ? `(${fmt(r.amt)})` : ""}
                      onChange={(e) => updateAmt("expense", r.id, e.target.value)}
                    />
                    <button className="del-btn" onClick={() => delPlRow("expense", r.id)}>
                      <Icon name="trash" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="pl-total-row">
                <span className="pl-total neg">{expTotal > 0 ? `(${fmt(expTotal)})` : "($0.00)"}</span>
              </div>
            </div>

            <div className="net-card">
              <span className="net-lbl">NET PROFIT / LOSS</span>
              <span className={`net-val ${net < 0 ? "neg" : "pos"}`}>{fmtSigned(net)}</span>
            </div>
          </div>
        )}

        {/* ══ PAYMENTS ══ */}
        {activeTab === "txn" && (
          <div>
            <div className="toolbar">
              <FilterWrap
                id="txn"
                openId={openFilter}
                setOpenId={setOpenFilter}
                label="Filters"
                panelStyle={{ minWidth: 500 }}
                onApply={() => showToast("Filters applied")}
                onClear={() => showToast("Filters cleared")}
              >
                <div className="fp-grid">
                  <div>
                    <div className="fp-lbl">Property</div>
                    <select className="fp-sel" defaultValue="">
                      <option value="">Select</option>
                      <option>Villa Rock Graden</option>
                      <option>Rental House</option>
                      <option>Ashiyana</option>
                    </select>
                  </div>
                  <div>
                    <div className="fp-lbl">Unit</div>
                    <select className="fp-sel" defaultValue="">
                      <option value="">Select</option>
                      <option>unit 405</option>
                      <option>Tower A</option>
                      <option>Ashiyana Suits</option>
                    </select>
                  </div>
                  <div>
                    <div className="fp-lbl">Tenant</div>
                    <select className="fp-sel" defaultValue="">
                      <option value="">Select</option>
                      <option>CB Tiwari</option>
                      <option>Social Code</option>
                    </select>
                  </div>
                  <div>
                    <div className="fp-lbl">Payment Status</div>
                    <select className="fp-sel" defaultValue="">
                      <option value="">All</option>
                      <option>Success</option>
                      <option>Pending</option>
                      <option>Failed</option>
                    </select>
                  </div>
                  <div>
                    <div className="fp-lbl">Payment Mode</div>
                    <select className="fp-sel" defaultValue="">
                      <option value="">All</option>
                      <option>Cash</option>
                      <option>Bank Transfer</option>
                      <option>Cheque</option>
                    </select>
                  </div>
                  <div>
                    <div className="fp-lbl">Date Range</div>
                    <select className="fp-sel" defaultValue="Month">
                      <option>Month</option>
                      <option>Quarter</option>
                      <option>Year</option>
                    </select>
                  </div>
                </div>
              </FilterWrap>
              <button className="export-btn" onClick={() => exportReport("txn")}>
                <Icon name="download" /> Export Report
              </button>
            </div>

            <div className="showing-row">
              Showing <b>30 of 24</b>
            </div>

            <div className="content-card">
              <div className="tbl-wrap">
                <table ref={(el) => (tableRefs.current.txn = el)}>
                  <thead>
                    <tr>
                      <th className="sort">Property/Unit ⇅</th>
                      <th className="sort">Invoice ID ⇅</th>
                      <th className="sort">Tenant ⇅</th>
                      <th className="sort">Payment Date ⇅</th>
                      <th className="sort">Payment Status ⇅</th>
                      <th className="sort">Due Date ⇅</th>
                      <th className="sort">Transaction Amount ⇅</th>
                      <th className="sort">Initial Invoice Amount ⇅</th>
                      <th className="sort">Amount Deposited ⇅</th>
                      <th className="sort">Remaining due after payment ⇅</th>
                      <th className="sort">Payment Mode ⇅</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["12774141", "CB Tiwari", "Jun 20, 2026", "Mar 05, 2026", "$1,000.00", "$5,000.00", "$1,000.00", "$3,500.00"],
                      ["12774150", "Social Code...", "Jun 15, 2026", "Dec 05, 2026", "$5,000.00", "$5,000.00", "$5,000.00", "$0.00"],
                      ["12774146", "Social Code...", "Jun 15, 2026", "Aug 05, 2026", "$5,000.00", "$5,000.00", "$5,000.00", "$0.00"],
                      ["12774148", "Social Code...", "Jun 15, 2026", "Oct 05, 2026", "$5,000.00", "$5,000.00", "$5,000.00", "$0.00"],
                      ["12774149", "Social Code...", "Jun 15, 2026", "Nov 05, 2026", "$5,000.00", "$5,000.00", "$5,000.00", "$0.00"],
                      ["12774144", "Social Code...", "Jun 15, 2026", "Jun 05, 2026", "$5,000.00", "$5,000.00", "$5,000.00", "$0.00"],
                      ["12774145", "Social Code...", "Jun 15, 2026", "Jul 05, 2026", "$5,000.00", "$5,000.00", "$5,000.00", "$0.00"],
                      ["12774143", "Social Code...", "Jun 15, 2026", "May 05, 2026", "$1,000.00", "$5,000.00", "$1,000.00", "$0.00"],
                      ["12774142", "Social Code...", "Jun 15, 2026", "Sep 05, 2026", "$5,000.00", "$5,000.00", "$5,000.00", "$0.00"],
                    ].map((row) => (
                      <tr key={row[0]}>
                        <td>
                          <div className="prop-name">Villa Rock...</div>
                          <div className="prop-addr">unit 405</div>
                        </td>
                        <td>{row[0]}</td>
                        <td>{row[1]}</td>
                        <td>{row[2]}</td>
                        <td>
                          <span className="badge success">Success</span>
                        </td>
                        <td>{row[3]}</td>
                        <td>{row[4]}</td>
                        <td>{row[5]}</td>
                        <td>{row[6]}</td>
                        <td>{row[7]}</td>
                        <td>Cash</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="chat-fab">
        <Icon name="chat" />
      </div>
      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </div>
  );
}

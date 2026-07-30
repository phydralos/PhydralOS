import styled, { keyframes } from "styled-components";

/* ── Keyframes ── */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const pulseGlow = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(96, 205, 255, 0.5); }
  70%  { box-shadow: 0 0 0 8px rgba(96, 205, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(96, 205, 255, 0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
`;

const heroSlide = keyframes`
  from { opacity: 0; transform: scale(1.04); }
  to   { opacity: 1; transform: scale(1); }
`;

/* ── Design Tokens ── */
// Surface palette (inspired by Windows 11 + Mica dark)
const T = {
  accentBlue: "#60cdff",
  accentBlueDark: "#0078d4",
  accentBlueSoft: "rgba(96, 205, 255, 0.12)",
  bg: "#202020",
  bgCard: "rgba(255, 255, 255, 0.04)",
  bgCardHover: "rgba(255, 255, 255, 0.08)",
  bgModal: "rgba(40, 40, 40, 0.96)",
  bgOverlay: "rgba(0, 0, 0, 0.55)",
  bgSidebar: "rgba(32, 32, 32, 0.92)",
  bgSurface: "#282828",
  border: "rgba(255, 255, 255, 0.06)",
  borderHover: "rgba(255, 255, 255, 0.14)",
  borderSubtle: "rgba(255, 255, 255, 0.04)",
  fontFamily: "'Montserrat', 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif",
  gold: "#fbbf24",
  green: "#4ade80",
  muted: "#9ca3af",
  mutedLight: "#b0b0c4",
  radius: "12px",
  radiusLg: "16px",
  radiusSm: "8px",
  radiusXl: "20px",
  red: "#f87171",
  redSoft: "rgba(248, 113, 113, 0.12)",
  text: "#f9fafb",
  textSecondary: "#a1a1aa",
  white08: "rgba(255, 255, 255, 0.08)",
};

const StyledAppStore = styled.div`
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

  background: ${T.bg};
  color: ${T.text};
  display: flex;
  flex-direction: column;
  font-family: ${T.fontFamily};
  font-size: 13px;
  height: 100%;
  letter-spacing: 0.01em;
  overflow: hidden;
  position: relative;
  user-select: none;

  *, *::before, *::after { box-sizing: border-box; }

  /* ═══════════════════════════════════════════
     TOP HEADER BAR
     ═══════════════════════════════════════════ */
  .ms-header {
    align-items: center;
    background: rgba(32, 32, 32, 0.85);
    backdrop-filter: saturate(180%) blur(20px);
    border-bottom: 1px solid ${T.border};
    display: flex;
    flex-shrink: 0;
    gap: 16px;
    height: 50px;
    padding: 0 20px;
    z-index: 20;

    .header-left {
      align-items: center;
      display: flex;
      flex-shrink: 0;

      .ms-logo {
        align-items: center;
        display: flex;
        gap: 10px;

        img {
          height: 18px;
          width: 18px;
        }

        .title {
          color: ${T.text};
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.3px;
          white-space: nowrap;
        }
      }
    }

    .header-center {
      display: flex;
      flex: 1;
      justify-content: center;
      max-width: 520px;
      min-width: 0;

      @media (max-width: 550px) {
        max-width: 100%;
      }

      .search-box {
        align-items: center;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid ${T.border};
        border-radius: 24px;
        display: flex;
        padding: 0 16px;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        width: 100%;

        &:focus-within {
          background: rgba(255, 255, 255, 0.1);
          border-color: ${T.accentBlue};
          box-shadow: 0 0 0 2px rgba(96, 205, 255, 0.2);
        }

        .search-icon {
          color: ${T.muted};
          display: flex;
          flex-shrink: 0;
        }

        input {
          background: transparent;
          border: none;
          color: ${T.text};
          flex: 1;
          font-family: ${T.fontFamily};
          font-size: 12.5px;
          outline: none;
          padding: 7px 8px;

          &::placeholder { color: ${T.muted}; }
        }
      }
    }

    .header-right {
      align-items: center;
      display: flex;
      flex-shrink: 0;
      gap: 10px;

      .topup-btn {
        background: linear-gradient(135deg, ${T.accentBlue} 0%, ${T.accentBlueDark} 100%);
        border: none;
        border-radius: 20px;
        color: #000;
        cursor: pointer;
        font-family: ${T.fontFamily};
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.2px;
        padding: 6px 16px;
        transition: all 0.2s ease;
        white-space: nowrap;

        &:hover {
          box-shadow: 0 4px 16px rgba(96, 205, 255, 0.35);
          transform: translateY(-1px);
        }
        &:active { transform: translateY(0); }
      }

      .user-profile {
        align-items: center;
        background: transparent;
        border: 1px solid ${T.border};
        border-radius: 20px;
        cursor: pointer;
        display: flex;
        gap: 8px;
        padding: 3px 10px 3px 3px;
        transition: all 0.2s ease;

        &:hover {
          background: ${T.white08};
          border-color: ${T.borderHover};
        }

        .avatar {
          background: #3f3f46;
          border-radius: 50%;
          height: 26px;
          overflow: hidden;
          width: 26px;
          img { height: 100%; object-fit: cover; width: 100%; }
        }
      }
    }
  }

  /* ═══════════════════════════════════════════
     BODY (SIDEBAR + CONTENT)
     ═══════════════════════════════════════════ */
  .ms-body {
    display: flex;
    flex: 1;
    overflow: hidden;

    /* ── Sidebar ── */
    .ms-sidebar {
      background: ${T.bgSidebar};
      backdrop-filter: saturate(180%) blur(20px);
      border-right: 1px solid ${T.border};
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      justify-content: space-between;
      overflow-y: auto;
      padding: 8px;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      width: 72px;

      @media (max-width: 550px) { width: 56px; padding: 6px 4px; }

      .nav-group {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .nav-item {
          align-items: center;
          background: transparent;
          border: none;
          border-radius: ${T.radiusSm};
          color: ${T.muted};
          cursor: pointer;
          display: flex;
          flex-direction: column;
          font-family: ${T.fontFamily};
          font-size: 9.5px;
          font-weight: 600;
          gap: 3px;
          justify-content: center;
          padding: 8px 2px;
          position: relative;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

          svg {
            fill: currentColor;
            height: 20px;
            transition: all 0.2s ease;
            width: 20px;
          }

          &:hover {
            background: ${T.white08};
            color: ${T.text};
            svg { transform: scale(1.08); }
          }

          &.active {
            background: ${T.accentBlueSoft};
            color: ${T.accentBlue};

            &::before {
              background: ${T.accentBlue};
              border-radius: 3px;
              content: "";
              height: 16px;
              left: 0;
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              width: 3px;
            }
          }

          .badge-count {
            animation: ${pulseGlow} 2s infinite;
            background: #ef4444;
            border-radius: 10px;
            color: #fff;
            font-size: 9px;
            font-weight: 800;
            padding: 1px 5px;
            position: absolute;
            right: 4px;
            top: 2px;
          }
        }
      }
    }

    /* ── Main Content Scroll ── */
    .ms-content {
      background: ${T.bg};
      flex: 1;
      min-width: 0;
      overflow-y: auto;
      padding: 24px 28px 32px;
      scroll-behavior: smooth;

      @media (max-width: 700px) { padding: 16px 14px 24px; }

      &::-webkit-scrollbar { width: 5px; }
      &::-webkit-scrollbar-track { background: transparent; }
      &::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.1);
        border-radius: 4px;
        &:hover { background: rgba(255,255,255,0.18); }
      }
    }
  }

  /* ═══════════════════════════════════════════
     SECTION HEADERS
     ═══════════════════════════════════════════ */
  .section-header {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin: 28px 0 16px;

    &:first-child { margin-top: 0; }

    .section-title {
      align-items: center;
      color: ${T.text};
      cursor: pointer;
      display: flex;
      font-size: 20px;
      font-weight: 700;
      gap: 8px;
      letter-spacing: -0.02em;
      transition: all 0.2s ease;

      .arrow {
        color: ${T.accentBlue};
        font-size: 18px;
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }

      &:hover {
        color: ${T.accentBlue};
        .arrow { transform: translateX(4px); }
      }
    }
  }

  /* ═══════════════════════════════════════════
     HERO SHOWCASE CAROUSEL
     ═══════════════════════════════════════════ */
  .hero-showcase {
    display: grid;
    gap: 14px;
    grid-template-columns: 1.8fr 1fr;
    margin-bottom: 8px;

    @media (max-width: 800px) { grid-template-columns: 1fr; }

    .hero-main-card {
      align-items: flex-end;
      animation: ${heroSlide} 0.6s ease-out;
      background: linear-gradient(145deg, #1a3a5c 0%, #0d1f35 40%, #0a0e18 100%);
      border: 1px solid ${T.border};
      border-radius: ${T.radiusLg};
      cursor: pointer;
      display: flex;
      min-height: 300px;
      overflow: hidden;
      padding: 28px 32px;
      position: relative;
      text-align: left;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);

      @media (max-width: 550px) { min-height: 220px; padding: 20px; }

      &:hover {
        border-color: ${T.borderHover};
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
        transform: translateY(-3px);
      }

      .hero-bg-art {
        bottom: 0;
        filter: blur(0.5px);
        mask-image: linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%);
        opacity: 0.55;
        pointer-events: none;
        position: absolute;
        right: 0;
        top: 0;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        width: 55%;
        img { height: 100%; object-fit: cover; width: 100%; }
      }

      &:hover .hero-bg-art {
        opacity: 0.7;
        transform: scale(1.05);
      }

      .hero-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 65%;
        z-index: 2;

        @media (max-width: 550px) { max-width: 85%; }

        .hero-title {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.15;
          text-shadow: 0 2px 8px rgba(0,0,0,0.4);

          @media (max-width: 550px) { font-size: 20px; }
        }

        .hero-subtitle {
          color: rgba(255,255,255,0.75);
          font-size: 13px;
          font-weight: 400;
          line-height: 1.4;
          max-width: 400px;
        }

        .hero-btn {
          align-self: flex-start;
          background: ${T.accentBlue};
          border: none;
          border-radius: 20px;
          color: #000;
          cursor: pointer;
          font-family: ${T.fontFamily};
          font-size: 12.5px;
          font-weight: 700;
          margin-top: 6px;
          padding: 8px 28px;
          transition: all 0.2s ease;

          &:hover {
            background: #7dd8ff;
            box-shadow: 0 4px 16px rgba(96, 205, 255, 0.3);
            transform: scale(1.03);
          }
        }

        .hero-badge {
          align-items: center;
          color: rgba(255,255,255,0.5);
          display: flex;
          font-size: 10px;
          gap: 6px;

          span.iarc {
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 3px;
            font-weight: 800;
            padding: 1px 4px;
          }
        }
      }

      .hero-dots {
        bottom: 14px;
        display: flex;
        gap: 6px;
        left: 50%;
        position: absolute;
        transform: translateX(-50%);

        .dot {
          background: rgba(255,255,255,0.3);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          height: 6px;
          padding: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 6px;

          &.active {
            background: ${T.accentBlue};
            border-radius: 4px;
            width: 20px;
          }

          &:hover { background: rgba(255,255,255,0.6); }
        }
      }
    }

    /* Hero Side Column */
    .hero-side-grid {
      display: flex;
      flex-direction: column;
      gap: 14px;

      .side-top-card {
        background: linear-gradient(145deg, #1d3a24 0%, #0e1e12 100%);
        border: 1px solid ${T.border};
        border-radius: ${T.radiusLg};
        cursor: pointer;
        display: flex;
        flex: 1.3;
        flex-direction: column;
        justify-content: flex-end;
        min-height: 140px;
        overflow: hidden;
        padding: 20px;
        position: relative;
        text-align: left;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          border-color: ${T.borderHover};
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.35);
        }

        .card-bg {
          bottom: 0; opacity: 0.3; position: absolute; right: 0; top: 0; width: 60%;
          transition: all 0.4s ease;
          img { height: 100%; object-fit: cover; width: 100%; }
        }
        &:hover .card-bg { opacity: 0.45; transform: scale(1.05); }

        .side-content {
          z-index: 2;
          .side-title { font-size: 17px; font-weight: 700; margin-bottom: 10px; }
          .get-btn {
            background: ${T.green};
            border: none;
            border-radius: 16px;
            color: #000;
            cursor: pointer;
            font-family: ${T.fontFamily};
            font-size: 11.5px;
            font-weight: 700;
            padding: 6px 20px;
            transition: all 0.2s ease;
            &:hover { background: #6ee7a0; box-shadow: 0 4px 12px rgba(74,222,128,0.3); }
          }
        }
      }

      .side-bottom-row {
        display: grid;
        flex: 1;
        gap: 14px;
        grid-template-columns: 1fr 1fr;

        .mini-feature-card {
          background: ${T.bgSurface};
          border: 1px solid ${T.border};
          border-radius: ${T.radius};
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          min-height: 100px;
          overflow: hidden;
          padding: 14px;
          position: relative;
          text-align: left;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

          &:hover {
            border-color: ${T.borderHover};
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
          }

          .mini-bg {
            bottom: 0; left: 0; opacity: 0.25; position: absolute; right: 0; top: 0;
            transition: opacity 0.3s ease;
            img { height: 100%; object-fit: cover; width: 100%; }
          }
          &:hover .mini-bg { opacity: 0.4; }

          .mini-title {
            font-size: 12px;
            font-weight: 700;
            text-shadow: 0 2px 6px rgba(0,0,0,0.8);
            z-index: 2;
          }
        }
      }
    }
  }

  /* ═══════════════════════════════════════════
     APP CARDS GRID
     ═══════════════════════════════════════════ */
  .cards-grid {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    margin-bottom: 8px;

    @media (max-width: 550px) {
      grid-template-columns: 1fr;
    }
  }

  .compact-card {
    align-items: center;
    animation: ${fadeInUp} 0.35s ease-out both;
    background: ${T.bgCard};
    border: 1px solid ${T.borderSubtle};
    border-radius: ${T.radius};
    cursor: pointer;
    display: flex;
    gap: 12px;
    padding: 12px 14px;
    text-align: left;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background: ${T.bgCardHover};
      border-color: ${T.borderHover};
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
      transform: translateY(-3px);
    }

    .app-icon {
      background: rgba(255,255,255,0.06);
      border-radius: ${T.radiusSm};
      flex-shrink: 0;
      height: 48px;
      overflow: hidden;
      width: 48px;
      img { height: 100%; object-fit: cover; width: 100%; }
    }

    .app-meta {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 2px;
      min-width: 0;

      .name {
        color: ${T.text};
        font-size: 13px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .developer {
        color: ${T.muted};
        font-size: 11px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .rating-line {
        color: ${T.gold};
        font-size: 11px;
        font-weight: 700;
      }
    }

    .card-hover-actions {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      gap: 4px;
    }

    .badge-pill {
      background: ${T.white08};
      border-radius: 12px;
      color: ${T.mutedLight};
      font-size: 10px;
      font-weight: 600;
      padding: 3px 10px;
      white-space: nowrap;

      &.owned {
        background: ${T.accentBlueSoft};
        color: ${T.accentBlue};
      }
      &.free {
        background: transparent;
        color: ${T.muted};
      }
    }
  }

  /* ═══════════════════════════════════════════
     DETAIL VIEW
     ═══════════════════════════════════════════ */
  .detail-view {
    animation: ${fadeInUp} 0.3s ease-out;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .back-bar {
      align-items: center;
      background: transparent;
      border: none;
      color: ${T.muted};
      cursor: pointer;
      display: inline-flex;
      font-family: ${T.fontFamily};
      font-size: 13px;
      font-weight: 500;
      gap: 6px;
      padding: 0;
      transition: all 0.2s ease;

      &:hover { color: ${T.accentBlue}; transform: translateX(-2px); }
    }

    .detail-hero-banner {
      animation: ${scaleIn} 0.35s ease-out;
      background: linear-gradient(165deg, rgba(96,205,255,0.06) 0%, ${T.bgSurface} 40%, ${T.bg} 100%);
      border: 1px solid ${T.border};
      border-radius: ${T.radiusLg};
      display: flex;
      gap: 24px;
      padding: 28px;

      @media (max-width: 650px) { flex-direction: column; align-items: center; text-align: center; padding: 20px; }

      .hero-logo-box {
        background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
        border: 1px solid ${T.borderHover};
        border-radius: ${T.radiusLg};
        box-shadow: 0 8px 28px rgba(0,0,0,0.5);
        flex-shrink: 0;
        height: 110px;
        overflow: hidden;
        padding: 14px;
        transition: transform 0.3s ease;
        width: 110px;
        img { height: 100%; object-fit: contain; width: 100%; }
        &:hover { transform: scale(1.05) rotate(2deg); }
      }

      .hero-info-box {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 6px;
        min-width: 0;

        .app-title {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;

          @media (max-width: 550px) { font-size: 22px; }
        }

        .publisher {
          color: ${T.muted};
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .rating-row {
          align-items: center;
          display: flex;
          flex-wrap: wrap;
          font-size: 12px;
          gap: 12px;

          .stars {
            align-items: center;
            color: ${T.gold};
            display: flex;
            font-weight: 700;
            gap: 4px;
          }
          .category-link {
            color: ${T.accentBlue};
            cursor: pointer;
            font-weight: 500;
            &:hover { text-decoration: underline; }
          }
        }

        .badges-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 2px;

          .feature-badge {
            align-items: center;
            background: ${T.white08};
            border-radius: 14px;
            color: ${T.mutedLight};
            display: flex;
            font-size: 10.5px;
            font-weight: 500;
            gap: 5px;
            padding: 3px 10px;
          }
        }

        .app-tagline {
          color: ${T.textSecondary};
          font-size: 13px;
          line-height: 1.5;
          margin-top: 4px;
          max-width: 560px;
        }

        .action-row {
          align-items: center;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 12px;

          .install-btn {
            background: ${T.accentBlue};
            border: none;
            border-radius: 20px;
            color: #000;
            cursor: pointer;
            font-family: ${T.fontFamily};
            font-size: 13px;
            font-weight: 700;
            padding: 10px 38px;
            transition: all 0.2s ease;

            &:hover {
              background: #7dd8ff;
              box-shadow: 0 4px 16px rgba(96,205,255,0.3);
              transform: scale(1.02);
            }
            &:disabled {
              background: #3f3f46;
              color: ${T.muted};
              cursor: not-allowed;
              transform: none;
              box-shadow: none;
            }
          }

          .share-btn,
          .review-btn {
            align-items: center;
            background: ${T.white08};
            border: 1px solid ${T.border};
            border-radius: 20px;
            color: ${T.text};
            cursor: pointer;
            display: flex;
            font-family: ${T.fontFamily};
            font-size: 12px;
            font-weight: 500;
            gap: 4px;
            height: 36px;
            padding: 0 14px;
            transition: all 0.2s ease;
            white-space: nowrap;

            &:hover {
              background: ${T.bgCardHover};
              border-color: ${T.borderHover};
            }
          }
        }

        .provided-by {
          color: ${T.muted};
          font-size: 11px;
          margin-top: 4px;
        }

        .age-rating-box {
          align-items: center;
          border: 1px solid ${T.border};
          border-radius: ${T.radiusSm};
          display: inline-flex;
          gap: 8px;
          margin-top: 8px;
          padding: 5px 10px;

          .iarc-logo {
            border: 1px solid ${T.mutedLight};
            border-radius: 2px;
            font-size: 8px;
            font-weight: 800;
            padding: 1px 4px;
          }
          .age-text { color: ${T.textSecondary}; font-size: 11px; }
        }
      }
    }

    /* Detail body split grid */
    .detail-body-split {
      display: grid;
      gap: 24px;
      grid-template-columns: 2.2fr 1fr;

      @media (max-width: 800px) { grid-template-columns: 1fr; }

      .detail-main-col {
        display: flex;
        flex-direction: column;
        gap: 18px;

        .screenshots-section,
        .description-section,
        .sys-reqs-section,
        .reviews-section {
          animation: ${slideInRight} 0.3s ease-out both;
          background: ${T.bgCard};
          border: 1px solid ${T.borderSubtle};
          border-radius: ${T.radius};
          padding: 20px;
          transition: border-color 0.2s ease;

          &:hover { border-color: ${T.border}; }
        }

        .screenshots-section {
          .screenshots-header {
            align-items: center; color: ${T.text}; display: flex;
            font-size: 15px; font-weight: 700; justify-content: space-between; margin-bottom: 14px;
          }
          .screenshots-slider {
            display: flex; gap: 12px; overflow-x: auto; padding-bottom: 6px; scroll-snap-type: x mandatory;
            &::-webkit-scrollbar { height: 4px; }
            &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

            .screenshot-card {
              border-radius: ${T.radiusSm};
              flex-shrink: 0;
              height: 200px;
              overflow: hidden;
              scroll-snap-align: start;
              width: 340px;

              @media (max-width: 550px) { width: 260px; height: 160px; }

              img {
                height: 100%; object-fit: cover; width: 100%;
                transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                &:hover { transform: scale(1.05); }
              }
            }
          }
        }

        .description-section {
          h3 { font-size: 15px; font-weight: 700; margin-bottom: 10px; }
          p { color: ${T.textSecondary}; font-size: 13px; line-height: 1.65; }
        }

        .sys-reqs-section {
          h3 { font-size: 15px; font-weight: 700; margin-bottom: 12px; }
          .reqs-grid {
            display: grid; gap: 14px; grid-template-columns: 1fr 1fr;
            @media (max-width: 550px) { grid-template-columns: 1fr; }
            .req-item {
              display: flex; flex-direction: column; gap: 2px;
              .label { color: ${T.muted}; font-size: 10.5px; font-weight: 600; letter-spacing: 0.3px; text-transform: uppercase; }
              .val { color: ${T.text}; font-size: 13px; font-weight: 500; }
            }
          }
        }

        .reviews-section {
          .rev-header {
            align-items: center; display: flex; justify-content: space-between; margin-bottom: 14px;
            h3 { font-size: 15px; font-weight: 700; margin: 0; }
            .add-rev-btn {
              background: ${T.accentBlue};
              border: none;
              border-radius: 16px;
              color: #000;
              cursor: pointer;
              font-family: ${T.fontFamily};
              font-size: 11.5px;
              font-weight: 700;
              padding: 5px 14px;
              transition: all 0.2s ease;
              &:hover { background: #7dd8ff; }
            }
          }
          .rev-list {
            display: flex; flex-direction: column; gap: 10px;
            .rev-card {
              background: ${T.white08};
              border-radius: ${T.radiusSm};
              display: flex; flex-direction: column; gap: 3px; padding: 12px;
              transition: background 0.2s ease;
              &:hover { background: ${T.bgCardHover}; }

              .rev-top {
                align-items: center; display: flex; justify-content: space-between;
                .name { font-weight: 600; }
                .stars { color: ${T.gold}; font-size: 12px; }
              }
              .rev-date { color: ${T.muted}; font-size: 10px; }
              .rev-text { color: ${T.textSecondary}; font-size: 12.5px; line-height: 1.5; margin-top: 4px; }
            }
          }
        }
      }

      .detail-sidebar-col {
        display: flex; flex-direction: column; gap: 14px;

        .discover-header {
          align-items: center; color: ${T.text}; display: flex;
          font-size: 15px; font-weight: 700; gap: 6px;
          .arrow { color: ${T.accentBlue}; }
        }

        .discover-list {
          display: flex; flex-direction: column; gap: 8px;

          .discover-item {
            align-items: center;
            background: ${T.bgCard};
            border: 1px solid ${T.borderSubtle};
            border-radius: ${T.radiusSm};
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            padding: 10px 12px;
            text-align: left;
            transition: all 0.2s ease;

            &:hover { background: ${T.bgCardHover}; border-color: ${T.border}; }

            .left-info {
              align-items: center; display: flex; gap: 10px; min-width: 0;
              .item-icon { background: rgba(255,255,255,0.06); border-radius: 8px; flex-shrink: 0; height: 36px; object-fit: cover; width: 36px; }
              .item-name { color: ${T.text}; font-size: 12.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            }
            .item-badge {
              background: ${T.white08};
              border-radius: 10px;
              color: ${T.muted};
              flex-shrink: 0;
              font-size: 10.5px;
              font-weight: 600;
              padding: 3px 8px;
            }
          }
        }
      }
    }
  }

  /* ═══════════════════════════════════════════
     MODAL OVERLAY + GLASS BOX
     ═══════════════════════════════════════════ */
  .modal-overlay {
    align-items: center;
    animation: ${fadeIn} 0.2s ease-out;
    background: ${T.bgOverlay};
    backdrop-filter: saturate(180%) blur(16px);
    border: none;
    cursor: default;
    display: flex;
    height: 100%;
    justify-content: center;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 100;

    .modal-box {
      animation: ${scaleIn} 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      background: ${T.bgModal};
      border: 1px solid ${T.borderHover};
      border-radius: ${T.radiusLg};
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      gap: 14px;
      max-height: 85%;
      max-width: 440px;
      overflow-y: auto;
      padding: 28px;
      position: relative;
      width: 92%;

      .modal-close {
        background: transparent;
        border: none;
        color: ${T.muted};
        cursor: pointer;
        font-size: 18px;
        position: absolute;
        right: 16px;
        top: 16px;
        transition: all 0.15s ease;
        &:hover { color: ${T.text}; transform: scale(1.15); }
      }

      .modal-title {
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.02em;
      }

      .modal-sub {
        color: ${T.textSecondary};
        font-size: 13px;
        line-height: 1.4;
      }

      .topup-options {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(3, 1fr);
        margin: 8px 0;

        button {
          background: ${T.bgCard};
          border: 1px solid ${T.border};
          border-radius: ${T.radius};
          color: ${T.accentBlue};
          cursor: pointer;
          font-family: ${T.fontFamily};
          font-size: 16px;
          font-weight: 700;
          padding: 18px 6px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

          &:hover {
            background: ${T.accentBlueSoft};
            border-color: ${T.accentBlue};
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(96,205,255,0.2);
          }
        }
      }

      .star-rating-select {
        display: flex;
        gap: 6px;

        button {
          background: transparent;
          border: none;
          color: #3f3f46;
          cursor: pointer;
          font-size: 26px;
          transition: all 0.15s ease;
          &.active { color: ${T.gold}; transform: scale(1.1); }
          &:hover { transform: scale(1.15); }
        }
      }

      textarea {
        background: rgba(255,255,255,0.04);
        border: 1px solid ${T.border};
        border-radius: ${T.radiusSm};
        color: ${T.text};
        font-family: ${T.fontFamily};
        font-size: 13px;
        min-height: 80px;
        outline: none;
        padding: 10px;
        resize: vertical;
        transition: border-color 0.2s ease;
        &:focus { border-color: ${T.accentBlue}; }
      }

      .modal-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 4px;

        button {
          border: none;
          border-radius: 16px;
          cursor: pointer;
          font-family: ${T.fontFamily};
          font-size: 12px;
          font-weight: 600;
          padding: 8px 22px;
          transition: all 0.2s ease;

          &.cancel-btn {
            background: ${T.white08};
            color: ${T.text};
            &:hover { background: ${T.bgCardHover}; }
          }
          &.confirm-btn {
            background: ${T.accentBlue};
            color: #000;
            &:hover { background: #7dd8ff; box-shadow: 0 4px 12px rgba(96,205,255,0.25); }
          }
        }
      }
    }
  }

  /* ═══════════════════════════════════════════
     TAB PAGES (Library, Downloads, etc.)
     ═══════════════════════════════════════════ */
  .tab-page {
    animation: ${fadeInUp} 0.3s ease-out;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .page-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.03em;
    }

    .library-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 4px;

      button {
        background: ${T.bgCard};
        border: 1px solid ${T.borderSubtle};
        border-radius: 20px;
        color: ${T.muted};
        cursor: pointer;
        font-family: ${T.fontFamily};
        font-size: 12px;
        font-weight: 600;
        padding: 6px 18px;
        transition: all 0.2s ease;

        &:hover { color: ${T.text}; border-color: ${T.border}; }
        &.active {
          background: ${T.accentBlueSoft};
          border-color: ${T.accentBlue};
          color: ${T.accentBlue};
        }
      }
    }

    .library-list {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .library-card {
        align-items: center;
        background: ${T.bgCard};
        border: 1px solid ${T.borderSubtle};
        border-radius: ${T.radius};
        display: flex;
        justify-content: space-between;
        padding: 14px 18px;
        transition: all 0.2s ease;

        @media (max-width: 550px) { flex-direction: column; gap: 10px; align-items: flex-start; }

        &:hover { background: ${T.bgCardHover}; border-color: ${T.border}; }

        .card-left {
          align-items: center;
          display: flex;
          gap: 14px;
          min-width: 0;

          .app-icon {
            background: rgba(255,255,255,0.06);
            border-radius: ${T.radiusSm};
            flex-shrink: 0;
            height: 44px;
            object-fit: cover;
            width: 44px;
          }

          .app-details {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;
            .title { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .sub { color: ${T.muted}; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          }
        }

        .card-actions {
          display: flex;
          flex-shrink: 0;
          gap: 8px;

          button {
            border: none;
            border-radius: 16px;
            cursor: pointer;
            font-family: ${T.fontFamily};
            font-size: 12px;
            font-weight: 600;
            padding: 6px 18px;
            transition: all 0.2s ease;

            &.install-btn {
              background: ${T.accentBlue};
              color: #000;
              &:hover { background: #7dd8ff; box-shadow: 0 3px 10px rgba(96,205,255,0.25); }
            }
            &.uninstall-btn {
              background: ${T.redSoft};
              color: ${T.red};
              &:hover { background: rgba(248,113,113,0.2); }
            }
          }
        }
      }
    }
  }

  /* ═══════════════════════════════════════════
     INSTALL PROGRESS BAR
     ═══════════════════════════════════════════ */
  .install-progress-box {
    background: ${T.bgCard};
    border: 1px solid ${T.border};
    border-radius: ${T.radius};
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
    padding: 14px;

    .progress-bar-bg {
      background: rgba(255,255,255,0.06);
      border-radius: 6px;
      height: 5px;
      overflow: hidden;
      width: 100%;

      .progress-bar-fill {
        animation: ${shimmer} 2s infinite linear;
        background: linear-gradient(90deg, ${T.accentBlueDark} 0%, ${T.accentBlue} 50%, ${T.accentBlueDark} 100%);
        background-size: 200% 100%;
        border-radius: 6px;
        height: 100%;
        transition: width 0.3s ease;
      }
    }

    .progress-info {
      color: ${T.muted};
      display: flex;
      font-size: 11px;
      font-weight: 500;
      justify-content: space-between;
    }
  }
`;

export default StyledAppStore;

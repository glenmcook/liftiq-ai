export function ColorSchemes() {
  const darkThemes = [
    {
      name: "Neon Green",
      label: "Dark",
      bg: "#0a0a0a",
      sidebar: "#0a0a0a",
      card: "#111111",
      border: "#222222",
      primary: "#4ade4a",
      primaryFg: "#050505",
      text: "#f9f9f9",
      muted: "#888888",
      badge: "DEFAULT",
    },
    {
      name: "Cyber Blue",
      label: "Dark",
      bg: "#050912",
      sidebar: "#050912",
      card: "#0b1120",
      border: "#1a2640",
      primary: "#0ea5e9",
      primaryFg: "#000c18",
      text: "#f0f8ff",
      muted: "#6b8aaa",
      badge: null,
    },
    {
      name: "Volcanic",
      label: "Dark",
      bg: "#0d0900",
      sidebar: "#0d0900",
      card: "#150f00",
      border: "#2a1f00",
      primary: "#f59e0b",
      primaryFg: "#0d0900",
      text: "#fff8ee",
      muted: "#8a7050",
      badge: null,
    },
    {
      name: "Purple Pulse",
      label: "Dark",
      bg: "#080610",
      sidebar: "#080610",
      card: "#0f0b1c",
      border: "#1e1535",
      primary: "#a855f7",
      primaryFg: "#050010",
      text: "#f5f0ff",
      muted: "#7a6890",
      badge: null,
    },
    {
      name: "Crimson",
      label: "Dark",
      bg: "#0d0505",
      sidebar: "#0d0505",
      card: "#150808",
      border: "#2a1010",
      primary: "#ef4444",
      primaryFg: "#0d0000",
      text: "#fff5f5",
      muted: "#8a5555",
      badge: null,
    },
    {
      name: "Arctic",
      label: "Dark / Indigo",
      bg: "#f4f6f9",
      sidebar: "#1a1f2e",
      card: "#ffffff",
      border: "#e2e8f0",
      primary: "#6366f1",
      primaryFg: "#ffffff",
      text: "#0f172a",
      muted: "#64748b",
      badge: null,
    },
  ];

  const lightThemes = [
    {
      name: "Neon Green",
      label: "Light",
      bg: "#f4faf4",
      sidebar: "#eef7ee",
      card: "#ffffff",
      border: "#cce5cc",
      primary: "#2d9e2d",
      primaryFg: "#ffffff",
      text: "#1a2e1a",
      muted: "#5a7a5a",
      badge: null,
    },
    {
      name: "Cyber Blue",
      label: "Light",
      bg: "#f0f8ff",
      sidebar: "#eaf4fd",
      card: "#ffffff",
      border: "#c8dff0",
      primary: "#0284c7",
      primaryFg: "#ffffff",
      text: "#0f1e2e",
      muted: "#4a6a7a",
      badge: null,
    },
    {
      name: "Volcanic",
      label: "Light",
      bg: "#fefaf0",
      sidebar: "#fdf6e4",
      card: "#ffffff",
      border: "#e8d8b0",
      primary: "#d97706",
      primaryFg: "#1a0f00",
      text: "#1a1000",
      muted: "#7a6030",
      badge: null,
    },
    {
      name: "Purple Pulse",
      label: "Light",
      bg: "#faf5ff",
      sidebar: "#f3eeff",
      card: "#ffffff",
      border: "#d8c8f0",
      primary: "#9333ea",
      primaryFg: "#ffffff",
      text: "#1a0f2e",
      muted: "#6a4a7a",
      badge: null,
    },
    {
      name: "Crimson",
      label: "Light",
      bg: "#fff5f5",
      sidebar: "#ffeeee",
      card: "#ffffff",
      border: "#f0cccc",
      primary: "#dc2626",
      primaryFg: "#ffffff",
      text: "#1a0a0a",
      muted: "#7a4040",
      badge: null,
    },
    {
      name: "Arctic",
      label: "Light / Indigo",
      bg: "#f1f5f9",
      sidebar: "#e8eef5",
      card: "#ffffff",
      border: "#cbd5e1",
      primary: "#6366f1",
      primaryFg: "#ffffff",
      text: "#0f172a",
      muted: "#64748b",
      badge: null,
    },
  ];

  const navItems = ["Dashboard", "Protocol", "History", "Progress", "DEXA Scans", "AI Check-in", "Diet", "Library", "Arsenal"];
  const activeItem = "Dashboard";

  const ThemeCard = ({ t, isDark }: { t: typeof darkThemes[0]; isDark: boolean }) => (
    <div style={{
      borderRadius: 12, overflow: "hidden",
      border: `2px solid ${t.badge ? t.primary + "80" : isDark ? "#2a2a2a" : "#e2e8f0"}`,
      position: "relative",
      boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.08)",
    }}>
      {t.badge && (
        <div style={{
          position: "absolute", top: 10, right: 10, zIndex: 10,
          background: t.primary, color: t.primaryFg, fontSize: 9,
          fontWeight: 800, letterSpacing: "0.12em", padding: "3px 8px", borderRadius: 4,
        }}>
          {t.badge}
        </div>
      )}

      {/* Theme label */}
      <div style={{
        background: isDark ? "#111" : "#ffffff",
        padding: "10px 14px",
        borderBottom: `1px solid ${isDark ? "#1e1e1e" : "#e2e8f0"}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: t.primary, flexShrink: 0 }} />
        <span style={{ color: isDark ? "#fff" : "#1a1a1a", fontWeight: 700, fontSize: 13 }}>{t.name}</span>
        <span style={{ color: isDark ? "#555" : "#888", fontSize: 12, marginLeft: 2 }}>— {t.label}</span>
      </div>

      {/* Mini app preview */}
      <div style={{ display: "flex", height: 300, background: t.bg }}>
        {/* Sidebar */}
        <div style={{
          width: 130, background: t.sidebar, borderRight: `1px solid ${t.border}`,
          padding: "12px 0", display: "flex", flexDirection: "column", gap: 2, flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px 12px" }}>
            <div style={{ width: 20, height: 20, background: t.primary, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 10, color: t.primaryFg, fontWeight: 900 }}>F</span>
            </div>
            <span style={{ color: t.text, fontWeight: 800, fontSize: 12, letterSpacing: "0.05em" }}>FITFORGE</span>
          </div>

          {navItems.map((item) => {
            const isActive = item === activeItem;
            return (
              <div key={item} style={{
                margin: "0 8px", padding: "5px 10px", borderRadius: 6,
                background: isActive ? t.primary : "transparent",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: isActive ? t.primaryFg : t.muted, opacity: isActive ? 1 : 0.5 }} />
                <span style={{
                  color: isActive ? t.primaryFg : t.muted,
                  fontSize: 9, fontWeight: isActive ? 700 : 500,
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {item}
                </span>
              </div>
            );
          })}

          <div style={{ marginTop: "auto", padding: "0 8px" }}>
            <div style={{
              background: t.primary + "20", border: `1px solid ${t.primary}40`,
              borderRadius: 6, padding: "6px 10px",
            }}>
              <span style={{ fontSize: 8, color: t.primary, fontWeight: 700, letterSpacing: "0.08em" }}>UPGRADE TO PRO</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: 12, overflow: "hidden" }}>
          <div style={{ color: t.primary, fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 3 }}>DASHBOARD</div>
          <div style={{ color: t.text, fontSize: 16, fontWeight: 800, letterSpacing: "0.05em", marginBottom: 10 }}>Welcome back</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 8 }}>
            {[
              { label: "BODY FAT", value: "16.2%", color: t.primary },
              { label: "LEAN MASS", value: "145.8 lbs", color: isDark ? "#60a5fa" : "#2563eb" },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: t.card, border: `1px solid ${t.border}`,
                borderRadius: 7, padding: "8px 10px",
              }}>
                <div style={{ color: t.muted, fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 3 }}>{stat.label}</div>
                <div style={{ color: stat.color, fontSize: 14, fontWeight: 800 }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 7, padding: "8px 10px" }}>
            <div style={{ color: t.muted, fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 6 }}>WEEKLY VOLUME</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 40 }}>
              {[0.4, 0.7, 0.55, 1, 0.8, 0.6, 0.3].map((h, i) => (
                <div key={i} style={{ flex: 1, background: t.primary, opacity: i === 3 ? 1 : 0.3, borderRadius: "2px 2px 0 0", height: `${h * 100}%` }} />
              ))}
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ background: t.primary, borderRadius: 6, padding: "6px 12px", display: "inline-flex" }}>
              <span style={{ color: t.primaryFg, fontSize: 9, fontWeight: 800, letterSpacing: "0.1em" }}>+ LOG WORKOUT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Swatch strip */}
      <div style={{
        background: isDark ? "#111" : "#ffffff",
        padding: "7px 12px", display: "flex", alignItems: "center", gap: 5,
        borderTop: `1px solid ${isDark ? "#1e1e1e" : "#e2e8f0"}`,
      }}>
        {[t.bg, t.card, t.border, t.primary, t.muted, t.text].map((c, i) => (
          <div key={i} title={c} style={{ width: 14, height: 14, borderRadius: 3, background: c, border: `1px solid ${isDark ? "#333" : "#ddd"}`, flexShrink: 0 }} />
        ))}
        <span style={{ color: isDark ? "#555" : "#888", fontSize: 9, marginLeft: 3, letterSpacing: "0.06em" }}>{t.primary}</span>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#f0f0f0", minHeight: "100vh", padding: "32px", fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <h1 style={{ color: "#1a1a1a", fontSize: 22, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
          FitForge — Color Scheme Options
        </h1>
        <p style={{ color: "#666", fontSize: 13, marginBottom: 32, letterSpacing: "0.05em" }}>
          Six accent colors × two modes (dark + light). Same accent color, different background.
        </p>

        {/* Dark themes */}
        <h2 style={{ color: "#333", fontSize: 14, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid #ddd" }}>
          ◼ Dark Mode
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 40 }}>
          {darkThemes.map((t) => <ThemeCard key={t.name + t.label} t={t} isDark={true} />)}
        </div>

        {/* Light themes */}
        <h2 style={{ color: "#333", fontSize: 14, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid #ddd" }}>
          ◻ Light Mode
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {lightThemes.map((t) => <ThemeCard key={t.name + t.label} t={t} isDark={false} />)}
        </div>

        <p style={{ color: "#999", fontSize: 11, marginTop: 24, letterSpacing: "0.06em" }}>
          12 themes total — pick an accent color and a mode.
        </p>
      </div>
    </div>
  );
}

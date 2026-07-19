export function ColorSchemes() {
  const themes = [
    {
      name: "Current",
      label: "Neon Green",
      bg: "#0a0a0a",
      sidebar: "#0a0a0a",
      card: "#111111",
      border: "#222222",
      primary: "#4ade4a",
      primaryFg: "#050505",
      text: "#f9f9f9",
      muted: "#888888",
      badge: "CURRENT",
    },
    {
      name: "Electric Blue",
      label: "Cyber Blue",
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
      label: "Amber Orange",
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
      label: "Electric Violet",
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
      label: "Red Steel",
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
      label: "Ice White",
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

  const navItems = ["Dashboard", "Protocol", "History", "Progress", "DEXA Scans", "AI Check-in", "Diet", "Library", "Arsenal"];
  const activeItem = "Dashboard";

  return (
    <div style={{ background: "#000", minHeight: "100vh", padding: "32px", fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
          LiftIQ — Color Scheme Options
        </h1>
        <p style={{ color: "#666", fontSize: 13, marginBottom: 32, letterSpacing: "0.05em" }}>
          Same layout, different palettes. Current theme shown first for reference.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {themes.map((t) => (
            <div key={t.name} style={{ borderRadius: 12, overflow: "hidden", border: `2px solid ${t.badge ? t.primary + "80" : "#1e1e1e"}`, position: "relative" }}>
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
              <div style={{ background: "#111", padding: "10px 14px", borderBottom: "1px solid #1e1e1e", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: t.primary, flexShrink: 0 }} />
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{t.name}</span>
                <span style={{ color: "#555", fontSize: 12, marginLeft: 2 }}>— {t.label}</span>
              </div>

              {/* Mini app preview */}
              <div style={{ display: "flex", height: 340, background: t.bg }}>
                {/* Sidebar */}
                <div style={{
                  width: 140, background: t.sidebar, borderRight: `1px solid ${t.border}`,
                  padding: "12px 0", display: "flex", flexDirection: "column", gap: 2, flexShrink: 0,
                }}>
                  {/* Logo */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px 12px" }}>
                    <div style={{ width: 20, height: 20, background: t.primary, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 10, color: t.primaryFg, fontWeight: 900 }}>L</span>
                    </div>
                    <span style={{ color: t.text, fontWeight: 800, fontSize: 13, letterSpacing: "0.05em" }}>LIFTIQ</span>
                  </div>

                  {navItems.map((item) => {
                    const isActive = item === activeItem;
                    return (
                      <div key={item} style={{
                        margin: "0 8px", padding: "6px 10px", borderRadius: 6,
                        background: isActive ? t.primary : "transparent",
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: isActive ? t.primaryFg : t.muted, opacity: isActive ? 1 : 0.5 }} />
                        <span style={{
                          color: isActive ? t.primaryFg : t.muted,
                          fontSize: 10, fontWeight: isActive ? 700 : 500,
                          letterSpacing: "0.04em",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {item}
                        </span>
                      </div>
                    );
                  })}

                  {/* Upgrade button */}
                  <div style={{ marginTop: "auto", padding: "0 8px" }}>
                    <div style={{
                      background: t.primary + "20", border: `1px solid ${t.primary}40`,
                      borderRadius: 6, padding: "7px 10px", display: "flex", alignItems: "center", gap: 6,
                    }}>
                      <span style={{ fontSize: 9, color: t.primary, fontWeight: 700, letterSpacing: "0.08em" }}>UPGRADE TO PRO</span>
                    </div>
                  </div>
                </div>

                {/* Main content */}
                <div style={{ flex: 1, padding: 14, overflow: "hidden" }}>
                  <div style={{ color: t.primary, fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 4 }}>
                    DASHBOARD
                  </div>
                  <div style={{ color: t.text, fontSize: 18, fontWeight: 800, letterSpacing: "0.05em", marginBottom: 12 }}>
                    Welcome back
                  </div>

                  {/* Stat cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                    {[
                      { label: "BODY FAT", value: "16.2%", color: t.primary },
                      { label: "LEAN MASS", value: "145.8 lbs", color: "#60a5fa" },
                    ].map((stat) => (
                      <div key={stat.label} style={{
                        background: t.card, border: `1px solid ${t.border}`,
                        borderRadius: 8, padding: "10px 12px",
                      }}>
                        <div style={{ color: t.muted, fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 4 }}>
                          {stat.label}
                        </div>
                        <div style={{ color: stat.color, fontSize: 16, fontWeight: 800 }}>
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Activity bar chart mock */}
                  <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ color: t.muted, fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 8 }}>
                      WEEKLY VOLUME
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 48 }}>
                      {[0.4, 0.7, 0.55, 1, 0.8, 0.6, 0.3].map((h, i) => (
                        <div key={i} style={{ flex: 1, background: t.primary, opacity: i === 3 ? 1 : 0.35, borderRadius: "2px 2px 0 0", height: `${h * 100}%` }} />
                      ))}
                    </div>
                  </div>

                  {/* CTA button sample */}
                  <div style={{ marginTop: 10 }}>
                    <div style={{
                      background: t.primary, borderRadius: 6, padding: "7px 14px",
                      display: "inline-flex", alignItems: "center", gap: 6,
                    }}>
                      <span style={{ color: t.primaryFg, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em" }}>
                        + LOG WORKOUT
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Swatch strip */}
              <div style={{ background: "#111", padding: "8px 12px", display: "flex", alignItems: "center", gap: 6, borderTop: `1px solid #1e1e1e` }}>
                {[t.bg, t.card, t.border, t.primary, t.muted, t.text].map((c, i) => (
                  <div key={i} title={c} style={{ width: 16, height: 16, borderRadius: 4, background: c, border: "1px solid #333", flexShrink: 0 }} />
                ))}
                <span style={{ color: "#555", fontSize: 10, marginLeft: 4, letterSpacing: "0.06em" }}>{t.primary}</span>
              </div>
            </div>
          ))}
        </div>

        <p style={{ color: "#444", fontSize: 11, marginTop: 24, letterSpacing: "0.06em" }}>
          Tell the agent which theme (or mix of ideas) you want and it will apply it to the app.
        </p>
      </div>
    </div>
  );
}

"use client";

export function CVPageActions() {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 22 }}>
      <button
        onClick={() => window.print()}
        style={{ fontSize: 12, background: "var(--green-mid)", color: "#fff", border: "none", borderRadius: 5, padding: "9px 20px", cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}
      >
        ⬇ Descargar PDF
      </button>
    </div>
  );
}

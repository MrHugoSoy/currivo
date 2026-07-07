"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CVCardPerfilSkeleton } from "@/components/Skeleton";
import type { User } from "@supabase/supabase-js";

type CV = {
  id: string; slug: string; nombre: string;
  puesto: string; ciudad: string | null; mercado: string; created_at: string;
};

type Profile = {
  is_pro: boolean;
  pro_plan: string | null;
  pro_expires_at: string | null;
  stripe_customer_id: string | null;
};

const FLAG: Record<string, string> = { mx: "🇲🇽", us: "🇺🇸", ca: "🇨🇦" };
const MARKET: Record<string, string> = { mx: "México", us: "USA", ca: "Canadá" };

const PLAN_LABELS: Record<string, string> = {
  pro_mxn_founder: "Pro Fundador",
  pro_mxn: "Pro",
  pro_usd_founder: "Pro Fundador",
  pro_usd: "Pro",
  lifetime_mxn: "Lifetime",
  gift: "Código Regalo",
};

export default function PerfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [cvsLoading, setCvsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [giftCode, setGiftCode] = useState("");
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftMsg, setGiftMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function loadCVs(userId: string, authEmail: string) {
    setCvsLoading(true);
    const [{ data: byId }, { data: byEmail }] = await Promise.all([
      supabase.from("cvs").select("id, slug, nombre, puesto, ciudad, mercado, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("cvs").select("id, slug, nombre, puesto, ciudad, mercado, created_at").eq("email", authEmail).order("created_at", { ascending: false }),
    ]);
    const seen = new Set<string>();
    const merged = [...(byId ?? []), ...(byEmail ?? [])].filter(cv => {
      if (seen.has(cv.id)) return false;
      seen.add(cv.id); return true;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setCvs(merged);
    setCvsLoading(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      if (!u) { router.replace("/"); return; }
      setUser(u);
      setUsername(u.user_metadata?.username ?? "");
      setAvatarUrl(u.user_metadata?.avatar_url ?? null);
      loadCVs(u.id, u.email ?? "");
      supabase.from("profiles")
        .select("is_pro, pro_plan, pro_expires_at, stripe_customer_id")
        .eq("user_id", u.id)
        .single()
        .then(({ data: p }) => setProfile(p as Profile | null));
    });
  }, [router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setSaveError("La foto no puede superar 2MB."); e.target.value = ""; return; }
    setAvatarFile(file); setSaveError(null);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    if (username && username.length < 3) { setSaveError("El nombre debe tener al menos 3 caracteres."); return; }
    const RESERVED = ["hugosoy", "resumika", "admin", "soporte", "support", "help", "root", "superadmin"];
    if (username.trim() && username.trim() !== (user.user_metadata?.username ?? "")) {
      if (RESERVED.includes(username.trim().toLowerCase())) {
        setSaveError("Ese nombre de usuario no está disponible. Elige otro."); return;
      }
      const { data: available } = await supabase.rpc("check_username_available", { uname: username.trim(), exclude_uid: user.id });
      if (available === false) { setSaveError("Ese nombre de usuario ya está en uso. Elige otro."); return; }
    }
    setSaving(true); setSaveError(null);
    try {
      let newAvatarUrl = avatarUrl;
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
        newAvatarUrl = publicUrl;
      }
      const { error } = await supabase.auth.updateUser({ data: { username: username.trim() || null, avatar_url: newAvatarUrl || null } });
      if (error) throw error;
      setAvatarUrl(newAvatarUrl); setAvatarPreview(null); setAvatarFile(null);
      setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar");
    } finally { setSaving(false); }
  };

  const handleRedeemGift = async () => {
    if (!user || !giftCode.trim()) return;
    setGiftLoading(true); setGiftMsg(null);
    try {
      const res = await fetch("/api/gift/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: giftCode.trim(), userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) { setGiftMsg({ ok: false, text: data.error ?? "Error al canjear." }); return; }
      const exp = new Date(data.expires_at).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
      setGiftMsg({ ok: true, text: `¡Código canjeado! Pro activo hasta el ${exp}.` });
      setGiftCode("");
      setProfile(p => p ? { ...p, is_pro: true, pro_plan: "gift", pro_expires_at: data.expires_at } : p);
    } catch { setGiftMsg({ ok: false, text: "Error de conexión." }); }
    finally { setGiftLoading(false); }
  };

  const signOut = async () => { await supabase.auth.signOut(); router.replace("/"); };
  const handleDeleteCV = (id: string) => setCvs(prev => prev.filter(c => c.id !== id));

  const handlePortal = async () => {
    if (!user) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Error al abrir el portal. Intenta de nuevo.");
    } finally {
      setPortalLoading(false);
    }
  };

  if (!user) return null;

  const displayAvatar = avatarPreview ?? avatarUrl;
  const initial = user.email?.[0].toUpperCase() ?? "?";
  const memberSince = new Date(user.created_at).toLocaleDateString("es-MX", { year: "numeric", month: "long" });
  const hasChanges = avatarFile !== null || username !== (user.user_metadata?.username ?? "");
  const inputStyle: React.CSSProperties = { width: "100%", background: "var(--cream)", border: "1px solid var(--border2)", borderRadius: 6, padding: "9px 12px", fontFamily: "inherit", fontSize: 13, color: "var(--ink)", outline: "none" };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .perfil-grid { grid-template-columns: 1fr !important; }
          .perfil-sidebar { position: static !important; }
          .perfil-header { padding: 0 16px !important; }
          .perfil-hero { padding: 20px 16px !important; }
          .perfil-content { padding: 20px 16px 60px !important; }
          .cv-cards-grid { grid-template-columns: 1fr !important; }
          .perfil-hero-inner { flex-wrap: wrap; gap: 12px !important; }
          .perfil-hero-count { margin-left: 0 !important; }
        }
        @media (max-width: 480px) {
          .cv-card-actions { flex-wrap: wrap; }
          .cv-card-actions a, .cv-card-actions button { min-width: calc(50% - 4px) !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "var(--cream)" }}>

        {/* Header */}
        <header className="perfil-header" style={{ background: "var(--paper)", borderBottom: "1px solid var(--border)", padding: "0 64px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 600, fontStyle: "italic", color: "var(--ink)", textDecoration: "none", letterSpacing: "-0.3px" }}>
            resumi<span style={{ color: "var(--green)" }}>ka</span>
          </a>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a href="/crear" style={{ fontSize: 12, color: "var(--green)", fontWeight: 500, textDecoration: "none", border: "1px solid rgba(45,90,61,.25)", borderRadius: 5, padding: "6px 14px", background: "var(--green-bg)" }}>✦ Nuevo CV</a>
            <button onClick={signOut} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 5, padding: "6px 14px", fontSize: 12, color: "var(--muted)", fontFamily: "inherit", cursor: "pointer" }}>Cerrar sesión</button>
          </div>
        </header>

        {/* Hero strip */}
        <div className="perfil-hero" style={{ background: "var(--ink)", padding: "32px 48px" }}>
          <div className="perfil-hero-inner" style={{ maxWidth: 1320, margin: "0 auto", display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "1.5px solid rgba(74,148,98,.4)", background: "rgba(74,148,98,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {displayAvatar ? <img src={displayAvatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "#7dd4a0" }}>{initial}</span>}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 500, color: "#f8f5ef" }}>{user.user_metadata?.username ? `@${user.user_metadata.username}` : user.email}</span>
                {profile?.is_pro && (
                  <span style={{ fontSize: 10, fontWeight: 600, background: "var(--green-bg)", color: "var(--green)", border: "1px solid rgba(45,90,61,.2)", borderRadius: 100, padding: "2px 9px", letterSpacing: "0.3px" }}>✦ Pro</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 3 }}>Miembro desde {memberSince}</div>
            </div>
            <div className="perfil-hero-count" style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 600, color: "#f8f5ef", lineHeight: 1 }}>{cvs.length}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 3 }}>{cvs.length === 1 ? "CV generado" : "CVs generados"}</div>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="perfil-content perfil-grid" style={{ maxWidth: 1320, margin: "0 auto", padding: "32px 64px 80px", display: "grid", gridTemplateColumns: "260px 1fr", gap: 28, alignItems: "start" }}>

          {/* LEFT — Profile settings */}
          <div className="perfil-sidebar" style={{ position: "sticky", top: 72 }}>
            <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 10, padding: "24px 22px" }}>
              <div style={{ fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "var(--hint)", marginBottom: 20, fontWeight: 600 }}>Editar perfil</div>

              {/* Avatar */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 22 }}>
                <div onClick={() => fileInputRef.current?.click()}
                  style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--border)", background: "var(--warm)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
                  {displayAvatar ? <img src={displayAvatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: "var(--green)" }}>{initial}</span>}
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.32)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity .15s" }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "1")} onMouseLeave={e => (e.currentTarget.style.opacity = "0")}>
                    <span style={{ fontSize: 18 }}>📷</span>
                  </div>
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} style={{ fontSize: 11, color: "var(--green)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 500, padding: 0 }}>Cambiar foto</button>
                <p style={{ fontSize: 10, color: "var(--hint)", margin: 0 }}>JPG · PNG · WEBP · Máx. 2MB</p>
                <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileSelect} style={{ display: "none" }} />
              </div>

              {/* Username */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 5, fontWeight: 500 }}>Nombre de perfil</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--hint)", pointerEvents: "none" }}>@</span>
                  <input type="text" placeholder="tunombre" value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 20))}
                    style={{ ...inputStyle, paddingLeft: 26 }} />
                </div>
                <p style={{ fontSize: 10, color: "var(--hint)", marginTop: 4 }}>3–20 caracteres · letras, números, _ y -</p>
              </div>

              {/* Email */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 5, fontWeight: 500 }}>Correo electrónico</label>
                <input type="email" value={user.email ?? ""} readOnly style={{ ...inputStyle, color: "var(--hint)", cursor: "default", background: "var(--warm)" }} />
              </div>

              {saveError && <p style={{ fontSize: 12, color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 5, padding: "8px 10px", marginBottom: 12 }}>{saveError}</p>}

              <button onClick={handleSave} disabled={saving || (!hasChanges && !saveSuccess)}
                style={{ width: "100%", background: saveSuccess ? "var(--green-bg)" : "var(--green)", color: saveSuccess ? "var(--green)" : "#fff", border: saveSuccess ? "1px solid rgba(45,90,61,.25)" : "none", borderRadius: 6, padding: "10px 0", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: (saving || (!hasChanges && !saveSuccess)) ? "default" : "pointer", opacity: saving ? 0.7 : 1, transition: "all .2s" }}>
                {saving ? "Guardando..." : saveSuccess ? "✓ Guardado" : "Guardar cambios"}
              </button>
            </div>

            {/* Plan section */}
            <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 10, padding: "20px 22px", marginTop: 12 }}>
              <div style={{ fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "var(--hint)", marginBottom: 14, fontWeight: 600 }}>Mi plan</div>
              {profile?.is_pro ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{PLAN_LABELS[profile.pro_plan ?? ""] ?? profile.pro_plan}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, background: "var(--green-bg)", color: "var(--green)", border: "1px solid rgba(45,90,61,.2)", borderRadius: 100, padding: "1px 8px" }}>Activo</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--hint)", marginBottom: 16 }}>
                    {profile.pro_expires_at
                      ? `${profile.pro_plan === "gift" ? "Expira el" : "Renueva el"} ${new Date(profile.pro_expires_at).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}`
                      : "Sin vencimiento"}
                  </div>
                  {profile.pro_plan !== "lifetime_mxn" && (
                    <button onClick={handlePortal} disabled={portalLoading}
                      style={{ width: "100%", background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "9px 0", fontSize: 12, color: "var(--muted)", fontFamily: "inherit", cursor: portalLoading ? "default" : "pointer", opacity: portalLoading ? 0.6 : 1 }}>
                      {portalLoading ? "Cargando..." : "Gestionar suscripción →"}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>Plan gratuito</div>
                  <a href="/pago?plan=pro_mxn_founder"
                    style={{ display: "block", textAlign: "center", background: "var(--green)", color: "#fff", borderRadius: 6, padding: "9px 0", fontSize: 12, fontWeight: 500, textDecoration: "none" }}>
                    Actualizar a Pro →
                  </a>
                </>
              )}
            </div>
          </div>

            {/* Gift code */}
            {!profile?.is_pro && (
              <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 10, padding: "20px 22px", marginTop: 12 }}>
                <div style={{ fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "var(--hint)", marginBottom: 14, fontWeight: 600 }}>Código de regalo</div>
                <input
                  type="text"
                  placeholder="RSMK-XXXX-XXXX"
                  value={giftCode}
                  onChange={e => { setGiftCode(e.target.value.toUpperCase()); setGiftMsg(null); }}
                  style={{ ...inputStyle, marginBottom: 8, letterSpacing: "1px", fontFamily: "monospace" }}
                />
                {giftMsg && (
                  <p style={{ fontSize: 11, color: giftMsg.ok ? "var(--green)" : "#b91c1c", background: giftMsg.ok ? "var(--green-bg)" : "#fef2f2", border: `1px solid ${giftMsg.ok ? "rgba(45,90,61,.2)" : "#fecaca"}`, borderRadius: 5, padding: "7px 10px", marginBottom: 8 }}>
                    {giftMsg.text}
                  </p>
                )}
                <button onClick={handleRedeemGift} disabled={giftLoading || !giftCode.trim()}
                  style={{ width: "100%", background: "var(--green)", color: "#fff", border: "none", borderRadius: 6, padding: "10px 0", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: (giftLoading || !giftCode.trim()) ? "default" : "pointer", opacity: (giftLoading || !giftCode.trim()) ? 0.5 : 1 }}>
                  {giftLoading ? "Canjeando..." : "Canjear código"}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — CVs */}
          <div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.5px" }}>Mis CVs</h2>
              <a href="/crear" style={{ fontSize: 12, color: "var(--green)", fontWeight: 500, textDecoration: "none" }}>+ Generar nuevo</a>
            </div>
            {cvsLoading ? (
              <div className="cv-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
                {[1,2,3,4].map(i => <CVCardPerfilSkeleton key={i} />)}
              </div>
            ) : cvs.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="cv-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
                {cvs.map(cv => <CVCard key={cv.id} cv={cv} onDelete={handleDeleteCV} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function CVCard({ cv, onDelete }: { cv: CV; onDelete: (id: string) => void }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const date = new Date(cv.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setShowDeleteModal(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function handleCopy() {
    navigator.clipboard.writeText(`${window.location.origin}/cv/${cv.slug}`);
    setCopied(true); setTimeout(() => setCopied(false), 2200);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/cv/delete", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: cv.id }) });
      if (!res.ok) { const { error } = await res.json(); throw new Error(error); }
      onDelete(cv.id);
    } catch (e) { console.error(e); alert("Error al eliminar. Intenta de nuevo."); }
    finally { setDeleting(false); setShowDeleteModal(false); }
  }

  return (
    <>
      <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px", display: "flex", flexDirection: "column", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 11, background: "var(--green-bg)", color: "var(--green)", borderRadius: 4, padding: "3px 8px", fontWeight: 500, border: "1px solid rgba(45,90,61,.15)" }}>
            {FLAG[cv.mercado]} {MARKET[cv.mercado] ?? cv.mercado}
          </span>
          <span style={{ fontSize: 10, color: "var(--hint)" }}>{date}</span>
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.3px", lineHeight: 1.2, marginBottom: 4 }}>{cv.nombre}</div>
        <div style={{ fontSize: 12, color: "var(--body)", marginBottom: cv.ciudad ? 2 : 14 }}>{cv.puesto}</div>
        {cv.ciudad && <div style={{ fontSize: 11, color: "var(--hint)", marginBottom: 14 }}>📍 {cv.ciudad}</div>}
        <div style={{ height: 1, background: "var(--border)", marginBottom: 12 }} />
        <div className="cv-card-actions" style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          <a href={`/cv/${cv.slug}`} target="_blank" rel="noreferrer"
            style={{ flex: 1, textAlign: "center", fontSize: 12, fontWeight: 500, color: "var(--green)", background: "var(--green-bg)", border: "1px solid rgba(45,90,61,.2)", borderRadius: 6, padding: "7px 0", textDecoration: "none", minWidth: 70 }}>
            Ver →
          </a>
          <button onClick={handleCopy}
            style={{ flex: 1, fontSize: 12, color: copied ? "var(--green)" : "var(--muted)", background: copied ? "var(--green-bg)" : "none", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 0", cursor: "pointer", fontFamily: "inherit", transition: "all .15s", minWidth: 70 }}>
            {copied ? "✓ Copiado" : "Copiar link"}
          </button>
          {/* FIX: ruta correcta /crear?edit= */}
          <button onClick={() => router.push(`/crear?edit=${cv.slug}`)}
            style={{ flex: 1, fontSize: 12, color: "var(--muted)", background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 0", cursor: "pointer", fontFamily: "inherit", minWidth: 60 }}>
            ✏ Editar
          </button>
          <button onClick={() => setShowDeleteModal(true)}
            style={{ flex: 1, fontSize: 12, color: "#dc2626", background: "none", border: "1px solid #fecaca", borderRadius: 6, padding: "7px 0", cursor: "pointer", fontFamily: "inherit", minWidth: 60 }}>
            🗑 Borrar
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div onClick={() => setShowDeleteModal(false)} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 12, padding: 32, maxWidth: 380, width: "90%", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>¿Eliminar este CV?</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24, lineHeight: 1.6 }}>Esta acción no se puede deshacer.<br />El link público dejará de funcionar.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: 10, fontSize: 13, fontFamily: "inherit", cursor: "pointer", color: "var(--body)" }}>Cancelar</button>
              <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, background: "#dc2626", border: "none", borderRadius: 6, padding: 10, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: deleting ? "not-allowed" : "pointer", color: "#fff", opacity: deleting ? 0.7 : 1 }}>
                {deleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "60px 32px", border: "1px dashed var(--border2)", borderRadius: 10 }}>
      <div style={{ fontSize: 36, marginBottom: 14 }}>📄</div>
      <p style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)", marginBottom: 8 }}>Aún no tienes CVs</p>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 22, lineHeight: 1.6 }}>Genera tu primer CV con IA en menos de 3 minutos. Es gratis.</p>
      <a href="/crear" style={{ display: "inline-block", background: "var(--green)", color: "#fff", textDecoration: "none", borderRadius: 6, padding: "10px 24px", fontSize: 13, fontWeight: 500 }}>✦ Generar mi CV</a>
    </div>
  );
}

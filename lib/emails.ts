import { resend } from "./resend";

const FROM = "resumika <hola@resumika.com>";
const BASE_URL = "https://resumika.com";

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f7f4ee;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ee;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4dfd6;">

        <!-- HEADER -->
        <tr>
          <td style="background:#2a5236;padding:28px 40px;text-align:center;">
            <span style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:700;font-style:italic;color:#f7f4ee;letter-spacing:-0.5px;">
              resumi<span style="color:#7dd4a0;">ka</span>
            </span>
          </td>
        </tr>

        <!-- CONTENT -->
        ${content}

        <!-- FOOTER -->
        <tr>
          <td style="padding:18px 40px;border-top:1px solid #e4dfd6;background:#f7f4ee;">
            <p style="font-size:11px;color:#a09a94;margin:0;text-align:center;line-height:1.6;">
              resumika.com · Genera CVs profesionales con IA<br />
              <a href="${BASE_URL}" style="color:#a09a94;text-decoration:none;">resumika.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail(email: string, nombre: string) {
  const displayName = nombre && nombre !== email ? nombre : "allí";

  const content = `
    <tr>
      <td style="padding:40px 40px 32px;">
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#1c1a16;margin:0 0 16px;letter-spacing:-0.5px;font-weight:600;">
          Hola, ${displayName} 👋
        </h1>
        <p style="font-size:15px;color:#4a4640;line-height:1.75;margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;">
          Tu cuenta en <strong>resumika</strong> está lista.
        </p>
        <p style="font-size:15px;color:#4a4640;line-height:1.75;margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;">
          Genera tu primer CV profesional con IA en menos de 3 minutos — diseñado para México, USA y Canadá.
        </p>

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
          <tr>
            <td style="background:#2a5236;border-radius:8px;">
              <a href="${BASE_URL}/crear"
                style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;letter-spacing:0.2px;">
                Crear mi CV →
              </a>
            </td>
          </tr>
        </table>

        <!-- Features -->
        <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;border:1px solid #e4dfd6;border-radius:8px;overflow:hidden;">
          ${[
            ["✦", "Para México, USA y Canadá", "CV adaptado a cada mercado laboral"],
            ["⚡", "Menos de 3 minutos", "Rellena el formulario, la IA hace el resto"],
            ["📄", "PDF listo para enviar", "Descarga tu CV en formato profesional"],
          ].map(([icon, title, desc], i) => `
          <tr style="${i > 0 ? "border-top:1px solid #e4dfd6;" : ""}">
            <td style="padding:14px 18px;width:40px;font-size:18px;vertical-align:top;">${icon}</td>
            <td style="padding:14px 18px 14px 0;vertical-align:top;">
              <strong style="display:block;font-size:13px;color:#1c1a16;font-family:Arial,Helvetica,sans-serif;">${title}</strong>
              <span style="font-size:12px;color:#8a8580;font-family:Arial,Helvetica,sans-serif;">${desc}</span>
            </td>
          </tr>`).join("")}
        </table>

        <p style="font-size:12px;color:#b0a9a2;line-height:1.6;margin:0;font-family:Arial,Helvetica,sans-serif;">
          Si no creaste esta cuenta, puedes ignorar este mensaje.
        </p>
      </td>
    </tr>`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Bienvenido a resumika ✦",
    html: baseLayout(content),
  });
}

export async function sendProEmail(email: string, nombre: string) {
  const displayName = nombre && nombre !== email ? nombre : "allí";

  const benefits = [
    ["🔁", "CVs ilimitados", "México, USA y Canadá sin restricciones"],
    ["🎨", "Todas las plantillas", "Incluidas las plantillas premium"],
    ["✉️", "Carta de presentación con IA", "Genera cartas personalizadas para cada vacante"],
    ["✏️", "Edición sin límites", "Actualiza tu CV cuantas veces quieras"],
  ];

  const content = `
    <tr>
      <td style="padding:0;">
        <!-- Pro badge strip -->
        <div style="background:linear-gradient(135deg,#2a5236,#3d7a52);padding:20px 40px;text-align:center;">
          <span style="display:inline-block;background:rgba(125,212,160,.2);border:1px solid rgba(125,212,160,.4);border-radius:100px;padding:4px 14px;font-size:11px;font-weight:700;color:#7dd4a0;letter-spacing:1px;font-family:Arial,Helvetica,sans-serif;text-transform:uppercase;">
            ✦ Pro activado
          </span>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:40px 40px 32px;">
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#1c1a16;margin:0 0 12px;letter-spacing:-0.5px;font-weight:600;">
          ¡Ya eres Pro, ${displayName}! 🎉
        </h1>
        <p style="font-size:15px;color:#4a4640;line-height:1.75;margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;">
          Tu cuenta ha sido activada. Ahora tienes acceso completo a todas las funciones de resumika.
        </p>

        <!-- Benefits list -->
        <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;border:1px solid #e4dfd6;border-radius:8px;overflow:hidden;">
          ${benefits.map(([icon, title, desc], i) => `
          <tr style="${i > 0 ? "border-top:1px solid #e4dfd6;" : ""}">
            <td style="padding:13px 18px;width:40px;font-size:17px;vertical-align:top;">${icon}</td>
            <td style="padding:13px 18px 13px 0;vertical-align:top;">
              <strong style="display:block;font-size:13px;color:#1c1a16;font-family:Arial,Helvetica,sans-serif;">${title}</strong>
              <span style="font-size:12px;color:#8a8580;font-family:Arial,Helvetica,sans-serif;">${desc}</span>
            </td>
          </tr>`).join("")}
        </table>

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
          <tr>
            <td style="background:#2a5236;border-radius:8px;">
              <a href="${BASE_URL}/crear"
                style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
                Crear mi CV Pro →
              </a>
            </td>
          </tr>
        </table>

        <p style="font-size:12px;color:#b0a9a2;line-height:1.6;margin:0;font-family:Arial,Helvetica,sans-serif;">
          Puedes gestionar tu suscripción en cualquier momento desde tu perfil.
        </p>
      </td>
    </tr>`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "¡Bienvenido a resumika Pro! ✦",
    html: baseLayout(content),
  });
}

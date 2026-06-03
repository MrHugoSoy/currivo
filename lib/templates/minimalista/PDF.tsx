import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import { parseCVText, extractHeader, CVItem } from "../parser";
import type { CVData } from "../types";
import path from "path";

Font.register({
  family: "DMSans",
  fonts: [
    { src: path.join(process.cwd(), "public/fonts/DMSans-Regular.ttf"), fontWeight: 400 },
    { src: path.join(process.cwd(), "public/fonts/DMSans-Bold.ttf"), fontWeight: 700 },
  ],
});

const C = {
  primario: "#1a1814", texto: "#4a443c",
  muted: "#8a8278", hint: "#b0a89e",
  fondo: "#f7f4ee", border: "#ddd7c8",
};

const s = StyleSheet.create({
  page:    { fontFamily: "DMSans", backgroundColor: C.fondo, paddingTop: 48, paddingBottom: 40, paddingLeft: 52, paddingRight: 52, fontSize: 10 },
  name:    { fontSize: 28, fontWeight: 700, color: C.primario, letterSpacing: 0.5 },
  sub:     { fontSize: 12, color: C.muted, marginTop: 5 },
  contact: { fontSize: 9, color: C.hint, marginTop: 6 },
  divider: { height: 0.5, backgroundColor: C.border, marginTop: 16, marginBottom: 20 },
  secRow:  { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  secTxt:  { fontSize: 8.5, color: C.muted, fontWeight: 700, letterSpacing: 1.5 },
  secLine: { flex: 1, height: 0.5, backgroundColor: C.border, marginLeft: 12 },
  jRow:    { flexDirection: "row", justifyContent: "space-between", marginBottom: 1 },
  jTitle:  { fontSize: 11, color: C.primario, fontWeight: 400 },
  jMeta:   { fontSize: 9, color: C.muted },
  jDate:   { fontSize: 9, color: C.hint },
  bRow:    { flexDirection: "row", marginTop: 2, paddingLeft: 10 },
  bMark:   { fontSize: 9, color: C.hint, marginRight: 6 },
  bTxt:    { fontSize: 9, color: C.texto, flex: 1, lineHeight: 1.7 },
  para:    { fontSize: 9.5, color: C.texto, lineHeight: 1.8, marginBottom: 3 },
});

export default function MinimalistaPDF({ data }: { data: CVData }) {
  const sections = parseCVText(data.cv_text);
  const hdr = extractHeader(data.cv_text);
  const name = hdr.name || data.nombre;
  const subtitle = hdr.subtitle || data.puesto;
  const contacts = hdr.contacts.length ? hdr.contacts : [data.ciudad, data.email].filter(Boolean) as string[];
  const main = sections.filter((sec) => sec.title !== "");

  return (
    <Document>
      <Page size={data.mercado === "mx" ? "A4" : "LETTER"} style={s.page}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 0 }}>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{name}</Text>
            {subtitle ? <Text style={s.sub}>{subtitle}</Text> : null}
            {contacts.length ? <Text style={s.contact}>{contacts.join("  ·  ")}</Text> : null}
          </View>
          {data.mercado === "mx" && data.photoUrl ? <Image src={data.photoUrl} style={{ width: 64, height: 64, borderRadius: 4, marginLeft: 16 }} /> : null}
        </View>
        <View style={s.divider} />
        {main.map((sec, i) => (
          <View key={i} style={{ marginBottom: 16 }}>
            <View style={s.secRow}>
              <Text style={s.secTxt}>{sec.title}</Text>
              <View style={s.secLine} />
            </View>
            {sec.items.map((item, j) => <MinPDFItem key={j} item={item} isSkill={/skill|habilidad|competenc/i.test(sec.title)} />)}
          </View>
        ))}
      </Page>
    </Document>
  );
}

function MinPDFItem({ item, isSkill }: { item: CVItem; isSkill: boolean }) {
  if (item.type === "education") {
    return (
      <View wrap={false} style={{ marginBottom: 10 }}>
        <View style={s.jRow}>
          <Text style={s.jTitle}>{item.title ?? ""}</Text>
          {item.date ? <Text style={s.jDate}>{item.date}</Text> : null}
        </View>
        {item.subtitle ? <Text style={s.jMeta}>{item.subtitle}</Text> : null}
      </View>
    );
  }
  if (item.type === "skills") {
    const parts = (item.content ?? "").split(" | ").map((t) => t.trim()).filter(Boolean);
    return <Text style={{ ...s.para, color: C.muted }}>{parts.join("  ·  ")}</Text>;
  }
  if (item.type === "job") {
    return (
      <View wrap={false} style={{ marginBottom: 12 }}>
        <View style={s.jRow}>
          <Text style={s.jTitle}>{item.title ?? ""}</Text>
          {item.date ? <Text style={s.jDate}>{item.date}</Text> : null}
        </View>
        {(item.subtitle || item.location) ? <Text style={s.jMeta}>{[item.subtitle, item.location].filter(Boolean).join(" · ")}</Text> : null}
        {(item.bullets ?? []).map((b, i) => (
          <View key={i} style={s.bRow}>
            <Text style={s.bMark}>–</Text>
            <Text style={s.bTxt}>{b}</Text>
          </View>
        ))}
      </View>
    );
  }
  if (item.type === "bullet") {
    return (
      <View style={s.bRow}>
        <Text style={s.bMark}>–</Text>
        <Text style={s.bTxt}>{item.content ?? ""}</Text>
      </View>
    );
  }
  const content = item.content ?? "";
  if (isSkill || content.includes(" | ") || content.split(",").length > 3) {
    const parts = content.split(/[|,]/).map((t) => t.trim()).filter(Boolean);
    return <Text style={{ ...s.para, color: C.muted }}>{parts.join("  ·  ")}</Text>;
  }
  return <Text style={s.para}>{content}</Text>;
}

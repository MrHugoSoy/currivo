import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import { parseCVText, extractHeader, CVItem } from "../parser";
import type { CVData } from "../types";
import path from "path";

Font.register({
  family: "DMSans",
  fonts: [
    { src: path.join(process.cwd(), "public/fonts/DMSans-Regular.ttf"), fontWeight: 400 },
    { src: path.join(process.cwd(), "public/fonts/DMSans-Bold.ttf"),    fontWeight: 700 },
  ],
});

const C = {
  header:   "#1e3a5f",
  acento:   "#2b6cb0",
  fondo:    "#ffffff",
  texto:    "#2d3748",
  hint:     "#718096",
  border:   "#e2e8f0",
  accentBg: "#ebf4ff",
};

const s = StyleSheet.create({
  page:     { fontFamily: "DMSans", backgroundColor: C.fondo, paddingBottom: 40, fontSize: 10 },
  hBand:    { backgroundColor: C.header, paddingTop: 28, paddingBottom: 24, paddingLeft: 40, paddingRight: 40, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  hText:    { flex: 1 },
  hName:    { fontSize: 24, fontWeight: 700, color: "#ffffff", letterSpacing: -0.5 },
  hSub:     { fontSize: 11, color: "#93c5fd", marginTop: 4, fontWeight: 700 },
  hContact: { fontSize: 8.5, color: "rgba(255,255,255,0.6)", marginTop: 6 },
  stripe:   { height: 3, backgroundColor: C.acento },
  body:     { paddingTop: 22, paddingLeft: 40, paddingRight: 40 },
  secRow:   { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  secBar:   { width: 2.5, height: 11, backgroundColor: C.acento, borderRadius: 1, marginRight: 8 },
  secTxt:   { fontSize: 7, color: C.header, fontWeight: 700, letterSpacing: 2.5 },
  secLine:  { flex: 1, height: 0.5, backgroundColor: C.border, marginLeft: 8 },
  secWrap:  { marginBottom: 16 },
  jWrap:    { marginBottom: 10, paddingLeft: 11, borderLeft: `1.5px solid ${C.border}` as any },
  jRow:     { flexDirection: "row", justifyContent: "space-between" },
  jTitle:   { fontSize: 11, fontWeight: 700, color: C.header },
  jDate:    { fontSize: 8.5, color: C.hint },
  jMeta:    { fontSize: 9, color: C.acento, marginTop: 2, fontWeight: 700 },
  bRow:     { flexDirection: "row", marginTop: 2 },
  bMark:    { fontSize: 8, color: C.acento, marginRight: 5, marginTop: 1 },
  bTxt:     { fontSize: 9, color: C.texto, flex: 1, lineHeight: 1.5 },
  tagRow:   { flexDirection: "row", flexWrap: "wrap" },
  tag:      { fontSize: 8, color: C.acento, backgroundColor: C.accentBg, paddingLeft: 7, paddingRight: 7, paddingTop: 2.5, paddingBottom: 2.5, borderRadius: 2, marginRight: 4, marginBottom: 4 },
  para:     { fontSize: 9, color: C.texto, lineHeight: 1.6, marginBottom: 3 },
  photo:    { width: 64, height: 64, borderRadius: 4, marginLeft: 16 },
});

export default function EjecutivoPDF({ data }: { data: CVData }) {
  const sections = parseCVText(data.cv_text);
  const hdr      = extractHeader(data.cv_text);
  const name     = hdr.name || data.nombre;
  const subtitle = hdr.subtitle || (data.mercado === "mx" ? data.puesto : "");
  const contacts = hdr.contacts.length
    ? hdr.contacts
    : [data.ciudad, data.email].filter(Boolean) as string[];
  const main     = sections.filter(sec => sec.title !== "");
  const isMx     = data.mercado === "mx";
  const showPhoto = isMx && !!data.photoUrl;

  return (
    <Document>
      <Page size={isMx ? "A4" : "LETTER"} style={s.page}>

        <View style={s.hBand}>
          <View style={s.hText}>
            <Text style={s.hName}>{name}</Text>
            {subtitle ? <Text style={s.hSub}>{subtitle}</Text> : null}
            {contacts.length > 0 ? <Text style={s.hContact}>{contacts.join("  ·  ")}</Text> : null}
          </View>
          {showPhoto && <Image src={data.photoUrl!} style={s.photo} />}
        </View>

        <View style={s.stripe} />

        <View style={s.body}>
          {main.map((sec, i) => (
            <View key={i} style={s.secWrap}>
              <View style={s.secRow}>
                <View style={s.secBar} />
                <Text style={s.secTxt}>{sec.title}</Text>
                <View style={s.secLine} />
              </View>
              {sec.items.map((item, j) => <PDFItem key={j} item={item} />)}
            </View>
          ))}
        </View>

      </Page>
    </Document>
  );
}

function PDFItem({ item }: { item: CVItem }) {
  if (item.type === "job") {
    return (
      <View wrap={false} style={s.jWrap}>
        <View style={s.jRow}>
          <Text style={s.jTitle}>{item.title ?? ""}</Text>
          {item.date ? <Text style={s.jDate}>{item.date}</Text> : null}
        </View>
        {(item.subtitle || item.location) ? (
          <Text style={s.jMeta}>{[item.subtitle, item.location].filter(Boolean).join(" · ")}</Text>
        ) : null}
        {item.content ? <Text style={{ ...s.para, marginTop: 2 }}>{item.content}</Text> : null}
        {(item.bullets ?? []).map((b, i) => (
          <View key={i} style={s.bRow}>
            <Text style={s.bMark}>▸</Text>
            <Text style={s.bTxt}>{b}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (item.type === "education") {
    return (
      <View wrap={false} style={{ ...s.jWrap, marginBottom: 8 }}>
        <View style={s.jRow}>
          <Text style={s.jTitle}>{item.title ?? ""}</Text>
          {item.date ? <Text style={s.jDate}>{item.date}</Text> : null}
        </View>
        {item.subtitle ? <Text style={{ fontSize: 9, color: C.hint, marginTop: 2 }}>{item.subtitle}</Text> : null}
      </View>
    );
  }

  if (item.type === "skills") {
    const tags = (item.content ?? "").split(/[|,]/).map(t => t.trim()).filter(Boolean);
    return (
      <View style={s.tagRow}>
        {tags.map((tag, i) => <Text key={i} style={s.tag}>{tag}</Text>)}
      </View>
    );
  }

  if (item.type === "bullet") {
    return (
      <View style={s.bRow}>
        <Text style={s.bMark}>▸</Text>
        <Text style={s.bTxt}>{item.content ?? ""}</Text>
      </View>
    );
  }

  const content = item.content ?? "";
  const parts = content.split(/[|,]/).map(t => t.trim()).filter(Boolean);
  if ((content.includes(" | ") || content.split(",").length > 2) && parts.every(p => p.length <= 35)) {
    return (
      <View style={s.tagRow}>
        {parts.map((tag, i) => <Text key={i} style={s.tag}>{tag}</Text>)}
      </View>
    );
  }
  return <Text style={s.para}>{content}</Text>;
}

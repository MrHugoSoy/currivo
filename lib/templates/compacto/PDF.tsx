import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";
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
  acento: "#16a34a",
  fondo:  "#ffffff",
  texto:  "#111827",
  hint:   "#6b7280",
  tagBg:  "#f0fdf4",
  tagTx:  "#15803d",
};

const s = StyleSheet.create({
  page:      { fontFamily: "DMSans", backgroundColor: C.fondo, paddingBottom: 40, fontSize: 10 },
  topBar:    { height: 3, backgroundColor: C.acento },
  header:    { paddingTop: 24, paddingBottom: 16, paddingLeft: 40, paddingRight: 40 },
  name:      { fontSize: 24, fontWeight: 700, color: C.texto, letterSpacing: -0.8 },
  sub:       { fontSize: 11, color: C.hint, marginTop: 3 },
  contact:   { fontSize: 8.5, color: C.hint, marginTop: 7 },
  divider:   { height: 1.5, backgroundColor: C.texto, marginLeft: 40, marginRight: 40 },
  body:      { paddingTop: 18, paddingLeft: 40, paddingRight: 40 },
  secWrap:   { marginBottom: 14 },
  secLabel:  { fontSize: 7, color: C.texto, fontWeight: 700, letterSpacing: 2.5, paddingBottom: 4 },
  secLine:   { height: 2, backgroundColor: C.acento, marginBottom: 7 },
  jTitle:    { fontSize: 11, fontWeight: 700, color: C.texto },
  jDate:     { fontSize: 8.5, color: C.hint },
  jRow:      { flexDirection: "row", justifyContent: "space-between" },
  jMeta:     { fontSize: 9, color: C.hint, marginTop: 1 },
  jWrap:     { marginBottom: 9 },
  bRow:      { flexDirection: "row", marginTop: 1 },
  bMark:     { fontSize: 9, color: C.acento, marginRight: 5 },
  bTxt:      { fontSize: 9, color: C.texto, flex: 1, lineHeight: 1.5 },
  tagRow:    { flexDirection: "row", flexWrap: "wrap" },
  tag:       { fontSize: 8, color: C.tagTx, backgroundColor: C.tagBg, paddingLeft: 7, paddingRight: 7, paddingTop: 2, paddingBottom: 2, borderRadius: 20, marginRight: 4, marginBottom: 4 },
  para:      { fontSize: 9, color: C.texto, lineHeight: 1.6, marginBottom: 3 },
});

export default function CompactoPDF({ data }: { data: CVData }) {
  const sections = parseCVText(data.cv_text);
  const hdr      = extractHeader(data.cv_text);
  const name     = hdr.name || data.nombre;
  const subtitle = hdr.subtitle || (data.mercado === "mx" ? data.puesto : "");
  const contacts = hdr.contacts.length
    ? hdr.contacts
    : [data.ciudad, data.email].filter(Boolean) as string[];
  const main     = sections.filter(sec => sec.title !== "");
  const isMx     = data.mercado === "mx";

  return (
    <Document>
      <Page size={isMx ? "A4" : "LETTER"} style={s.page}>

        <View style={s.topBar} />

        <View style={s.header}>
          <Text style={s.name}>{name}</Text>
          {subtitle ? <Text style={s.sub}>{subtitle}</Text> : null}
          {contacts.length > 0 ? <Text style={s.contact}>{contacts.join("  |  ")}</Text> : null}
        </View>

        <View style={s.divider} />

        <View style={s.body}>
          {main.map((sec, i) => (
            <View key={i} style={s.secWrap}>
              <Text style={s.secLabel}>{sec.title}</Text>
              <View style={s.secLine} />
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
            <Text style={s.bMark}>–</Text>
            <Text style={s.bTxt}>{b}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (item.type === "education") {
    return (
      <View wrap={false} style={{ ...s.jWrap, marginBottom: 7 }}>
        <View style={s.jRow}>
          <Text style={s.jTitle}>{item.title ?? ""}</Text>
          {item.date ? <Text style={s.jDate}>{item.date}</Text> : null}
        </View>
        {item.subtitle ? <Text style={s.jMeta}>{item.subtitle}</Text> : null}
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
        <Text style={s.bMark}>–</Text>
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

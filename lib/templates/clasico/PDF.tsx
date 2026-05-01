import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";
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
  primario: "#1a1814", acento: "#2a5236", fondo: "#fffefc",
  texto: "#4a443c", hint: "#8a8278", border: "#ddd7c8",
  greenBg: "#edf4ef", greenMid: "#4a9060",
};

const s = StyleSheet.create({
  page:    { fontFamily: "DMSans", backgroundColor: C.fondo, paddingTop: 40, paddingBottom: 40, paddingLeft: 44, paddingRight: 44, fontSize: 10 },
  name:    { fontSize: 26, fontWeight: 700, color: C.primario, letterSpacing: -0.5 },
  sub:     { fontSize: 12, color: C.acento, marginTop: 4, fontWeight: 700 },
  contact: { fontSize: 9, color: C.hint, marginTop: 5 },
  divider: { height: 1.5, backgroundColor: C.primario, marginTop: 10, marginBottom: 14 },
  secRow:  { flexDirection: "row", alignItems: "center", marginBottom: 7 },
  secTxt:  { fontSize: 7, color: C.hint, fontWeight: 700, letterSpacing: 2 },
  secLine: { flex: 1, height: 0.5, backgroundColor: C.border, marginLeft: 8 },
  jTitle:  { fontSize: 11, fontWeight: 700, color: C.primario },
  jMeta:   { fontSize: 9, color: C.hint, marginTop: 2 },
  bRow:    { flexDirection: "row", marginTop: 3 },
  bMark:   { fontSize: 8, color: C.greenMid, marginRight: 5, marginTop: 1 },
  bTxt:    { fontSize: 9, color: C.texto, flex: 1, lineHeight: 1.5 },
  para:    { fontSize: 10, color: C.texto, lineHeight: 1.6, marginBottom: 3 },
  tagRow:  { flexDirection: "row", flexWrap: "wrap" },
  tag:     { fontSize: 8.5, color: C.acento, backgroundColor: C.greenBg, paddingLeft: 7, paddingRight: 7, paddingTop: 3, paddingBottom: 3, borderRadius: 2, marginRight: 4, marginBottom: 4 },
});

export default function ClasicoPDF({ data }: { data: CVData }) {
  const sections = parseCVText(data.cv_text);
  const hdr = extractHeader(data.cv_text);
  const name = hdr.name || data.nombre;
  const subtitle = hdr.subtitle || data.puesto;
  const contacts = [...hdr.contacts, ...(hdr.contacts.length ? [] : [data.ciudad, data.email].filter(Boolean) as string[])];
  const main = sections.filter((sec) => sec.title !== "");

  return (
    <Document>
      <Page size={data.mercado === "mx" ? "A4" : "LETTER"} style={s.page}>
        <Text style={s.name}>{name}</Text>
        {subtitle ? <Text style={s.sub}>{subtitle}</Text> : null}
        {contacts.length > 0 ? <Text style={s.contact}>{contacts.join(" · ")}</Text> : null}
        <View style={s.divider} />
        {main.map((sec, i) => (
          <View key={i} style={{ marginBottom: 12 }}>
            <View style={s.secRow}>
              <Text style={s.secTxt}>{sec.title}</Text>
              <View style={s.secLine} />
            </View>
            {sec.items.map((item, j) => <PDFItem key={j} item={item} />)}
          </View>
        ))}
      </Page>
    </Document>
  );
}

function PDFItem({ item }: { item: CVItem }) {
  if (item.type === "education") {
    return (
      <View wrap={false} style={{ marginBottom: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={s.jTitle}>{item.title ?? ""}</Text>
          {item.date ? <Text style={{ fontSize: 8.5, color: C.hint }}>{item.date}</Text> : null}
        </View>
        {item.subtitle ? <Text style={s.jMeta}>{item.subtitle}</Text> : null}
      </View>
    );
  }
  if (item.type === "skills") {
    const tags = (item.content ?? "").split(" | ").map((t) => t.trim()).filter(Boolean);
    return (
      <View style={s.tagRow}>
        {tags.map((tag, i) => <Text key={i} style={s.tag}>{tag}</Text>)}
      </View>
    );
  }
  if (item.type === "job") {
    return (
      <View wrap={false} style={{ marginBottom: 9 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={s.jTitle}>{item.title ?? ""}</Text>
          {item.date ? <Text style={{ fontSize: 8.5, color: C.hint }}>{item.date}</Text> : null}
        </View>
        {(item.subtitle || item.location) ? (
          <Text style={s.jMeta}>{[item.subtitle, item.location].filter(Boolean).join(" · ")}</Text>
        ) : null}
        {item.content ? <Text style={{ ...s.para, marginTop: 2 }}>{item.content}</Text> : null}
        {(item.bullets ?? []).map((b, i) => (
          <View key={i} style={s.bRow}>
            <Text style={s.bMark}>-</Text>
            <Text style={s.bTxt}>{b}</Text>
          </View>
        ))}
      </View>
    );
  }
  if (item.type === "bullet") {
    return (
      <View style={s.bRow}>
        <Text style={s.bMark}>-</Text>
        <Text style={s.bTxt}>{item.content ?? ""}</Text>
      </View>
    );
  }
  const content = item.content ?? "";
  if (content.includes(" | ") || content.split(",").length > 2) {
    const tags = content.split(/[|,]/).map((t) => t.trim()).filter(Boolean);
    return (
      <View style={s.tagRow}>
        {tags.map((tag, i) => <Text key={i} style={s.tag}>{tag}</Text>)}
      </View>
    );
  }
  return <Text style={s.para}>{content}</Text>;
}

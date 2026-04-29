import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import { parseCVText, extractHeader, extractSkills, extractLanguages, skillLevel, CVItem } from "../parser";
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
  sidebar: "#2a5236", fondo: "#fffefc", primario: "#1a1814",
  texto: "#4a443c", hint: "#8a8278", border: "#ddd7c8",
  greenLight: "#7dd4a0", sidebarMuted: "rgba(255,255,255,0.5)",
  sidebarText: "rgba(255,255,255,0.9)",
};

const s = StyleSheet.create({
  page:      { fontFamily: "DMSans", backgroundColor: C.fondo, flexDirection: "row", fontSize: 10 },
  sidebar:   { width: "30%", backgroundColor: C.sidebar, padding: 24 },
  main:      { flex: 1, padding: 28 },
  name:      { fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.2 },
  subS:      { fontSize: 11, color: C.greenLight, marginTop: 3, marginBottom: 14, fontWeight: 700 },
  contactS:  { fontSize: 9, color: C.sidebarMuted, marginBottom: 4 },
  secLabelS: { fontSize: 7, color: C.sidebarMuted, fontWeight: 700, letterSpacing: 2, marginBottom: 8, marginTop: 14 },
  skillName: { fontSize: 9, color: C.sidebarText, marginBottom: 2 },
  barBg:     { height: 2.5, backgroundColor: "rgba(255,255,255,.15)", borderRadius: 2 },
  barFill:   { height: "100%", backgroundColor: C.greenLight, borderRadius: 2 },
  langTxt:   { fontSize: 9, color: C.sidebarText, marginBottom: 4 },
  secRow:    { flexDirection: "row", alignItems: "center", marginBottom: 7 },
  secBar:    { width: 2.5, height: 12, backgroundColor: C.sidebar, borderRadius: 1, marginRight: 8 },
  secTxt:    { fontSize: 7.5, color: C.primario, fontWeight: 700, letterSpacing: 1.5 },
  jTitle:    { fontSize: 11, fontWeight: 700, color: C.primario },
  jMeta:     { fontSize: 9, color: C.hint, marginTop: 1 },
  bRow:      { flexDirection: "row", marginTop: 2 },
  bMark:     { fontSize: 9, color: C.sidebar, marginRight: 5 },
  bTxt:      { fontSize: 9, color: C.texto, flex: 1, lineHeight: 1.5 },
  para:      { fontSize: 9.5, color: C.texto, lineHeight: 1.6, marginBottom: 3 },
});

export default function ModernoPDF({ data }: { data: CVData }) {
  const sections = parseCVText(data.cv_text);
  const hdr = extractHeader(data.cv_text);
  const name = hdr.name || data.nombre;
  const subtitle = hdr.subtitle || data.puesto;
  const contacts = hdr.contacts.length ? hdr.contacts : [data.ciudad, data.email].filter(Boolean) as string[];
  const skills = extractSkills(sections);
  const langs = extractLanguages(sections);
  const main = sections.filter((sec) => sec.title !== "" && !/skill|habilidad|idioma|language|langue/i.test(sec.title));

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Sidebar */}
        <View style={s.sidebar}>
          <Text style={s.name}>{name}</Text>
          {subtitle ? <Text style={s.subS}>{subtitle}</Text> : null}
          {contacts.map((c, i) => <Text key={i} style={s.contactS}>{c}</Text>)}

          {skills.length > 0 ? (
            <>
              <Text style={s.secLabelS}>SKILLS</Text>
              {skills.slice(0, 8).map((sk) => (
                <View key={sk} style={{ marginBottom: 7 }}>
                  <Text style={s.skillName}>{sk}</Text>
                  <View style={s.barBg}>
                    <View style={{ ...s.barFill, width: `${skillLevel(sk)}%` }} />
                  </View>
                </View>
              ))}
            </>
          ) : null}

          {langs.length > 0 ? (
            <>
              <Text style={s.secLabelS}>LANGUAGES</Text>
              {langs.map((l, i) => <Text key={i} style={s.langTxt}>{l}</Text>)}
            </>
          ) : null}
        </View>

        {/* Main */}
        <View style={s.main}>
          {main.map((sec, i) => (
            <View key={i} style={{ marginBottom: 12 }}>
              <View style={s.secRow}>
                <View style={s.secBar} />
                <Text style={s.secTxt}>{sec.title}</Text>
              </View>
              {sec.items.map((item, j) => <MPDFItem key={j} item={item} />)}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

function MPDFItem({ item }: { item: CVItem }) {
  if (item.type === "job") {
    return (
      <View style={{ marginBottom: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={s.jTitle}>{item.title ?? ""}</Text>
          {item.date ? <Text style={{ fontSize: 8.5, color: C.hint }}>{item.date}</Text> : null}
        </View>
        {(item.subtitle || item.location) ? <Text style={s.jMeta}>{[item.subtitle, item.location].filter(Boolean).join(" · ")}</Text> : null}
        {(item.bullets ?? []).map((b, i) => (
          <View key={i} style={s.bRow}>
            <Text style={s.bMark}>·</Text>
            <Text style={s.bTxt}>{b}</Text>
          </View>
        ))}
      </View>
    );
  }
  if (item.type === "bullet") {
    return (
      <View style={s.bRow}>
        <Text style={s.bMark}>·</Text>
        <Text style={s.bTxt}>{item.content ?? ""}</Text>
      </View>
    );
  }
  return <Text style={s.para}>{item.content ?? ""}</Text>;
}

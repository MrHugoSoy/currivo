import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import path from "path";

Font.register({
  family: "DMSans",
  fonts: [
    { src: path.join(process.cwd(), "public/fonts/DMSans-Regular.ttf"), fontWeight: 400 },
    { src: path.join(process.cwd(), "public/fonts/DMSans-Bold.ttf"),    fontWeight: 700 },
  ],
});

const s = StyleSheet.create({
  page:  { fontFamily: "DMSans", backgroundColor: "#ffffff", paddingTop: 52, paddingBottom: 52, paddingLeft: 60, paddingRight: 60, fontSize: 11 },
  name:  { fontSize: 20, fontWeight: 700, color: "#1a1814", letterSpacing: -0.3 },
  meta:  { fontSize: 10, color: "#8a8278", marginTop: 4, marginBottom: 24 },
  bar:   { height: 2, backgroundColor: "#2a5236", marginBottom: 28 },
  para:  { fontSize: 11, color: "#2d3748", lineHeight: 1.85, marginBottom: 14 },
});

interface Props {
  text:     string;
  nombre:   string;
  puesto:   string;
  empresa?: string;
  mercado:  string;
}

export default function CoverLetterPDF({ text, nombre, puesto, empresa, mercado }: Props) {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  const isMx = mercado === "mx";

  return (
    <Document>
      <Page size={isMx ? "A4" : "LETTER"} style={s.page}>
        <Text style={s.name}>{nombre}</Text>
        <Text style={s.meta}>{[puesto, empresa].filter(Boolean).join("  ·  ")}</Text>
        <View style={s.bar} />
        {paragraphs.map((p, i) => (
          <Text key={i} style={s.para}>{p.replace(/\n/g, " ").trim()}</Text>
        ))}
      </Page>
    </Document>
  );
}

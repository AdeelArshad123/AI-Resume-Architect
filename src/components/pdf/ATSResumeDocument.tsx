"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeModel } from "@/types/resume";

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    fontFamily: "Helvetica"
  },
  section: { marginBottom: 12 },
  heading: { fontSize: 12, marginBottom: 6, fontWeight: 700 },
  subheading: { fontSize: 10, marginBottom: 2, fontWeight: 700 },
  text: { lineHeight: 1.35 },
  bullets: { marginTop: 4, marginLeft: 10 },
  bullet: { marginBottom: 3 }
});

function SafeText({ children }: { children: string }) {
  return <Text style={styles.text}>{children}</Text>;
}

export function ATSResumeDocument({ resume }: { resume: ResumeModel }) {
  const profile = resume.profile;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: 800 }}>{profile.name}</Text>
          <Text style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>{profile.headline}</Text>
          <View style={{ marginTop: 6 }}>
            <SafeText>{profile.summary}</SafeText>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Skills</Text>
          <Text style={styles.text}>{resume.skills.join(", ") || "—"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Experience</Text>
          {resume.experiences.length ? (
            resume.experiences.map((exp) => (
              <View key={exp.id} style={{ marginBottom: 10 }}>
                <Text style={styles.subheading}>{exp.title}</Text>
                {exp.company ? <Text style={styles.text}>{exp.company}</Text> : null}
                {exp.start || exp.end ? (
                  <Text style={styles.text}>
                    {[exp.start, exp.end].filter(Boolean).join(" - ")}
                  </Text>
                ) : null}
                {exp.bullets.length ? (
                  <View style={styles.bullets}>
                    {exp.bullets.map((b, idx) => (
                      <Text key={idx} style={styles.bullet}>
                        {"• " + b}
                      </Text>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.text}>—</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.text}>Interview to generate STAR bullets.</Text>
          )}
        </View>
      </Page>
    </Document>
  );
}


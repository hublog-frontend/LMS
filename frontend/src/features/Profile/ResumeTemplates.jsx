import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts if needed (optional for basic ATS)
// Font.register({ family: 'Inter', src: '...' });

const colors = {
  primary: "#2160ad",
  text: "#333",
  lightText: "#666",
  border: "#eee",
  sidebar: "#f8f9fa",
  accent: "#184a86",
};

const styles = StyleSheet.create({
  // Classic Template Styles
  classicPage: {
    padding: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.6,
    color: colors.text,
  },
  classicHeader: {
    marginBottom: 25,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  classicName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    letterSpacing: 2,
    lineHeight: 1.2,
    textAlign: "center",
  },
  classicContact: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    fontSize: 9,
    color: colors.lightText,
  },
  classicContactItem: {
    marginHorizontal: 6,
  },
  classicSection: {
    marginTop: 20,
  },
  classicSectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  classicItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  classicItemTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000",
  },
  classicItemSubtitle: {
    fontSize: 10,
    color: colors.lightText,
    marginBottom: 4,
    fontStyle: "italic",
  },
  classicDate: {
    fontSize: 10,
    color: colors.lightText,
  },
  classicContent: {
    fontSize: 10,
    color: colors.text,
    textAlign: "justify",
  },

  // Modern Template Styles (Two-Column)
  modernPage: {
    flexDirection: "row",
    fontFamily: "Helvetica",
  },
  modernLeft: {
    width: "32%",
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 30,
    height: "100%",
  },
  modernRight: {
    width: "68%",
    padding: 40,
    backgroundColor: "#fff",
  },
  modernSidebarName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#fff",
    textAlign: "center",
    textTransform: "uppercase",
  },
  modernSidebarTitle: {
    fontSize: 12,
    color: "#bbb",
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 1,
  },
  modernSiderbarSection: {
    marginBottom: 25,
  },
  modernSidebarHeading: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 5,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  modernSidebarItem: {
    fontSize: 9,
    marginBottom: 6,
    color: "#ddd",
  },
  modernMainName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  modernMainJob: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 25,
    fontWeight: "medium",
  },
  modernMainSection: {
    marginBottom: 25,
  },
  modernMainHeading: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Executive Minimalist Styles
  execPage: {
    padding: 60,
    fontFamily: "Helvetica",
    color: "#2c3e50",
    fontSize: 10,
  },
  execHeader: {
    marginBottom: 40,
  },
  execName: {
    fontSize: 34,
    fontWeight: "bold",
    letterSpacing: 3,
    color: "#000",
    marginBottom: 8,
    lineHeight: 1.2,
  },
  execJob: {
    fontSize: 12,
    letterSpacing: 2,
    color: colors.primary,
    marginBottom: 15,
  },
  execContact: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "center",
    fontSize: 9,
    color: "#666",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  execContactItem: {
    marginRight: 12,
    marginLeft: 12,
  },
  execSection: {
    marginBottom: 25,
  },
  execSectionTitle: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "bold",
    color: "#000",
    textTransform: "uppercase",
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: 10,
  },
});

// Component for Date Formatting
const DateText = ({ startM, startY, endM, endY, isPresent }) => (
  <Text>
    {startM}/{startY} — {isPresent == 1 ? "Present" : `${endM}/${endY}`}
  </Text>
);

// Template 1: Premium Classic
export const ClassicResume = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.classicPage}>
      <View style={styles.classicHeader}>
        <Text style={styles.classicName}>{data?.user_name || ""}</Text>
        <View style={styles.classicContact}>
          <Text style={styles.classicContactItem}>{data?.email || ""}</Text>
          <Text>|</Text>
          <Text style={styles.classicContactItem}>{data?.phone || ""}</Text>
          {data?.linked_in && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text>|</Text>
              <Text style={styles.classicContactItem}>
                LinkedIn {data?.linked_in}
              </Text>
            </View>
          )}
          <Text>|</Text>
          <Text style={styles.classicContactItem}>
            {data?.current_city || ""}
          </Text>
        </View>
      </View>

      {data?.summary && (
        <View style={styles.classicSection}>
          <Text style={styles.classicSectionTitle}>Executive Summary</Text>
          <Text style={styles.classicContent}>{data.summary}</Text>
        </View>
      )}

      {data?.experience?.length > 0 && (
        <View style={styles.classicSection}>
          <Text style={styles.classicSectionTitle}>
            Professional Experience
          </Text>
          {data.experience.map((exp, i) => (
            <View key={i} style={{ marginBottom: 15 }}>
              <View style={styles.classicItemHeader}>
                <Text style={styles.classicItemTitle}>
                  {exp.job_title || ""} @ {exp.company_name || ""}
                </Text>
                <Text style={styles.classicDate}>
                  <DateText
                    startM={exp.start_month}
                    startY={exp.start_year}
                    endM={exp.end_month}
                    endY={exp.end_year}
                    isPresent={exp.is_present_company}
                  />
                </Text>
              </View>
              <Text style={styles.classicItemSubtitle}>
                {exp.location || ""}
              </Text>
              <Text style={styles.classicContent}>
                • {exp.responsibility || ""}
              </Text>
            </View>
          ))}
        </View>
      )}

      {data?.education?.length > 0 && (
        <View style={styles.classicSection}>
          <Text style={styles.classicSectionTitle}>Education</Text>
          {data.education.map((edu, i) => (
            <View key={i} style={{ marginBottom: 12 }}>
              <View style={styles.classicItemHeader}>
                <Text style={styles.classicItemTitle}>
                  {edu.education || ""} {edu.branch ? `in ${edu.branch}` : ""}
                </Text>
                <Text style={styles.classicDate}>{edu.passed_year || ""}</Text>
              </View>
              <Text style={styles.classicItemSubtitle}>
                {edu.college_name || ""}
              </Text>
              <Text style={styles.classicContent}>
                Academic Score: {edu.percentage || ""}
              </Text>
            </View>
          ))}
        </View>
      )}

      {data?.projects?.length > 0 && (
        <View style={styles.classicSection}>
          <Text style={styles.classicSectionTitle}>Projects</Text>
          {data.projects.map((project, i) => (
            <View key={i} style={{ marginBottom: 12 }}>
              <View style={styles.classicItemHeader}>
                <Text style={styles.classicItemTitle}>
                  {project.project_name || ""}
                </Text>
              </View>
              {project.link && (
                <Text style={{ ...styles.classicItemSubtitle, color: colors.primary, marginBottom: 4 }}>
                  {project.link}
                </Text>
              )}
              {project.description && (
                <Text style={styles.classicContent}>
                  • {project.description}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {data?.certificates?.length > 0 && (
        <View style={styles.classicSection}>
          <Text style={styles.classicSectionTitle}>Certifications & Awards</Text>
          {data.certificates.map((cert, i) => (
            <View key={i} style={{ marginBottom: 12 }}>
              <View style={styles.classicItemHeader}>
                <Text style={styles.classicItemTitle}>
                  {cert.title || ""}
                </Text>
                <Text style={styles.classicDate}>{cert.issued_year || ""}</Text>
              </View>
              <Text style={styles.classicItemSubtitle}>
                {cert.issuing_organization || ""}
              </Text>
              {cert.description && (
                <Text style={styles.classicContent}>
                  • {cert.description}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {data?.skills?.length > 0 && (
        <View style={styles.classicSection}>
          <Text style={styles.classicSectionTitle}>Core Competencies</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {data.skills.map((skill, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: "#f5f7fa",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 4,
                }}
              >
                <Text style={{ fontSize: 9 }}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Page>
  </Document>
);

// Template 2: Professional Modern
export const ModernResume = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.modernPage}>
      <View style={styles.modernLeft}>
        <Text style={styles.modernSidebarName}>{data?.user_name || ""}</Text>
        <Text style={styles.modernSidebarTitle}>
          {data?.experience?.[0]?.job_title || "Professional"}
        </Text>

        <View style={styles.modernSiderbarSection}>
          <Text style={styles.modernSidebarHeading}>Contact</Text>
          <Text style={styles.modernSidebarItem}>{data?.email || ""}</Text>
          <Text style={styles.modernSidebarItem}>{data?.phone || ""}</Text>
          <Text style={styles.modernSidebarItem}>
            {data?.current_city || ""}
          </Text>
        </View>

        {data?.skills?.length > 0 && (
          <View style={styles.modernSiderbarSection}>
            <Text style={styles.modernSidebarHeading}>Skills</Text>
            {data.skills.map((skill, i) => (
              <Text key={i} style={styles.modernSidebarItem}>
                • {skill}
              </Text>
            ))}
          </View>
        )}

        {data?.languages?.length > 0 && (
          <View style={styles.modernSiderbarSection}>
            <Text style={styles.modernSidebarHeading}>Languages</Text>
            {data.languages.map((lang, i) => (
              <Text key={i} style={styles.modernSidebarItem}>
                {lang}
              </Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.modernRight}>
        <View style={styles.modernMainSection}>
          <Text style={styles.modernMainHeading}>About Me</Text>
          <Text style={{ fontSize: 10, color: "#555", lineHeight: 1.6 }}>
            {data?.summary ||
              "Dedicated professional with extensive experience in the field."}
          </Text>
        </View>

        {data?.experience?.length > 0 && (
          <View style={styles.modernMainSection}>
            <Text style={styles.modernMainHeading}>Experience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                  {exp.job_title || ""}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: colors.primary,
                    marginBottom: 4,
                  }}
                >
                  {exp.company_name || ""} | {exp.start_year || ""} -{" "}
                  {exp.is_present_company == 1 ? "Present" : exp.end_year || ""}
                </Text>
                <Text style={{ fontSize: 9, color: "#666" }}>
                  {exp.responsibility || ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {data?.education?.length > 0 && (
          <View style={styles.modernMainSection}>
            <Text style={styles.modernMainHeading}>Education</Text>
            {data.education.map((edu, i) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                  {edu.education || ""}
                </Text>
                <Text style={{ fontSize: 10, color: "#777" }}>
                  {edu.college_name || ""} | {edu.passed_year || ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {data?.projects?.length > 0 && (
          <View style={styles.modernMainSection}>
            <Text style={styles.modernMainHeading}>Projects</Text>
            {data.projects.map((project, i) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                  {project.project_name || ""}
                </Text>
                {project.link && (
                  <Text style={{ fontSize: 10, color: colors.primary, marginBottom: 2 }}>
                    {project.link}
                  </Text>
                )}
                {project.description && (
                  <Text style={{ fontSize: 9, color: "#666" }}>
                    • {project.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {data?.certificates?.length > 0 && (
          <View style={styles.modernMainSection}>
            <Text style={styles.modernMainHeading}>Certifications</Text>
            {data.certificates.map((cert, i) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                  {cert.title || ""}
                </Text>
                <Text style={{ fontSize: 10, color: colors.primary, marginBottom: 2 }}>
                  {cert.issuing_organization || ""} | {cert.issued_year || ""}
                </Text>
                {cert.description && (
                  <Text style={{ fontSize: 9, color: "#666" }}>
                    • {cert.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </Page>
  </Document>
);

// Template 3: Executive Minimalist (Ultra Clean)
export const MinimalistResume = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.execPage}>
      <View style={styles.execHeader}>
        <Text style={styles.execName}>
          {data?.user_name?.toUpperCase() || ""}
        </Text>
        <Text style={styles.execJob}>
          {data?.experience?.[0]?.job_title?.toUpperCase() ||
            "EXECUTIVE PROFESSIONAL"}
        </Text>

        <View style={styles.execContact}>
          <Text style={{ marginRight: 12 }}>{data?.email || ""}</Text>
          <Text>|</Text>
          <Text style={styles.execContactItem}>{data?.phone || ""}</Text>
          <Text>|</Text>
          <Text style={{ marginLeft: 12 }}>{data?.current_city || ""}</Text>
        </View>
      </View>

      <View style={styles.execSection}>
        <Text style={styles.execSectionTitle}>Professional Summary</Text>
        <Text style={{ lineHeight: 1.8, color: "#444" }}>
          {data?.summary ||
            "A results-oriented leader with a track record of driving innovation and achieving business objectives."}
        </Text>
      </View>

      {data?.experience?.length > 0 && (
        <View style={styles.execSection}>
          <Text style={styles.execSectionTitle}>Key Experience</Text>
          {data.experience.map((exp, i) => (
            <View key={i} style={{ marginBottom: 18 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                  {exp.company_name?.toUpperCase() || ""}
                </Text>
                <Text style={{ fontSize: 9, color: "#777" }}>
                  {exp.start_year || ""} —{" "}
                  {exp.is_present_company == 1 ? "PRESENT" : exp.end_year || ""}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 10,
                  color: colors.primary,
                  fontStyle: "italic",
                  marginBottom: 6,
                }}
              >
                {exp.job_title || ""}
              </Text>
              <Text style={{ fontSize: 9, color: "#555", lineHeight: 1.6 }}>
                • {exp.responsibility || ""}
              </Text>
            </View>
          ))}
        </View>
      )}

      {data?.education?.length > 0 && (
        <View style={styles.execSection}>
          <Text style={styles.execSectionTitle}>Education</Text>
          {data.education.map((edu, i) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                {edu.education?.toUpperCase() || ""}
              </Text>
              <Text style={{ fontSize: 10, color: "#777" }}>
                {edu.college_name || ""} | {edu.passed_year || ""}
              </Text>
            </View>
          ))}
        </View>
      )}

      {data?.projects?.length > 0 && (
        <View style={styles.execSection}>
          <Text style={styles.execSectionTitle}>Key Projects</Text>
          {data.projects.map((project, i) => (
            <View key={i} style={{ marginBottom: 13 }}>
              <Text style={{ fontSize: 11, fontWeight: "bold", marginBottom: 2 }}>
                {project.project_name?.toUpperCase() || ""}
              </Text>
              {project.link && (
                <Text style={{ fontSize: 10, color: colors.primary, fontStyle: "italic", marginBottom: 4 }}>
                  {project.link}
                </Text>
              )}
              {project.description && (
                <Text style={{ fontSize: 9, color: "#555", lineHeight: 1.6 }}>
                  • {project.description}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {data?.certificates?.length > 0 && (
        <View style={styles.execSection}>
          <Text style={styles.execSectionTitle}>Certifications & Awards</Text>
          {data.certificates.map((cert, i) => (
            <View key={i} style={{ marginBottom: 13 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                  {cert.title?.toUpperCase() || ""}
                </Text>
                <Text style={{ fontSize: 9, color: "#777" }}>
                  {cert.issued_year || ""}
                </Text>
              </View>
              <Text style={{ fontSize: 10, color: colors.primary, fontStyle: "italic", marginBottom: 4 }}>
                {cert.issuing_organization || ""}
              </Text>
              {cert.description && (
                <Text style={{ fontSize: 9, color: "#555", lineHeight: 1.6 }}>
                  • {cert.description}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {data?.skills?.length > 0 && (
        <View style={styles.execSection}>
          <Text style={styles.execSectionTitle}>Expertise</Text>
          <Text style={{ fontSize: 10, color: "#555", letterSpacing: 1 }}>
            {data.skills.join("   /   ")}
          </Text>
        </View>
      )}
    </Page>
  </Document>
);

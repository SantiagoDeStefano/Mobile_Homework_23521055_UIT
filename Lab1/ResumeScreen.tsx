import React, { useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Tokens ────────────────────────────────────────────────────────────────
const C = {
  bg: "#0B0E13",
  surface: "#111620",
  surfaceAlt: "#161C27",
  border: "#1E2A3A",
  accent: "#38BDF8",        // sky-400
  accentDim: "#0EA5E9",
  green: "#4ADE80",
  muted: "#6B7E95",
  text: "#E2EAF4",
  textSoft: "#A8BACE",
};

// ─── Data ───────────────────────────────────────────────────────────────────
const PROFILE = {
  name: "Khoi Nguyen Pham",
  email: "ngpham.2807@gmail.com",
  location: "Ho Chi Minh City",
  phone: "+84 828 072 468",
  linkedin: "linkedin.com/in/khoinguyenpham",
  github: "github.com/khoinguyen",
};

const EDUCATION = {
  school: "University of Information Technology – VNUHCM",
  degree: "Bachelor of Information Systems",
  gpa: "3.53 / 4.00",
  expected: "Expected June 2027",
  courses: [
    "Probability & Statistics",
    "Linear Algebra",
    "Calculus",
    "Data Structures & Algorithms",
    "Data Mining",
    "Database Systems",
    "Computer Networks",
  ],
};

const RESEARCH = [
  {
    title: "Deep Learning for Multiphasic CT-Based Liver Cancer Classification",
    role: "First Author",
    venue: "Submitted to Computer Methods and Programs in Biomedicine",
    bullets: [
      "Proposed dual-model framework for liver cancer subtype classification and 3D tumor refinement from multiphasic CT imaging.",
      "EfficientNet-V2-S early-fusion model → 0.985 Macro-AUC, 0.960 Macro-F1 (5-fold patient-wise CV).",
      "3D U-Net refinement model → Dice 0.93 ± 0.05, IoU 0.85.",
      "Evaluated robustness under domain shift on 233 external cases.",
    ],
  },
];

const PROJECTS = [
  {
    name: "Kubernetes AI Agent",
    tags: ["RAG", "LangChain", "FAISS", "Ollama"],
    bullets: [
      "RAG system over 1,567 Kubernetes docs using FAISS vector search.",
      "ReAct-based agent with semantic search & calculator tool-calling.",
      "Sliding-window memory (k=4) for multi-turn context.",
      "~4.3s avg latency; 90% accuracy on numerical reasoning (18/20).",
    ],
  },
  {
    name: "MLOps Platform – BERT on AWS EKS",
    tags: ["Terraform", "KServe", "Prometheus", "MLflow"],
    bullets: [
      "Provisioned AWS EKS via Terraform (IaC).",
      "CI/CD with GitHub Actions enforcing >80% test coverage.",
      "KServe + Knative scale-to-zero & FastAPI HPA autoscaling.",
      "MLflow, DVC, Grafana, Jaeger, Loki, Evidently for observability.",
    ],
  },
  {
    name: "Twitter-Inspired Backend API",
    tags: ["Node.js", "MongoDB", "AWS S3", "HLS"],
    bullets: [
      "Auth, AWS SES verification, S3 media uploads with HLS streaming.",
      "Clean architecture + automated CI/CD via Docker & GitHub Actions.",
    ],
  },
  {
    name: "Mivora – Event Ticket Platform",
    tags: ["PostgreSQL", "Socket.io", "AWS EC2", "Vercel"],
    bullets: [
      "Full-stack event management: JWT auth, RBAC, QR ticket validation.",
      "Real-time chat & check-in via Socket.io with persistent storage.",
      "Normalized PostgreSQL schema with indexed queries.",
      "Deployed backend on AWS EC2 + RDS; frontend on Vercel.",
    ],
  },
];

const SKILLS = [
  { label: "Languages", value: "Python · TypeScript · SQL" },
  {
    label: "ML",
    value: "PyTorch · Hugging Face · FAISS · LangChain · Ollama",
  },
  {
    label: "MLOps & Infra",
    value: "Kubernetes · AWS · Terraform · Helm · KServe · MLflow · Docker",
  },
  { label: "Backend", value: "Node.js · Express · PostgreSQL · MongoDB" },
  { label: "English", value: "IELTS 7.0" },
];

// ─── Small components ────────────────────────────────────────────────────────

const SectionLabel = ({ text }: { text: string }) => (
  <View style={s.sectionHeader}>
    <Text style={s.sectionLabel}>{text}</Text>
    <View style={s.sectionLine} />
  </View>
);

const Tag = ({ text }: { text: string }) => (
  <View style={s.tag}>
    <Text style={s.tagText}>{text}</Text>
  </View>
);

const Bullet = ({ text }: { text: string }) => (
  <View style={s.bulletRow}>
    <Text style={s.bulletDot}>›</Text>
    <Text style={s.bulletText}>{text}</Text>
  </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ResumeScreen() {
  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.accentBar} />
          <Text style={s.name}>{PROFILE.name}</Text>

          <View style={s.contactGrid}>
            <TouchableOpacity
              onPress={() => Linking.openURL(`mailto:${PROFILE.email}`)}
            >
              <Text style={s.contactLink}>{PROFILE.email}</Text>
            </TouchableOpacity>
            <Text style={s.contactSep}>·</Text>
            <Text style={s.contactItem}>{PROFILE.location}</Text>
            <Text style={s.contactSep}>·</Text>
            <Text style={s.contactItem}>{PROFILE.phone}</Text>
          </View>

          <View style={s.contactGrid}>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(`https://${PROFILE.linkedin}`)
              }
            >
              <Text style={s.contactLink}>LinkedIn</Text>
            </TouchableOpacity>
            <Text style={s.contactSep}>·</Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(`https://${PROFILE.github}`)
              }
            >
              <Text style={s.contactLink}>GitHub</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Education ── */}
        <SectionLabel text="EDUCATION" />
        <View style={s.card}>
          <View style={s.cardRowSpread}>
            <Text style={s.cardTitle}>{EDUCATION.degree}</Text>
            <View style={s.gpaBadge}>
              <Text style={s.gpaText}>{EDUCATION.gpa}</Text>
            </View>
          </View>
          <Text style={s.cardSub}>{EDUCATION.school}</Text>
          <Text style={s.cardDate}>{EDUCATION.expected}</Text>
          <View style={s.tagRow}>
            {EDUCATION.courses.map((c) => (
              <Tag key={c} text={c} />
            ))}
          </View>
        </View>

        {/* ── Research ── */}
        <SectionLabel text="RESEARCH" />
        {RESEARCH.map((r) => (
          <View key={r.title} style={s.card}>
            <Text style={s.cardTitle}>{r.title}</Text>
            <View style={s.roleRow}>
              <View style={s.roleBadge}>
                <Text style={s.roleText}>{r.role}</Text>
              </View>
              <Text style={s.cardDate}>{r.venue}</Text>
            </View>
            {r.bullets.map((b) => (
              <Bullet key={b} text={b} />
            ))}
          </View>
        ))}

        {/* ── Projects ── */}
        <SectionLabel text="PROJECTS" />
        {PROJECTS.map((p) => (
          <View key={p.name} style={s.card}>
            <Text style={s.cardTitle}>{p.name}</Text>
            <View style={s.tagRow}>
              {p.tags.map((t) => (
                <Tag key={t} text={t} />
              ))}
            </View>
            {p.bullets.map((b) => (
              <Bullet key={b} text={b} />
            ))}
          </View>
        ))}

        {/* ── Skills ── */}
        <SectionLabel text="TECHNICAL SKILLS" />
        <View style={s.card}>
          {SKILLS.map((sk, i) => (
            <View
              key={sk.label}
              style={[s.skillRow, i < SKILLS.length - 1 && s.skillRowBorder]}
            >
              <Text style={s.skillLabel}>{sk.label}</Text>
              <Text style={s.skillValue}>{sk.value}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Header
  header: {
    paddingVertical: 24,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  accentBar: {
    width: 40,
    height: 3,
    backgroundColor: C.accent,
    borderRadius: 2,
    marginBottom: 12,
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: C.text,
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  contactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  contactItem: {
    fontSize: 12,
    color: C.textSoft,
  },
  contactLink: {
    fontSize: 12,
    color: C.accent,
    textDecorationLine: "underline",
  },
  contactSep: {
    fontSize: 12,
    color: C.muted,
    marginHorizontal: 2,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: C.accent,
    letterSpacing: 2,
    marginRight: 10,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },

  // Card
  card: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardRowSpread: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    lineHeight: 20,
  },
  cardSub: {
    fontSize: 13,
    color: C.textSoft,
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 11,
    color: C.muted,
    marginBottom: 8,
    flexShrink: 1,
    flexWrap: "wrap",
  },

  // GPA badge
  gpaBadge: {
    backgroundColor: C.accentDim + "22",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: C.accentDim + "55",
  },
  gpaText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.accent,
  },

  // Role badge
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  roleBadge: {
    backgroundColor: C.green + "22",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: C.green + "55",
  },
  roleText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.green,
  },

  // Tags
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: C.border,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "600",
    color: C.textSoft,
    letterSpacing: 0.3,
  },

  // Bullets
  bulletRow: {
    flexDirection: "row",
    marginBottom: 5,
    paddingRight: 4,
  },
  bulletDot: {
    fontSize: 13,
    color: C.accent,
    marginRight: 6,
    lineHeight: 18,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: C.textSoft,
    lineHeight: 18,
  },

  // Skills table
  skillRow: {
    flexDirection: "row",
    paddingVertical: 10,
    gap: 12,
  },
  skillRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  skillLabel: {
    width: 72,
    fontSize: 11,
    fontWeight: "700",
    color: C.accent,
    letterSpacing: 0.5,
    paddingTop: 1,
  },
  skillValue: {
    flex: 1,
    fontSize: 13,
    color: C.textSoft,
    lineHeight: 18,
  },
});
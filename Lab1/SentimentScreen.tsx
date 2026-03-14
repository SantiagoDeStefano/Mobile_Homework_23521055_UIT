import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Replace with your Gemini API key ────────────────────────────────────────
const GEMINI_API_KEY = "AIzaSyDrO5L-EHiP_QVTgaDMWtvH7RR9gCZx6KU";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// ── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#0B0E13",
  surface: "#111620",
  border: "#1E2A3A",
  accent: "#38BDF8",
  text: "#E2EAF4",
  textSoft: "#A8BACE",
  muted: "#6B7E95",
  positive: "#4ADE80",
  negative: "#F87171",
  neutral: "#FACC15",
};

type Sentiment = "POSITIVE" | "NEGATIVE" | "NEUTRAL" | null;

const SENTIMENT_CONFIG: Record<
  NonNullable<Sentiment>,
  { color: string; label: string; emoji: string }
> = {
  POSITIVE: { color: C.positive, label: "Positive", emoji: "😊" },
  NEGATIVE: { color: C.negative, label: "Negative", emoji: "😞" },
  NEUTRAL:  { color: C.neutral,  label: "Neutral",  emoji: "😐" },
};

export default function SentimentScreen() {
  const [input, setInput] = useState("");
  const [sentiment, setSentiment] = useState<Sentiment>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!input.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setSentiment(null);
    setError("");

    try {
      const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Classify the sentiment of the following sentence as exactly one word: POSITIVE, NEGATIVE, or NEUTRAL. Reply with only that one word, nothing else.\n\nSentence: "${input.trim()}"`,
                },
              ],
            },
          ],
        }),
      });

      const data = await res.json();
      const raw: string =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const parsed = raw.trim().toUpperCase();

      if (
        parsed === "POSITIVE" ||
        parsed === "NEGATIVE" ||
        parsed === "NEUTRAL"
      ) {
        setSentiment(parsed as Sentiment);
      } else {
        setError("Unexpected response from API. Try again.");
      }
    } catch (e) {
      setError("Network error. Check your API key or connection.");
    } finally {
      setLoading(false);
    }
  };

  const config = sentiment ? SENTIMENT_CONFIG[sentiment] : null;

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={s.container}>
            {/* Header */}
            <View style={s.header}>
              <View style={s.accentBar} />
              <Text style={s.title}>Sentiment Analysis</Text>
              <Text style={s.subtitle}>
                Enter a sentence to classify its sentiment
              </Text>
            </View>

            {/* Input card */}
            <View style={s.card}>
              <Text style={s.cardLabel}>INPUT SENTENCE</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. I really love this product!"
                placeholderTextColor={C.muted}
                value={input}
                onChangeText={setInput}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                onSubmitEditing={analyze}
              />
              <TouchableOpacity
                style={[s.button, (!input.trim() || loading) && s.buttonDisabled]}
                onPress={analyze}
                disabled={!input.trim() || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={C.bg} size="small" />
                ) : (
                  <Text style={s.buttonText}>Analyze</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Result card */}
            {config && (
              <View style={[s.card, s.resultCard, { borderColor: config.color + "55" }]}>
                <Text style={s.cardLabel}>RESULT</Text>
                <View style={s.resultRow}>
                  <Text style={s.resultEmoji}>{config.emoji}</Text>
                  <Text style={[s.resultLabel, { color: config.color }]}>
                    {config.label}
                  </Text>
                </View>
              </View>
            )}

            {/* Error */}
            {!!error && (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Header
  header: { paddingVertical: 24 },
  accentBar: {
    width: 40,
    height: 3,
    backgroundColor: C.accent,
    borderRadius: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: C.text,
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: C.textSoft,
  },

  // Card
  card: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: C.accent,
    letterSpacing: 2,
    marginBottom: 10,
  },

  // Input
  input: {
    color: C.text,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 100,
    marginBottom: 14,
  },

  // Button
  button: {
    backgroundColor: C.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: C.bg,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Result
  resultCard: { borderWidth: 1 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  resultEmoji: { fontSize: 36 },
  resultLabel: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1,
  },

  // Error
  errorBox: {
    backgroundColor: "#F8717122",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F8717155",
  },
  errorText: {
    color: C.negative,
    fontSize: 13,
  },
});
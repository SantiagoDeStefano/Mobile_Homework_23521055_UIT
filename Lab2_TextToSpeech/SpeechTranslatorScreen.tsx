import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView,
} from "react-native";

declare global {
  interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; }
}

const LANGUAGES = [
  { label: "English",    value: "en", bcp47: "en-US" },
  { label: "Vietnamese", value: "vi", bcp47: "vi-VN" },
  { label: "Japanese",   value: "ja", bcp47: "ja-JP" },
  { label: "Korean",     value: "ko", bcp47: "ko-KR" },
  { label: "French",     value: "fr", bcp47: "fr-FR" },
  { label: "Chinese",    value: "zh", bcp47: "zh-CN" },
];

async function translate(text: string, from: string, to: string) {
  if (!text || from === to) return text;
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
  );
  const json = await res.json();
  return json?.responseData?.translatedText ?? "[failed]";
}

export default function SpeechTranslatorScreen() {
  const [listening, setListening]     = useState(false);
  const [spoken, setSpoken]           = useState("");
  const [translated, setTranslated]   = useState("");
  const [translating, setTranslating] = useState(false);
  const [sourceLang, setSourceLang]   = useState(0);
  const [targetLang, setTargetLang]   = useState(1);
  const recRef = useRef<any>(null);

  const doTranslate = async (text: string, from: number, to: number) => {
    setTranslating(true);
    const result = await translate(text, LANGUAGES[from].value, LANGUAGES[to].value);
    setTranslated(result);
    setTranslating(false);
  };

  const toggleListening = () => {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Use Chrome!"); return; }

    const rec = new SR();
    rec.lang = LANGUAGES[sourceLang].bcp47;
    rec.continuous = true;
    rec.interimResults = false;

    rec.onresult = (e: any) => {
      const text = e.results[e.results.length - 1][0].transcript;
      setSpoken(text);
      doTranslate(text, sourceLang, targetLang);
    };
    rec.onend = () => setListening(false);

    rec.start();
    recRef.current = rec;
    setSpoken("");
    setTranslated("");
    setListening(true);
  };

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>Speech Translator</Text>

      <View style={s.row}>
        <View style={s.col}>
          <Text style={s.label}>Source</Text>
          {LANGUAGES.map((l, i) => (
            <TouchableOpacity
              key={l.value}
              style={[s.langBtn, sourceLang === i && s.active]}
              onPress={() => setSourceLang(i)}
            >
              <Text style={[s.langText, sourceLang === i && s.activeText]}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.col}>
          <Text style={s.label}>Target</Text>
          {LANGUAGES.map((l, i) => (
            <TouchableOpacity
              key={l.value}
              style={[s.langBtn, targetLang === i && s.active]}
              onPress={() => setTargetLang(i)}
            >
              <Text style={[s.langText, targetLang === i && s.activeText]}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[s.micBtn, listening && s.micBtnStop]}
        onPress={toggleListening}
      >
        <Text style={s.micText}>{listening ? "⏹ Stop" : "🎙 Speak"}</Text>
      </TouchableOpacity>

      <View style={s.card}>
        <Text style={s.label}>Recognised</Text>
        <Text style={s.resultText}>{spoken || "—"}</Text>
      </View>

      <View style={s.card}>
        <Text style={s.label}>Translation</Text>
        {translating
          ? <ActivityIndicator color="#6d28d9" />
          : <Text style={s.resultText}>{translated || "—"}</Text>}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:   { padding: 24, paddingTop: 60, backgroundColor: "#fff", flexGrow: 1 },
  title:       { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  row:         { flexDirection: "row", gap: 12, marginBottom: 24 },
  col:         { flex: 1 },
  label:       { fontSize: 11, fontWeight: "600", color: "#6b7280", marginBottom: 8, textTransform: "uppercase" },
  langBtn:     { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 6 },
  active:      { backgroundColor: "#6d28d9", borderColor: "#6d28d9" },
  langText:    { fontSize: 13, color: "#374151" },
  activeText:  { color: "#fff" },
  micBtn:      { backgroundColor: "#6d28d9", borderRadius: 12, padding: 18, alignItems: "center", marginBottom: 24 },
  micBtnStop:  { backgroundColor: "#dc2626" },
  micText:     { color: "#fff", fontSize: 18, fontWeight: "700" },
  card:        { backgroundColor: "#f9fafb", borderRadius: 12, padding: 16, marginBottom: 16, minHeight: 80 },
  resultText:  { fontSize: 16, color: "#111827", lineHeight: 24 },
});
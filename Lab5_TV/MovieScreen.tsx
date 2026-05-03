import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator, Modal, ScrollView,
} from "react-native";

const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNTJhOTIxNjgzYThiMDYyNzM5NDM4NmJlMTYxZTk4NyIsIm5iZiI6MTc3NzQ0NzQ5MC4zMDQsInN1YiI6IjY5ZjFiMjQyYjllZDA0YWFjOTk5YjY2MyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.vsTpjEJo5dHYh5-w-Cv6Ny1Y0rTd_ljaQlsXla1nUnQ";

const API = (path: string) =>
  fetch(`https://api.themoviedb.org/3${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  }).then((r) => r.json());

const IMG = (path: string) => `https://image.tmdb.org/t/p/w500${path}`;

export default function MovieScreen() {
  const [movies, setMovies]     = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [query, setQuery]       = useState("");
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<"popular"|"top"|"upcoming">("popular");

  useEffect(() => { fetchMovies(); }, [tab]);

  const fetchMovies = async () => {
    setLoading(true);
    const endpoint =
      tab === "popular"  ? "/movie/popular" :
      tab === "top"      ? "/movie/top_rated" :
                           "/movie/upcoming";
    const data = await API(`${endpoint}?language=en-US&page=1`);
    setMovies(data.results ?? []);
    setLoading(false);
  };

  const search = async (text: string) => {
    setQuery(text);
    if (!text.trim()) { fetchMovies(); return; }
    const data = await API(`/search/movie?query=${encodeURIComponent(text)}`);
    setMovies(data.results ?? []);
  };

  const openMovie = async (id: number) => {
    const data = await API(`/movie/${id}?language=en-US`);
    setSelected(data);
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>🎬 Movies</Text>

      {/* Search */}
      <TextInput
        style={s.search}
        placeholder="Search movies..."
        placeholderTextColor="#888"
        value={query}
        onChangeText={search}
      />

      {/* Tabs */}
      <View style={s.tabs}>
        {(["popular","top","upcoming"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.tab, tab === t && s.tabActive]}
            onPress={() => { setQuery(""); setTab(t); }}
          >
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === "popular" ? "Popular" : t === "top" ? "Top Rated" : "Upcoming"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading
        ? <ActivityIndicator color="#e50914" size="large" style={{ marginTop: 40 }} />
        : <FlatList
            data={movies}
            keyExtractor={(m) => String(m.id)}
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.card} onPress={() => openMovie(item.id)}>
                <Image
                  source={{ uri: IMG(item.poster_path) }}
                  style={s.poster}
                />
                <Text style={s.movieTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={s.rating}>⭐ {item.vote_average?.toFixed(1)}</Text>
              </TouchableOpacity>
            )}
          />
      }

      {/* Detail Modal */}
      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <ScrollView style={s.modal}>
          {selected && <>
            <Image source={{ uri: IMG(selected.backdrop_path || selected.poster_path) }} style={s.backdrop} />
            <View style={s.modalBody}>
              <Text style={s.modalTitle}>{selected.title}</Text>
              <Text style={s.modalMeta}>
                ⭐ {selected.vote_average?.toFixed(1)}  ·  {selected.release_date?.slice(0,4)}  ·  {selected.runtime} min
              </Text>
              <Text style={s.modalGenres}>
                {selected.genres?.map((g: any) => g.name).join(" · ")}
              </Text>
              <Text style={s.modalOverview}>{selected.overview}</Text>
              <TouchableOpacity style={s.closeBtn} onPress={() => setSelected(null)}>
                <Text style={s.closeBtnText}>✕ Close</Text>
              </TouchableOpacity>
            </View>
          </>}
        </ScrollView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: "#141414", paddingTop: 56, paddingHorizontal: 16 },
  title:          { fontSize: 24, fontWeight: "800", color: "#fff", marginBottom: 12 },
  search:         { backgroundColor: "#222", color: "#fff", borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 14 },
  tabs:           { flexDirection: "row", gap: 8, marginBottom: 16 },
  tab:            { flex: 1, padding: 8, borderRadius: 8, backgroundColor: "#222", alignItems: "center" },
  tabActive:      { backgroundColor: "#e50914" },
  tabText:        { color: "#888", fontSize: 12, fontWeight: "600" },
  tabTextActive:  { color: "#fff" },
  card:           { flex: 1, backgroundColor: "#1f1f1f", borderRadius: 10, overflow: "hidden" },
  poster:         { width: "100%", height: 200 },
  movieTitle:     { color: "#fff", fontSize: 12, fontWeight: "600", padding: 8, paddingBottom: 2 },
  rating:         { color: "#f5a623", fontSize: 11, paddingHorizontal: 8, paddingBottom: 8 },
  modal:          { flex: 1, backgroundColor: "#141414" },
  backdrop:       { width: "100%", height: 220 },
  modalBody:      { padding: 20 },
  modalTitle:     { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 8 },
  modalMeta:      { color: "#aaa", fontSize: 13, marginBottom: 6 },
  modalGenres:    { color: "#e50914", fontSize: 12, marginBottom: 12 },
  modalOverview:  { color: "#ccc", fontSize: 14, lineHeight: 22, marginBottom: 24 },
  closeBtn:       { backgroundColor: "#e50914", padding: 14, borderRadius: 10, alignItems: "center" },
  closeBtnText:   { color: "#fff", fontWeight: "700", fontSize: 15 },
});
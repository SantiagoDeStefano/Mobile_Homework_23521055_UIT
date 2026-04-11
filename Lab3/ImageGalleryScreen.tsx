import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";

// ─── Constants ────────────────────────────────────────────────────────────────
const PIXABAY_API_KEY = "55400394-7c5ceb20418058ba6331b4b2f"; // replace with your key
const PAGE_SIZE = 20;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

// ─── Data Classes ─────────────────────────────────────────────────────────────

interface PixabayImage {
  id: number;
  webformatURL: string;
  largeImageURL: string;
  tags: string;
  user: string;
  views: number;
  downloads: number;
  likes: number;
  imageWidth: number;
  imageHeight: number;
}

interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

interface ProcessedImage {
  image: PixabayImage;
  aiTags: string[];
  isAnalyzing: boolean;
}

// ─── AI Cache (in-memory, mirrors Room DAO concept) ───────────────────────────

const aiCache = new Map<number, string[]>();

function getCachedAnalysis(id: number): string[] | null {
  return aiCache.get(id) ?? null;
}

function setCachedAnalysis(id: number, tags: string[]): void {
  aiCache.set(id, tags);
}

// ─── Image Analyzer (Claude API replacing ML Kit) ─────────────────────────────

async function analyzeImage(
  imageUrl: string,
  imageId: number,
): Promise<string[]> {
  const cached = getCachedAnalysis(imageId);
  if (cached) return cached;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "url", url: imageUrl },
              },
              {
                type: "text",
                text: 'List exactly 3 concise object/scene labels for this image. Respond ONLY with a JSON array of 3 strings, no other text. Example: ["cat","outdoor","grass"]',
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "[]";
    const clean = text.replace(/```json|```/g, "").trim();
    const tags: string[] = JSON.parse(clean);
    setCachedAnalysis(imageId, tags);
    return tags;
  } catch {
    return [];
  }
}

// ─── Pixabay API ──────────────────────────────────────────────────────────────

async function fetchImages(
  query: string,
  page: number,
): Promise<PixabayResponse> {
  const q = encodeURIComponent(query || "nature");
  const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${q}&page=${page}&per_page=${PAGE_SIZE}&image_type=photo&safesearch=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Pixabay fetch failed");
  return res.json();
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ImageGalleryScreen() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [page, setPage] = useState(1);
  const [totalHits, setTotalHits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("nature");
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(
    null,
  );

  const hasMore = images.length < totalHits;

  // Load first page whenever activeSearch changes
  useEffect(() => {
    loadPage(1, true);
  }, [activeSearch]);

  const loadPage = useCallback(
    async (pageNum: number, reset: boolean) => {
      if (reset) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        const data = await fetchImages(activeSearch, pageNum);
        setTotalHits(data.totalHits);

        const newItems: ProcessedImage[] = data.hits.map((img) => ({
          image: img,
          aiTags: getCachedAnalysis(img.id) ?? [],
          isAnalyzing: !getCachedAnalysis(img.id),
        }));

        setImages((prev) => (reset ? newItems : [...prev, ...newItems]));
        setPage(pageNum);

        // Analyze images in background
        newItems.forEach(async (item) => {
          if (item.isAnalyzing) {
            const tags = await analyzeImage(
              item.image.webformatURL,
              item.image.id,
            );
            setImages((prev) =>
              prev.map((p) =>
                p.image.id === item.image.id
                  ? { ...p, aiTags: tags, isAnalyzing: false }
                  : p,
              ),
            );
          }
        });
      } catch (e: any) {
        setError(e.message ?? "Something went wrong");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeSearch],
  );

  const handleSearch = () => {
    const q = inputText.trim();
    if (q) {
      setActiveSearch(q);
      setSearchQuery("");
    }
  };

  // Smart filter: filter displayed images by AI tags
  const filteredImages = searchQuery.trim()
    ? images.filter((item) =>
        item.aiTags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.trim().toLowerCase()),
        ),
      )
    : images;

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadPage(page + 1, false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  const renderItem = ({
    item,
    index,
  }: {
    item: ProcessedImage;
    index: number;
  }) => (
    <TouchableOpacity
      style={[
        styles.card,
        index % 2 === 0 ? styles.cardLeft : styles.cardRight,
      ]}
      onPress={() => setSelectedImage(item)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: item.image.webformatURL }}
        style={styles.cardImage}
      />
      <View style={styles.cardOverlay}>
        {item.isAnalyzing ? (
          <View style={styles.analyzingBadge}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.analyzingText}>Analyzing…</Text>
          </View>
        ) : (
          <View style={styles.tagsRow}>
            {item.aiTags.slice(0, 2).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardUser} numberOfLines={1}>
          {item.image.user}
        </Text>
        <Text style={styles.cardLikes}>♥ {item.image.likes}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>📸 Image Gallery</Text>
      <Text style={styles.subtitle}>
        Powered by Pixabay + AI Object Detection
      </Text>

      {/* Search Pixabay */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Pixabay (e.g. ocean, city…)"
          placeholderTextColor="#888"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Go</Text>
        </TouchableOpacity>
      </View>

      {/* Smart filter by AI tags */}
      <TextInput
        style={styles.filterInput}
        placeholder="🤖 Filter by AI tag (e.g. dog, sky…)"
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <Text style={styles.resultCount}>
        {searchQuery
          ? `${filteredImages.length} AI-matched results`
          : `${totalHits.toLocaleString()} results for "${activeSearch}"`}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#4A90D9" />
        <Text style={styles.footerText}>Loading more…</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90D9" />
        <Text style={styles.loadingText}>Fetching images…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => loadPage(1, true)}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={filteredImages}
        keyExtractor={(item) => String(item.image.id)}
        renderItem={renderItem}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>
              No images matched your AI tag filter.
            </Text>
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={styles.clearFilter}>Clear filter</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal
        visible={!!selectedImage}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedImage(null)}
      >
        {selectedImage && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Image
                source={{ uri: selectedImage.image.largeImageURL }}
                style={styles.modalImage}
                resizeMode="cover"
              />
              <ScrollView style={styles.modalInfo}>
                <Text style={styles.modalUser}>
                  📷 {selectedImage.image.user}
                </Text>
                <Text style={styles.modalMeta}>
                  👁 {selectedImage.image.views.toLocaleString()} · ⬇️{" "}
                  {selectedImage.image.downloads.toLocaleString()} · ♥{" "}
                  {selectedImage.image.likes.toLocaleString()}
                </Text>
                <Text style={styles.modalTagsLabel}>Pixabay tags:</Text>
                <Text style={styles.modalPixabayTags}>
                  {selectedImage.image.tags}
                </Text>
                <Text style={styles.modalTagsLabel}>
                  🤖 AI-detected objects:
                </Text>
                <View style={styles.modalAiTags}>
                  {selectedImage.isAnalyzing ? (
                    <View style={styles.analyzingRow}>
                      <ActivityIndicator size="small" color="#4A90D9" />
                      <Text style={styles.analyzingLabel}>
                        Analyzing image…
                      </Text>
                    </View>
                  ) : selectedImage.aiTags.length > 0 ? (
                    selectedImage.aiTags.map((tag) => (
                      <View key={tag} style={styles.modalTag}>
                        <Text style={styles.modalTagText}>{tag}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noTags}>No AI tags available</Text>
                  )}
                </View>
              </ScrollView>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelectedImage(null)}
              >
                <Text style={styles.closeBtnText}>✕ Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    padding: 24,
  },
  // Header
  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 32,
    paddingBottom: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A2E",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1A1A2E",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchBtn: {
    marginLeft: 8,
    height: 44,
    paddingHorizontal: 20,
    backgroundColor: "#4A90D9",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  filterInput: {
    height: 44,
    backgroundColor: "#EEF4FF",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1A1A2E",
    borderWidth: 1,
    borderColor: "#C5D8F5",
    marginBottom: 10,
  },
  resultCount: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  // Cards
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardLeft: {
    marginRight: 6,
  },
  cardRight: {
    marginLeft: 6,
  },
  cardImage: {
    width: "100%",
    height: CARD_WIDTH * 0.75,
    backgroundColor: "#E8EAED",
  },
  cardOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  analyzingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  analyzingText: {
    color: "#fff",
    fontSize: 10,
    marginLeft: 4,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  tag: {
    backgroundColor: "rgba(74,144,217,0.85)",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cardUser: {
    fontSize: 11,
    color: "#555",
    flex: 1,
    marginRight: 4,
  },
  cardLikes: {
    fontSize: 11,
    color: "#E05C5C",
    fontWeight: "600",
  },
  // Footer loader
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    color: "#888",
    fontSize: 13,
    marginLeft: 8,
  },
  // Loading / Error
  loadingText: {
    marginTop: 12,
    color: "#888",
    fontSize: 15,
  },
  errorIcon: {
    fontSize: 40,
  },
  errorText: {
    color: "#E05C5C",
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: "#4A90D9",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
  },
  // Empty
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    color: "#888",
    fontSize: 15,
    textAlign: "center",
  },
  clearFilter: {
    color: "#4A90D9",
    marginTop: 10,
    fontWeight: "600",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    maxHeight: "90%",
  },
  modalImage: {
    width: "100%",
    height: 260,
    backgroundColor: "#E8EAED",
  },
  modalInfo: {
    padding: 20,
    maxHeight: 280,
  },
  modalUser: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 4,
  },
  modalMeta: {
    fontSize: 13,
    color: "#888",
    marginBottom: 14,
  },
  modalTagsLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
    marginBottom: 6,
    marginTop: 4,
  },
  modalPixabayTags: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
    fontStyle: "italic",
  },
  modalAiTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  modalTag: {
    backgroundColor: "#EEF4FF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#C5D8F5",
  },
  modalTagText: {
    color: "#4A90D9",
    fontWeight: "600",
    fontSize: 13,
  },
  analyzingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  analyzingLabel: {
    color: "#888",
    fontSize: 13,
    marginLeft: 8,
  },
  noTags: {
    color: "#aaa",
    fontSize: 13,
    fontStyle: "italic",
  },
  closeBtn: {
    margin: 16,
    backgroundColor: "#1A1A2E",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  closeBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});

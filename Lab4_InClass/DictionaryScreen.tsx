import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import * as SQLite from 'expo-sqlite';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DictEntry {
  id: number;
  word: string;
  definition: string;
}

type ResultState =
  | { type: 'idle' }
  | { type: 'exact'; entry: DictEntry }
  | { type: 'suggestions'; words: DictEntry[] }
  | { type: 'notfound' };

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_WORDS: { word: string; definition: string }[] = [
  { word: 'apple', definition: 'A round fruit with red, yellow, or green skin and a whitish interior.' },
  { word: 'application', definition: 'A program or piece of software designed for a particular purpose.' },
  { word: 'apply', definition: 'To make a formal request or put something to use.' },
  { word: 'appetite', definition: 'A natural desire to satisfy a bodily need, especially for food.' },
  { word: 'banana', definition: 'A long curved fruit with a yellow skin and soft sweet flesh.' },
  { word: 'battery', definition: 'A container consisting of one or more cells for storing electric charge.' },
  { word: 'beautiful', definition: 'Pleasing the senses or mind aesthetically.' },
  { word: 'bench', definition: 'A long seat for several people, typically made of wood or stone.' },
  { word: 'bicycle', definition: 'A vehicle with two wheels tandem, handlebars, and a seat.' },
  { word: 'bridge', definition: 'A structure built to span a physical obstacle such as a river.' },
  { word: 'camera', definition: 'A device for recording visual images in the form of photographs or video.' },
  { word: 'capital', definition: 'The city or town that functions as the seat of government.' },
  { word: 'cloud', definition: 'A visible mass of condensed water vapour floating in the atmosphere.' },
  { word: 'computer', definition: 'An electronic device for storing and processing data.' },
  { word: 'dance', definition: 'To move rhythmically to music, typically following a set sequence of steps.' },
  { word: 'democracy', definition: 'A system of government by the whole population through elected representatives.' },
  { word: 'desert', definition: 'A waterless, desolate area of land with little or no vegetation.' },
  { word: 'dictionary', definition: 'A book listing words of a language with their definitions and meanings.' },
  { word: 'dragon', definition: 'A large mythical creature resembling a reptile with wings and fire breath.' },
  { word: 'dream', definition: "A series of thoughts, images, and sensations occurring in a person's mind during sleep." },
  { word: 'earth', definition: 'The planet on which we live; the world.' },
  { word: 'eclipse', definition: 'An obscuring of the light from one celestial body by the passage of another.' },
  { word: 'elephant', definition: 'A very large mammal with a trunk, long curved ivory tusks, and large ears.' },
  { word: 'energy', definition: 'The strength and vitality required for sustained physical or mental activity.' },
  { word: 'engine', definition: 'A machine with moving parts that converts power into motion.' },
  { word: 'explore', definition: 'To travel through an unfamiliar area in order to learn about it.' },
  { word: 'fiction', definition: 'Literature describing imaginary events and people.' },
  { word: 'flower', definition: 'The seed-bearing part of a plant, consisting of reproductive organs.' },
  { word: 'forest', definition: 'A large area covered chiefly with trees and undergrowth.' },
  { word: 'freedom', definition: 'The power or right to act, speak, or think as one wants.' },
  { word: 'galaxy', definition: 'A system of millions or billions of stars held together by gravitational attraction.' },
  { word: 'garden', definition: 'A piece of ground used for growing flowers, vegetables, or fruit.' },
  { word: 'gravity', definition: 'The force that attracts a body toward the center of the earth.' },
  { word: 'guitar', definition: 'A stringed musical instrument with a fretted fingerboard.' },
  { word: 'harmony', definition: 'The combination of simultaneously sounded musical notes to produce a pleasing effect.' },
  { word: 'history', definition: 'The study of past events, particularly in human affairs.' },
  { word: 'horizon', definition: "The line at which the earth's surface and the sky appear to meet." },
  { word: 'hospital', definition: 'An institution providing medical and surgical treatment and nursing care.' },
  { word: 'hurricane', definition: 'A storm with a violent wind, especially a tropical cyclone.' },
  { word: 'idea', definition: 'A thought or suggestion as to a possible course of action.' },
  { word: 'imagination', definition: 'The faculty of forming new ideas or images not present to the senses.' },
  { word: 'island', definition: 'A piece of land surrounded by water.' },
  { word: 'journey', definition: 'An act of traveling from one place to another.' },
  { word: 'jungle', definition: 'An area of land overgrown with dense forest and tangled vegetation.' },
  { word: 'justice', definition: 'Just behaviour or treatment; the quality of being fair and reasonable.' },
  { word: 'knowledge', definition: 'Facts, information, and skills acquired through experience or education.' },
  { word: 'language', definition: 'The method of human communication, spoken or written.' },
  { word: 'library', definition: 'A building containing collections of books and resources for reading.' },
  { word: 'lightning', definition: 'The occurrence of a natural electrical discharge during a storm.' },
  { word: 'memory', definition: 'The faculty by which the mind stores and remembers information.' },
  { word: 'mountain', definition: "A large natural elevation of the earth's surface rising abruptly." },
  { word: 'music', definition: 'Vocal or instrumental sounds combined to produce beauty of form and expression.' },
  { word: 'mystery', definition: 'Something that is difficult or impossible to understand or explain.' },
  { word: 'network', definition: 'An arrangement of intersecting horizontal and vertical lines.' },
  { word: 'ocean', definition: 'A very large expanse of sea, in particular each of the main areas.' },
  { word: 'opportunity', definition: 'A set of circumstances that makes it possible to do something.' },
  { word: 'orbit', definition: 'The curved path of a celestial object around a star or planet.' },
  { word: 'painting', definition: 'The process or art of using paint to produce a picture or decoration.' },
  { word: 'paradise', definition: 'A place or state of ideal happiness and beauty.' },
  { word: 'philosophy', definition: 'The study of the fundamental nature of knowledge, reality, and existence.' },
  { word: 'planet', definition: 'A celestial body moving in an elliptical orbit around a star.' },
  { word: 'poetry', definition: 'Literary work in which the expression of feelings uses distinctive style and rhythm.' },
  { word: 'rainbow', definition: 'An arch of colors visible in the sky caused by refraction of sunlight.' },
  { word: 'river', definition: 'A large natural stream of water flowing to the sea, a lake, or another river.' },
  { word: 'robot', definition: 'A machine capable of carrying out complex actions automatically.' },
  { word: 'science', definition: 'The intellectual and practical activity encompassing systematic study of the world.' },
  { word: 'shadow', definition: 'A dark area produced by a body coming between rays of light and a surface.' },
  { word: 'silence', definition: 'Complete absence of sound.' },
  { word: 'software', definition: 'Programs and other operating information used by a computer.' },
  { word: 'space', definition: 'A continuous area or expanse that is free, available, or unoccupied.' },
  { word: 'spectrum', definition: 'A band of colors produced by separation of components of light.' },
  { word: 'storm', definition: 'A violent disturbance of the atmosphere with strong winds and rain.' },
  { word: 'symphony', definition: 'An elaborate musical composition for full orchestra.' },
  { word: 'telescope', definition: 'An optical instrument for making distant objects appear nearer.' },
  { word: 'thunder', definition: 'A loud rumbling sound caused by lightning expanding surrounding air.' },
  { word: 'time', definition: 'The indefinite continued progress of existence and events in the past, present, and future.' },
  { word: 'treasure', definition: 'A quantity of precious metals, gems, or other valuable objects.' },
  { word: 'universe', definition: 'All existing matter and space considered as a whole; the cosmos.' },
  { word: 'valley', definition: 'A low area of land between hills or mountains.' },
  { word: 'velocity', definition: 'The speed of something in a given direction.' },
  { word: 'verisimilitude', definition: 'The appearance of being true or real; believability.' },
  { word: 'volcano', definition: 'A mountain or hill having a crater through which lava erupts.' },
  { word: 'water', definition: 'A colorless, transparent, odorless liquid that forms seas, lakes, and rain.' },
  { word: 'wilderness', definition: 'An uncultivated, uninhabited, and inhospitable region.' },
  { word: 'wisdom', definition: 'The quality of having experience, knowledge, and good judgement.' },
  { word: 'wonder', definition: 'A feeling of amazement and admiration caused by something beautiful or new.' },
  { word: 'world', definition: 'The earth, together with all of its countries and peoples.' },
  { word: 'xenon', definition: 'A colorless, dense, odorless noble gas found in the atmosphere in trace amounts.' },
  { word: 'yesterday', definition: 'On the day before today; the recent past.' },
  { word: 'zenith', definition: 'The time at which something is most powerful or successful; the highest point.' },
];

// ─── Web fallback (localStorage) ─────────────────────────────────────────────

const isWeb = Platform.OS === 'web';
let webStore: DictEntry[] = [];

function initWebStore() {
  if (webStore.length > 0) return;
  try {
    const saved = localStorage.getItem('dictionary_db');
    if (saved) { webStore = JSON.parse(saved); return; }
  } catch {}
  webStore = SEED_WORDS.map((w, i) => ({ id: i + 1, ...w }));
  try { localStorage.setItem('dictionary_db', JSON.stringify(webStore)); } catch {}
}

function webLookupExact(word: string): DictEntry | null {
  return webStore.find((e) => e.word.toLowerCase() === word.trim().toLowerCase()) ?? null;
}

function webLookupSubstring(query: string): DictEntry[] {
  const q = query.trim().toLowerCase();
  return webStore
    .filter((e) => e.word.toLowerCase().includes(q))
    .sort((a, b) => a.word.localeCompare(b.word))
    .slice(0, 50);
}

// ─── Native SQLite helpers (expo-sqlite >= 14, Expo 51) ───────────────────────

function openDb(): SQLite.SQLiteDatabase {
  return SQLite.openDatabaseSync('dictionary.db');
}

function initDb(db: SQLite.SQLiteDatabase) {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS dictionary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT UNIQUE NOT NULL,
      definition TEXT NOT NULL
    );
  `);
  const count = db.getFirstSync<{ cnt: number }>('SELECT COUNT(*) as cnt FROM dictionary;');
  if (count && count.cnt === 0) {
    db.withTransactionSync(() => {
      for (const entry of SEED_WORDS) {
        db.runSync(
          'INSERT OR IGNORE INTO dictionary (word, definition) VALUES (?, ?);',
          entry.word,
          entry.definition
        );
      }
    });
  }
}

function lookupExact(db: SQLite.SQLiteDatabase, word: string): DictEntry | null {
  return db.getFirstSync<DictEntry>(
    'SELECT * FROM dictionary WHERE word = ? COLLATE NOCASE;',
    word.trim().toLowerCase()
  ) ?? null;
}

function lookupSubstring(db: SQLite.SQLiteDatabase, query: string): DictEntry[] {
  return db.getAllSync<DictEntry>(
    'SELECT * FROM dictionary WHERE word LIKE ? COLLATE NOCASE ORDER BY word ASC LIMIT 50;',
    `%${query.trim().toLowerCase()}%`
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DictionaryScreen() {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ResultState>({ type: 'idle' });
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (isWeb) {
      initWebStore();
      setReady(true);
    } else {
      try {
        const database = openDb();
        initDb(database);
        setDb(database);
      } catch (e) {
        console.error('SQLite init error:', e);
      } finally {
        setReady(true);
      }
    }
  }, []);

  const handleLookup = () => {
    if ((!db && !isWeb) || !input.trim()) return;
    setSearching(true);
    setResult({ type: 'idle' });

    try {
      let exact: DictEntry | null = null;
      let suggestions: DictEntry[] = [];

      if (isWeb) {
        exact = webLookupExact(input);
        if (!exact) suggestions = webLookupSubstring(input);
      } else if (db) {
        exact = lookupExact(db, input);
        if (!exact) suggestions = lookupSubstring(db, input);
      }

      if (exact) {
        setResult({ type: 'exact', entry: exact });
      } else if (suggestions.length > 0) {
        setResult({ type: 'suggestions', words: suggestions });
      } else {
        setResult({ type: 'notfound' });
      }
    } catch (e) {
      setResult({ type: 'notfound' });
    } finally {
      setSearching(false);
    }
  };

  const handleSuggestionPress = (word: string) => {
    setInput(word);
    let exact: DictEntry | null = null;
    if (isWeb) {
      exact = webLookupExact(word);
    } else if (db) {
      exact = lookupExact(db, word);
    }
    if (exact) setResult({ type: 'exact', entry: exact });
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (!ready) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E5BBA" />
        <Text style={styles.loadingText}>Loading dictionary…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📖 Dictionary</Text>
        <Text style={styles.headerSub}>{SEED_WORDS.length} words · {isWeb ? 'localStorage' : 'SQLite'}</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a word…"
          placeholderTextColor="#9AA5C4"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleLookup}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.lookupBtn, !input.trim() && styles.lookupBtnDisabled]}
          onPress={handleLookup}
          disabled={!input.trim()}
        >
          {searching ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.lookupBtnText}>LOOKUP</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Results */}
      <View style={styles.results}>
        {result.type === 'idle' && (
          <View style={styles.idleContainer}>
            <Text style={styles.idleIcon}>🔍</Text>
            <Text style={styles.idleText}>Search for any word above</Text>
            <Text style={styles.idleHint}>
              Exact match shows definition · partial match shows suggestions
            </Text>
          </View>
        )}

        {result.type === 'exact' && (
          <View style={styles.exactCard}>
            <View style={styles.exactHeader}>
              <Text style={styles.exactWord}>{result.entry.word}</Text>
              <View style={styles.exactBadge}>
                <Text style={styles.exactBadgeText}>exact match</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <Text style={styles.exactDefinition}>{result.entry.definition}</Text>
          </View>
        )}

        {result.type === 'suggestions' && (
          <>
            <Text style={styles.suggestionsHeader}>
              No exact match — did you mean one of these?
            </Text>
            <FlatList
              data={result.words}
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionCard}
                  onPress={() => handleSuggestionPress(item.word)}
                  activeOpacity={0.75}
                >
                  <View style={styles.suggestionLeft}>
                    <Text style={styles.suggestionWord}>{item.word}</Text>
                    <Text style={styles.suggestionDef} numberOfLines={2}>
                      {item.definition}
                    </Text>
                  </View>
                  <Text style={styles.suggestionArrow}>›</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </>
        )}

        {result.type === 'notfound' && (
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundIcon}>😕</Text>
            <Text style={styles.notFoundText}>
              "{input}" not found in dictionary
            </Text>
            <Text style={styles.notFoundHint}>
              Try a different spelling or a shorter query
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F3FB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F3FB',
  },
  loadingText: {
    marginTop: 12,
    color: '#2E5BBA',
    fontSize: 15,
  },
  // Header
  header: {
    backgroundColor: '#2E5BBA',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: -22,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#2E5BBA',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A2E',
    paddingVertical: 4,
  },
  lookupBtn: {
    backgroundColor: '#2E5BBA',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  lookupBtnDisabled: {
    backgroundColor: '#9AA5C4',
  },
  lookupBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  // Results area
  results: {
    flex: 1,
    padding: 20,
    paddingTop: 24,
  },
  // Idle
  idleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  idleIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  idleText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E5BBA',
    marginBottom: 6,
  },
  idleHint: {
    fontSize: 13,
    color: '#9AA5C4',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  // Exact match
  exactCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#2E5BBA',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  exactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  exactWord: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: -0.5,
    flex: 1,
  },
  exactBadge: {
    backgroundColor: '#EEF3FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  exactBadgeText: {
    color: '#2E5BBA',
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEF3FF',
    marginBottom: 14,
  },
  exactDefinition: {
    fontSize: 16,
    color: '#444',
    lineHeight: 26,
  },
  // Suggestions
  suggestionsHeader: {
    fontSize: 14,
    color: '#9AA5C4',
    marginBottom: 14,
    fontStyle: 'italic',
  },
  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  suggestionLeft: {
    flex: 1,
  },
  suggestionWord: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E5BBA',
    marginBottom: 3,
  },
  suggestionDef: {
    fontSize: 13,
    color: '#888',
    lineHeight: 19,
  },
  suggestionArrow: {
    fontSize: 22,
    color: '#C5D0E8',
    marginLeft: 12,
  },
  separator: {
    height: 10,
  },
  // Not found
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  notFoundIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E05C5C',
    textAlign: 'center',
    marginBottom: 6,
  },
  notFoundHint: {
    fontSize: 13,
    color: '#9AA5C4',
    textAlign: 'center',
  },
});
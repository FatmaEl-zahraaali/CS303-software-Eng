import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { getFunctions, httpsCallable } from 'firebase/functions';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  LogBox,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

LogBox.ignoreLogs(['Method readAsStringAsync imported from "expo-file-system" is deprecated']);

interface AIResponse {
  answer: string;
  example: string;
  summary: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export default function AIAssistantScreen() {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<AIResponse | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizSize, setQuizSize] = useState(5);
  const [activeTab, setActiveTab] = useState<'explain' | 'quiz'>('explain');

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (result.assets) {
      setSelectedFile(result.assets[0]);
      setAnswer(null);
      setQuizQuestions([]);
    }
  };

  const callAI = async (type: 'explain' | 'quiz') => {
    if (!selectedFile) return Alert.alert('No File', 'Upload a PDF first');
    if (type === 'explain' && !question.trim()) return Alert.alert('No Question', 'Type your question');

    setLoading(true);
    const functions = getFunctions();

    const base64 = await readAsStringAsync(selectedFile.uri, {
    encoding: 'base64',
    });

    const askTutor = httpsCallable(functions, 'askTutor');

    try {
      if (type === 'explain') {
        const res = await askTutor({ fileBase64: base64, question: question.trim() });
        setAnswer((res.data as any).data);
      } else {
        const res = await askTutor({
          fileBase64: base64,
          question: `Generate ${quizSize} multiple-choice questions from this lecture. Return JSON: { "questions": [ { "question": "", "options": [], "correct": 0, "explanation": "" } ] }`,
        });
        setQuizQuestions((res.data as any).data.questions);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const QuizSizeSelector = () => (
    <View style={styles.sizeSelector}>
      {[5, 10, 15].map((size) => (
        <TouchableOpacity
          key={size}
          style={[styles.sizeBtn, quizSize === size && styles.sizeActive]}
          onPress={() => setQuizSize(size)}
        >
          <Text style={[styles.sizeText, quizSize === size && styles.sizeActiveText]}>{size} Qs</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#11998e', '#38ef7d']} style={styles.header}>
        <Ionicons name="chatbubbles-outline" size={40} color="#fff" />
        <Text style={styles.headerTitle}>AI Study Assistant</Text>
        <Text style={styles.headerSubtitle}>Ask or Generate Quiz</Text>
      </LinearGradient>

      <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument}>
        <Ionicons name="document-text-outline" size={20} color="#11998e" />
        <Text style={styles.uploadText}>{selectedFile ? selectedFile.name : 'Upload PDF'}</Text>
      </TouchableOpacity>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'explain' && styles.activeTab]}
          onPress={() => setActiveTab('explain')}
        >
          <Text style={[styles.tabText, activeTab === 'explain' && styles.activeTabText]}>Explanation</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'quiz' && styles.activeTab]}
          onPress={() => setActiveTab('quiz')}
        >
          <Text style={[styles.tabText, activeTab === 'quiz' && styles.activeTabText]}>Quiz</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'explain' ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="e.g., Explain closures in JavaScript"
            value={question}
            onChangeText={setQuestion}
            multiline
          />
          <TouchableOpacity style={styles.actionBtn} onPress={() => callAI('explain')} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Ask AI</Text>}
          </TouchableOpacity>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#11998e" />
              <Text style={styles.thinkingText}> AI is analyzing your file...</Text>
            </View>
          )}

          {answer && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Explanation</Text>
              <Text style={styles.text}>{answer.answer}</Text>
              <Text style={styles.cardTitle}> Example</Text>
              <Text style={styles.text}>{answer.example}</Text>
              <Text style={styles.cardTitle}> Summary</Text>
              <Text style={styles.text}>{answer.summary}</Text>
            </View>
          )}
        </>
      ) : (
        <>
          <QuizSizeSelector />
          <TouchableOpacity style={styles.actionBtn} onPress={() => callAI('quiz')} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}> Generate Quiz</Text>}
          </TouchableOpacity>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#11998e" />
              <Text style={styles.thinkingText}> AI is generating {quizSize} questions...</Text>
            </View>
          )}

          {quizQuestions.map((q, idx) => (
            <View key={idx} style={styles.quizCard}>
              <Text style={styles.qText}>{idx + 1}. {q.question}</Text>
              {q.options.map((opt, i) => (
                <Text key={i} style={styles.optText}>
                  {String.fromCharCode(65 + i)}. {opt}
                </Text>
              ))}
              <Text style={styles.correct}> Correct: {q.options[q.correct]}</Text>
              <Text style={styles.explain}>{q.explanation}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { paddingTop: 60, paddingBottom: 24, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 12 },
  headerSubtitle: { fontSize: 13, color: '#e0e0e0', marginTop: 4 },
  uploadBtn: { flexDirection: 'row', margin: 16, padding: 12, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', gap: 8 },
  uploadText: { fontSize: 14, color: '#11998e', flex: 1 },
  tabContainer: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, backgroundColor: '#fff', borderRadius: 30, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 30, alignItems: 'center' },
  activeTab: { backgroundColor: '#11998e' },
  tabText: { fontWeight: 'bold', color: '#888' },
  activeTabText: { color: '#fff' },
  sizeSelector: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12, gap: 12 },
  sizeBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: '#e0e0e0' },
  sizeActive: { backgroundColor: '#11998e' },
  sizeText: { fontWeight: 'bold', color: '#333' },
  sizeActiveText: { color: '#fff' },
  input: { backgroundColor: '#fff', margin: 16, padding: 12, borderRadius: 16, minHeight: 80, textAlignVertical: 'top' },
  actionBtn: { backgroundColor: '#11998e', marginHorizontal: 16, padding: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  loadingContainer: { alignItems: 'center', marginVertical: 20 },
  thinkingText: { marginTop: 12, fontSize: 14, color: '#11998e', textAlign: 'center' },
  card: { backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 16, gap: 8 },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#11998e' },
  text: { fontSize: 14, color: '#333' },
  quizCard: { backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 16, gap: 6 },
  qText: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  optText: { fontSize: 14, marginLeft: 16 },
  correct: { fontWeight: 'bold', color: '#2e7d32', marginTop: 8 },
  explain: { fontSize: 12, color: '#555', marginTop: 4 },
});
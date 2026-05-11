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
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

LogBox.ignoreLogs(['Method readAsStringAsync imported from "expo-file-system" is deprecated']);

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function AIGeneratorScreen() {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [numQuestions, setNumQuestions] = useState('5');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [quizName, setQuizName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (result.assets) setSelectedFile(result.assets[0]);
  };

  const generateQuiz = async () => {
    if (!selectedFile) return Alert.alert('No File', 'Please select a PDF');
    if (!quizName.trim()) return Alert.alert('No Name', 'Please enter a quiz name');

    setLoading(true);
    const base64 = await readAsStringAsync(selectedFile.uri, {
      encoding: 'base64',
    });
    const functions = getFunctions();
    const generate = httpsCallable(functions, 'generateQuiz');

    try {
      const result = await generate({
        fileBase64: base64,
        numQuestions: parseInt(numQuestions),
        difficulty,
        courseCode: 'CS303',
      });
      const data = result.data as any;
      setGeneratedQuestions(data.questions);
      Alert.alert(' Success', `${data.count} questions generated!`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (index: number) => {
    setEditingIndex(index);
    setEditQuestion({ ...generatedQuestions[index] });
    setEditModalVisible(true);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editQuestion) {
      const updated = [...generatedQuestions];
      updated[editingIndex] = editQuestion;
      setGeneratedQuestions(updated);
      setEditModalVisible(false);
      Alert.alert('Updated', 'Question saved');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Ionicons name="bulb-outline" size={40} color="#fff" />
        <Text style={styles.headerTitle}>AI Quiz Generator</Text>
        <Text style={styles.headerSubtitle}>Generate questions from PDF</Text>
      </LinearGradient>

      <TextInput
        style={styles.quizName}
        placeholder="Quiz Name (e.g., Midterm Exam)"
        value={quizName}
        onChangeText={setQuizName}
      />

      <TouchableOpacity style={styles.uploadBtn} onPress={pickDocument}>
        <Ionicons name="document-text-outline" size={20} color="#667eea" />
        <Text style={styles.uploadText}>{selectedFile ? selectedFile.name : 'Upload PDF'}</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <TextInput
          style={styles.inputSmall}
          placeholder="Questions"
          value={numQuestions}
          onChangeText={setNumQuestions}
          keyboardType="numeric"
        />
        <View style={styles.difficultyRow}>
          {['Easy', 'Medium', 'Hard'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.badge, difficulty === level && styles.activeBadge]}
              onPress={() => setDifficulty(level as any)}
            >
              <Text style={difficulty === level ? styles.activeText : undefined}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.generateBtn} onPress={generateQuiz} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Generate & Save</Text>}
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.thinkingText}> AI is generating {numQuestions} questions...</Text>
        </View>
      )}

      {generatedQuestions.map((q, idx) => (
        <View key={idx} style={styles.questionCard}>
          <Text style={styles.qText}>
            {idx + 1}. {q.questionText}
          </Text>
          {q.options.map((opt, j) => (
            <Text key={j} style={styles.optText}>
              {String.fromCharCode(65 + j)}. {opt}
            </Text>
          ))}
          <Text style={styles.correct}>Correct: {q.correctAnswer}</Text>
          <Text style={styles.explain}> {q.explanation}</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(idx)}>
            <Ionicons name="create-outline" size={18} color="#667eea" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Question</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Question"
              value={editQuestion?.questionText}
              onChangeText={(text) => setEditQuestion((prev) => (prev ? { ...prev, questionText: text } : null))}
            />
            {editQuestion?.options.map((opt, idx) => (
              <TextInput
                key={idx}
                style={styles.modalInput}
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChangeText={(text) => {
                  const newOpts = [...(editQuestion?.options || [])];
                  newOpts[idx] = text;
                  setEditQuestion((prev) => (prev ? { ...prev, options: newOpts } : null));
                }}
              />
            ))}
            <TextInput
              style={styles.modalInput}
              placeholder="Correct Answer"
              value={editQuestion?.correctAnswer}
              onChangeText={(text) => setEditQuestion((prev) => (prev ? { ...prev, correctAnswer: text } : null))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Explanation"
              value={editQuestion?.explanation}
              onChangeText={(text) => setEditQuestion((prev) => (prev ? { ...prev, explanation: text } : null))}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={{ color: 'red' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit}>
                <Text style={{ color: 'green', fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { paddingTop: 60, paddingBottom: 24, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 12 },
  headerSubtitle: { fontSize: 13, color: '#e0e0e0', marginTop: 4 },
  quizName: { margin: 16, padding: 12, backgroundColor: '#fff', borderRadius: 12, fontSize: 16, fontWeight: 'bold' },
  uploadBtn: { flexDirection: 'row', marginHorizontal: 16, padding: 12, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', gap: 8 },
  uploadText: { fontSize: 14, color: '#667eea', flex: 1 },
  row: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, gap: 12 },
  inputSmall: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 12 },
  difficultyRow: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e2e8f0' },
  activeBadge: { backgroundColor: '#667eea' },
  activeText: { color: '#fff', fontWeight: 'bold' },
  generateBtn: { backgroundColor: '#667eea', marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  loadingContainer: { alignItems: 'center', marginVertical: 20 },
  thinkingText: { marginTop: 12, fontSize: 14, color: '#667eea', textAlign: 'center' },
  questionCard: { backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 16, gap: 6 },
  qText: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  optText: { fontSize: 14, marginLeft: 16 },
  correct: { fontWeight: 'bold', color: '#2e7d32', marginTop: 8 },
  explain: { fontSize: 12, color: '#555', marginTop: 4 },
  editBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  editText: { color: '#667eea', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
  modalContent: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 20, gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 10 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
});

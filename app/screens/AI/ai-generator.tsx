import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  LogBox,
  Modal,
  Platform,
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

const readFileAsBase64 = async (fileUri: string): Promise<string> => {
  if (Platform.OS === 'web') {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } else {
    return await readAsStringAsync(fileUri, { encoding: 'base64' });
  }
};

const pickDocumentWeb = () => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const uri = URL.createObjectURL(file);
        resolve({ uri, name: file.name });
      } else {
        reject('No file selected');
      }
    };
    input.click();
  });
};

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
  const [fontSize, setFontSize] = useState(14);

  const pickDocument = async () => {
    if (Platform.OS === 'web') {
      const file = await pickDocumentWeb();
      setSelectedFile(file);
    } else {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (result.assets) setSelectedFile(result.assets[0]);
    }
  };

  const handleShareQuiz = async () => {
    if (!generatedQuestions.length) {
      Alert.alert('No Questions', 'Generate questions first');
      return;
    }

    let shareText = ` ${quizName || 'Quiz'}\n`;
    shareText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    shareText += ` Instructions:\n`;
    shareText += `• Read each question carefully.\n`;
    shareText += `• Choose the correct option (A, B, C, or D).\n`;
    shareText += `• Write your answer in the space provided.\n\n`;
    shareText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    generatedQuestions.forEach((q, idx) => {
      shareText += `${idx + 1}. ${q.questionText}\n`;
      q.options.forEach((opt, j) => {
        shareText += `   ${String.fromCharCode(65 + j)}. ${opt}\n`;
      });
      shareText += `\n   Answer: ___________ (A/B/C/D)\n\n`;
      shareText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    });

    shareText += `Good Luck! `;

    try {
      await Sharing.shareAsync(shareText);
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert('Error', 'Could not share. Please try again.');
    }
  };

  const saveEdit = () => {
    if (editingIndex !== null && editQuestion) {
      const updated = [...generatedQuestions];
      updated[editingIndex] = editQuestion;
      setGeneratedQuestions(updated);
      setEditModalVisible(false);
      Alert.alert(' تم التحديث', 'السؤال تم تعديله بنجاح');
    }
  };

  const deleteQuestion = (index: number) => {
    Alert.alert(
      'Delete Question',
      'Are you sure you want to delete this question?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = [...generatedQuestions];
            updated.splice(index, 1);
            setGeneratedQuestions(updated);
            Alert.alert('Deleted', 'Question removed from quiz');
          },
        },
      ]
    );
  };

  const generateQuiz = async () => {
    if (!selectedFile) return Alert.alert('No File', 'Please select a PDF');
    if (!quizName.trim()) return Alert.alert('No Name', 'Please enter a quiz name');

    setLoading(true);
    try {
      const base64 = await readFileAsBase64(selectedFile.uri);
      
      const functions = getFunctions();
      if (Platform.OS === 'web' && process.env.NODE_ENV === 'development') {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      const generate = httpsCallable(functions, 'generateQuiz');

      const result = await generate({
        fileBase64: base64,
        numQuestions: parseInt(numQuestions),
        difficulty,
        courseCode: 'CS303',
      });
      
      const data = result.data as any;
      console.log(" Response from function:", data);
      
      const questions = data.questions || (data.data?.questions);
      if (questions && Array.isArray(questions)) {
        const processedQuestions = questions.map((q: any) => {
          let correctLetter = q.correctAnswer;
          if (!['A', 'B', 'C', 'D'].includes(correctLetter)) {
            const index = q.options.findIndex((opt: string) => opt === correctLetter);
            if (index !== -1) {
              correctLetter = String.fromCharCode(65 + index);
            }
          }
          return {
            ...q,
            correctAnswer: correctLetter,
          };
        });
        setGeneratedQuestions(processedQuestions);
        Alert.alert(' Success', `${questions.length} questions generated!`);
      } else {
        console.error("Unexpected response structure:", data);
        Alert.alert('Error', 'Invalid response from server');
      }
    } catch (err: any) {
      console.error("Error:", err);
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (index: number) => {
    setEditingIndex(index);
    setEditQuestion({ ...generatedQuestions[index] });
    setEditModalVisible(true);
  };

  const getCorrectLetter = (question: Question) => {
    if (['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
      return question.correctAnswer;
    }
    const index = question.options.findIndex(opt => opt === question.correctAnswer);
    return index !== -1 ? String.fromCharCode(65 + index) : 'A';
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
        <Text style={styles.uploadText}>{selectedFile ? selectedFile.name : ' Upload PDF'}</Text>
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

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.generateBtn} onPress={generateQuiz} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}> Generate</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShareQuiz}>
          <Ionicons name="share-social-outline" size={20} color="#fff" />
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.thinkingText}> AI is generating {numQuestions} questions...</Text>
        </View>
      )}

      {generatedQuestions.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}> {quizName} - {generatedQuestions.length} Questions</Text>
          <View style={styles.fontSizeRow}>
            <Text style={styles.fontSizeLabel}>A</Text>
            <TouchableOpacity onPress={() => setFontSize(Math.max(10, fontSize - 2))}>
              <Text style={styles.fontSizeBtn}>-</Text>
            </TouchableOpacity>
            <Text style={styles.fontSizeValue}>{fontSize}</Text>
            <TouchableOpacity onPress={() => setFontSize(Math.min(24, fontSize + 2))}>
              <Text style={styles.fontSizeBtn}>+</Text>
            </TouchableOpacity>
            <Text style={styles.fontSizeLabel}>A</Text>
          </View>
        </View>
      )}

      {generatedQuestions.map((q, idx) => (
        <View key={idx} style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={[styles.qText, { fontSize: fontSize + 2 }]}>
              {idx + 1}. {q.questionText}
            </Text>
            <View style={styles.questionActions}>
              <TouchableOpacity onPress={() => openEditModal(idx)}>
                <Ionicons name="create-outline" size={20} color="#667eea" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteQuestion(idx)}>
                <Ionicons name="trash-outline" size={20} color="#ff4444" />
              </TouchableOpacity>
            </View>
          </View>
          {q.options.map((opt, j) => (
            <Text key={j} style={[styles.optText, { fontSize }]}>
              {String.fromCharCode(65 + j)}. {opt}
            </Text>
          ))}
          <Text style={[styles.correct, { fontSize }]}> Correct: {getCorrectLetter(q)}</Text>
          <Text style={[styles.explain, { fontSize: fontSize - 2 }]}> {q.explanation}</Text>
        </View>
      ))}

      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}> Edit Question</Text>
            
            <Text style={styles.modalLabel}>Question Text:</Text>
            <TextInput
              style={styles.modalInput}
              multiline
              value={editQuestion?.questionText}
              onChangeText={(text) => setEditQuestion((prev) => (prev ? { ...prev, questionText: text } : null))}
            />
            
            {editQuestion?.options.map((opt, idx) => (
              <View key={idx}>
                <Text style={styles.modalLabel}>Option {idx + 1}:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={opt}
                  onChangeText={(text) => {
                    const newOpts = [...(editQuestion?.options || [])];
                    newOpts[idx] = text;
                    setEditQuestion((prev) => (prev ? { ...prev, options: newOpts } : null));
                  }}
                />
              </View>
            ))}
            
            <Text style={styles.modalLabel}>Correct Answer (A, B, C, or D):</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="A, B, C, or D"
              value={editQuestion?.correctAnswer}
              onChangeText={(text) => setEditQuestion((prev) => (prev ? { ...prev, correctAnswer: text.toUpperCase() } : null))}
            />
            
            <Text style={styles.modalLabel}>Explanation:</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              multiline
              value={editQuestion?.explanation}
              onChangeText={(text) => setEditQuestion((prev) => (prev ? { ...prev, explanation: text } : null))}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={saveEdit}>
                <Text style={styles.modalSaveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  uploadBtn: { flexDirection: 'row', marginHorizontal: 16, marginTop: 8, padding: 12, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', gap: 8 },
  uploadText: { fontSize: 14, color: '#667eea', flex: 1 },
  row: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, gap: 12 },
  inputSmall: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 12 },
  difficultyRow: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e2e8f0' },
  activeBadge: { backgroundColor: '#667eea' },
  activeText: { color: '#fff', fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, gap: 12 },
  generateBtn: { flex: 2, backgroundColor: '#667eea', padding: 12, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  shareBtn: { flex: 1, backgroundColor: '#2196F3', padding: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4 },
  shareBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  loadingContainer: { alignItems: 'center', marginVertical: 20 },
  thinkingText: { marginTop: 12, fontSize: 14, color: '#667eea', textAlign: 'center' },
  resultsHeader: { marginHorizontal: 16, marginTop: 16, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultsTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  fontSizeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  fontSizeLabel: { fontSize: 16, fontWeight: 'bold', color: '#667eea' },
  fontSizeBtn: { fontSize: 18, fontWeight: 'bold', color: '#667eea', paddingHorizontal: 8 },
  fontSizeValue: { fontSize: 14, color: '#333', minWidth: 24, textAlign: 'center' },
  questionCard: { backgroundColor: '#fff', margin: 16, marginTop: 8, padding: 16, borderRadius: 16, gap: 6 },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  qText: { fontWeight: 'bold', flex: 1, marginRight: 12 },
  questionActions: { flexDirection: 'row', gap: 12 },
  optText: { marginLeft: 16 },
  correct: { fontWeight: 'bold', color: '#2e7d32', marginTop: 8 },
  explain: { color: '#555', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  modalLabel: { fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 4, color: '#333' },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, marginBottom: 8 },
  modalTextArea: { minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 },
  modalCancelBtn: { flex: 1, backgroundColor: '#f5f5f5', padding: 12, borderRadius: 12, alignItems: 'center' },
  modalCancelText: { color: '#666', fontWeight: 'bold' },
  modalSaveBtn: { flex: 1, backgroundColor: '#667eea', padding: 12, borderRadius: 12, alignItems: 'center' },
  modalSaveText: { color: '#fff', fontWeight: 'bold' },
});

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

export default function AddQuestionScreen() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [difficulty, setDifficulty] = useState('Easy');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const router = useRouter();
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const handleSave = async () => {
    if (
      !question.trim() ||
      !subject.trim() ||
      !chapter.trim() ||
      options.some(opt => !opt.trim()) ||
      correctIndex === null
    ) {
      Alert.alert("Error", "Please fill all fields, including Subject and Chapter.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "questions"), {
        subject: subject.trim(),
        chapter: parseInt(chapter),
        questionText: question,
        options: options,
        correctAnswer: options[correctIndex],
        difficulty: difficulty,
        doctorId: userData?.uid,
        doctorName: userData?.name,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Question added to the bank successfully");

      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectIndex(null);
      setSubject('');
      setChapter('');
      setShowFeedback(false);
    } catch (error) {
      Alert.alert("Error", "Failed to save the question");
    } finally {
      setLoading(false);
    }
  }

  const getOptionStyle = (index) => {
    if (!showFeedback) {
      return correctIndex === index ? styles.radioSelected : styles.radio;
    }
    if (index === correctIndex) return styles.correctFeedback;
    return styles.wrongFeedback;
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor="#007AFF" barStyle="light-content" />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Add New Question</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.label}>Subject Name</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          value={subject}
          onChangeText={setSubject}
        />

        <Text style={styles.label}>Chapter Number</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          value={chapter}
          onChangeText={setChapter}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Question Text</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Enter your question here"
          value={question}
          onChangeText={setQuestion}
          multiline
        />

        <Text style={styles.label}>Difficulty Level</Text>
        <View style={styles.diffGroup}>
          {difficulties.map(level => (
            <TouchableOpacity
              key={level}
              style={[styles.diffBtn, difficulty === level && styles.diffBtnActive]}
              onPress={() => setDifficulty(level)}
            >
              <Text style={[styles.diffText, difficulty === level && { color: '#fff' }]}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Options (Select to Test & Set Correct)</Text>
        {options.map((opt, index) => (
          <View key={index} style={styles.optionRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 10 }]}
              placeholder={`Option ${index + 1}`}
              value={opt}
              onChangeText={(text) => {
                const newOps = [...options];
                newOps[index] = text;
                setOptions(newOps);
              }}
            />
            <TouchableOpacity
              style={[styles.radio, getOptionStyle(index)]}
              onPress={() => {
                setCorrectIndex(index);
                setShowFeedback(true);
              }}
            >
              {correctIndex === index && <Ionicons name={showFeedback ? "checkmark-circle" : "checkmark"} size={18} color="white" />}
              {showFeedback && index !== correctIndex && <Ionicons name="close-circle" size={18} color="white" />}
            </TouchableOpacity>
          </View>
        ))}

        {showFeedback && (
          <Text style={styles.feedbackText}>
            Correct Answer is: {options[correctIndex]}
          </Text>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>Save to Question Bank</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    backgroundColor: "#007AFF",
    height: 100,
    width: '100%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 35,
    paddingHorizontal: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  backBtn: {
    backgroundColor: "#fff",
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1E293B'
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginTop: 15,
    marginBottom: 8
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  diffGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  diffBtn: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  diffBtnActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  diffText: {
    fontWeight: 'bold',
    color: '#64748B'
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  radio: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  radioSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  correctFeedback: {
    backgroundColor: '#34C759',
    borderColor: '#34C759'
  },
  wrongFeedback: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30'
  },
  feedbackText: {
    textAlign: 'center',
    color: '#34C759',
    fontWeight: 'bold',
    marginTop: 10
  },
  saveBtn: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});
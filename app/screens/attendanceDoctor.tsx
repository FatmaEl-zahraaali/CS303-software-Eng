import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { db } from '../../config/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

export default function AttendanceScreen() {
  const { userData } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [subjectName, setSubjectName] = useState('');

  const generateAttendanceSession = async () => {
    if (!subjectName.trim()) {
      Alert.alert("Error", "Please enter the subject name first.");
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "attendance_sessions"), {
        doctorId: userData?.uid,
        doctorName: userData?.name,
        subject: subjectName,
        createdAt: serverTimestamp(),
        active: true,
      });

      setSessionId(docRef.id);
      Alert.alert("Success", `Attendance session for ${subjectName} started.`);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not start attendance session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lecture Attendance</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : sessionId ? (
        <View style={styles.qrContainer}>
          <Text style={styles.subjectTitle}>{subjectName}</Text>
          <QRCode
            value={sessionId}
            size={220}
            color="black"
            backgroundColor="white"
          />
          <Text style={styles.sessionText}>ID: {sessionId}</Text>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#FF3B30', marginTop: 20 }]}
            onPress={() => {
              setSessionId(null);
              setSubjectName('');
            }}
          >
            <Text style={styles.buttonText}>Close Session</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Subject Name"    
            value={subjectName}
            onChangeText={setSubjectName}
          />
          <TouchableOpacity style={styles.button} onPress={generateAttendanceSession}>
            <Text style={styles.buttonText}>Generate QR Code</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, color: '#1E293B' },
  inputContainer: { width: '100%', alignItems: 'center' },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 16
  },
  qrContainer: { padding: 20, backgroundColor: 'white', borderRadius: 20, alignItems: 'center', elevation: 5 },
  subjectTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#007AFF' },
  sessionText: { marginTop: 15, fontSize: 10, color: '#94A3B8' },
  button: { backgroundColor: '#007AFF', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 12, width: '100%', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { db } from '../../config/firebaseConfig';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function DoctorResultsScreen() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "student_answers"), orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResults(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons 
          name={item.isCorrect ? "checkmark-circle" : "close-circle"} 
          size={40} 
          color={item.isCorrect ? "#34C759" : "#FF3B30"} 
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.studentName}>{item.studentName}</Text>
          <Text style={styles.questionText} numberOfLines={1}>Q: {item.questionText}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: item.isCorrect ? '#E8F5E9' : '#FFEBEE' }]}>
          <Text style={{ color: item.isCorrect ? '#2E7D32' : '#C62828', fontWeight: 'bold' }}>
            {item.isCorrect ? "Correct" : "Wrong"}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" style={{flex:1}} color="#007AFF" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Student Results</Text>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No results recorded yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1E293B' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, elevation: 3 },
  row: { flexDirection: 'row', alignItems: 'center' },
  studentName: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
  questionText: { color: '#64748B', fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  empty: { textAlign: 'center', marginTop: 50, color: '#94A3B8' }
});
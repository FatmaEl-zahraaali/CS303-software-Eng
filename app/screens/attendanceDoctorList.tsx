import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { db } from "../../config/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useLocalSearchParams } from "expo-router";

export default function AttendanceDoctorList() {
  const { sessionId } = useLocalSearchParams();
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    if (!sessionId) return;

    const q = query(
      collection(db, "attendance_records"),
      where("sessionId", "==", sessionId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })));
    });

    return () => unsub();
  }, [sessionId]);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        Attendance List
      </Text>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={{ padding: 10 }}>{item.studentName}</Text>
        )}
      />
    </View>
  );
}
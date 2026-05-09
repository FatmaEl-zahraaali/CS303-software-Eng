import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../config/firebaseConfig";

export default function AttendanceDoctorList() {
  const [courses, setCourses] = useState<any>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const snapshot = await getDocs(
      collection(db, "attendance_records")
    );

    const data: any = {};

    snapshot.docs.forEach((doc) => {
      const item = doc.data();
      const courseName = item.courseName?.trim();
      const sessionId = item.sessionId;
      const sessionTitle = item.sessionTitle;

      if (!courseName || !sessionId || !sessionTitle) return;

      const normalizedCourse = courseName.toUpperCase();

      if (!data[normalizedCourse]) {
        data[normalizedCourse] = [];
      }

      const exists = data[normalizedCourse].find(
        (s: any) => s.sessionId === sessionId
      );

      if (!exists) {
        data[normalizedCourse].push({
          sessionId,
          sessionTitle,
        });
      }
    });
    setCourses(data);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#007AFF" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance List</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {Object.keys(courses).map((course) => (
          <View key={course} style={styles.courseCard}>
            <TouchableOpacity
              style={styles.courseHeader}
              onPress={() =>
                setExpanded(expanded === course ? null : course)
              }
            >
              <Text style={styles.courseTitle}>{course}</Text>
              <Ionicons
                name={expanded === course ? "chevron-up" : "chevron-down"}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>

            {expanded === course &&
              courses[course].map((session: any) => (
                <TouchableOpacity
                  key={session.sessionId}
                  onPress={() =>
                    router.push({
                      pathname: "/screens/SessionStudents",
                      params: { sessionId: session.sessionId },
                    })
                  }
                  style={styles.sessionItem}
                >
                  <Ionicons name="document-text-outline" size={18} color="#007AFF" />
                  <Text style={styles.sessionText}>{session.sessionTitle}</Text>
                </TouchableOpacity>
              ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  header: {
    backgroundColor: "#007AFF",
    height: 100,
    width: "100%",
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
  listContent: {
    padding: 20,
  },
  courseCard: {
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },
  sessionItem: {
    marginTop: 12,
    marginLeft: 10,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 3,
    borderLeftColor: "#007AFF",
  },
  sessionText: {
    fontSize: 16,
    color: "#475569",
    marginLeft: 10,
  },
});

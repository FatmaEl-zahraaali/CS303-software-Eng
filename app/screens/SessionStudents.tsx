import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../config/firebaseConfig";
export default function SessionStudents() {
    const { sessionId } = useLocalSearchParams();
    const [students, setStudents] = useState<any[]>([]);
    const router = useRouter();
    useEffect(() => {
        if (!sessionId) return;

        const q = query(
            collection(db, "attendance_records"),
            where("sessionId", "==", sessionId)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            setStudents(
                snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
            );
        });

        return () => unsub();
    }, [sessionId]);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: "#F8FAFC",
            }}>
                <StatusBar barStyle="light-content" />
                <View style={styles.header}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>Students Attendance</Text>
             <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => { router.back() }}>
                        <Ionicons name="arrow-back" size={24} color="#007AFF" /> 
                    </TouchableOpacity>
                </View>
                </View>
            <FlatList
                data={students}
                contentContainerStyle={{ padding: 20 }}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <View style={styles.studentCard}>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.indexText}>{index + 1}.</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.studentName}>{item.studentName}</Text>
                                <Text style={styles.studentEmail}>{item.studentEmail}</Text>
                            </View>
                        </View>
                        <Image
                            source={{ uri: item.studentImage || 'https://via.placeholder.com/50' }}
                            style={styles.studentImage}
                        />
                    </View>
                )}
            />
        
        </View>
    );
}
const styles = StyleSheet.create({
    header: {
        backgroundColor: "#007AFF",
        height: 100,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        paddingTop: 35,
        paddingHorizontal: 25,
        justifyContent: "center",
        elevation: 8,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerTitle: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    studentCard: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        elevation: 2,
    },
    indexText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
        marginRight: 10,
    },
    studentName: {
        fontSize: 16,
        fontWeight: "600",
    },
    studentEmail: {
        color: "gray",
        marginTop: 2,
    },
    studentImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "#eee",
        backgroundColor: "#eee",
    },
});
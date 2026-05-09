import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getSavedQuestions, removeQuestion } from "../../utils/savedQuestions";

export default function SavedQuestions() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

    const loadData = async () => {
        const data = await getSavedQuestions();
        setQuestions(data);
    };

    const handleRemove = async (id: string) => {
        await removeQuestion(id);
        loadData();
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
            setSelectedSubject(null);
        }, [])
    );

    const subjects = Array.from(
        new Set(questions.map((q) => q.subject))
    ).filter(Boolean);

    const filtered = questions.filter(
        (q) => q.subject === selectedSubject
    );

    return (
        <View style={{ flex: 1, backgroundColor: "#F2F2F2" }}>
            <StatusBar backgroundColor="#135D56" barStyle="light-content" />

            <View style={styles.header}>

                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>
                        {selectedSubject ? selectedSubject : "Saved Questions"}
                    </Text>
                    {selectedSubject && (
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => setSelectedSubject(null)}
                        >
                            <Ionicons
                                name="arrow-back"
                                size={24}
                                color="#135D56"
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            <ScrollView contentContainerStyle={styles.container}>

                {!selectedSubject &&
                    subjects.map((sub, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.subjectBox}
                            onPress={() => setSelectedSubject(sub)}
                        >
                            <Ionicons
                                name="folder-open"
                                size={24}
                                color="#135D56"
                            />
                            <Text style={styles.subjectText}>
                                {sub}
                            </Text>
                        </TouchableOpacity>
                    ))
                }

                {selectedSubject && (
                    <>

                        {filtered.length === 0 ? (
                            <Text>No saved questions</Text>
                        ) : (
                            filtered.map((q) => (
                                <View key={q.id} style={styles.card}>
                                    <Text>{q.questionText}</Text>
                                    <Text style={styles.answer}>
                                        Answer: {q.correctAnswer}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.removeBtn}
                                        onPress={() => handleRemove(q.id)}
                                    >
                                        <Ionicons
                                            name="trash"
                                            size={20}
                                            color="#fff"
                                        />

                                        <Text style={styles.removeText}>
                                            Remove
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </>
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 15,
        paddingTop: 25,
    },
    header: {
        backgroundColor: "#135D56",
        height: 120,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        paddingTop: 25,
        paddingHorizontal: 25,
        justifyContent: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },

    headerTitle: {
        color: "#fff",
        fontSize: 34,
        fontWeight: "bold",
        flex: 1,
    },
    subjectBox: {
        padding: 15,
        backgroundColor: "#eee",
        marginBottom: 10,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
    },

    subjectText: {
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 8,
    },

    subjectHeader: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },

    card: {
        padding: 15,
        backgroundColor: "#fff",
        marginBottom: 10,
        borderRadius: 10,
    },
    answer: {
        marginTop: 8,
        color: "#34C759",
    },

    removeBtn: {
        marginTop: 12,
        backgroundColor: "#135D56",
        padding: 10,
        borderRadius: 10,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },

    removeText: {
        color: "#fff",
        marginLeft: 6,
        fontWeight: "600",
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    backBtn: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
});
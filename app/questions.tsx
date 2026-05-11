import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../config/firebaseConfig";
import { getSavedQuestions, removeQuestion, saveQuestion } from "../utils/savedQuestions";
type Question = {
    id: string;
    subject: string;
    chapter: number;
    questionText: string;
    options: string[];
    correctAnswer: string;
    difficulty: string;
};

const Questions = () => {
    const { difficulty, subject, chapter } = useLocalSearchParams<{
        difficulty: string,
        subject: string,
        chapter: string
    }>();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const router = useRouter();
    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
            const snapshot = await getDocs(collection(db, "questions"));
            const data: Question[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as any)
            }));

            const filtered = data.filter(q => {
                const matchDiff = q.difficulty?.toLowerCase() === difficulty?.toLowerCase();
                const matchSub = subject
                    ? q.subject?.trim().toLowerCase() === subject.trim().toLowerCase()
                    : true;
                const matchChap = chapter
                    ? q.chapter?.toString().replace(/[^0-9]/g, '') === chapter.toString()
                    : true;
                return matchDiff && matchSub && matchChap;
            });

            setQuestions(filtered);
    };
    const selectAnswer = (questionId: string, answer: string) => {
        setSelectedAnswers(prev => {
            if (prev[questionId]) return prev;

            return {
                ...prev,
                [questionId]: answer
            };
        });
    };

    const handleSave = async (q: Question) => {
        const isSaved = savedIds.includes(q.id);

        if (isSaved) {
            await removeQuestion(q.id);

            setSavedIds(prev => prev.filter(id => id !== q.id));
        } else {
            await saveQuestion({
                id: q.id,
                subject: q.subject,
                questionText: q.questionText,
                correctAnswer: q.correctAnswer,
                options: q.options,
            });

            const saved = await getSavedQuestions();
            setSavedIds(prev => [...prev, q.id]);
        }
    };


    if (questions.length === 0) {
        return (
            <View style={styles.center}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#F2F2F2" }}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => { router.back() }}
                    >
                        <Ionicons name="arrow-back" size={24} color="#135D56" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {difficulty ? difficulty.toUpperCase() : "Questions"}
                    </Text>
                </View>
            </View>
            <ScrollView contentContainerStyle={styles.container}>
                {questions.map((q, index) => {
                    const selected = selectedAnswers[q.id];
                    const isAnswered = selected !== undefined;
                    const isCorrect = selected === q.correctAnswer;
                    return (
                        <View key={q.id} style={styles.card}>
                            <View style={styles.questionRow}>
                                <Text style={styles.question}>
                                    {index + 1}. {q.questionText}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => handleSave(q)}
                                    style={styles.saveBtn}
                                >
                                    <Ionicons
                                        name={
                                            savedIds.includes(q.id)
                                                ? "bookmark"
                                                : "bookmark-outline"
                                        }
                                        size={24}
                                        color={
                                            savedIds.includes(q.id)
                                                ? "#135D56"
                                                : "#999"
                                        }
                                    />
                                </TouchableOpacity>

                            </View>

                            {q.options.map((opt, i) => (
                                <TouchableOpacity
                                    key={i}
                                    disabled={selected !== undefined}
                                    style={[
                                        styles.option,

                                        selected !== undefined &&
                                        selected === q.correctAnswer &&
                                        opt === q.correctAnswer && {
                                            borderColor: "#34C759",
                                            borderWidth: 2,
                                        },

                                        selected !== undefined &&
                                        selected === opt &&
                                        opt !== q.correctAnswer && {
                                            borderColor: "#FF3B30",
                                            borderWidth: 2,
                                        },

                                        selected !== undefined &&
                                        selected !== opt && {
                                            opacity: 0.4,
                                        },
                                    ]}
                                    onPress={() => selectAnswer(q.id, opt)}
                                >
                                    <Text
                                        style={{
                                            color:
                                                selected !== undefined &&
                                                    (
                                                        (selected === q.correctAnswer && opt === q.correctAnswer) ||
                                                        (selected === opt && opt !== q.correctAnswer)
                                                    )
                                                    ? "#000"
                                                    : "#000",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {opt}
                                    </Text>
                                </TouchableOpacity>
                            ))}

                            {isAnswered && (
                                <View style={{ marginTop: 10 }}>

                                    {isCorrect ? (
                                        <View>
                                            <Text style={styles.correct}>✔ Correct</Text>
                                        </View>
                                    ) : (
                                        <View>
                                            <Text style={styles.wrong}>❌ Wrong</Text>
                                            <Text style={styles.correctAnswerText}>
                                                ✔ Correct Answer: {q.correctAnswer}
                                            </Text>
                                        </View>
                                    )}

                                </View>
                            )}

                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

export default Questions;

const styles = StyleSheet.create({
    header: {
        backgroundColor: "#135D56",
        height: 100,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        paddingTop: 55,
        paddingBottom: 25,
        paddingHorizontal: 25,
        justifyContent: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    headerRow: {
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerTitle: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
    },
    backBtn: {
        width: 45,
        height: 45,
        borderRadius: 12,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        padding: 15,
        paddingTop: 20
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },

    card: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: "#fff",
        borderRadius: 12,
        elevation: 3
    },

    question: {
        fontSize: 18,
        fontWeight: "bold",
        flex: 1,
        marginBottom: 10
    },

    option: {
        padding: 12,
        backgroundColor: "#eee",
        marginVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },

    selectedOption: {
        backgroundColor: "#d0e8ff"
    },

    correct: {
        color: "green",
        fontWeight: "bold"
    },

    wrong: {
        color: "red",
        fontWeight: "bold"
    },

    correctAnswerText: {
        marginTop: 5,
        color: "#333"
    },
    disabledOption: {
        opacity: 0.7,
    },
    questionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    saveBtn: {
        marginLeft: 5,
        marginTop: -2,
    }
});
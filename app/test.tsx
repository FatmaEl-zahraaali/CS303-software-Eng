import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../config/firebaseConfig";

type Question = {
    id: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
    difficulty: string;
    subject?: string;
};

const TestPage = () => {
    const { code } = useLocalSearchParams<{ code: string }>();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
    const [isFinished, setIsFinished] = useState(false);
    const INITIAL_TIME = 15 * 60;
    const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchRandomQuestions();
        startTimer();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);
    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    autoFinish();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const autoFinish = () => {
        setIsFinished(true);
        Alert.alert("Time's Up!", "The test time has ended. See your results.");
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const fetchRandomQuestions = async () => {
        
            const snapshot = await getDocs(collection(db, "questions"));
            let allQuestions: Question[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as any)
            }));

            if (code) {
                allQuestions = allQuestions.filter(q => q.subject === code);
            }
            const shuffled = allQuestions.sort(() => 0.5 - Math.random());
            setQuestions(shuffled.slice(0, 10));       
            setLoading(false);
    };

    const handleFinish = () => {
        if (Object.keys(selectedAnswers).length < questions.length) {
            Alert.alert("Wait!", "Please answer all questions before finishing.");
            return;
        }
        if (timerRef.current) clearInterval(timerRef.current);
        setIsFinished(true);
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#135D56" /></View>;

    return (
        <View style={{ flex: 1, backgroundColor: "#F2F2F2" }}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Quick Quiz</Text>
                <View style={styles.timerContainer}>
                    <Ionicons name="time-outline" size={20} color="#fff" />
                    <Text style={[styles.timerText, timeLeft < 60 && { color: '#FF3B30' }]}>
                        {formatTime(timeLeft)}
                    </Text>
                </View>
                <Text style={{ color: '#fff' }}>{Object.keys(selectedAnswers).length}/{questions.length}</Text>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#135D56" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {questions.map((q, index) => {
                    const selected = selectedAnswers[q.id];

                    return (
                        <View key={q.id} style={styles.card}>
                            <Text style={styles.question}>{index + 1}. {q.questionText}</Text>
                            {q.options.map((opt, i) => {
                                let backgroundColor = "#f8f8f8";
                                let borderColor = "#ddd";

                                if (isFinished) {
                                    if (opt === q.correctAnswer) {
                                        backgroundColor = "#d4edda";
                                        borderColor = "#28a745";
                                    } else if (selected === opt && selected !== q.correctAnswer) {
                                        backgroundColor = "#f8d7da";
                                        borderColor = "#dc3545";
                                    }
                                } else {
                                    if (selected === opt) {
                                        backgroundColor = "#E0F2F1";
                                        borderColor = "#135D56";
                                    }
                                }

                                return (
                                    <TouchableOpacity
                                        key={i}
                                        onPress={() => !isFinished && setSelectedAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                        style={[styles.option, { backgroundColor, borderColor }]}
                                        disabled={isFinished}
                                    >
                                        <Text style={styles.optionText}>{opt}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    );
                })}

                {!isFinished && (
                    <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
                        <Text style={styles.finishBtnText}>FINISH EXAM</Text>
                    </TouchableOpacity>
                )}

                {isFinished && (
                    <TouchableOpacity style={[styles.finishBtn, { backgroundColor: '#135D56' }]} onPress={() => router.back()}>
                        <Text style={styles.finishBtnText}>BACK TO MENU</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
};

export default TestPage;

const styles = StyleSheet.create({
    header: {
        backgroundColor: "#135D56",
        height: 110,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 40,
        borderBottomRightRadius: 30,
        borderBottomLeftRadius: 30
    },
    headerTitle: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold"
    },
    backBtn: {
        backgroundColor: "#fff",
        padding: 8,
        borderRadius: 10
    },
    container: {
        padding: 20,
        paddingBottom: 40
    },
    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 15,
        marginBottom: 20,
        elevation: 3
    },
    question: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 15
    },
    option: {
        padding: 15,
        borderRadius: 12,
        marginVertical: 6,
        borderWidth: 1.5
    },
    optionText: {
        fontWeight: "600",
        fontSize: 15
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    finishBtn: {
        backgroundColor: "#135D56",
        padding: 18,
        borderRadius: 15,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 30,
        elevation: 5
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    timerText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        marginLeft: 5,
        fontFamily: 'monospace'
    },
    finishBtnText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "800"
    }
});
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { auth, db } from "../config/firebaseConfig";

export default function ReviewScreen() {
    const router = useRouter();
    const [review, setReview] = useState("");
    const [userName, setUserName] = useState("");
    const [userImg, setUserImg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const PRIMARY_COLOR = "#135D56";

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {               
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        setUserName(userDoc.data().name);
                        setUserImg(userDoc.data().profileImage);
                    }
            }
        };
        fetchUserData();
    }, []);

    const handleSubmit = async () => {
        if (review.trim().length < 5) {
            Alert.alert("Notice", "Please write a bit more before submitting!");
            return;
        }
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Error", "You must be logged in to post a review.");
            return;
        }
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "reviews"), {
                studentName: userName || "Unknown Student",
                studentImage: userImg,
                studentId: user.uid,
                reviewText: review,
                timestamp: serverTimestamp(),
            });
            Alert.alert("Success", "Thank you for your feedback!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert("Error", "Could not save review.");
        }
        finally {
            setIsSubmitting(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <StatusBar backgroundColor={PRIMARY_COLOR} barStyle="light-content" />

                <View style={[styles.header, { backgroundColor: PRIMARY_COLOR }]}>
                    <Text style={styles.headerTitle}>Review</Text>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={22} color="#135D56" />
                    </TouchableOpacity>

                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.body}
                >
                    <View style={styles.contentContainer}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="chatbubble-ellipses" size={40} color={PRIMARY_COLOR} />
                        </View>

                        <Text style={styles.title}>Your Opinion Matters!</Text>
                        <Text style={styles.subtitle}>
                            How was your experience? Tell us what you liked or how we can improve.
                        </Text>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Write your review here..."
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                                value={review}
                                onChangeText={setReview}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitBtn, { backgroundColor: PRIMARY_COLOR }]}
                            onPress={handleSubmit}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.submitBtnText}>Submit</Text>
                            <Ionicons name="send" size={18} color="#fff" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F1F4F4",
    },
    header: {
        height: 120,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 25,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#135D56",
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
    },
    backBtn: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 15,
    },
    body: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 25,
        paddingTop: 40,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#E0F2F1",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: "#2A3A48",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 15,
        color: "#666",
        textAlign: "center",
        marginBottom: 30,
        lineHeight: 22,
    },
    inputWrapper: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 15,
        height: 180,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: "#333",
    },
    submitBtn: {
        width: "100%",
        flexDirection: "row",
        height: 60,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 25,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    submitBtnText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});
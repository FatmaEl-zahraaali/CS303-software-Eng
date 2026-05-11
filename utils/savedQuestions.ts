import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "saved_questions";

export const getSavedQuestions = async () => {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
};

export const saveQuestion = async (question: any) => {
  const current = await getSavedQuestions();

  const exists = current.find((q: any) => q.id === question.id);

  if (exists) return;

  const updated = [...current, question];

  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
};

export const removeQuestion = async (id: string) => {
  const current = await getSavedQuestions();

  const updated = current.filter((q: any) => q.id !== id);

  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
};
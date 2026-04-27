import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

type UserData = {
  uid: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
};

type AuthType = {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
};

const AuthContext = createContext<AuthType>({
  user: null,
  userData: null,
  loading: true,
});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        await u.reload();

        
        if (!u.emailVerified) {
          setUser(null);
          setUserData(null);
          setLoading(false);
          return;
        }

        setUser(u);

        try {
          const docRef = doc(db, "users", u.uid);
          const snap = await getDoc(docRef);

          if (snap.exists()) {
            setUserData(snap.data() as UserData);
          } else {
            setUserData(null);
          }
        } catch (e) {
          console.log("Firestore error:", e);
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
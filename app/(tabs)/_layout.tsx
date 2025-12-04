import { Tabs } from 'expo-router';
import React, { useEffect, useState, createContext } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, useColorScheme } from 'react-native';
import { auth, onAuthStateChanged,db } from '@/firebaseConfig';
import { User } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore'; 
import LoginViews from '@/components/views/auth/login';
import RegisterScreen from '@/components/views/auth/register';

type UserContextType = {
  user: User | null;       
  userData: any | null;     
};

export const UserContext = createContext<UserContextType | null>(null);
const Colors = {
  light: { tint: '#0a7ea4' },
  dark: { tint: '#fff' },
};

const TabIcon = ({ name, color }: { name: string, color: string }) => {
  const iconMap: Record<string, string> = {
    'chat': '💬',
    'settings': '⚙️', 
  };
  return <Text style={{ fontSize: 24, color }}>{iconMap[name] || '?'}</Text>;
};

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light'; 
  
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null); 
  const [initializing, setInitializing] = useState(true);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      
      if (u) {
        try {
          const q = query(collection(db, 'users'), where('uid', '==', u.uid));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            console.log("Data User dari DB:", data); 
            setUserData(data);
          } else {
            console.log("User login tapi data tidak ada di DB users");
          }
        } catch (e) {
          console.error("Gagal ambil data user dari DB:", e);
        }
      } else {
        setUserData(null);
      }

      if (initializing) setInitializing(false);
    });
    return () => unsub();
  }, []);

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!user) {
    if (isRegisterMode) {
      return <RegisterScreen onNavigateToLogin={() => setIsRegisterMode(false)} />;
    }
    return <LoginViews onNavigateToRegister={() => setIsRegisterMode(true)} />;
  }

  return (
    <UserContext.Provider value={{ user, userData }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme].tint,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderColor: '#eee',
            height: 60,
            paddingBottom: 10,
            paddingTop: 10,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Chat Room',
            tabBarIcon: ({ color }) => <TabIcon name="chat" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <TabIcon name="settings" color={color} />,
          }}
        />
      </Tabs>
    </UserContext.Provider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
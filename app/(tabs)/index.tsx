import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import {
  addDoc,
  messagesCollection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "@/firebaseConfig";

import { UserContext } from "./_layout";
import { logoutUser } from "@/services/firebase";

type MessageType = {
  id: string;
  text: string;
  user: string;
  image?: string; 
  createdAt: { seconds: number; nanoseconds: number } | null;
};

export default function ChatScreen() {
  const context = useContext(UserContext);
  const username = context?.userData?.username || context?.user?.displayName || "User"; 

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const loadCache = async () => {
      try {
        const cached = await AsyncStorage.getItem('chat_history');
        if (cached) {
          setMessages(JSON.parse(cached));
        }
      } catch (e) { console.log("Gagal load cache", e); }
    };
    loadCache();

    const q = query(messagesCollection, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const list: MessageType[] = [];
      snapshot.forEach((doc) => {
        list.push({
          id: doc.id,
          ...(doc.data() as Omit<MessageType, "id">),
        });
      });
      
      setMessages(list);
      setLoading(false);

      AsyncStorage.setItem('chat_history', JSON.stringify(list)).catch((e) => {
        console.log("Gagal simpan cache", e);
      });
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 500);
    }, (error) => {
      console.error("Snapshot error:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.2,
      base64: true, 
    });

    if (!result.canceled && result.assets[0].base64 ) {
      sendImageAsBase64(result.assets[0].base64);
    }
  }

  const sendImageAsBase64 = async (base64: string) => {
    setUploading(true);
    try {
      const imageUri = `data:image/jpeg;base64,${base64}`;  
      
      await addDoc(messagesCollection, {
        text: "Gambar terkirim", 
        image: imageUri,         
        user: username,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      Alert.alert("Gagal", "Gagal mengirim gambar. Ukuran mungkin terlalu besar.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  }

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      await addDoc(messagesCollection, {
        text: message,
        user: username,
        createdAt: serverTimestamp(),
      });
      setMessage("");
    } catch (error) {
      console.error("Gagal kirim pesan:", error);
      Alert.alert("Error", "Gagal mengirim pesan.");
    }
  };

  const renderItem = ({ item }: { item: MessageType }) => {
    const isMyMessage = item.user === username;
    
    return (
      <View style={[styles.msgBox, isMyMessage ? styles.myMsg : styles.otherMsg]}>
        {!isMyMessage && <Text style={styles.sender}>{item.user}</Text>}
        
        {item.image ? (
          <Image 
            source={{ uri: item.image }} 
            style={styles.chatImage} 
            resizeMode="cover"
          />
        ) : (
          <Text style={[styles.msgText, isMyMessage && styles.myMsgText]}>{item.text}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={{fontWeight: 'bold', fontSize: 16}}>Chat Room: {username}</Text>
        <TouchableOpacity onPress={() => logoutUser()}>
          <Text style={{color: 'red', fontWeight: 'bold'}}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Chat List & Input */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined} 
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15 }}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
            <Text style={{fontSize: 24}}>📷</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input} placeholder="Ketik pesan..." 
            value={message} onChangeText={setMessage} multiline
          />
          
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator color="white" size="small"/>
            ) : (
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>KIRIM</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 15, 
    backgroundColor: 'white', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    marginTop: Platform.OS === 'android' ? 30 : 0
  },
  msgBox: { padding: 10, marginVertical: 5, borderRadius: 10, maxWidth: "75%" },
  myMsg: { backgroundColor: "#007AFF", alignSelf: "flex-end" },
  otherMsg: { backgroundColor: "white", alignSelf: "flex-start" },
  sender: { fontSize: 10, color: "#F57C00", fontWeight: "bold", marginBottom: 4 },
  msgText: { fontSize: 16 },
  myMsgText: { color: "white" },
  chatImage: { width: 200, height: 150, borderRadius: 10, backgroundColor: '#eee' }, 
  inputContainer: { flexDirection: "row", padding: 10, backgroundColor: "white", alignItems: "center", borderTopWidth: 1, borderColor: "#eee" },
  input: { flex: 1, backgroundColor: "#f0f0f0", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginHorizontal: 10, maxHeight: 100 },
  iconButton: { padding: 5 },
  sendButton: { backgroundColor: "#007AFF", width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' }
});
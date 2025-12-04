import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { logoutUser, registerUser } from "@/services/firebase";

interface RegisterScreenProps {
    onNavigateToLogin: () => void;
}

export default function RegisterScreen({ onNavigateToLogin }: RegisterScreenProps) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!username || !email || !password) {
            Alert.alert("Mohon Maaf", "Semua kolom (Username, Email, Password) wajib diisi.");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Password Lemah", "Password minimal 6 karakter.");
            return;
        }

        setLoading(true);
        try {
            await registerUser(email, username, password);
            await logoutUser();
            
            Alert.alert(
                "Registrasi Berhasil", 
                "Akun Anda telah dibuat. Anda akan otomatis masuk.",
                [{ text: "Login Sekarang" , 
                    onPress: () => onNavigateToLogin()
                 }]
            );
        } catch (error: any) {
            let msg = error.message;
            if (msg.includes("auth/email-already-in-use")) msg = "Email sudah terdaftar.";
            if (msg.includes("auth/invalid-email")) msg = "Format email salah.";
            Alert.alert("Gagal Mendaftar", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.card}>
                <Text style={styles.title}>Daftar Akun Baru</Text>
                <Text style={styles.subtitle}>Silakan isi data diri Anda</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Username (Nama Panggilan)"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="words"
                />
                
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Daftar Sekarang</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={onNavigateToLogin} 
                    style={styles.linkContainer}
                >
                    <Text style={styles.linkText}>
                        Sudah punya akun? <Text style={styles.linkHighlight}>Login di sini</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#f5f5f5"
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 25,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 5,
        color: "#333"
    },
    subtitle: {
        fontSize: 14,
        textAlign: "center",
        marginBottom: 20,
        color: "#666"
    },
    input: {
        borderWidth: 1,
        borderColor: "#e1e1e1",
        backgroundColor: "#f9f9f9",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16
    },
    button: {
        backgroundColor: '#28a745', 
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    linkContainer: {
        marginTop: 20,
        alignItems: 'center',
        padding: 10
    },
    linkText: {
        color: '#666',
        fontSize: 14
    },
    linkHighlight: {
        color: '#007AFF',
        fontWeight: "bold"
    }
});
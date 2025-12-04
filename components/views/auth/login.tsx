import React, { useState } from "react";
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator, 
    KeyboardAvoidingView, 
    Platform,
    Alert
} from "react-native";
import { useRouter } from "expo-router";
import { loginUser } from "@/services/firebase";
interface LoginViewsProps {
    onNavigateToRegister: () => void;
}

export default function LoginViews({ onNavigateToRegister }: LoginViewsProps) {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);


    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Mohon Maaf", "Email dan password harus diisi.");
            return;
        }

        setLoading(true);
        try {
            await loginUser(email, password);
            router.replace('/')
        } catch (error: any) {
            let msg = error.message;
            if (msg.includes("auth/invalid-email")) msg = "Format email tidak valid.";
            if (msg.includes("auth/user-not-found") || msg.includes("auth/invalid-credential")) {
                msg = "Email atau password salah.";
            }
            Alert.alert("Gagal Login", msg);
            
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
                <Text style={styles.title}>Selamat Datang</Text>
                <Text style={styles.subtitle}>Masuk untuk mulai chatting</Text>
                
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
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Masuk</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={onNavigateToRegister} 
                    style={styles.linkContainer}
                >
                    <Text style={styles.linkText}>
                        Belum punya akun? <Text style={styles.linkHighlight}>Register sekarang</Text>
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
        backgroundColor: '#007AFF', // Biru untuk Login
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
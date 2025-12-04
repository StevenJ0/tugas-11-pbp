import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where, limit } from 'firebase/firestore';

import { auth, db } from '@/firebaseConfig';
export const registerUser = async (email: string, username: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const docRef = await addDoc(collection(db, 'users'), {
            uid: user.uid,
            email: email,
            username: username,
            createdAt: new Date()
        });

        return { user, docRef };

    } catch (error) {
        console.error('Gagal membuat user:', error);
        throw error;
    }
}

export const loginUser = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const q = query(collection(db, 'users'), where('uid', '==', user.uid), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error('Data user tidak ditemukan');
        }

        let userData = null;
        querySnapshot.forEach((doc) => {
            userData = doc.data();
        });
        return { user, userData };
    } catch (error) {
        console.error('Gagal login:', error);
        throw error;
    }
}

export const logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Gagal logout:", error);
    }
}
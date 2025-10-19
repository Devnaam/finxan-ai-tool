import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification, // Add this
} from 'firebase/auth';


import { auth } from "../config/firebase";
import api from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
	const [currentUser, setCurrentUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [userProfile, setUserProfile] = useState(null);

	// Sign up with email and password
	// Sign up with email and password
	// Sign up with email and password
const signup = async (email, password, name) => {
  try {
    // Step 1: Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Step 2: Register user in backend DB (MongoDB)
    await api.post('/auth/register', {
      firebaseUid: userCredential.user.uid,
      email: userCredential.user.email,
      name: name,
    });

    // Step 3: Send email verification
    await sendEmailVerification(userCredential.user);

    toast.success('Verification email sent! Check your inbox.');
    return userCredential.user;
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
};



	// Login with email and password
	// Login with email and password
	const login = async (email, password) => {
		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);

			// Check if email is verified
			if (!userCredential.user.emailVerified) {
				await signOut(auth);
				throw new Error(
					"Please verify your email before logging in. Check your inbox."
				);
			}

			// Sync with backend
			const idToken = await userCredential.user.getIdToken();
			await api.post("/auth/login", { idToken });

			toast.success("Logged in successfully!");
			return userCredential.user;
		} catch (error) {
			toast.error(error.message);
			throw error;
		}
	};

	// Login with Google
	const loginWithGoogle = async () => {
		try {
			const provider = new GoogleAuthProvider();
			const userCredential = await signInWithPopup(auth, provider);

			// Sync with backend
			const idToken = await userCredential.user.getIdToken();
			await api.post("/auth/login", { idToken });

			toast.success("Logged in with Google!");
			return userCredential.user;
		} catch (error) {
			toast.error(error.message);
			throw error;
		}
	};

	// Logout
	const logout = async () => {
		try {
			await signOut(auth);
			setUserProfile(null);
			toast.success("Logged out successfully!");
		} catch (error) {
			toast.error(error.message);
			throw error;
		}
	};

	// Fetch user profile from backend
	const fetchUserProfile = async () => {
		try {
			const response = await api.get("/auth/profile");
			setUserProfile(response.user);
		} catch (error) {
			console.error("Error fetching user profile:", error);
		}
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setCurrentUser(user);

			if (user) {
				await fetchUserProfile();
			} else {
				setUserProfile(null);
			}

			setLoading(false);
		});

		return unsubscribe;
	}, []);

	const value = {
		currentUser,
		userProfile,
		signup,
		login,
		loginWithGoogle,
		logout,
		loading,
		fetchUserProfile,
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	);
};

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot,
  } from 'firebase/firestore';
  import { auth, db } from '../config/firebaseConfig.js';
  
  function getUserDocRef() {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('User not authenticated');
    return doc(db, 'users', uid);
  }
  
  export async function getUserProfile() {
    const docRef = getUserDocRef();
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) throw new Error('User data not found');
    return snapshot.data();
  }
  
  export function listenToUserProfile(callback) {
    const docRef = getUserDocRef();
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      }
    });
  }
  
  export async function updateUserProfileField(field, value) {
    const docRef = getUserDocRef();
    await updateDoc(docRef, {
      [field]: value,
    });
  }
  
  export async function updateUserProfileFields(fieldsObject) {
    const docRef = getUserDocRef();
    await updateDoc(docRef, fieldsObject);
  }
  
  export async function replaceUserProfile(fullData) {
    const docRef = getUserDocRef();
    await setDoc(docRef, fullData, { merge: true });
  }

  export const getUserById = async (userId) => {
    try {
      // Reference to the user document in Firestore
      const userDocRef = doc(db, 'users', userId);
      
      // Get the user document
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // Return the user data with the ID included
        return {
          id: userDoc.id,
          ...userDoc.data()
        };
      } else {
        console.log(`No user found with ID: ${userId}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      throw error;
    }
  };
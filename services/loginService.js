// loginBackend.js

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig.js';


//@param {string} email - user email
//@param {string} password - user password
//@returns {Promise<Object>} - user object

export async function loginUser(email, password) {
  if (!email || !password) {
    throw new Error('Please enter the email and the password');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // if (!userCredential.user.emailVerified) {
    //   throw new Error('email not verified, please verify your email first');
    // }
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
}

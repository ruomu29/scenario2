// registerService.js

import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig.js';


//check whether the email is ucl email
//@param {string} email - user emai
//@returns {boolean} - boolean for whether its not ucl email

function isValidUclEmail(email) {
  const UCL_EMAIL_REGEX = /^[^\s@]+@ucl\.ac\.uk$/i;
  return UCL_EMAIL_REGEX.test(email);
}


//@param {Object} params
//@param {string} params.name
//@param {string} params.email
//@param {string} params.password
//@returns {Promise<Object>}
//@throws {Error}

export async function registerUser({ name, email, password }) {
  if (!isValidUclEmail(email)) {
    throw new Error('Please use ucl email');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);

    // save data in the database
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      name: name,
      createdAt: new Date(),
    });

    return user;
  } catch (error) {
    throw new Error(error.message);
  }
}

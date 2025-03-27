import { db } from '@/config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export const getUsers = async () => {
  const userReferences = collection(db, 'users');
  const querySnapshot = await getDocs(userReferences);

  const userList = querySnapshot.docs.map((doc) => ({
    id: doc.id, 
    name: doc.data().name,
    bio: doc.data().bio,
    degree: doc.data().degree,
    interests: doc.data().interests,
    societies: doc.data().societies,
    gender: doc.data().gender
  }));

  return userList
};

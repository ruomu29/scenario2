import { db } from '@/config/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export const getUsers = async () => {
  const userReferences = collection(db, 'users');
  const querySnapshot = await getDocs(userReferences);

  const userList = querySnapshot.docs.map((doc) => ({
    id: doc.id, 
    name: doc.data().name,
    age: doc.data().age
  }));

  return userList
};

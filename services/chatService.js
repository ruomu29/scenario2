// services/chatService.js
// most are copied from original components/allChats app/chatMessages
import { collection, getDocs, onSnapshot, query, orderBy, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

// load all chats from database
export async function fetchAllChats() {
  const querySnapshot = await getDocs(collection(db, 'chats'));
  const chatData = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    chatData.push({
      id: doc.id,
      name: data.name,
      lastMessage: data.lastMessage,
      lastMessageTime: data.lastMessageTime,
      members: data.members,
    });
  });
  return chatData;
}
// Listen for a message change
export function subscribeToMessages(chatId, callback, errorCallback) {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const messagesQuery = query(messagesRef, orderBy('created_at', 'asc'));

  return onSnapshot(messagesQuery, (snapshot) => {
    const messageData = [];
    snapshot.forEach((doc) => {
      messageData.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    callback(messageData);
  }, errorCallback);
}

// sending message
export async function sendMessage(chatId, newMessage, user) {
  const trimmed = newMessage.trim();
  const now = serverTimestamp();

  const messagesRef = collection(db, 'chats', chatId.toString(), 'messages');

  await addDoc(messagesRef, {
    value: trimmed,
    created_at: now,
    user_id: user,
  });

  const chatDocRef = doc(db, 'chats', chatId.toString());
  await updateDoc(chatDocRef, {
    lastMessage: trimmed,
    lastMessageTime: now,
  });
}
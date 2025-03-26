// components/allChats.tsx

import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity } from 'react-native';
import { Chat } from '@/constants/interfaces';
import { formatRelativeTime } from './relativeTime';
import { router } from 'expo-router';
import { fetchAllChats } from '@/services/chatService';

function AllChats() {
  const [chats, setChats] = useState<Chat[]>([]);

  const onPressLogic = ({ item }: { item: Chat }) => {
    router.push({
      pathname: "/chatMessages",
      params: { chatId: item.id, chatName: item.name }
    });
  };

  const renderItem = ({ item }: { item: Chat }) => {
    const timeDisplay = formatRelativeTime(item.lastMessageTime);

    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => onPressLogic({ item })}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        </View>
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>z
            <Text style={styles.chatName}>{item.name}</Text>
            <Text style={styles.timestamp}>{timeDisplay}</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">
            {item.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    const loadChats = async () => {
      try {
        const chatData = await fetchAllChats();
        setChats(chatData);
        console.log(chatData);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    loadChats();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>Start a new chat to begin messaging</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(255, 225, 227)',
  },
  header: {
    padding: 16,
    backgroundColor: 'rgb(255, 237, 237)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgb(255, 237, 237)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgb(51, 51, 51)',
  },
  list: {
    width: '100%',
  },
  listContent: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: 'rgb(249, 201, 199)',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgb(239, 239, 239)',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgb(227,154,150)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'rgb(255, 255, 255)',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgb(51, 51, 51)',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgb(153, 153, 153)',
  },
  lastMessage: {
    fontSize: 14,
    color: 'rgb(102, 102, 102)',
    flex: 1,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgb(102, 102, 102)',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgb(153, 153, 153)',
    textAlign: 'center',
  },
});

export { AllChats };

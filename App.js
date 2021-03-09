import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { GiftedChat } from "react-native-gifted-chat";

import {
  StyleSheet,
  Text,
  View,
  LogBox,
  TextInput,
  Button,
} from "react-native";
import * as firebase from "firebase";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChNORfg3IPQE6Ybw7hoReNgXAy70ccgPc",
  authDomain: "signal-clone-81bd2.firebaseapp.com",
  projectId: "signal-clone-81bd2",
  storageBucket: "signal-clone-81bd2.appspot.com",
  messagingSenderId: "201515680034",
  appId: "1:201515680034:web:cf0a3ef6e9262d48a6657b",
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

const chatsRef = db.collection("chats");

export default function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    readUser();
    const unsubcribe = chatsRef.onSnapshot((querySnapShot) => {
      const messagesFireStore = querySnapShot
        .docChanges()
        .filter(({ type }) => type === "added")
        .map(({ doc }) => {
          const message = doc.data();
          return { ...message, createdAt: message.createdAt.toDate() };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      appendMsgs(messagesFireStore);
    });
    // return () => unsubcribe();
  }, []);

  const appendMsgs = useCallback(
    (msg) => {
      setMessages(GiftedChat.append(messages, msg));
    },
    [messages]
  );
  const readUser = async () => {
    const user = await AsyncStorage.getItem("user");
    if (user) {
      setUser(JSON.parse(user));
    }
  };

  const handleSend = async (messages) => {
    const write = messages.map((m) => chatsRef.add(m));
    await Promise.all(write);
  };
  const handlPress = async () => {
    const _id = Math.random().toString(36).substr(7);
    const user = { _id, name };
    await AsyncStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="enter your name"
          value={name}
          onChangeText={(text) => setName(text)}
        />
        <Button title="Enter the chat" onPress={handlPress} />
      </View>
    );
  }
  return <GiftedChat messages={messages} user={user} onSend={handleSend} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 50,
    width: "90%",
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    marginBottom: 10,
  },
});

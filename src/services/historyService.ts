import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const saveTranscription = async (userId: string, fileName: string, text: string) => {
  try {
    await addDoc(collection(db, "transcriptions"), {
      userId,
      fileName,
      transcription: text,
      createdAt: serverTimestamp()
    });
    console.log("Data saved successfully!");
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
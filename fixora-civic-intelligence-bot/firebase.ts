import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCMaeQvkDbEZiMDgCAupm6VmTmKRrvDDxQ",
  authDomain: "fixora-civic-system.firebaseapp.com",
  projectId: "fixora-civic-system",
  storageBucket: "fixora-civic-system.appspot.com",
  messagingSenderId: "975918469004",
  appId: "1:975918469004:web:fc984e8b441bddd47b50a9"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Core services
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

export default app

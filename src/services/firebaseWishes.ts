/**
 * Firebase Firestore Architecture & Integration Service for Wedding Wishes
 * 
 * Firestore Collection Schema:
 * Collection: 'wedding_wishes'
 * Document:
 *   id: string (auto-generated)
 *   guestName: string (e.g. "Eleanor & Marcus")
 *   message: string (the blessing or wish text)
 *   isPrivateName: boolean (if true, shows "Anonymous Guest" publicly)
 *   createdAt: Timestamp | string (serverTimestamp())
 *   isApproved: boolean (default true, can be moderated in admin)
 *   likes: number (incremented via FieldValue.increment(1))
 *   seasonFrom?: string (optional season milestone where submitted)
 */

import { WishRecord } from '../types';

export interface FirebaseFirestoreGuide {
  collectionName: string;
  fields: Array<{ field: string; type: string; description: string }>;
  firestoreRules: string;
  sampleCodeSnippet: string;
}

export const firebaseWishesGuide: FirebaseFirestoreGuide = {
  collectionName: 'wedding_wishes',
  fields: [
    { field: 'guestName', type: 'string', description: 'Name of the well-wisher or family' },
    { field: 'message', type: 'string', description: 'Heartfelt wedding blessing / memory' },
    { field: 'isPrivateName', type: 'boolean', description: 'Whether to hide guest identity from other guests' },
    { field: 'createdAt', type: 'Timestamp (serverTimestamp)', description: 'Exact time when wish was recorded' },
    { field: 'isApproved', type: 'boolean', description: 'Moderation status for public display' },
    { field: 'likes', type: 'number', description: 'Total hearts/likes received from other guests' }
  ],
  firestoreRules: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /wedding_wishes/{wishId} {
      // Any guest can read approved wishes
      allow read: if resource.data.isApproved == true || request.auth != null;
      
      // Guests can submit wishes with validation
      allow create: if request.resource.data.guestName is string
                    && request.resource.data.guestName.size() > 0
                    && request.resource.data.guestName.size() <= 100
                    && request.resource.data.message is string
                    && request.resource.data.message.size() > 0
                    && request.resource.data.message.size() <= 1500
                    && request.resource.data.likes == 1;
      
      // Anyone can like a wish (atomic increment only)
      allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likes'])
                    && request.resource.data.likes == resource.data.likes + 1;
                    
      // Only wedding admins can edit or delete wishes
      allow delete, update: if request.auth != null && request.auth.token.admin == true;
    }
  }
}`,
  sampleCodeSnippet: `// 1. Initialize Firebase App & Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-wedding-app.firebaseapp.com",
  projectId: "your-wedding-app",
  storageBucket: "your-wedding-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. Real-Time Live Stream of Wishes for Guests:
export function subscribeToLiveWishes(onWishesUpdate) {
  const q = query(collection(db, 'wedding_wishes'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
    }));
    onWishesUpdate(list);
  });
}

// 3. Submitting a New Wish:
export async function sendWeddingWish(guestName, message, isPrivateName) {
  await addDoc(collection(db, 'wedding_wishes'), {
    guestName,
    message,
    isPrivateName,
    createdAt: serverTimestamp(),
    isApproved: true,
    likes: 1
  });
}

// 4. Liking a Wish in Real-Time:
export async function likeWeddingWish(wishId) {
  const ref = doc(db, 'wedding_wishes', wishId);
  await updateDoc(ref, {
    likes: increment(1)
  });
}`
};

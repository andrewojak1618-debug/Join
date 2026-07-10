import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


/**
 * Loads all contacts from Firestore with the document id attached.
 */
async function loadContacts() {
  const db = window.joinFirestore;
  const snapshot = await getDocs(collection(db, "contacts"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}


/**
 * Creates one contact in Firestore and adds server timestamps.
 */
async function createContact(contact) {
  const db = window.joinFirestore;
  const contactRef = await addDoc(collection(db, "contacts"), {
    ...contact,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: contactRef.id, ...contact };
}


/**
 * Updates one contact in Firestore without saving the local id field.
 */
async function updateContact(contactId, contact) {
  const db = window.joinFirestore;
  const { id, ...contactData } = contact;
  await updateDoc(doc(db, "contacts", contactId), {
    ...contactData,
    updatedAt: serverTimestamp(),
  });
}


/**
 * Deletes one contact from Firestore.
 */
async function deleteContact(contactId) {
  const db = window.joinFirestore;
  await deleteDoc(doc(db, "contacts", contactId));
}

window.joinFirebaseContacts = {
  loadContacts,
  createContact,
  updateContact,
  deleteContact,
};

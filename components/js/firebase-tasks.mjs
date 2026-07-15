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
 * Loads all tasks from Firestore with the document id attached.
 */
async function loadTasks() {
  const db = window.joinFirestore;
  const snapshot = await getDocs(collection(db, "tasks"));
  return snapshot.docs.map((taskDoc) => ({
    id: taskDoc.id,
    ...taskDoc.data(),
  }));
}


/**
 * Creates one task in Firestore and adds server timestamps.
 */
async function createTask(task) {
  const db = window.joinFirestore;
  const taskData = getWritableTaskData(task);
  const taskRef = await addDoc(collection(db, "tasks"), {
    ...taskData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: taskRef.id, ...taskData };
}


/**
 * Updates one Firestore task without saving local-only fields.
 */
async function updateTask(taskId, task) {
  const db = window.joinFirestore;
  await updateDoc(doc(db, "tasks", taskId), {
    ...getWritableTaskData(task),
    updatedAt: serverTimestamp(),
  });
}


/**
 * Deletes one task from Firestore.
 */
async function deleteTask(taskId) {
  const db = window.joinFirestore;
  await deleteDoc(doc(db, "tasks", taskId));
}


/**
 * Removes local-only fields and keeps assignees as a Firestore list.
 */
function getWritableTaskData(task) {
  const { id, createdAt, updatedAt, assignedTo, ...taskData } = task;
  return {
    ...taskData,
    assignedTo: normalizeTaskAssignees(assignedTo),
  };
}


/**
 * Ensures the assignees are stored as a list without empty entries.
 * @param {string[]|string|undefined} assignedTo - The raw assignee value.
 * @returns {string[]} The assignee ids as a clean list.
 */
function normalizeTaskAssignees(assignedTo) {
  if (Array.isArray(assignedTo)) return assignedTo.filter(Boolean);
  return assignedTo ? [assignedTo] : [];
}

window.joinFirebaseTasks = {
  loadTasks,
  createTask,
  updateTask,
  deleteTask,
};

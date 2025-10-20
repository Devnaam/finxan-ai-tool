import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase";

// For Firebase Storage uploads
export const storage = getStorage(app);

export async function uploadProfilePhoto(file, userId) {
  if (!file || !userId) throw new Error("Missing file or user ID");
  const storageRef = ref(storage, `profiles/${userId}/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

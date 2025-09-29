// src/lib/firebase/auth.ts
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
// Função de Logout
export async function logout() {
  let error = null;
  try {
    await signOut(auth);
  } catch (e) {
    error = e;
  }
  return { error };
}
import { app } from './config'; // Importe a instância 'app' que configuramos

const auth = getAuth(app);

// Função de Cadastro
export async function signUp(email: string, password: string) {
  let result = null, error = null;
  try {
    result = await createUserWithEmailAndPassword(auth, email, password);
  } catch (e) {
    error = e;
  }
  return { result, error };
}

// Função de Login
export async function signIn(email: string, password: string) {
  let result = null, error = null;
  try {
    result = await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    error = e;
  }
  return { result, error };
}
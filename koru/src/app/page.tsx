// src/app/page.tsx

// Adicione esta linha no topo! Isso transforma o componente em um Client Component.
"use client"; 

import { db } from '@/lib/firebase/config'; // Importe o db
import { doc, setDoc } from "firebase/firestore"; // Importe funções do Firestore

export default function Home() {

  const handleTestDb = async () => {
    try {
      // Cria uma referência para um documento que não existe ainda
      const newDocRef = doc(db, "testCollection", "testDocument");
      
      // Tenta escrever um dado nesse documento
      await setDoc(newDocRef, {
        message: "Firebase connection is working!",
        timestamp: new Date()
      });
      
      alert("Sucesso! Um dado foi gravado no Firestore. Verifique o console do Firebase.");

    } catch (error) {
      console.error("Erro ao gravar no Firestore:", error);
      alert("Ocorreu um erro. Verifique o console do navegador (F12).");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-4">
      <h1>Meu App de Produtividade</h1>
      <button onClick={handleTestDb} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Testar Conexão com Banco de Dados
      </button>
    </main>
  );
}
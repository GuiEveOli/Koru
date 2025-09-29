// src/context/AuthContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, getAuth, User } from 'firebase/auth';
import { app } from '@/lib/firebase/config'; // Importa a config do Firebase

// Inicializa o serviço de autenticação do Firebase
const auth = getAuth(app);

// Define o tipo do contexto para ter o usuário (ou nulo)
interface AuthContextType {
    user: User | null;
}

// Cria o Contexto com um valor inicial nulo
export const AuthContext = createContext<AuthContextType>({ user: null });

// Cria um hook customizado para facilitar o uso do contexto
export const useAuth = () => useContext(AuthContext);

// Cria o componente Provedor
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Estado de carregamento

    useEffect(() => {
        // onAuthStateChanged é o "ouvinte" do Firebase.
        // Ele executa a função callback toda vez que o estado de auth muda (login/logout).
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Se o usuário estiver logado, atualizamos o estado 'user'
                setUser(user);
            } else {
                // Se não, o estado 'user' é nulo
                setUser(null);
            }
            // Já verificamos, então o carregamento inicial terminou.
            setLoading(false);
        });

        // Retorna a função de cleanup. Ela será chamada quando o componente for "desmontado",
        // removendo o ouvinte para evitar vazamentos de memória.
        return () => unsubscribe();
    }, []);

    // Se estiver carregando, podemos mostrar um spinner ou apenas uma tela em branco.
    // Isso evita o "flash" de conteúdo antes da verificação ser concluída.
    if (loading) {
        return <div>Carregando...</div>; // Ou um componente de loading mais bonito
    }

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
};
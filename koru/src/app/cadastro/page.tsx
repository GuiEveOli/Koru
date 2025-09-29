// src/app/cadastro/page.tsx
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/firebase/auth'; // Importa nossa função de cadastro

export default function CadastroPage() {
    // 1. Estados para guardar o email e a senha digitados pelo usuário
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    // 2. Função que será chamada quando o formulário for enviado
    const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Previne o comportamento padrão de recarregar a página

        // 3. Chama a função signUp que criamos, passando email e senha
        const { result, error } = await signUp(email, password);

        // 4. Lida com o resultado
        if (error) {
            // Se houver um erro, exibe um alerta e o loga no console
            alert("Ocorreu um erro ao criar a conta. Verifique o console.");
            return console.error(error);
        }

        // Se o cadastro for bem-sucedido
        console.log("Usuário cadastrado com sucesso:", result);
        // 5. Redireciona o usuário para a página principal (dashboard)
        router.push('/');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center text-gray-900">Criar Nova Conta</h1>
                <form onSubmit={handleSignUp} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">Senha</label>
                        <input
                            id="password"
                            type="password"
                            required
                            minLength={6}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <button type="submit" className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Cadastrar
                        </button>
                    </div>
                    <div>
                        <button
                            type="button"
                            className="w-full px-4 py-2 font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => router.push('/login')}
                        >
                            Já tenho conta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
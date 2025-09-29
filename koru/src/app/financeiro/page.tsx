// src/app/financeiro/page.tsx
"use client";
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import TransactionForm from '@/components/TransactionForm'; // 1. Importe o formulário

export default function FinanceiroPage() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    if (!user) {
        return null; // ou um spinner de carregamento
    }

    return (
        <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
            <div className="w-full max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Meu Controle Financeiro</h1>

                <TransactionForm />

                <div className="mt-8">
                    <h2 className="text-2xl font-semibold text-gray-700">Histórico de Transações</h2>
                    {/* Aqui vamos adicionar a lista de transações */}
                </div>
            </div>
        </main>
    );
}
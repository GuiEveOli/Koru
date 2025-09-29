// src/components/TransactionForm.tsx
"use client";
import { useState } from 'react';

export default function TransactionForm() {
    // Estados para cada campo do formulário
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('despesa');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    // 1. Adicionamos um novo estado para a Categoria
    const [category, setCategory] = useState('Alimentação'); // Um valor padrão

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const transactionData = {
            description,
            amount: parseFloat(amount),
            type,
            date,
            // 2. Adicionamos o campo Categoria ao objeto que será exibido
            category,
        };

        console.log("Nova Transação:", transactionData);
        alert('Transação adicionada! (Verifique o console com F12)');

        // Limpa o formulário após o envio
        setDescription('');
        setAmount('');
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Adicionar Nova Transação</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                {/* Campo Descrição */}
                <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-600">Descrição</label>
                    <input
                        type="text" id="description" value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full input-style border border-solid border-borda-botao rounded-sm" required
                    />
                </div>

                {/* Campo Valor */}
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-600">Valor (R$)</label>
                    <input
                        type="number" id="amount" value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1 block w-full input-style" required step="0.01"
                    />
                </div>

                {/* NOVO CAMPO: Categoria */}
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-600">Categoria</label>
                    <select
                        id="category" value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mt-1 block w-full input-style-select"
                    >
                        <option>Alimentação</option>
                        <option>Transporte</option>
                        <option>Moradia</option>
                        <option>Lazer</option>
                        <option>Saúde</option>
                        <option>Outros</option>
                    </select>
                </div>

                {/* Campo Tipo */}
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-600">Tipo (Receita/Despesa)</label>
                    <select
                        id="type" value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="mt-1 block w-full input-style-select"
                    >
                        <option value="despesa">Despesa</option>
                        <option value="receita">Receita</option>
                    </select>
                </div>
                
                {/* O campo de data foi movido para uma nova linha para melhor layout */}
                <div className="md:col-span-2">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-600">Data</label>
                    <input
                        type="date" id="date" value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-1 block w-full input-style" required
                    />
                </div>
                
                {/* Botão de Envio */}
                <div className="md:col-start-5">
                  <button type="submit" className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                      Adicionar
                  </button>
                </div>
            </form>
        </div>
    );
}

// Para evitar repetição, você pode adicionar um estilo base no seu globals.css
// e aplicá-lo com @apply no Tailwind. Por enquanto, a repetição de classes
// nos inputs e selects é aceitável.
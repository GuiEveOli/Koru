// src/app/page.tsx
"use client";
import { useEffect } from 'react';
import { logout } from '@/lib/firebase/auth';
import { useAuth } from '@/context/AuthContext'; // Nosso hook
import { useRouter } from 'next/navigation'; // Hook de navegação do Next.js
import Link from 'next/link';

export default function Home() {
  const { user } = useAuth(); // Pega o usuário do nosso "crachá global"
  const router = useRouter();

  useEffect(() => {
    // Este efeito será executado sempre que o 'user' mudar.
    // A verificação inicial de loading já aconteceu no AuthProvider.
    if (!user) {
      // Se não houver usuário, redireciona para a página de login.
      router.push('/login');
    }
  }, [user, router]);

  // Se o usuário existir, ele não será redirecionado e verá o conteúdo da página.
  // Podemos até adicionar uma verificação para não mostrar nada antes do redirecionamento.
  if (!user) {
    return null; // Ou um spinner, ou uma mensagem de "redirecionando..."
  }

  // Conteúdo visível apenas para usuários logados
  const handleLogout = async () => {
    const { error } = await logout();
    if (error) {
      alert('Erro ao fazer logout.');
      return;
    }
    router.push('/login');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-4">
      <h1>Bem-vindo ao seu Dashboard!</h1>
      <p>Seu e-mail é: {user.email}</p>
      <Link href="/financeiro" className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Ir para Controle Financeiro
      </Link>
      <button
        className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        onClick={handleLogout}
      >
        Logout
      </button>
      {/* Aqui você vai construir o dashboard principal do seu app */}
    </main>
  );
}
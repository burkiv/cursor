// pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Menu from '../components/Menu';
import { useSession } from 'next-auth/react';
import { requireAuth } from '../lib/auth';
import { useRouter } from 'next/router';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl text-purple-600">Yükleniyor...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Ana Sayfa - Çift Platformu</title>
      </Head>
      <div className="flex h-screen bg-coupleBg overflow-hidden">
        {menuOpen && <Menu />}
        
        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="space-x-2">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-1 px-3 rounded"
              >
                {menuOpen ? 'Menüyü Gizle' : 'Menüyü Göster'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Hoş geldiniz!</h1>
            <p className="text-gray-600 mb-6">
              Burası ana sayfa. Buradan odalar oluşturabilir, partnerinizi davet edebilir, aktiviteleri seçebilirsiniz.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-pink-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Hızlı Başlangıç</h2>
                <ul className="space-y-2 text-gray-600">
                  <li>✨ Profil sayfanızı düzenleyin</li>
                  <li>👋 Partnerinizi davet edin</li>
                  <li>🎯 Aktivite seçin ve başlayın</li>
                </ul>
              </div>

              <div className="bg-pink-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Son Aktiviteler</h2>
                <p className="text-gray-500">Henüz bir aktivite yok</p>
              </div>

              <div className="bg-pink-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">İstatistikler</h2>
                <div className="space-y-2">
                  <p className="text-gray-600">Toplam Aktivite: 0</p>
                  <p className="text-gray-600">Paylaşılan Mesaj: 0</p>
                  <p className="text-gray-600">Albüm Sayısı: 0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  return await requireAuth(context);
}

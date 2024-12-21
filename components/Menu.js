import Link from 'next/link';
import { useRouter } from 'next/router';
import { useRoom } from '../contexts/RoomContext';
import { useState, useEffect } from 'react';

export default function Menu() {
  const { activeRoom, leaveRoom } = useRoom();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (res.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  return (
    <div className="w-64 bg-white p-4 shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Menü</h1>
      
      <div className="space-y-2">
        <Link href="/" legacyBehavior>
          <a className="p-3 hover:bg-pink-50 rounded cursor-pointer flex items-center text-gray-700 hover:text-gray-900">
            <span className="mr-2">🏠</span>
            Ana Sayfa
          </a>
        </Link>

        <Link href="/profile" legacyBehavior>
          <a className="p-3 hover:bg-pink-50 rounded cursor-pointer flex items-center text-gray-700 hover:text-gray-900">
            <span className="mr-2">👤</span>
            Profil
          </a>
        </Link>

        <Link href="/messages" legacyBehavior>
          <a className="p-3 hover:bg-pink-50 rounded cursor-pointer flex items-center text-gray-700 hover:text-gray-900">
            <span className="mr-2">✉️</span>
            Mesajlar
          </a>
        </Link>

        <Link href="/albums" legacyBehavior>
          <a className="p-3 hover:bg-pink-50 rounded cursor-pointer flex items-center text-gray-700 hover:text-gray-900">
            <span className="mr-2">📸</span>
            Albümler
          </a>
        </Link>

        {isClient && (
          !activeRoom ? (
            <>
              <Link href="/create-room" legacyBehavior>
                <a className="p-3 hover:bg-pink-50 rounded cursor-pointer flex items-center text-gray-700 hover:text-gray-900">
                  <span className="mr-2">➕</span>
                  Oda Oluştur
                </a>
              </Link>

              <Link href="/join-room" legacyBehavior>
                <a className="p-3 hover:bg-pink-50 rounded cursor-pointer flex items-center text-gray-700 hover:text-gray-900">
                  <span className="mr-2">🚪</span>
                  Odaya Katıl
                </a>
              </Link>
            </>
          ) : (
            <>
              <Link href={`/room/${activeRoom}/activities`} legacyBehavior>
                <a className="p-3 hover:bg-pink-50 rounded cursor-pointer flex items-center text-gray-700 hover:text-gray-900">
                  <span className="mr-2">🎮</span>
                  Aktiviteler
                </a>
              </Link>

              <button
                onClick={leaveRoom}
                className="w-full p-3 hover:bg-pink-50 rounded cursor-pointer flex items-center text-red-500 hover:text-red-600"
              >
                <span className="mr-2">🚪</span>
                Odadan Çık
              </button>
            </>
          )
        )}

        <div className="border-t border-gray-200 my-4"></div>

        <button
          onClick={handleLogout}
          className="w-full p-3 hover:bg-red-50 rounded cursor-pointer flex items-center text-red-600 hover:text-red-700"
        >
          <span className="mr-2">🚫</span>
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}

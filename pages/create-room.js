import Head from 'next/head';
import Menu from '../components/Menu';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function CreateRoomPage() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState(null);
  const [error, setError] = useState(null);

  async function handleCreateRoom() {
    setError(null);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName }),
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error);
      } else {
        const data = await res.json();
        setRoomId(data.roomId);
        router.push(`/room/${data.roomId}`);
      }
    } catch (err) {
      setError('Bir hata oluştu.');
    }
  }

  return (
    <>
      <Head>
        <title>Oda Oluştur - Çift Platformu</title>
        <meta name="description" content="Oda oluşturma sayfası" />
      </Head>
      <div className="flex h-screen bg-coupleBg">
        <Menu />
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Oda Oluştur</h1>
          <p className="mb-4 text-gray-600">Partnerinizle etkileşime girebileceğiniz bir oda oluşturun. Oda ID'sini partnerinizle paylaşın.</p>
          
          <div className="max-w-sm bg-white p-4 rounded shadow-md">
            <label className="block mb-2 font-medium text-gray-700">Oda Adı:</label>
            <input
              className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:border-coupleAccent text-gray-800"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Oda adını girin"
            />

            <button
              onClick={handleCreateRoom}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
            >
              Oluştur
            </button>

            {error && (
              <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {roomId && (
              <div className="mt-4 p-2 bg-couplePanel rounded">
                <p className="font-semibold text-gray-800">Oda Oluşturuldu!</p>
                <p className="text-sm text-gray-700">Oda ID: <span className="font-mono">{roomId}</span></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

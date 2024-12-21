// pages/join-room.js
import Head from 'next/head';
import Menu from '../components/Menu';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function JoinRoomPage() {
  const router = useRouter();
  const [inputRoomId, setInputRoomId] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState(null);

  async function handleJoinRoom() {
    setError(null);
    setRoomData(null);
    try {
      const res = await fetch('/api/rooms?roomId=' + inputRoomId);
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || 'Oda bulunamadı');
      } else {
        const data = await res.json();
        setRoomData(data);
        router.push(`/room/${data.roomId}`);
    }
      
    } catch (err) {
      setError('Bir hata oluştu.');
    }
  }

  return (
    <>
      <Head>
        <title>Odaya Katıl - Çift Platformu</title>
        <meta name="description" content="Odaya katılma sayfası" />
      </Head>
      <div className="flex h-screen bg-coupleBg text-coupleText">
        <Menu />
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-4">Odaya Katıl</h1>
          <p className="mb-4">Partnerinizin paylaştığı Oda ID’sini girerek odaya katılın.</p>
          
          <div className="max-w-sm bg-white p-4 rounded shadow-md">
            <label className="block mb-2 font-medium">Oda ID:</label>
            <input
              className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:border-coupleAccent"
              type="text"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
              placeholder="Oda ID’sini girin"
            />

            <button
              onClick={handleJoinRoom}
              className="w-full bg-coupleAccent hover:bg-pink-600 text-white py-2 rounded transition-colors duration-200"
            >
              Katıl
            </button>

            {error && (
              <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {roomData && (
              <div className="mt-4 p-2 bg-couplePanel rounded">
                <p className="font-semibold">Odaya Katıldınız!</p>
                <p className="text-sm">Oda Adı: <span className="font-mono">{roomData.roomName}</span></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

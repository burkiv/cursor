import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import Head from 'next/head'
import Menu from '../../../components/Menu'

let socket;

export default function RoomIndexPage() {
  const router = useRouter();
  const { roomId } = router.query;
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');

  useEffect(() => {
    if (!roomId) return;
    fetch('/api/socket');
    socket = io({ path: '/api/socket_io' });

    socket.on('connect', () => {
      socket.emit('joinRoom', roomId);
    });

    socket.on('assignedRole', ({ role }) => {
      setRole(role);
    });

    socket.on('chatMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    }
  }, [roomId]);

  function sendMessage() {
    if(!inputMsg.trim()) return;
    socket.emit('chatMessage', { roomId, message: inputMsg, sender: role === 'partner' ? 'Partner' : 'User' });
    setInputMsg('');
  }

  return (
    <>
      <Head>
        <title>{`Oda ${roomId || ''}`}</title>
      </Head>
      <div className="flex h-screen bg-coupleBg text-coupleText overflow-hidden">
        {menuOpen && roomId && <Menu roomId={roomId} />}
        
        <div className="flex-1 flex flex-row relative">
          <div className="flex-1 p-8 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="space-x-2">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="bg-coupleAccent hover:bg-pink-600 text-white py-1 px-3 rounded"
                >
                  {menuOpen ? 'Menüyü Gizle' : 'Menüyü Göster'}
                </button>
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className="bg-coupleAccent hover:bg-pink-600 text-white py-1 px-3 rounded"
                >
                  {chatOpen ? 'Sohbeti Gizle' : 'Sohbeti Göster'}
                </button>
              </div>
            </div>

            {!roomId && <p>Yükleniyor...</p>}
            <h1 className="text-3xl font-bold mb-4">Oda {roomId}</h1>
            <p className="text-gray-700 mb-4">Oda anasayfası. Soldaki menüden aktivite seçebilirsiniz.</p>
            {role && <p>Rolünüz: {role}</p>}
          </div>

          {chatOpen && (
            <div className="relative h-full flex flex-col shadow-md overflow-hidden" style={{width: 300, backgroundColor: '#ffffff'}}>
              <h2 className="text-xl font-semibold mb-2 p-4 border-b border-gray-300">Sohbet</h2>
              <div className="flex-1 p-2 overflow-y-auto bg-gray-50">
                {messages.map((m, i) => (
                  <div key={i} className="mb-1">
                    <span className="font-bold">{m.sender}:</span> {m.message}
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-gray-300 flex">
                <input 
                  className="flex-1 border border-gray-300 rounded p-2 focus:outline-none focus:border-coupleAccent mr-2"
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Mesaj yaz..."
                />
                <button 
                  className="bg-coupleAccent hover:bg-pink-600 text-white py-2 px-4 rounded"
                  onClick={sendMessage}
                >
                  Gönder
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import Head from 'next/head'
import Menu from '../../../components/Menu'
import DrawingActivity from '../../../components/DrawingActivity'

let socket;

export default function DrawPage() {
  const router = useRouter();
  const { roomId } = router.query;
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;
    setIsLoading(true);
    fetch('/api/socket');
    socket = io({ path: '/api/socket_io' });

    socket.on('connect', () => {
      socket.emit('joinRoom', roomId);
    });

    socket.on('assignedRole', ({ role }) => {
      setRole(role);
      setIsLoading(false);
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
        <title>{`Çizim - Oda ${roomId || ''}`}</title>
      </Head>
      <div className="flex h-screen bg-coupleBg overflow-hidden">
        {menuOpen && roomId && <Menu roomId={roomId} />}
        
        <div className="flex-1 flex flex-row relative">
          <div className="flex-1 p-8 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="space-x-2">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-1 px-3 rounded"
                >
                  {menuOpen ? 'Menüyü Gizle' : 'Menüyü Göster'}
                </button>
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-1 px-3 rounded"
                >
                  {chatOpen ? 'Sohbeti Gizle' : 'Sohbeti Göster'}
                </button>
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-4 text-gray-800">{`Oda ${roomId} - Çizim`}</h1>
            
            {isLoading ? (
              <div className="bg-white p-8 rounded shadow-md">
                <p className="text-gray-600">Çizim alanı yükleniyor...</p>
              </div>
            ) : role ? (
              <DrawingActivity socket={socket} roomId={roomId} role={role} />
            ) : (
              <div className="bg-white p-8 rounded shadow-md">
                <p className="text-gray-600">Rol ataması bekleniyor...</p>
              </div>
            )}
          </div>

          {chatOpen && (
            <div className="relative h-full flex flex-col shadow-md overflow-hidden" style={{width: 300, backgroundColor: '#ffffff'}}>
              <h2 className="text-xl font-semibold mb-2 p-4 border-b border-gray-300 text-gray-800">Sohbet</h2>
              <div className="flex-1 p-2 overflow-y-auto bg-gray-50">
                {messages.map((m, i) => (
                  <div key={i} className="mb-1">
                    <span className="font-bold text-gray-800">{m.sender}:</span> <span className="text-gray-700">{m.message}</span>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-gray-300 flex">
                <input 
                  className="flex-1 border border-gray-300 rounded p-2 focus:outline-none focus:border-pink-500 mr-2 text-gray-800"
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Mesaj yaz..."
                />
                <button 
                  className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded"
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

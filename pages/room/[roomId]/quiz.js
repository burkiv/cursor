import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import Head from 'next/head'
import Menu from '../../../components/Menu'

let socket;

export default function QuizPage() {
  const router = useRouter();
  const { roomId } = router.query;
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');

  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [score, setScore] = useState(null);

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

  function submitQuiz() {
    // Basit örnek: Doğru cevaplar: Q1: "evet", Q2: "hayır"
    let sc = 0;
    if (q1.toLowerCase() === 'evet') sc++;
    if (q2.toLowerCase() === 'hayır') sc++;
    setScore(sc);
  }

  return (
    <>
      <Head>
        <title>{`Quiz - Oda ${roomId || ''}`}</title>
      </Head>
      <div className="flex h-screen bg-coupleBg text-coupleText overflow-hidden">
        {roomId && menuOpen && <Menu roomId={roomId} />}
        
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

            <h1 className="text-3xl font-bold mb-4">{`Oda ${roomId} - Quiz`}</h1>
            {role && (
              <div className="bg-white p-4 rounded shadow-md mb-4">
                <h2 className="text-xl font-semibold mb-2">Sevgili Quiz</h2>
                <p className="mb-2">Bu basit quizde ilişkiniz hakkında sorular var.</p>
                <div className="mb-2">
                  <label>Soru 1: Partnerinizle her gün konuşuyor musunuz? (evet/hayır)</label><br/>
                  <input 
                    className="border p-1"
                    value={q1}
                    onChange={(e) => setQ1(e.target.value)}
                  />
                </div>
                <div className="mb-2">
                  <label>Soru 2: Partnerinizle hiç tartışmıyor musunuz? (evet/hayır)</label><br/>
                  <input 
                    className="border p-1"
                    value={q2}
                    onChange={(e) => setQ2(e.target.value)}
                  />
                </div>
                <button onClick={submitQuiz} className="bg-coupleAccent hover:bg-pink-600 text-white py-1 px-3 rounded">Gönder</button>
                {score !== null && (
                  <div className="mt-2">
                    <p>Skorunuz: {score}/2</p>
                    <p>{score === 2 ? 'Harika, mükemmel bir iletişiminiz var!' : 'Biraz daha çaba lazım gibi...'}</p>
                  </div>
                )}
              </div>
            )}
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

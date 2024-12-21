import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Menu from '../components/Menu';
import { useRoom } from '../contexts/RoomContext';
import { io } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { requireAuth } from '../lib/auth';

let socket;

export default function MessagesPage() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(true);
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingInvites, setPendingInvites] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (session?.user?.name) {
      fetch('/api/socket');
      socket = io({ path: '/api/socket_io' });

      socket.on('connect', () => {
        socket.emit('login', { username: session.user.name });
        socket.emit('getPartnerMessages');
        socket.emit('getPartner');
      });

      socket.on('partnerMessages', (msgs) => {
        setMessages(msgs);
      });

      socket.on('newMessage', (msg) => {
        setMessages(prev => [...prev, msg]);
      });

      socket.on('partnerInfo', (partnerInfo) => {
        setPartner(partnerInfo);
        setShowInvite(false);
        setSuccess('Partner başarıyla eklendi');
        setTimeout(() => setSuccess(''), 3000);
      });

      socket.on('partnerInvite', (invite) => {
        setPendingInvites(prev => [...prev, invite]);
      });

      socket.on('partnerInviteResult', ({ success, message }) => {
        if (success) {
          setSuccess(message);
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(message);
          setTimeout(() => setError(''), 3000);
        }
      });

      return () => {
        socket.disconnect();
      }
    }
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Lütfen önce giriş yapın</p>
      </div>
    );
  }

  const sendMessage = () => {
    if (!inputMsg.trim() || !partner || !socket) return;
    
    socket.emit('sendPartnerMessage', {
      message: inputMsg,
      partnerId: partner.id
    });
    setInputMsg('');
  };

  const sendInvite = () => {
    if (!inviteUsername.trim()) return;
    setError('');
    
    socket.emit('sendPartnerInvite', {
      username: inviteUsername
    });
  };

  const acceptInvite = (from) => {
    socket.emit('acceptPartnerInvite', { from });
    setPendingInvites(prev => prev.filter(invite => invite.from !== from));
  };

  const rejectInvite = (from) => {
    socket.emit('rejectPartnerInvite', { from });
    setPendingInvites(prev => prev.filter(invite => invite.from !== from));
  };

  return (
    <>
      <Head>
        <title>Mesajlar - Çift Platformu</title>
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Mesajlar</h1>
              {!partner && !pendingInvites.length && (
                <button
                  onClick={() => setShowInvite(true)}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded"
                >
                  Partner Davet Et
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                {success}
              </div>
            )}

            {pendingInvites.length > 0 && (
              <div className="mb-6 p-4 bg-pink-50 rounded-lg">
                <h2 className="text-xl font-semibold mb-3 text-gray-800">Partner Daveti</h2>
                {pendingInvites.map((invite, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <p className="text-gray-800">{invite.from} sizi partner olarak eklemek istiyor</p>
                    <div className="space-x-2">
                      <button
                        onClick={() => acceptInvite(invite.from)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                      >
                        Kabul Et
                      </button>
                      <button
                        onClick={() => rejectInvite(invite.from)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                      >
                        Reddet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showInvite && !partner && (
              <div className="mb-6 p-4 bg-pink-50 rounded-lg">
                <h2 className="text-xl font-semibold mb-3 text-gray-800">Partner Davet Et</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteUsername}
                    onChange={(e) => setInviteUsername(e.target.value)}
                    placeholder="Partner Kullanıcı Adı"
                    className="flex-1 border rounded p-2 focus:outline-none focus:border-pink-500 text-gray-800"
                  />
                  <button
                    onClick={sendInvite}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded"
                  >
                    Davet Gönder
                  </button>
                </div>
              </div>
            )}

            {!partner && !showInvite && !pendingInvites.length ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Henüz bir partneriniz yok.</p>
                <p className="text-gray-500">
                  Partnerinizi davet etmek için yukarıdaki &quot;Partner Davet Et&quot; butonunu kullanın.
                </p>
              </div>
            ) : partner && (
              <div className="flex flex-col h-[600px]">
                <div className="bg-pink-50 p-4 rounded-t-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-200 rounded-full flex items-center justify-center text-xl text-gray-800">
                      {partner.username[0].toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-800">{partner.username}</h2>
                      <p className="text-sm text-gray-500">
                        {partner.online ? 'Çevrimiçi' : 'Çevrimdışı'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.sender === 'me'
                            ? 'bg-pink-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t p-4 bg-white rounded-b-lg">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMsg}
                      onChange={(e) => setInputMsg(e.target.value)}
                      placeholder="Mesajınızı yazın..."
                      className="flex-1 border rounded p-2 focus:outline-none focus:border-pink-500 text-gray-800"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button
                      onClick={sendMessage}
                      className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded"
                    >
                      Gönder
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  return await requireAuth(context);
} 
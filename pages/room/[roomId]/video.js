import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import Head from 'next/head'
import Menu from '../../../components/Menu'
import ReactPlayer from 'react-player'

let socket;

export default function VideoPage() {
  const router = useRouter();
  const { roomId } = router.query;
  const playerRef = useRef(null);
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [seeking, setSeeking] = useState(false);

  const [videoUrl, setVideoUrl] = useState('');
  const [videoInput, setVideoInput] = useState('');
  const [playing, setPlaying] = useState(false);

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

    socket.on('videoAction', ({ action, time }) => {
      if (action === 'play') {
        setPlaying(true);
      } else {
        setPlaying(false);
      }
    });

    socket.on('videoLink', ({ link }) => {
      setVideoUrl(link);
    });

    socket.on('videoState', ({ link, currentTime, playing: isPlaying }) => {
      if (!videoUrl) {
        setVideoUrl(link);
        setPlaying(isPlaying);
      }
    });

    return () => {
      socket.disconnect();
    }
  }, [roomId, videoUrl, playing]);

  function sendMessage() {
    if(!inputMsg.trim()) return;
    socket.emit('chatMessage', { roomId, message: inputMsg, sender: role === 'partner' ? 'Partner' : 'User' });
    setInputMsg('');
  }

  function sendVideoLink() {
    if (!videoInput.trim()) return;
    console.log('Sending video link:', videoInput);
    setVideoUrl(videoInput);
    socket.emit('videoLink', { roomId, link: videoInput });
    setVideoInput('');
  }

  function handlePlay() {
    if (seeking) return;
    setPlaying(true);
    if (socket && playerRef.current) {
      socket.emit('videoAction', { 
        roomId, 
        action: 'play', 
        time: playerRef.current.getCurrentTime() 
      });
    }
  }

  function handlePause() {
    if (seeking) return;
    setPlaying(false);
    if (socket && playerRef.current) {
      socket.emit('videoAction', { 
        roomId, 
        action: 'pause', 
        time: playerRef.current.getCurrentTime() 
      });
    }
  }

  function handleSeek(seconds) {
    setSeeking(true);
    if (socket) {
      socket.emit('videoAction', { 
        roomId, 
        action: 'seek', 
        time: seconds 
      });
    }
    setTimeout(() => setSeeking(false), 500);
  }

  function handleProgress({ playedSeconds }) {
    // Her 5 saniyede bir senkronizasyon kontrolü
    if (Math.floor(playedSeconds) % 5 === 0 && socket && playing && !seeking) {
      socket.emit('videoAction', { 
        roomId, 
        action: playing ? 'play' : 'pause', 
        time: playedSeconds 
      });
    }
  }

  return (
    <>
      <Head>
        <title>{`Oda ${roomId || ''} - Video İzleme`}</title>
      </Head>
      <div className="flex h-screen bg-coupleBg text-coupleText overflow-hidden">
        {roomId && menuOpen && <Menu roomId={roomId} />}
        
        <div className="flex-1 flex flex-row relative">
          <div className={`flex-1 ${isFullscreen ? 'p-0' : 'p-8'} overflow-auto`}>
            {!isFullscreen && (
              <>
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

                <h1 className="text-3xl font-bold mb-4">{`Oda ${roomId} - Video İzleme`}</h1>

                <div className="bg-white p-4 rounded shadow-md mb-4">
                  <h2 className="text-xl font-semibold mb-2">YouTube Linki Girin</h2>
                  <input 
                    type="text" 
                    className="border p-2 mr-2" 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    value={videoInput} 
                    onChange={(e) => setVideoInput(e.target.value)}
                  />
                  <button onClick={sendVideoLink} className="bg-coupleAccent hover:bg-pink-600 text-white py-1 px-3 rounded">Linki Gönder</button>
                </div>
              </>
            )}

            {videoUrl && (
              <div className={`relative ${isFullscreen ? 'h-screen w-full' : 'h-[600px] bg-white p-4 rounded shadow-md'}`}>
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="bg-coupleAccent hover:bg-pink-600 text-white py-1 px-3 rounded"
                  >
                    {isFullscreen ? 'Küçült' : 'Tam Ekran'}
                  </button>
                </div>
                <ReactPlayer 
                  ref={playerRef}
                  url={videoUrl}
                  playing={playing}
                  controls={true}
                  width="100%"
                  height="100%"
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onSeek={handleSeek}
                  onProgress={handleProgress}
                  style={{ backgroundColor: 'black' }}
                />
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

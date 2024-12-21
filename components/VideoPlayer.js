// components/VideoPlayer.js
import { useRef, useState, useEffect } from 'react';

export default function VideoPlayer({ socket, roomId, videoUrl }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('videoAction', ({ action, time }) => {
      if (!videoRef.current) return;
      videoRef.current.currentTime = time;
      if (action === 'play') {
        videoRef.current.play();
        setPlaying(true);
      } else if (action === 'pause') {
        videoRef.current.pause();
        setPlaying(false);
      }
    });

    return () => {
      socket.off('videoAction');
    }
  }, [socket]);

  function togglePlay() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
      socket.emit('videoAction', { roomId, action: 'play', time: videoRef.current.currentTime });
    } else {
      videoRef.current.pause();
      setPlaying(false);
      socket.emit('videoAction', { roomId, action: 'pause', time: videoRef.current.currentTime });
    }
  }

  function toggleFullscreen() {
    setIsFullscreen(!isFullscreen);
  }

  return (
    <div className={`transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'bg-white p-4 rounded shadow-md mb-4'}`}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-white">Video İzleme</h2>
        <button
          onClick={toggleFullscreen}
          className="bg-coupleAccent hover:bg-pink-600 text-white py-1 px-3 rounded ml-2"
        >
          {isFullscreen ? 'Küçült' : 'Tam Ekran'}
        </button>
      </div>
      
      <div className={`relative ${isFullscreen ? 'h-[calc(100vh-100px)]' : 'h-[400px]'}`}>
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          controls={false}
          src={videoUrl}
        ></video>
      </div>
      
      <div className="mt-2 flex justify-center">
        <button
          onClick={togglePlay}
          className="bg-coupleAccent hover:bg-pink-600 text-white py-1 px-3 rounded"
        >
          {playing ? 'Durdur' : 'Oynat'}
        </button>
      </div>
    </div>
  );
}

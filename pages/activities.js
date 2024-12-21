import { useRouter } from 'next/router';
import { useState } from 'react';
import Head from 'next/head';
import Menu from '../components/Menu';

export default function ActivitiesPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);

  const activities = [
    {
      id: 'video',
      title: 'Video İzleme',
      description: 'YouTube videoları izleyin ve sohbet edin',
      icon: '▶️',
      path: '/room/[roomId]/video'
    },
    {
      id: 'draw',
      title: 'Çizim Yapma',
      description: 'Birlikte resim çizin ve paylaşın',
      icon: '🎨',
      path: '/room/[roomId]/draw'
    },
    {
      id: 'quiz',
      title: 'Quiz Çözme',
      description: 'Eğlenceli quizler çözün',
      icon: '❓',
      path: '/room/[roomId]/quiz'
    }
  ];

  const handleActivityClick = (activity) => {
    if (!router.query.roomId) {
      alert('Lütfen önce bir odaya katılın!');
      return;
    }
    router.push(activity.path.replace('[roomId]', router.query.roomId));
  };

  return (
    <>
      <Head>
        <title>Aktiviteler</title>
      </Head>
      <div className="flex h-screen bg-coupleBg text-coupleText overflow-hidden">
        {menuOpen && <Menu roomId={router.query.roomId} />}
        
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

            <h1 className="text-3xl font-bold mb-8">Aktiviteler</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => handleActivityClick(activity)}
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer transform transition-transform hover:scale-105"
                >
                  <div className="text-4xl mb-4">{activity.icon}</div>
                  <h2 className="text-xl font-semibold mb-2">{activity.title}</h2>
                  <p className="text-gray-600">{activity.description}</p>
                </div>
              ))}
            </div>
          </div>

          {chatOpen && (
            <div className="relative h-full flex flex-col shadow-md overflow-hidden" style={{width: 300, backgroundColor: '#ffffff'}}>
              <h2 className="text-xl font-semibold mb-2 p-4 border-b border-gray-300">Sohbet</h2>
              <div className="flex-1 p-2 overflow-y-auto bg-gray-50">
                {/* Sohbet mesajları buraya gelecek */}
              </div>
              <div className="p-2 border-t border-gray-300 flex">
                <input 
                  className="flex-1 border border-gray-300 rounded p-2 focus:outline-none focus:border-coupleAccent mr-2"
                  type="text"
                  placeholder="Mesaj yaz..."
                />
                <button 
                  className="bg-coupleAccent hover:bg-pink-600 text-white py-2 px-4 rounded"
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
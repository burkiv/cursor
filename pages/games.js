// pages/games.js
import Head from 'next/head';
import Menu from '../components/Menu';

export default function GamesPage() {
  return (
    <>
      <Head>
        <title>Oyunlar - Çift Platformu</title>
        <meta name="description" content="Oyunlar sayfası" />
      </Head>
      <div className="flex h-screen bg-pink-50">
        <Menu />
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-4">Oyunlar</h1>
          <p className="text-gray-700">
            Burada çiftlerin beraber oynayabileceği mini oyunlar yer alacak. 
            İleride buraya bir oyun listesi, açıklamalar ve “Oyuna Başla” butonları ekleyeceğiz.
          </p>
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-pink-100 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-2">Kelime Oyunu</h2>
              <p className="text-gray-700 mb-2">Birlikte kelimeler türetin, zorluklar atlatın.</p>
              <button className="bg-pink-500 hover:bg-pink-600 text-white py-1 px-3 rounded">
                Başla
              </button>
            </div>

            <div className="p-4 bg-pink-100 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-2">Eşleştirme Kartları</h2>
              <p className="text-gray-700 mb-2">Aynı kartları açarak puan toplayın ve birbirinizi tanıyın.</p>
              <button className="bg-pink-500 hover:bg-pink-600 text-white py-1 px-3 rounded">
                Başla
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Menu from '../../components/Menu';
import { getServerSession } from "next-auth";
import { authOptions } from '../api/auth/[...nextauth]';

export default function Albums() {
  const { data: session } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(true);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlbum, setNewAlbum] = useState({ title: '', description: '', isPrivate: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (session?.user?.name) {
      fetchAlbums();
    }
  }, [session]);

  const fetchAlbums = async () => {
    try {
      const response = await fetch('/api/albums');
      if (response.ok) {
        const data = await response.json();
        setAlbums(data);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
      setError('Albümler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbum.title.trim()) {
      setError('Albüm adı gerekli');
      return;
    }

    try {
      const response = await fetch('/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlbum),
      });

      if (response.ok) {
        const album = await response.json();
        setAlbums([album, ...albums]);
        setShowCreateModal(false);
        setNewAlbum({ title: '', description: '', isPrivate: false });
        setSuccess('Albüm başarıyla oluşturuldu');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Albüm oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error creating album:', error);
      setError('Albüm oluşturulurken bir hata oluştu');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Lütfen önce giriş yapın</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Albümler - Çift Platformu</title>
      </Head>
      <div className="flex h-screen bg-coupleBg overflow-hidden">
        {menuOpen && <Menu />}
        
        <div className="flex-1 p-8">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-1 px-3 rounded mb-4"
          >
            {menuOpen ? 'Menüyü Gizle' : 'Menüyü Göster'}
          </button>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Albümler</h1>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Yeni Albüm
              </button>
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

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Albümler yükleniyor...</p>
              </div>
            ) : albums.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Henüz bir albümünüz yok</p>
                <p className="text-gray-500">
                  Yeni albüm oluşturmak için yukarıdaki "Yeni Albüm" butonunu kullanın
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => router.push(`/albums/${album.id}`)}
                    className="bg-pink-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      {album.coverPhotoUrl ? (
                        <img
                          src={album.coverPhotoUrl}
                          alt={album.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-400">Fotoğraf Yok</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800">{album.title}</h3>
                      {album.description && (
                        <p className="text-sm text-gray-600 mt-1">{album.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        {album._count?.photos || 0} fotoğraf
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showCreateModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Yeni Albüm Oluştur</h2>
                  <form onSubmit={handleCreateAlbum}>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Albüm Adı
                      </label>
                      <input
                        type="text"
                        value={newAlbum.title}
                        onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
                        className="w-full border rounded p-2 focus:outline-none focus:border-pink-500"
                        placeholder="Albüm adını girin"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Açıklama
                      </label>
                      <textarea
                        value={newAlbum.description}
                        onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
                        className="w-full border rounded p-2 focus:outline-none focus:border-pink-500"
                        placeholder="Albüm açıklaması girin (isteğe bağlı)"
                        rows="3"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded"
                      >
                        Oluştur
                      </button>
                    </div>
                  </form>
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
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session: {
        user: {
          id: session.user.id,
          name: session.user.name
        }
      }
    }
  };
} 
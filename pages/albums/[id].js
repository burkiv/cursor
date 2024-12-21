import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Menu from '../../components/Menu';

export default function AlbumDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(true);
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');

  useEffect(() => {
    if (id && session) {
      fetchAlbum();
    }
  }, [id, session]);

  const fetchAlbum = async () => {
    try {
      const response = await fetch(`/api/albums/${id}`);
      if (response.ok) {
        const data = await response.json();
        setAlbum(data);
      } else {
        setError('Albüm yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching album:', error);
      setError('Albüm yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    } else {
      setError('Lütfen geçerli bir resim dosyası seçin');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Lütfen bir resim seçin');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('photo', selectedFile);
    formData.append('title', photoTitle);
    formData.append('description', photoDescription);

    try {
      const response = await fetch(`/api/albums/${id}/photos`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const newPhoto = await response.json();
        setAlbum(prev => ({
          ...prev,
          photos: [...prev.photos, newPhoto]
        }));
        setShowUploadModal(false);
        setSelectedFile(null);
        setPhotoTitle('');
        setPhotoDescription('');
      } else {
        setError('Fotoğraf yüklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError('Fotoğraf yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Lütfen önce giriş yapın</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-600">Albüm bulunamadı</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{album.title} - Çift Platformu</title>
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
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{album.title}</h1>
                {album.description && (
                  <p className="text-gray-600 mt-2">{album.description}</p>
                )}
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Fotoğraf Ekle
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {album.photos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Bu albümde henüz fotoğraf yok</p>
                <p className="text-gray-500">
                  Fotoğraf eklemek için yukarıdaki "Fotoğraf Ekle" butonunu kullanın
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {album.photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={photo.url}
                        alt={photo.title || album.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    {photo.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-sm font-medium">{photo.title}</p>
                        {photo.description && (
                          <p className="text-xs">{photo.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {showUploadModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Fotoğraf Yükle</h2>
                  <form onSubmit={handleUpload}>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Fotoğraf
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="w-full"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Başlık
                      </label>
                      <input
                        type="text"
                        value={photoTitle}
                        onChange={(e) => setPhotoTitle(e.target.value)}
                        className="w-full border rounded p-2 focus:outline-none focus:border-pink-500"
                        placeholder="Fotoğraf başlığı (isteğe bağlı)"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Açıklama
                      </label>
                      <textarea
                        value={photoDescription}
                        onChange={(e) => setPhotoDescription(e.target.value)}
                        className="w-full border rounded p-2 focus:outline-none focus:border-pink-500"
                        placeholder="Fotoğraf açıklaması (isteğe bağlı)"
                        rows="3"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowUploadModal(false)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        disabled={uploading || !selectedFile}
                        className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
                      >
                        {uploading ? 'Yükleniyor...' : 'Yükle'}
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
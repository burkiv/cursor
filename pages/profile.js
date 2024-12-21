// pages/profile.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import Menu from '../components/Menu';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [partner, setPartner] = useState(null);
  const [relationshipInfo, setRelationshipInfo] = useState(null);

  useEffect(() => {
    fetchProfileData();
    fetchPartnerData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      if (response.ok) {
        setProfileData(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Profil bilgileri alınamadı');
    }
  };

  const fetchPartnerData = async () => {
    try {
      const response = await fetch('/api/partner');
      const data = await response.json();
      if (response.ok) {
        setPartner(data.partner);
        setRelationshipInfo(data.relationshipInfo);
        if (data.relationshipInfo?.startDate) {
          setStartDate(new Date(data.relationshipInfo.startDate).toISOString().split('T')[0]);
        }
      }
    } catch (err) {
      console.error('Partner bilgileri alınamadı:', err);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    setIsUploading(true);
    setError('');

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setProfileData(data.user);
        setSuccess('Profil fotoğrafı başarıyla güncellendi');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Profil fotoğrafı güncellenirken bir hata oluştu');
      }
    } catch (err) {
      setError('Profil fotoğrafı güncellenirken bir hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  const updateStartDate = async () => {
    if (!startDate) return;

    try {
      const response = await fetch('/api/partner/update-date', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startDate }),
      });

      const data = await response.json();

      if (response.ok) {
        setRelationshipInfo(prev => ({ ...prev, startDate }));
        setShowDatePicker(false);
        setSuccess('İlişki başlangıç tarihi güncellendi');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Tarih güncellenirken bir hata oluştu');
    }
  };

  if (!session) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Profil - Çift Platformu</title>
      </Head>
      <div className="flex h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 overflow-hidden">
        {menuOpen && <Menu />}
        
        <div className="flex-1 p-8 overflow-y-auto">
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

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-8">
              Profil
            </h1>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                <p className="font-medium">Hata</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6">
                <p className="font-medium">Başarılı</p>
                <p className="text-sm">{success}</p>
              </div>
            )}

            <div className="space-y-8">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <Image
                    src={profileData?.profilePicture || '/default-avatar.png'}
                    alt="Profil Fotoğrafı"
                    width={128}
                    height={128}
                    className="rounded-full object-cover"
                  />
                  <label
                    className="absolute bottom-0 right-0 bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-full cursor-pointer"
                    htmlFor="profilePicture"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </label>
                  <input
                    type="file"
                    id="profilePicture"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    disabled={isUploading}
                  />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {profileData?.name || profileData?.username || 'Kullanıcı'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-pink-500">
                    {relationshipInfo?.sharedActivities || 0}
                  </div>
                  <div className="text-gray-600">Paylaşılan Aktivite</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-pink-500">
                    {relationshipInfo?.albums || 0}
                  </div>
                  <div className="text-gray-600">Albüm</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-2xl font-bold text-pink-500">
                    {relationshipInfo?.photos || 0}
                  </div>
                  <div className="text-gray-600">Fotoğraf</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner Bilgileri</h3>
                {partner ? (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-semibold text-pink-500">
                          {partner.username[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{partner.username}</h4>
                        <p className="text-sm text-gray-500">
                          {partner.online ? 'Çevrimiçi' : 'Çevrimdışı'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-600">İlişki Başlangıç Tarihi</p>
                          <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="text-pink-500 hover:text-pink-600 text-sm"
                          >
                            {showDatePicker ? 'İptal' : 'Düzenle'}
                          </button>
                        </div>
                        {showDatePicker ? (
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="flex-1 border rounded p-2 focus:outline-none focus:border-pink-500"
                            />
                            <button
                              onClick={updateStartDate}
                              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded"
                            >
                              Kaydet
                            </button>
                          </div>
                        ) : (
                          <p className="text-gray-800">
                            {relationshipInfo?.startDate ? 
                              new Date(relationshipInfo.startDate).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              }) : 'Tarih belirtilmemiş'
                            }
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Birlikte Geçirilen Süre</p>
                          <p className="text-gray-800">{relationshipInfo?.duration || 'Hesaplanıyor...'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Toplam Mesaj</p>
                          <p className="text-gray-800">{relationshipInfo?.totalMessages || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Henüz bir partneriniz yok</p>
                    <button 
                      onClick={() => window.location.href = '/messages'}
                      className="mt-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:opacity-90 transition duration-200"
                    >
                      Partner Ekle
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tercihler</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Bildirimler</p>
                      <p className="text-sm text-gray-500">Partner aktiviteleri için bildirimler</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Gizlilik</p>
                      <p className="text-sm text-gray-500">Profil gizliliği</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

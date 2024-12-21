import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Lütfen tüm alanları doldurun');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false
      });

      if (result.error) {
        setError(result.error);
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('Giriş yapılırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Giriş Yap - Çift Platformu</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Giriş Yap
            </h1>
            <p className="text-gray-600 mt-2">
              Çift Platformuna hoş geldiniz
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
              <p className="font-medium">Hata</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
                placeholder="Kullanıcı adınızı girin"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900 placeholder-gray-500"
                placeholder="Şifrenizi girin"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:opacity-90 transition duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>

            <div className="text-center mt-4">
              <Link href="/register" className="text-purple-600 hover:text-purple-700 font-medium">
                Hesabınız yok mu? Kayıt olun
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

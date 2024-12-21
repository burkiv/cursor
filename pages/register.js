import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password || !confirmPassword) {
      setError('Tüm alanları doldurun');
      return;
    }

    if (!validateUsername(username)) {
      setError('Kullanıcı adı 3-20 karakter arası olmalı ve sadece harf, rakam ve alt çizgi içerebilir');
      return;
    }

    if (!validatePassword(password)) {
      setError('Şifre en az 8 karakter uzunluğunda olmalı ve en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setError('');
    setIsSubmitting(true);

    if (!securityQuestion || !securityAnswer) {
      setError('Güvenlik sorusu ve cevabını doldurun');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          username, 
          password,
          securityQuestion,
          securityAnswer 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Kayıt olurken bir hata oluştu');
      }

      router.push('/login?registered=true');
    } catch (err) {
      console.error('Kayıt hatası:', err);
      setError(err.message || 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Kayıt Ol - Çift Platformu</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Kayıt Ol
            </h1>
            <p className="text-gray-600 mt-2">Çift Platformuna hoş geldiniz</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
              <p className="font-medium">Hata</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={step === 1 ? handleNextStep : handleSubmit} className="space-y-6">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900"
                    placeholder="Kullanıcı adınızı girin"
                    disabled={isSubmitting}
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
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900"
                    placeholder="Şifrenizi girin"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Şifre Tekrar
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900"
                    placeholder="Şifrenizi tekrar girin"
                    disabled={isSubmitting}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:opacity-90 transition duration-200 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Devam Et
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Güvenlik Sorusu
                  </label>
                  <select
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900"
                    disabled={isSubmitting}
                  >
                    <option value="">Güvenlik sorusu seçin</option>
                    <option value="En sevdiğiniz yemek nedir?">En sevdiğiniz yemek nedir?</option>
                    <option value="İlk evcil hayvanınızın adı nedir?">İlk evcil hayvanınızın adı nedir?</option>
                    <option value="Doğduğunuz şehir neresidir?">Doğduğunuz şehir neresidir?</option>
                    <option value="En sevdiğiniz renk nedir?">En sevdiğiniz renk nedir?</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Güvenlik Sorusu Cevabı
                  </label>
                  <input
                    type="text"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900"
                    placeholder="Güvenlik sorusunun cevabını girin"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/2 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    Geri
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:opacity-90 transition duration-200 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Kaydediliyor...' : 'Kayıt Ol'}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

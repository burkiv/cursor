import { hash, compare } from 'bcryptjs';
import prisma from '../../../lib/prisma';

// Rate limiting için basit bir obje
const resetAttempts = {};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, securityAnswer, newPassword } = req.body;

    if (!username || !securityAnswer || !newPassword) {
      return res.status(400).json({ error: 'Tüm alanlar gerekli' });
    }

    // Rate limiting kontrolü
    const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const attemptKey = `${username}_${userIP}`;
    
    if (resetAttempts[attemptKey]) {
      const { count, timestamp } = resetAttempts[attemptKey];
      const timeDiff = Date.now() - timestamp;
      
      // 1 saat içinde 3 başarısız deneme limiti
      if (count >= 3 && timeDiff < 60 * 60 * 1000) {
        return res.status(429).json({
          error: 'Çok fazla başarısız deneme. Lütfen 1 saat sonra tekrar deneyin.'
        });
      }
      
      // 1 saat geçtiyse sayacı sıfırla
      if (timeDiff >= 60 * 60 * 1000) {
        resetAttempts[attemptKey] = { count: 0, timestamp: Date.now() };
      }
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      updateResetAttempts(attemptKey);
      return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Güvenlik sorusu cevabını kontrol et
    const answerMatch = await compare(securityAnswer.toLowerCase(), user.securityAnswer);
    if (!answerMatch) {
      updateResetAttempts(attemptKey);
      return res.status(401).json({ error: 'Güvenlik sorusu cevabı yanlış' });
    }

    // Yeni şifreyi hashle
    const hashedPassword = await hash(newPassword, 12);

    // Şifreyi güncelle
    await prisma.user.update({
      where: { username },
      data: { 
        password: hashedPassword,
        passwordResetAt: new Date()
      }
    });

    // Başarılı sıfırlama sonrası attempt sayacını sıfırla
    delete resetAttempts[attemptKey];

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Şifre sıfırlanırken bir hata oluştu' });
  }
}

function updateResetAttempts(key) {
  if (!resetAttempts[key]) {
    resetAttempts[key] = { count: 1, timestamp: Date.now() };
  } else {
    resetAttempts[key].count += 1;
  }
} 
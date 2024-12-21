import prisma from '../../../lib/prisma';

// Rate limiting için basit bir obje
const questionAttempts = {};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Kullanıcı adı gerekli' });
    }

    // Rate limiting kontrolü
    const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const attemptKey = `${username}_${userIP}`;
    
    if (questionAttempts[attemptKey]) {
      const { count, timestamp } = questionAttempts[attemptKey];
      const timeDiff = Date.now() - timestamp;
      
      // 15 dakika içinde 10 deneme limiti
      if (count >= 10 && timeDiff < 15 * 60 * 1000) {
        return res.status(429).json({
          error: 'Çok fazla deneme. Lütfen 15 dakika sonra tekrar deneyin.'
        });
      }
      
      // 15 dakika geçtiyse sayacı sıfırla
      if (timeDiff >= 15 * 60 * 1000) {
        questionAttempts[attemptKey] = { count: 0, timestamp: Date.now() };
      }
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        securityQuestion: true
      }
    });

    if (!user) {
      // Güvenlik için kullanıcı bulunamadığında bile generic bir soru döndür
      return res.status(200).json({
        securityQuestion: 'İlk evcil hayvanınızın adı nedir?'
      });
    }

    // Attempt sayısını güncelle
    if (!questionAttempts[attemptKey]) {
      questionAttempts[attemptKey] = { count: 1, timestamp: Date.now() };
    } else {
      questionAttempts[attemptKey].count += 1;
    }

    res.status(200).json({
      securityQuestion: user.securityQuestion
    });
  } catch (error) {
    console.error('Get security question error:', error);
    res.status(500).json({ error: 'Güvenlik sorusu alınırken bir hata oluştu' });
  }
} 
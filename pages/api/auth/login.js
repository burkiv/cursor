import { sign } from 'jsonwebtoken';
import { compare } from 'bcryptjs';
import { serialize } from 'cookie';
import prisma from '../../../lib/prisma';

// Rate limiting için basit bir obje
const loginAttempts = {};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    console.log('Login attempt for username:', username); // Debug log

    // Kullanıcı adı ve şifre kontrolü
    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
    }

    // Rate limiting kontrolü
    const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const attemptKey = `${username}_${userIP}`;
    
    if (loginAttempts[attemptKey]) {
      const { count, timestamp } = loginAttempts[attemptKey];
      const timeDiff = Date.now() - timestamp;
      
      // 15 dakika içinde 5 başarısız deneme limiti
      if (count >= 5 && timeDiff < 15 * 60 * 1000) {
        return res.status(429).json({
          error: 'Çok fazla başarısız deneme. Lütfen 15 dakika sonra tekrar deneyin.'
        });
      }
      
      // 15 dakika geçtiyse sayacı sıfırla
      if (timeDiff >= 15 * 60 * 1000) {
        loginAttempts[attemptKey] = { count: 0, timestamp: Date.now() };
      }
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { username }
    });

    console.log('User found:', user ? 'Yes' : 'No'); // Debug log

    if (!user) {
      updateLoginAttempts(attemptKey);
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }

    // Şifre kontrolü
    const passwordMatch = await compare(password, user.password);
    console.log('Password match:', passwordMatch); // Debug log

    if (!passwordMatch) {
      updateLoginAttempts(attemptKey);
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }

    // JWT token oluştur
    const token = sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'couple-platform-secret-key-2024',
      { expiresIn: '7d' }
    );

    // Cookie ayarla
    const cookie = serialize('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
      path: '/'
    });

    // Başarılı giriş sonrası login attempt sayacını sıfırla
    delete loginAttempts[attemptKey];

    // Kullanıcının son giriş zamanını güncelle
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        lastLoginAt: new Date(),
        loginAttempts: 0,
        isLocked: false,
        lockUntil: null
      }
    });

    res.setHeader('Set-Cookie', cookie);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Login error:', error); // Detaylı hata logu
    res.status(500).json({ error: 'Giriş yapılırken bir hata oluştu. Hata: ' + error.message });
  }
}

function updateLoginAttempts(key) {
  if (!loginAttempts[key]) {
    loginAttempts[key] = { count: 1, timestamp: Date.now() };
  } else {
    loginAttempts[key].count += 1;
  }
} 
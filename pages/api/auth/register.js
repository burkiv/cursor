import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password, securityQuestion, securityAnswer } = req.body;

    // Validate input
    if (!username || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ error: 'Tüm alanları doldurun' });
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ 
        error: 'Kullanıcı adı 3-20 karakter arası olmalı ve sadece harf, rakam ve alt çizgi içerebilir' 
      });
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: 'Şifre en az 8 karakter uzunluğunda olmalı ve en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir' 
      });
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        securityQuestion,
        securityAnswer: securityAnswer.toLowerCase(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Kayıt başarıyla tamamlandı' 
    });

  } catch (error) {
    console.error('Kayıt hatası:', error);
    return res.status(500).json({ 
      error: 'Kayıt olurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.' 
    });
  } finally {
    await prisma.$disconnect();
  }
} 
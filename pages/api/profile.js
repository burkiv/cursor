import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

const saveFile = async (file, username) => {
  const data = await fs.readFile(file.filepath);
  const fileName = `${username}-${Date.now()}${path.extname(file.originalFilename)}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, data);
  await fs.unlink(file.filepath); // temp dosyayı sil
  
  return `/uploads/${fileName}`;
};

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Oturum açmanız gerekiyor' });
  }

  try {
    if (req.method === 'GET') {
      const user = await prisma.user.findUnique({
        where: { username: session.user.name },
        select: {
          id: true,
          username: true,
          name: true,
          profilePicture: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      return res.status(200).json(user);
    }

    if (req.method === 'POST') {
      const form = formidable({
        maxFileSize: 5 * 1024 * 1024, // 5MB
      });

      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });

      let profilePicturePath = null;
      const profilePicture = files.profilePicture?.[0];

      if (profilePicture) {
        // Eski profil fotoğrafını sil
        const currentUser = await prisma.user.findUnique({
          where: { username: session.user.name },
          select: { profilePicture: true },
        });

        if (currentUser?.profilePicture && 
            !currentUser.profilePicture.includes('default-avatar')) {
          try {
            const oldPath = path.join(process.cwd(), 'public', currentUser.profilePicture);
            await fs.access(oldPath);
            await fs.unlink(oldPath);
          } catch (error) {
            console.error('Eski profil fotoğrafı silinirken hata:', error);
          }
        }

        // Yeni fotoğrafı kaydet
        profilePicturePath = await saveFile(profilePicture, session.user.name);
      }

      // Kullanıcıyı güncelle
      const updatedUser = await prisma.user.update({
        where: { username: session.user.name },
        data: {
          ...(profilePicturePath && { profilePicture: profilePicturePath }),
          ...(fields.name && { name: fields.name }),
        },
      });

      return res.status(200).json({
        success: true,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          name: updatedUser.name,
          profilePicture: updatedUser.profilePicture,
        },
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Bir hata oluştu',
      details: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
} 
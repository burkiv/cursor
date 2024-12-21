import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        const album = await prisma.album.findUnique({
          where: { id },
          include: {
            photos: {
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        });

        if (!album) {
          return res.status(404).json({ error: 'Album not found' });
        }

        // Albüm sahibini kontrol et
        const user = await prisma.user.findUnique({
          where: { username: session.user.name }
        });

        if (album.userId !== user.id) {
          return res.status(403).json({ error: 'Forbidden' });
        }

        return res.json(album);

      case 'PUT':
        const { title, description, isPrivate } = req.body;

        const updatedAlbum = await prisma.album.update({
          where: { id },
          data: {
            title,
            description,
            isPrivate
          }
        });

        return res.json(updatedAlbum);

      case 'DELETE':
        await prisma.album.delete({
          where: { id }
        });

        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Album API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 
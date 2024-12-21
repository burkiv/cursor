import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

const saveFile = async (file) => {
  try {
    const data = fs.readFileSync(file.filepath);
    
    const ext = path.extname(file.originalFilename || '.jpg');
    const filename = `${Date.now()}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, data);

    try {
      fs.unlinkSync(file.filepath);
    } catch (unlinkError) {
      console.error('Warning: Could not delete temp file:', unlinkError);
    }
    
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error(`Failed to save file: ${error.message}`);
  }
};

const parseForm = async (req) => {
  const options = {
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
    multiples: false,
  };

  return new Promise((resolve, reject) => {
    const { default: formidable } = require('formidable');
    const form = formidable(options);
    
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        reject(err);
        return;
      }
      resolve([fields, files]);
    });
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;

    const user = await prisma.user.findUnique({
      where: { username: session.user.name }
    });

    const album = await prisma.album.findUnique({
      where: { id }
    });

    if (!album || album.userId !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const [fields, files] = await parseForm(req);

    if (!files || !files.photo) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const url = await saveFile(files.photo);

    const photo = await prisma.photo.create({
      data: {
        url,
        title: fields.title || null,
        description: fields.description || null,
        albumId: id,
        userId: user.id
      }
    });

    const photoCount = await prisma.photo.count({
      where: { albumId: id }
    });

    if (photoCount === 1) {
      await prisma.album.update({
        where: { id },
        data: { coverPhotoId: photo.id }
      });
    }

    return res.status(201).json(photo);
  } catch (error) {
    console.error('Photo API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: error.message,
      stack: error.stack 
    });
  }
} 
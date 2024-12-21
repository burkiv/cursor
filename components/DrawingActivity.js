// components/DrawingActivity.js
import { useEffect, useRef, useState, useCallback } from 'react';

export default function DrawingActivity({ socket, roomId, role }) {
  const userCanvasRef = useRef(null);
  const partnerCanvasRef = useRef(null);

  const [drawing, setDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [eraser, setEraser] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff');

  const handlePartnerDraw = useCallback(({ x, y, drawing, drawer, brushColor, brushSize, eraser }) => {
    const canvas = (drawer === 'partner') ? partnerCanvasRef.current : userCanvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = eraser ? bgColor : brushColor;
    ctx.lineWidth = brushSize;

    if (drawing) {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  }, [bgColor]);

  useEffect(() => {
    if (!socket) return;
    socket.on('draw', handlePartnerDraw);

    return () => {
      socket.off('draw', handlePartnerDraw);
    }
  }, [socket, handlePartnerDraw]);

  function handleMouseDown(e) {
    if (!role) return;
    const canvas = (role === 'partner') ? partnerCanvasRef.current : userCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDrawing(true);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = eraser ? bgColor : brushColor;
    ctx.lineWidth = brushSize;

    socket.emit('draw', { roomId, x, y, drawing: false, drawer: role, brushColor, brushSize, eraser });
  }

  function handleMouseMove(e) {
    if (!drawing || !role) return;
    const canvas = (role === 'partner') ? partnerCanvasRef.current : userCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = eraser ? bgColor : brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();

    socket.emit('draw', { roomId, x, y, drawing: true, drawer: role, brushColor, brushSize, eraser });
  }

  function handleMouseUp() {
    setDrawing(false);
  }

  function handleMouseLeave() {
    if (drawing) setDrawing(false);
  }

  function fillBackground(canvas, color) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }

  useEffect(() => {
    const userCanvas = userCanvasRef.current;
    const partnerCanvas = partnerCanvasRef.current;
    userCanvas.width = 600;
    userCanvas.height = 600;
    partnerCanvas.width = 600;
    partnerCanvas.height = 600;

    fillBackground(userCanvas, bgColor);
    fillBackground(partnerCanvas, bgColor);
  }, [bgColor]);

  function handleCombine() {
    // İki canvas'ı yan yana birleştir
    // Final resim 1200x600 olsun
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = 1200;
    finalCanvas.height = 600;
    const fctx = finalCanvas.getContext('2d');

    // Sol kanvas partner
    fctx.drawImage(partnerCanvasRef.current, 0, 0);
    // Sağ kanvas user
    fctx.drawImage(userCanvasRef.current, 600, 0);

    // Data al
    const dataURL = finalCanvas.toDataURL('image/png');

    // İndirmek için link
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'final_drawing.png';
    link.click();
  }

  return (
    <div className="bg-white p-4 rounded shadow-md mb-4">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">Çizim Araçları</h2>
      <div className="flex gap-4 mb-4">
        <div>
          <label className="text-gray-700">Fırça Rengi:</label>
          <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="ml-2" />
        </div>
        <div>
          <label className="text-gray-700">Fırça Boyutu:</label>
          <input type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="ml-2" />
        </div>
        <div>
          <label className="text-gray-700">Arka Plan Rengi:</label>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="ml-2" />
        </div>
        <div>
          <label className="text-gray-700">
            <input type="checkbox" checked={eraser} onChange={(e) => setEraser(e.target.checked)} className="mr-2" />
            Silgi
          </label>
        </div>
        <button 
          onClick={handleCombine} 
          className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-1 px-3 rounded"
        >
          Tamamla ve İndir
        </button>
      </div>

      <div className="flex gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Partner Kanvası (Sol)</h2>
          <canvas
            ref={partnerCanvasRef}
            onMouseDown={role === 'partner' ? handleMouseDown : undefined}
            onMouseMove={role === 'partner' ? handleMouseMove : undefined}
            onMouseUp={role === 'partner' ? handleMouseUp : undefined}
            onMouseLeave={role === 'partner' ? handleMouseLeave : undefined}
            style={{ border: '1px solid #ccc', cursor: role === 'partner' ? 'crosshair' : 'default' }}
          ></canvas>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Kullanıcı Kanvası (Sağ)</h2>
          <canvas
            ref={userCanvasRef}
            onMouseDown={role === 'user' ? handleMouseDown : undefined}
            onMouseMove={role === 'user' ? handleMouseMove : undefined}
            onMouseUp={role === 'user' ? handleMouseUp : undefined}
            onMouseLeave={role === 'user' ? handleMouseLeave : undefined}
            style={{ border: '1px solid #ccc', cursor: role === 'user' ? 'crosshair' : 'default' }}
          ></canvas>
        </div>
      </div>
    </div>
  );
}

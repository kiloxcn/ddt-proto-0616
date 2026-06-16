import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 模拟异常接入请求记录 (云端建图特性)
  const abnormalRequests: any[] = [];

  // 模拟 KOS 激活码校验逻辑
  app.post('/api/activate', (req, res) => {
    const { machineCode, activationCode } = req.body;

    console.log(`[KOS] 收到激活请求: 机器码=${machineCode}, 激活码=${activationCode}`);

    // 模拟 SN 码不存在 (出厂未登记)
    if (machineCode === 'DDT-MC-NOT-FOUND') {
      abnormalRequests.push({
        machineCode,
        activationCode,
        timestamp: new Date().toISOString(),
        reason: 'SN_NOT_FOUND'
      });
      return res.status(404).json({ 
        success: false, 
        code: 'SN_NOT_FOUND',
        message: '未查询到该设备的序列号信息，请联系售后支持' 
      });
    }

    // 1. 校验机器码格式
    if (!machineCode || !machineCode.startsWith('DDT-MC-')) {
      return res.status(400).json({ 
        success: false, 
        code: 'INVALID_MACHINE_CODE',
        message: '无效的机器码格式' 
      });
    }

    // 2. 模拟激活码校验
    if (!activationCode || activationCode.length < 8) {
      return res.status(400).json({ 
        success: false, 
        code: 'INVALID_CODE',
        message: '无效的激活码，请扫描产品包装中的专用激活二维码' 
      });
    }

    // 3. 模拟激活码过期 (随机模拟)
    if (activationCode.includes('EXPIRED')) {
      return res.status(400).json({ 
        success: false, 
        code: 'CODE_EXPIRED',
        message: '激活码已失效，请联系售后支持' 
      });
    }

    // 4. 模拟激活码已绑定
    if (activationCode.includes('BOUND')) {
      return res.status(400).json({ 
        success: false, 
        code: 'CODE_BOUND',
        message: '该激活码已被其他设备激活，请联系售后支持' 
      });
    }

    // 5. 模拟系统响应超时 (504)
    if (activationCode.includes('TIMEOUT')) {
      return res.status(504).json({ 
        success: false, 
        code: 'SERVER_TIMEOUT',
        message: '系统响应超时，请稍后重试' 
      });
    }

    // 校验通过
    res.json({
      success: true,
      message: '激活成功',
      data: {
        sn: `SN-${Date.now()}`,
        quota: 1000,
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
      }
    });
  });

  // 获取异常接入请求 (云端建图特性)
  app.get('/api/cloud/abnormal-requests', (req, res) => {
    res.json(abnormalRequests);
  });

  // Vite 适配
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

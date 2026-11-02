import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { db, verifyPassword, Product, User, Order } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'velora_luxury_haute_couture_secret_key_2026';

export interface AuthPayload {
  userId: string;
  username: string;
  role: 'admin' | 'customer';
  exp: number;
}

// Generate secure JWT-like token
export function signToken(payload: Omit<AuthPayload, 'exp'>): string {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
  const fullPayload: AuthPayload = { ...payload, exp };

  const headerB64 = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');

  return `${headerB64}.${payloadB64}.${signature}`;
}

// Verify token
export function verifyToken(token: string): AuthPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const payload: AuthPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

// Extend Request type
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Auth middleware
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyToken(token);
  if (!payload) {
    return next();
  }

  const user = db.findUserById(payload.userId);
  if (user) {
    req.user = user;
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Требуется авторизация' });
    return;
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Доступ разрешен только администраторам' });
    return;
  }
  next();
}

export const apiRouter = Router();

// Apply token parser
apiRouter.use(authenticate);

// ================= AUTH ROUTES =================

// Login
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const loginInput = req.body.login || req.body.username;
  const password = req.body.password;

  if (!loginInput || !password) {
    res.status(400).json({ error: 'Пожалуйста, укажите логин и пароль' });
    return;
  }

  const user = db.findUserByUsername(String(loginInput));
  if (!user) {
    res.status(401).json({ error: 'Неверный логин или пароль' });
    return;
  }

  const isValid = verifyPassword(String(password), user.passwordHash, user.salt);
  if (!isValid) {
    res.status(401).json({ error: 'Неверный логин или пароль' });
    return;
  }

  const token = signToken({
    userId: user.id,
    username: user.username,
    role: user.role,
  });

  const safeUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    address: user.address || '',
    createdAt: user.createdAt,
  };

  res.json({
    token,
    user: safeUser,
    message: user.role === 'admin' ? 'Вход в панель администратора выполнен' : 'Вход успешно выполнен',
  });
});

// Register (for clients)
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { username, password, name, email, phone, address } = req.body;

  if (!username || !password || !name) {
    res.status(400).json({ error: 'Заполните обязательные поля: логин, пароль и имя' });
    return;
  }

  if (String(username).trim().toLowerCase() === 'velora_admin') {
    res.status(400).json({ error: 'Этот логин зарезервирован' });
    return;
  }

  if (String(password).length < 6) {
    res.status(400).json({ error: 'Пароль должен содержать не менее 6 символов' });
    return;
  }

  try {
    const newUser = db.createUser({
      username: String(username),
      password: String(password),
      name: String(name),
      email: String(email || ''),
      phone: String(phone || ''),
      address: String(address || ''),
    });

    const token = signToken({
      userId: newUser.id,
      username: newUser.username,
      role: newUser.role,
    });

    const safeUser = {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      address: newUser.address || '',
      createdAt: newUser.createdAt,
    };

    res.status(201).json({
      token,
      user: safeUser,
      message: 'Регистрация успешно завершена',
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Ошибка регистрации' });
  }
});

// Current User Profile
apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address || '',
      createdAt: user.createdAt,
    },
  });
});

// Update Profile
apiRouter.put('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { name, email, phone, address } = req.body;
  try {
    const updated = db.updateUser(req.user!.id, {
      name,
      email,
      phone,
      address,
    });
    res.json({
      user: {
        id: updated.id,
        username: updated.username,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        address: updated.address || '',
        createdAt: updated.createdAt,
      },
      message: 'Профиль успешно обновлен',
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Ошибка обновления профиля' });
  }
});

// ================= PRODUCT ROUTES =================

// List products with search and filtering
apiRouter.get('/products', (req: Request, res: Response) => {
  let products = db.getProducts();

  const { category, search, sort, featured } = req.query;

  if (category && category !== 'Все') {
    products = products.filter(
      (p) => p.category.toLowerCase() === String(category).toLowerCase()
    );
  }

  if (featured === 'true') {
    products = products.filter((p) => p.isFeatured);
  }

  if (search && String(search).trim() !== '') {
    const q = String(search).toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (sort) {
    switch (sort) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        products.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        // default by featured / created
        break;
    }
  }

  res.json({ products });
});

// Get single product
apiRouter.get('/products/:id', (req: Request, res: Response) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Товар не найден' });
    return;
  }
  res.json({ product });
});

// ================= ORDER ROUTES =================

// Create Order (Guest or Authenticated)
apiRouter.post('/orders', (req: AuthenticatedRequest, res: Response) => {
  const { customer, items, subtotal, discount, shipping, totalAmount, promoCode } = req.body;

  if (!customer || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Некорректные данные заказа' });
    return;
  }

  try {
    const order = db.createOrder({
      userId: req.user ? req.user.id : null,
      customer,
      items,
      subtotal: Number(subtotal) || 0,
      discount: Number(discount) || 0,
      shipping: Number(shipping) || 0,
      totalAmount: Number(totalAmount) || 0,
      promoCode,
    });

    res.status(201).json({
      order,
      message: 'Заказ успешно оформлен',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Ошибка при оформлении заказа' });
  }
});

// User orders
apiRouter.get('/orders/my', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const orders = db.getOrdersByUserId(req.user!.id);
  res.json({ orders });
});

// Single order details
apiRouter.get('/orders/:id', (req: AuthenticatedRequest, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Заказ не найден' });
    return;
  }

  // Security: Allow order view if public guest just created it, or owner, or admin
  if (order.userId && (!req.user || (req.user.id !== order.userId && req.user.role !== 'admin'))) {
    res.status(403).json({ error: 'Нет доступа к этому заказу' });
    return;
  }

  res.json({ order });
});

// ================= ADMIN PROTECTED ROUTES =================

// Admin metrics & dashboard
apiRouter.get('/admin/stats', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const stats = db.getStats();
  const recentOrders = db.getOrders().slice(0, 5);
  res.json({
    stats,
    recentOrders,
  });
});

// Admin product create
apiRouter.post('/admin/products', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const {
    title,
    category,
    price,
    oldPrice,
    description,
    composition,
    care,
    images,
    sizes,
    colors,
    stock,
    isFeatured,
    isNew,
    tags,
  } = req.body;

  if (!title || !price || !category) {
    res.status(400).json({ error: 'Укажите название, категорию и цену товара' });
    return;
  }

  const created = db.createProduct({
    title: String(title),
    category: String(category),
    price: Number(price),
    oldPrice: oldPrice ? Number(oldPrice) : undefined,
    description: String(description || ''),
    composition: String(composition || '100% премиальные ткани'),
    care: String(care || 'Деликатная сухая чистка'),
    images: Array.isArray(images) && images.length > 0 ? images : [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
    ],
    sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ['S', 'M', 'L'],
    colors: Array.isArray(colors) && colors.length > 0 ? colors : [{ name: 'Классический черный', hex: '#111111' }],
    stock: Number(stock) || 10,
    isFeatured: Boolean(isFeatured),
    isNew: Boolean(isNew),
    tags: Array.isArray(tags) ? tags : ['Новинка'],
  });

  res.status(201).json({ product: created, message: 'Товар успешно добавлен' });
});

// Admin product update
apiRouter.put('/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    res.json({ product: updated, message: 'Товар успешно обновлен' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Ошибка обновления товара' });
  }
});

// Admin product delete
apiRouter.delete('/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Товар не найден' });
    return;
  }
  res.json({ message: 'Товар успешно удален' });
});

// Admin orders list
apiRouter.get('/admin/orders', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const orders = db.getOrders();
  res.json({ orders });
});

// Admin order status update
apiRouter.put('/admin/orders/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { status, trackingNumber } = req.body;
  if (!status) {
    res.status(400).json({ error: 'Укажите новый статус' });
    return;
  }

  try {
    const updated = db.updateOrderStatus(req.params.id, status, trackingNumber);
    res.json({ order: updated, message: 'Статус заказа обновлен' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Ошибка обновления статуса' });
  }
});

// Admin users list
apiRouter.get('/admin/users', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const users = db.getAllUsers();
  res.json({ users });
});

// Admin delete user
apiRouter.delete('/admin/users/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = db.deleteUser(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Пользователь не найден' });
      return;
    }
    res.json({ message: 'Пользователь удален' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Не удалось удалить пользователя' });
  }
});

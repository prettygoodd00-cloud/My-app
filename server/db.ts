import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  salt: string;
  role: 'admin' | 'customer';
  address?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  oldPrice?: number;
  description: string;
  composition: string;
  care: string;
  images: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  stock: number;
  isFeatured: boolean;
  isNew: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string | null;
  customer: {
    name: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    deliveryMethod: 'courier' | 'boutique' | 'express';
    paymentMethod: 'card' | 'sbp' | 'cash';
    comment?: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  totalAmount: number;
  promoCode?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseSchema {
  users: User[];
  products: Product[];
  orders: Order[];
}

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL
  ? path.resolve('/tmp', 'velora_data')
  : path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Password hashing helper
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const effectiveSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, effectiveSalt, 64).toString('hex');
  return { hash, salt: effectiveSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: computedHash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
}

// Initial curated luxury catalog for VELORA
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'vel-01',
    title: 'Кашемировое пальто с поясом Camel',
    category: 'Верхняя одежда',
    price: 480000,
    oldPrice: 560000,
    description: 'Иконическое пальто прямого силуэта из премиального монгольского кашемира. Мягкая ниспадающая линия плеча, глубокие накладные карманы и съемный акцентный пояс подчеркивают благородство кроя. Идеально для демисезонных и вечерних образов.',
    composition: '100% натуральный кашемир премиум-грейда (Loro Piana weave), подкладка: 100% натуральный шелк.',
    care: 'Исключительно сухая специализированная эко-химчистка. Хранить в фирменном чехле на широких плечиках.',
    images: [
      '/images/camel_cashmere_coat.jpg',
      '/images/camel_coat_detail.jpg',
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Песочный Camel', hex: '#C19A6B' },
      { name: 'Графитовый оникс', hex: '#1C1C1E' },
      { name: 'Сливочный кашемир', hex: '#F5F2EB' },
    ],
    stock: 8,
    isFeatured: true,
    isNew: true,
    tags: ['Бестселлер', 'Премиум кашемир', 'Новая коллекция'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vel-02',
    title: 'Шелковое платье-комбинация Midnight Noir',
    category: 'Платья и костюмы',
    price: 195000,
    oldPrice: 220000,
    description: 'Элегантное вечернее платье с открытой спиной, выполненное из плотного шелкового креп-сатина. Струящийся силуэт красиво облегает фигуру, а тонкие бретели регулируют идеальную посадку.',
    composition: '100% натуральный шелк Mulberry плотностью 22 момме.',
    care: 'Деликатная ручная стирка при температуре до 30°C специальными средствами для шелка или сухая чистка.',
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
    ],
    sizes: ['XS', 'S', 'M'],
    colors: [
      { name: 'Глубокий черный', hex: '#111111' },
      { name: 'Шампань', hex: '#F3E5AB' },
      { name: 'Изумрудный шелк', hex: '#1B4D3E' },
    ],
    stock: 12,
    isFeatured: true,
    isNew: true,
    tags: ['Вечерняя линия', '100% шелк'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vel-03',
    title: 'Двубортный шерстяной жакет Tailored Minimal',
    category: 'Платья и костюмы',
    price: 290000,
    oldPrice: undefined,
    description: 'Архитектурный двубортный блейзер свободного кроя. Строгая линия плеча в духе эстетики 90-х годов, роговые пуговицы ручной шлифовки и идеальные лацканы создают статусную основу гардероба.',
    composition: '98% тонкорунная шерсть Virgin Wool, 2% эластан для комфортной посадки.',
    care: 'Сухая чистка.',
    images: [
      '/images/wool_blazer_minimal.jpg',
    ],
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Меланжевый графит', hex: '#373A3C' },
      { name: 'Молочный крем', hex: '#EDE8DF' },
    ],
    stock: 9,
    isFeatured: true,
    isNew: false,
    tags: ['Архитектурный крой', 'Офис и вечер'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vel-04',
    title: 'Свитер оверсайз из беби-кашемира Cloud',
    category: 'Трикотаж и кашемир',
    price: 260000,
    oldPrice: 295000,
    description: 'Невесомый и обволакивающий свитерок крупной фактурной вязки. Выполнен из нежнейшего пуха монгольских козлят беби-кашемир. Высокий мягкий ворот-стойка и свободные удлиненные рукава.',
    composition: '100% сертифицированный беби-кашемир первого счеса.',
    care: 'Ручная стирка в холодной воде с шампунем для кашемира. Сушить горизонтально в расправленном виде.',
    images: [
      '/images/cashmere_sweater_cloud.jpg',
    ],
    sizes: ['XS/S', 'M/L'],
    colors: [
      { name: 'Алебастровый', hex: '#FAF9F6' },
      { name: 'Теплый тауп', hex: '#9E8D7C' },
      { name: 'Пепельная роза', hex: '#D4B8B1' },
    ],
    stock: 15,
    isFeatured: true,
    isNew: true,
    tags: ['Baby Cashmere', 'Уютная роскошь'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vel-05',
    title: 'Структурированная сумка-тоут из зернистой кожи Sienna',
    category: 'Кожаные сумки',
    price: 370000,
    oldPrice: 430000,
    description: 'Минималистичная сумка геометрической формы из итальянской телячьей кожи растительного дубления. Латунная фурнитура с матовым золотым напылением, вместительное отделение для ноутбука 13" и потайной карман на молнии.',
    composition: '100% итальянская натуральная кожа Nappa, подкладка из замши Alcantara.',
    care: 'Обрабатывать специальным воском для кожи, беречь от прямых солнечных лучей и влаги.',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85',
    ],
    sizes: ['One Size (36 × 28 × 12 см)'],
    colors: [
      { name: 'Глубокий шоколад', hex: '#3B2F2F' },
      { name: 'Карамель', hex: '#AF6E4D' },
      { name: 'Черный обсидиан', hex: '#111111' },
    ],
    stock: 6,
    isFeatured: true,
    isNew: false,
    tags: ['Ручная работа', 'Итальянская кожа'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vel-06',
    title: 'Брюки-палаццо со стрелками Virgin Wool',
    category: 'Платья и костюмы',
    price: 175000,
    oldPrice: undefined,
    description: 'Широкие струящиеся брюки с высокой посадкой и глубокими защипами на талии. Плотная шерстяная костюмная ткань держит четкую форму стрелок, визуально удлиняя силуэт.',
    composition: '100% натуральная шерсть Virgin Wool, карманная подкладка хлопок.',
    care: 'Сухая чистка.',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=85',
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Черный', hex: '#111111' },
      { name: 'Песочный меланж', hex: '#C2B69D' },
    ],
    stock: 11,
    isFeatured: false,
    isNew: false,
    tags: ['Базовый гардероб'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vel-07',
    title: 'Кожаный тренч с патами и ремнем Noir',
    category: 'Верхняя одежда',
    price: 620000,
    oldPrice: 700000,
    description: 'Эксклюзивный тренчкот из сверхмягкой перчаточной кожи ягненка. Вдохновлен архивами европейских модных домов. Классическая кокетка, регулируемые паты на манжетах и пояс с металлической пряжкой.',
    composition: '100% натуральная премиальная кожа ягненка (Lambskin), подкладка вискоза.',
    care: 'Специализированная чистка для изделий из тонкой кожи.',
    images: [
      '/images/leather_trench_noir.jpg',
    ],
    sizes: ['S', 'M'],
    colors: [
      { name: 'Глянцевый черный', hex: '#0A0A0A' },
      { name: 'Коньячный', hex: '#6E3A20' },
    ],
    stock: 4,
    isFeatured: true,
    isNew: true,
    tags: ['Лимитированный тираж', 'Коллекционная вещь'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vel-08',
    title: 'Шелковый платок ручной подгибки "Flora Velora"',
    category: 'Аксессуары',
    price: 95000,
    oldPrice: 120000,
    description: 'Авторский шелковый платок каре 90х90 см с узором, разработанным в парижской студии бренда. Ручная обработка края руликом (hand-rolled edges), нежный мерцающий блеск саржевого плетения.',
    composition: '100% шелковый твил.',
    care: 'Деликатная сухая чистка или ручная бережная стирка в прохладной воде.',
    images: [
      '/images/silk_scarf_flora.jpg',
    ],
    sizes: ['90 × 90 см'],
    colors: [
      { name: 'Палитра слоновой кости и золота', hex: '#E6D7B9' },
      { name: 'Черно-белая графика', hex: '#2B2B2B' },
    ],
    stock: 20,
    isFeatured: false,
    isNew: true,
    tags: ['Подарочная упаковка', 'Шелк'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vel-09',
    title: 'Миниатюрная сумка-багет с цепочкой Lumière',
    category: 'Кожаные сумки',
    price: 265000,
    oldPrice: undefined,
    description: 'Лаконичная вечерняя сумочка на плечо. Украшена съемной массивной цепочкой ювелирного плетения с 24-каратным гальваническим золочением. Закрывается на потайной магнитный замок.',
    composition: '100% гладкая кожа Boxcalf, золоченая латунная фурнитура.',
    care: 'Хранить в сухом месте в хлопковом пыльнике.',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1200&q=85',
    ],
    sizes: ['One Size (24 × 14 × 6 см)'],
    colors: [
      { name: 'Обсидиан', hex: '#111111' },
      { name: 'Слоновая кость', hex: '#FFFFF0' },
    ],
    stock: 7,
    isFeatured: false,
    isNew: false,
    tags: ['Вечерний шик'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vel-10',
    title: 'Ювелирный ремень с литой пряжкой из матовой латуни',
    category: 'Аксессуары',
    price: 115000,
    oldPrice: undefined,
    description: 'Узкий классический ремень из плотной седельной кожи. Пряжка органической скульптурной формы отлита вручную в мастерской бренда.',
    composition: '100% итальянская седельная кожа, литая латунь.',
    care: 'Беречь от влаги.',
    images: [
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85',
    ],
    sizes: ['75 см', '85 см', '95 см'],
    colors: [
      { name: 'Черный', hex: '#151515' },
      { name: 'Коньячный', hex: '#582F1E' },
    ],
    stock: 18,
    isFeatured: false,
    isNew: false,
    tags: ['Скульптурная пряжка'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class Database {
  private data: DatabaseSchema = {
    users: [],
    products: [],
    orders: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      const bundledDb = path.resolve(process.cwd(), 'data', 'database.json');
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else if (fs.existsSync(bundledDb)) {
        const raw = fs.readFileSync(bundledDb, 'utf-8');
        this.data = JSON.parse(raw);
        this.save();
      } else {
        this.seedInitialData();
        this.save();
      }

      // Ensure the exact requested admin credentials exist
      this.ensureAdminUser();
    } catch (err) {
      console.error('Error initializing database:', err);
      this.seedInitialData();
    }
  }

  private seedInitialData() {
    // Admin user credentials as requested:
    // Login: velora_admin
    // Password: Velora2026!
    const { hash: adminHash, salt: adminSalt } = hashPassword('Velora2026!');
    const adminUser: User = {
      id: 'usr_admin_velora',
      username: 'velora_admin',
      name: 'Администратор VELORA',
      email: 'admin@velora-couture.com',
      phone: '+7 (495) 120-80-00',
      passwordHash: adminHash,
      salt: adminSalt,
      role: 'admin',
      address: 'Москва, Столешников переулок, 14',
      createdAt: new Date().toISOString(),
    };

    // Sample customer account
    const { hash: customerHash, salt: customerSalt } = hashPassword('Elena2026!');
    const sampleCustomer: User = {
      id: 'usr_sample_customer',
      username: 'elena_v',
      name: 'Елена Воронцова',
      email: 'elena.v@example.com',
      phone: '+7 (916) 432-10-98',
      passwordHash: customerHash,
      salt: customerSalt,
      role: 'customer',
      address: 'Москва, ул. Большая Никитская, д. 24, кв. 18',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    };

    // Sample initial orders
    const sampleOrders: Order[] = [
      {
        id: 'VEL-9821',
        userId: 'usr_sample_customer',
        customer: {
          name: 'Елена Воронцова',
          email: 'elena.v@example.com',
          phone: '+7 (916) 432-10-98',
          city: 'Москва',
          address: 'ул. Большая Никитская, д. 24, кв. 18',
          deliveryMethod: 'courier',
          paymentMethod: 'card',
          comment: 'Пожалуйста, позвоните за час до визита курьера для примерки.',
        },
        items: [
          {
            productId: 'vel-01',
            title: 'Кашемировое пальто с поясом Camel',
            price: 89000,
            size: 'S',
            color: 'Песочный Camel',
            quantity: 1,
            image: INITIAL_PRODUCTS[0].images[0],
          },
          {
            productId: 'vel-08',
            title: 'Шелковый платок ручной подгибки "Flora Velora"',
            price: 18000,
            size: '90 × 90 см',
            color: 'Палитра слоновой кости и золота',
            quantity: 1,
            image: INITIAL_PRODUCTS[7].images[0],
          },
        ],
        subtotal: 107000,
        discount: 0,
        shipping: 0,
        totalAmount: 107000,
        status: 'processing',
        trackingNumber: 'RU-VEL-847291',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
      {
        id: 'VEL-7650',
        userId: 'usr_sample_customer',
        customer: {
          name: 'Елена Воронцова',
          email: 'elena.v@example.com',
          phone: '+7 (916) 432-10-98',
          city: 'Москва',
          address: 'Бутик VELORA в ТЦ Галерея Времени',
          deliveryMethod: 'boutique',
          paymentMethod: 'card',
        },
        items: [
          {
            productId: 'vel-04',
            title: 'Свитер оверсайз из беби-кашемира Cloud',
            price: 48000,
            size: 'XS/S',
            color: 'Алебастровый',
            quantity: 1,
            image: INITIAL_PRODUCTS[3].images[0],
          },
        ],
        subtotal: 48000,
        discount: 0,
        shipping: 0,
        totalAmount: 48000,
        status: 'delivered',
        trackingNumber: 'RU-VEL-736291',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
    ];

    this.data = {
      users: [adminUser, sampleCustomer],
      products: INITIAL_PRODUCTS,
      orders: sampleOrders,
    };
  }

  private ensureAdminUser() {
    const adminIndex = this.data.users.findIndex(
      (u) => u.username.toLowerCase() === 'velora_admin'
    );
    const { hash, salt } = hashPassword('Velora2026!');
    if (adminIndex === -1) {
      this.data.users.push({
        id: 'usr_admin_velora',
        username: 'velora_admin',
        name: 'Администратор VELORA',
        email: 'admin@velora-couture.com',
        phone: '+7 (495) 120-80-00',
        passwordHash: hash,
        salt,
        role: 'admin',
        address: 'Москва, Столешников переулок, 14',
        createdAt: new Date().toISOString(),
      });
      this.save();
    } else {
      // Refresh admin password if it differs to ensure exact match with spec
      if (this.data.users[adminIndex].role !== 'admin' || !verifyPassword('Velora2026!', this.data.users[adminIndex].passwordHash, this.data.users[adminIndex].salt)) {
        this.data.users[adminIndex].passwordHash = hash;
        this.data.users[adminIndex].salt = salt;
        this.data.users[adminIndex].role = 'admin';
        this.save();
      }
    }
  }

  private save() {
    try {
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  // --- Users Operations ---
  public findUserByUsername(username: string): User | undefined {
    return this.data.users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(userData: {
    username: string;
    password: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
  }): User {
    const existing = this.findUserByUsername(userData.username);
    if (existing) {
      throw new Error('Пользователь с таким логином уже существует');
    }

    const { hash, salt } = hashPassword(userData.password);
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: userData.username.trim(),
      name: userData.name.trim(),
      email: userData.email.trim(),
      phone: userData.phone.trim(),
      passwordHash: hash,
      salt,
      role: 'customer',
      address: userData.address || '',
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<Pick<User, 'name' | 'email' | 'phone' | 'address'>>): User {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) throw new Error('Пользователь не найден');

    if (updates.name !== undefined) user.name = updates.name;
    if (updates.email !== undefined) user.email = updates.email;
    if (updates.phone !== undefined) user.phone = updates.phone;
    if (updates.address !== undefined) user.address = updates.address;

    this.save();
    return user;
  }

  public getAllUsers(): Omit<User, 'passwordHash' | 'salt'>[] {
    return this.data.users.map((u) => {
      const ordersCount = this.data.orders.filter((o) => o.userId === u.id).length;
      return {
        id: u.id,
        username: u.username,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        address: u.address,
        createdAt: u.createdAt,
        ordersCount,
      };
    });
  }

  public deleteUser(id: string): boolean {
    const user = this.findUserById(id);
    if (!user) return false;
    if (user.role === 'admin' || user.username.toLowerCase() === 'velora_admin') {
      throw new Error('Нельзя удалить учетную запись администратора');
    }
    this.data.users = this.data.users.filter((u) => u.id !== id);
    this.save();
    return true;
  }

  // --- Products Operations ---
  public getProducts(): Product[] {
    return [...this.data.products];
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  public createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const id = `vel-${Date.now().toString().slice(-4)}${Math.random().toString(36).substring(2, 5)}`;
    const newProduct: Product = {
      ...productData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.products.unshift(newProduct);
    this.save();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Товар не найден');

    const updated: Product = {
      ...this.data.products[index],
      ...updates,
      id, // Preserve original id
      updatedAt: new Date().toISOString(),
    };
    this.data.products[index] = updated;
    this.save();
    return updated;
  }

  public deleteProduct(id: string): boolean {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.data.products.splice(index, 1);
    this.save();
    return true;
  }

  // --- Orders Operations ---
  public getOrders(): Order[] {
    return [...this.data.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getOrdersByUserId(userId: string): Order[] {
    return this.data.orders
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id);
  }

  public createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Order {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const id = `VEL-${randomNum}`;
    const newOrder: Order = {
      ...orderData,
      id,
      status: 'pending',
      trackingNumber: `RU-VEL-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Deduct stock safely
    for (const item of newOrder.items) {
      const product = this.getProductById(item.productId);
      if (product && product.stock >= item.quantity) {
        product.stock -= item.quantity;
      }
    }

    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  public updateOrderStatus(id: string, status: Order['status'], trackingNumber?: string): Order {
    const order = this.data.orders.find((o) => o.id === id);
    if (!order) throw new Error('Заказ не найден');
    order.status = status;
    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }
    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  public getStats() {
    const totalOrders = this.data.orders.length;
    const totalRevenue = this.data.orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const totalProducts = this.data.products.length;
    const totalUsers = this.data.users.length;
    const pendingOrders = this.data.orders.filter(
      (o) => o.status === 'pending' || o.status === 'processing'
    ).length;

    return {
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      pendingOrders,
    };
  }
}

export const db = new Database();

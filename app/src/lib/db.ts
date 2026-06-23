import Dexie, { type Table } from "dexie";

export interface LocalUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  licenseValid: boolean;
  token: string;
  expiresAt: number;
}

export interface LocalClient {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  email?: string;
  phone?: string;
  city?: string;
  type: string;
  notes?: string;
  createdAt: string;
  _dirty?: boolean;
  _deleted?: boolean;
}

export interface LocalOrder {
  id: string;
  clientId?: string;
  clientName: string;
  orderNumber?: string;
  status: string;
  priority: string;
  totalAmount: number;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  _dirty?: boolean;
  _deleted?: boolean;
}

export interface LocalSale {
  id: string;
  clientId?: string;
  clientName: string;
  invoiceNumber?: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  issueDate: string;
  dueDate?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  _dirty?: boolean;
  _deleted?: boolean;
}

export interface LocalQuote {
  id: string;
  clientId?: string;
  clientName: string;
  quoteNumber?: string;
  status: string;
  totalAmount: number;
  validUntil?: string;
  notes?: string;
  createdAt: string;
  _dirty?: boolean;
  _deleted?: boolean;
}

export interface LocalCashflow {
  id: string;
  type: string;
  amount: number;
  description: string;
  category?: string;
  paymentMethod?: string;
  date: string;
  createdAt: string;
  _dirty?: boolean;
  _deleted?: boolean;
}

export interface LocalProduct {
  id: string;
  sku?: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  cost: number;
  unit: string;
  stock: number;
  minStock: number;
  createdAt: string;
  _dirty?: boolean;
}

class InglyDB extends Dexie {
  users!: Table<LocalUser>;
  clients!: Table<LocalClient>;
  orders!: Table<LocalOrder>;
  sales!: Table<LocalSale>;
  quotes!: Table<LocalQuote>;
  cashflows!: Table<LocalCashflow>;
  products!: Table<LocalProduct>;

  constructor() {
    super("InglyOS");
    this.version(1).stores({
      users: "id,email",
      clients: "id,_dirty,_deleted",
      orders: "id,status,_dirty,_deleted",
      sales: "id,status,_dirty,_deleted",
      quotes: "id,status,_dirty,_deleted",
      cashflows: "id,type,_dirty,_deleted",
      products: "id,_dirty",
    });
  }
}

let _db: InglyDB | null = null;

export function getDB(): InglyDB {
  if (typeof window === "undefined") throw new Error("IndexedDB only in browser");
  if (!_db) _db = new InglyDB();
  return _db;
}

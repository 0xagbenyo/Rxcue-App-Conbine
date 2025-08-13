export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  medicalHistory?: string[];
  familyMembers?: User[];
}

export interface MedicalHistory {
  id: string;
  medical_condition: string;
  diagnosed_date: string;
  status: string;
  notes?: string;
}

export interface Medicine {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  prescriptionRequired: boolean;
  price: number;
  inStock: boolean;
  image: string | null;
  custom_dosage_frequencyadult?: string;
  custom_dosage_frequencychild?: string;
  custom_dosage_amountadult?: string;
  custom_dosage_amountchild?: string;
  custom_dosage_durationadult?: string;
  custom_dosage_durationchild?: string;
  custom_dosage_notes?: string;
  custom_interval?: string;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  amount: number;
  custom_dosage_frequencyadult?: string;
  custom_dosage_frequencychild?: string;
  custom_dosage_amountadult?: string;
  custom_dosage_amountchild?: string;
  custom_dosage_durationadult?: string;
  custom_dosage_durationchild?: string;
  custom_dosage_notes?: string;
  custom_interval?: string;
}

export interface Order {
  id: string;
  orderDate: string;
  total: number;
  paidAmount: number;
  status: string;
  docstatus?: number; // Added for debugging
  items: OrderItem[];
}

export interface OrderDetails extends Order {
  dueDate: string;
  customer: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'user' | 'pharmacist';
  message: string;
  timestamp: Date;
  attachments?: string[];
}

export interface ChatSession {
  id: string;
  userId: string;
  pharmacistId: string;
  messages: ChatMessage[];
  status: 'active' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Pharmacist {
  id: string;
  name: string;
  license: string;
  specialization: string;
  isOnline: boolean;
  rating: number;
  totalChats: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'chat' | 'reminder' | 'promotion';
  isRead: boolean;
  createdAt: Date;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet' | 'cod' | 'mobile_money';
  details: any;
  isDefault: boolean;
}

export interface DeliveryTracking {
  orderId: string;
  currentStatus: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  estimatedDelivery: Date;
  updates: {
    status: string;
    timestamp: Date;
    description: string;
  }[];
} 
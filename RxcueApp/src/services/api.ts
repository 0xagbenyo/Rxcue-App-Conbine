import { API_BASE_URL } from '../config/api';

// Helper function to make API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    console.log('API Call - Endpoint:', endpoint);
    console.log('API Call - Options:', options);
    console.log('API Call - Body:', options.body);
    console.log('API Call - Full URL:', `${API_BASE_URL}${endpoint}`);
    
    // Ensure Content-Type is always application/json for POST/PUT requests with body
    const headers: Record<string, string> = {};
    
    // Copy existing headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers[key] = value as string;
      });
    }
    
    // Force Content-Type to application/json if there's a body
    if (options.body && (options.method === 'POST' || options.method === 'PUT')) {
      headers['Content-Type'] = 'application/json';
    }
    
    console.log('API Call - Final Headers:', headers);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', response.headers);
    
    const data = await response.json();
    console.log('API Response Data:', data);
    
    if (!response.ok) {
      console.error('API Error Response:', data);
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication API calls
export const authAPI = {
  // Send OTP for login (existing users)
  sendLoginOtp: (phone: string) => 
    apiCall('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  // Verify OTP for login
  verifyLoginOtp: (phone: string, otp: string) =>
    apiCall('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    }),

  // Send OTP for signup (new users)
  sendSignupOtp: (name: string, phone: string, email: string) =>
    apiCall('/auth/send-signup-otp', {
      method: 'POST',
      body: JSON.stringify({ name, phone, email }),
    }),

  // Verify OTP and complete signup
  verifySignupOtp: (name: string, phone: string, email: string, otp: string) =>
    apiCall('/auth/verify-signup-otp', {
      method: 'POST',
      body: JSON.stringify({ name, phone, email, otp }),
    }),

  // Get current user profile
  getProfile: (token: string) =>
    apiCall('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // Logout
  logout: (token: string) =>
    apiCall('/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};

// Profile API calls
export const profileAPI = {
  // Get user profile data from ERPNext
  getProfile: () => {
    const token = (global as any).authToken || '';
    console.log('Profile API - Token being used:', token ? 'Token exists' : 'No token');
    console.log('Profile API - Token value:', token);
    
    return apiCall('/users/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Update user profile in ERPNext
  updateProfile: (data: { name?: string; email?: string }) =>
    apiCall('/users/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${(global as any).authToken || ''}`,
      },
      body: JSON.stringify(data),
    }),
};

// Storage utilities for tokens and user data
export const storage = {
  setToken: (token: string) => {
    // In a real app, use AsyncStorage or SecureStore
    // For now, we'll use a simple approach
    (global as any).authToken = token;
  },
  
  getToken: () => {
    return (global as any).authToken;
  },
  
  removeToken: () => {
    delete (global as any).authToken;
  },

  // User data storage
  setUserData: (userData: any) => {
    (global as any).userData = userData;
  },

  getUserData: () => {
    return (global as any).userData;
  },

  getERPNextCustomerId: () => {
    return (global as any).userData?.erpnextCustomerId;
  },

  removeUserData: () => {
    delete (global as any).userData;
  },

  // Clear all data on logout
  clearAll: async () => {
    try {
      // Import notification service dynamically to avoid circular dependencies
      const notificationService = require('./notificationService').default;
      await notificationService.cancelAllReminders();
      console.log('All reminders cancelled during clearAll');
    } catch (error) {
      console.error('Error cancelling reminders during clearAll:', error);
    }
    
    delete (global as any).authToken;
    delete (global as any).userData;
  }
};

// Medical History API calls
export const medicalHistoryAPI = {
  // Get user's medical history
  getMedicalHistory: () => {
    const token = (global as any).authToken || '';
    console.log('Medical History API - Token being used:', token ? 'Token exists' : 'No token');
    
    return apiCall('/medical-history', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Add medical condition
  addMedicalCondition: (medical_condition: string, diagnosed_date: string, status: string, notes?: string) => {
    const token = (global as any).authToken || '';
    console.log('Adding medical condition:', { medical_condition, diagnosed_date, status, notes });
    
    return apiCall('/medical-history', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ medical_condition, diagnosed_date, status, notes }),
    });
  },

  // Remove medical condition
  removeMedicalCondition: (conditionId: string) => {
    const token = (global as any).authToken || '';
    console.log('Removing medical condition:', conditionId);
    
    return apiCall(`/medical-history/${conditionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

// Cart API calls
export const cartAPI = {
  // Get user's cart
  getCart: () => {
    const token = (global as any).authToken || '';
    console.log('Cart API - Getting cart');
    
    return apiCall('/cart', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Add item to cart
  addToCart: (itemId: string, quantity: number = 1) => {
    const token = (global as any).authToken || '';
    console.log('Cart API - Adding item to cart:', { itemId, quantity });
    
    return apiCall('/cart/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ item_id: itemId, quantity }),
    });
  },

  // Update cart item quantity
  updateCartItem: (itemId: string, quantity: number) => {
    const token = (global as any).authToken || '';
    console.log('Cart API - Updating cart item:', { itemId, quantity });
    
    return apiCall(`/cart/update/${itemId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity }),
    });
  },

  // Remove item from cart
  removeFromCart: (itemId: string) => {
    const token = (global as any).authToken || '';
    console.log('Cart API - Removing item from cart:', itemId);
    
    return apiCall(`/cart/remove/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Clear cart
  clearCart: () => {
    const token = (global as any).authToken || '';
    console.log('Cart API - Clearing cart');
    
    return apiCall('/cart/clear', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

// Orders API calls
export const ordersAPI = {
  // Get user's orders
  getOrders: () => {
    const token = (global as any).authToken || '';
    console.log('Orders API - Getting orders');
    
    return apiCall('/orders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Get specific order details
  getOrderDetails: (orderId: string) => {
    const token = (global as any).authToken || '';
    console.log('Orders API - Getting order details:', orderId);
    
    return apiCall(`/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Checkout (create sales invoice from cart)
  checkout: () => {
    const token = (global as any).authToken || '';
    console.log('Orders API - Checkout');
    
    return apiCall('/orders/checkout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
}; 

// Payment API calls
export const paymentAPI = {
              // Initialize MTN payment
            initiateMTNPayment: (amount: number, phoneNumber: string, orderId: string) => {
              const token = (global as any).authToken || '';
              console.log('Payment API - Initiating MTN payment:', { amount, phoneNumber, orderId });
              
              return apiCall('/payments/mtn/initiate', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  amount, 
                  phoneNumber, 
                  orderId,
                  currency: 'GHS'
                }),
              });
            },

            // Check MTN payment status
            checkMTNPaymentStatus: (transactionId: string) => {
              const token = (global as any).authToken || '';
              console.log('Payment API - Checking MTN payment status:', transactionId);
              
              return apiCall(`/payments/mtn/status/${transactionId}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
            },

            // Verify MTN payment
            verifyMTNPayment: (transactionId: string, otp: string) => {
              const token = (global as any).authToken || '';
              console.log('Payment API - Verifying MTN payment:', { transactionId, otp });
              
              return apiCall('/payments/mtn/verify', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ transactionId, otp }),
              });
            },
}; 
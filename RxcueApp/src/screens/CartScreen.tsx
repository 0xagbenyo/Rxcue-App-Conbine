import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { CartItem } from '../types';
import { cartAPI, ordersAPI } from '../services/api';

const CartScreen = ({ navigation }: any) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    loadCartItems();
  }, []);

  // Refresh cart when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Cart screen focused, refreshing cart...');
      loadCartItems();
    }, [])
  );

  const calculateCartTotal = (items: CartItem[]) => {
    return items.reduce((total, item) => {
      return total + (item.medicine.price * item.quantity);
    }, 0);
  };

  const loadCartItems = async () => {
    try {
      setIsLoading(true);
      console.log('Loading cart items...');
      
      const response = await cartAPI.getCart();
      console.log('Cart API response:', response);
      
      if (response.success && response.data) {
        const items = response.data.items || [];
        console.log('Cart items loaded:', items);
        
        // Convert API cart items to CartItem format with error handling
        const formattedItems: CartItem[] = items.map((item: any) => {
          console.log('Processing cart item:', item);
          
          // Ensure all required fields are present with defaults
          const itemId = item.item_id || item.id || '';
          const itemName = item.name || 'Unknown Item';
          const itemQuantity = parseInt(item.quantity) || 1;
          const itemPrice = parseFloat(item.rate) || 0;
          
          return {
            medicine: {
              id: itemId, // This is the item name from ERPNext (e.g., "Ketazole")
              name: itemName,
              genericName: itemName, // Use name as generic name for now
              category: 'Medicine', // Default category
              description: '',
              price: itemPrice,
              dosage: '',
              manufacturer: '',
              prescriptionRequired: false, // We'll need to check this from item details
              image: item.image || 'https://via.placeholder.com/150',
              inStock: true,
              quantity: 100,
            },
            quantity: itemQuantity,
          };
        });
        
        console.log('Formatted cart items:', formattedItems);
        setCartItems(formattedItems);
        
        // Calculate total locally by summing up item prices * quantities
        const calculatedTotal = calculateCartTotal(formattedItems);
        console.log('Calculated total:', calculatedTotal);
        setCartTotal(calculatedTotal);
      } else {
        console.log('No cart data or error:', response);
        setCartItems([]);
        setCartTotal(0);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      Alert.alert('Error', 'Failed to load cart items');
      setCartItems([]);
      setCartTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (medicineId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(medicineId);
      return;
    }

    try {
      console.log('Updating quantity for item:', medicineId, 'to:', newQuantity);
      const response = await cartAPI.updateCartItem(medicineId, newQuantity);
      
      if (response.success) {
        // Reload cart to get updated data
        await loadCartItems();
      } else {
        Alert.alert('Error', 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const removeItem = async (medicineId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Removing item:', medicineId);
              const response = await cartAPI.removeFromCart(medicineId);
              
              if (response.success) {
                // Reload cart to get updated data
                await loadCartItems();
              } else {
                Alert.alert('Error', 'Failed to remove item');
              }
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Failed to remove item');
            }
          },
        },
      ]
    );
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }

    try {
      // Generate a temporary order ID for payment
      const tempOrderId = `TEMP_${Date.now()}`;
      
      // Navigate directly to MTN Mobile Money payment
      navigation.navigate('Payment', {
        amount: cartTotal,
        orderId: tempOrderId,
        onPaymentSuccess: (orderId: string) => {
          console.log('Payment successful, order created:', orderId);
          // The sales invoice will be created automatically after successful payment
        }
      });
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Failed to process checkout');
    }
  };

  const handleRefresh = () => {
    loadCartItems();
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    try {
      return (
        <View style={styles.cartItemCard}>
          {/* Product Image */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: item.medicine.image || 'https://via.placeholder.com/150' }} 
              style={styles.productImage}
              defaultSource={{ uri: 'https://via.placeholder.com/150' }}
            />
          </View>
          
          {/* Product Info */}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2} ellipsizeMode="tail">
              {item.medicine.name || 'Unknown Item'}
            </Text>
            <Text style={styles.productPrice}>₵{(item.medicine.price || 0).toFixed(2)}</Text>
            
            {/* Delete Button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removeItem(item.medicine.id)}
            >
              <Ionicons name="trash-outline" size={14} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          {/* Quantity Controls */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.medicine.id, (item.quantity || 1) - 1)}
            >
              <Ionicons name="remove" size={16} color="#333" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity || 1}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.medicine.id, (item.quantity || 1) + 1)}
            >
              <Ionicons name="add" size={16} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      );
    } catch (error) {
      console.error('Error rendering cart item:', error);
      return (
        <View style={styles.cartItemCard}>
          <Text style={styles.errorText}>Error loading item</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#00CEC9" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
                 <TouchableOpacity 
           style={styles.backButton}
           onPress={() => navigation.goBack()}
         >
           <Ionicons name="chevron-back" size={24} color="#000" />
         </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Cart</Text>
          <Text style={styles.headerSubtitle}>{cartItems.length} items</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleRefresh}
          >
            <Ionicons name="refresh-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Prescription')}
          >
            <Ionicons name="medical-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Cart Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIconContainer}>
            <Ionicons name="cart-outline" size={80} color="#00CEC9" />
          </View>
          <Text style={styles.loadingText}>Loading your cart...</Text>
        </View>
      ) : cartItems.length > 0 ? (
        <>
          {/* Items Count */}
          <View style={styles.itemsCountContainer}>
            <Text style={styles.itemsCountText}>
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
            </Text>
          </View>

          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.medicine.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cartList}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          {/* Order Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Item Total ({cartItems.length})</Text>
              <Text style={styles.summaryValue}>₵{cartTotal.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Order Total</Text>
              <Text style={styles.totalValue}>₵{cartTotal.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>Pay with MTN Mobile Money</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.continueShoppingButton}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={styles.continueShoppingText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="cart-outline" size={100} color="#00CEC9" />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Add some medicines to get started with your order. Browse our collection and find what you need.
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#00CEC9',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#333',
    marginTop: 2,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cartList: {
    padding: 12,
  },
  separator: {
    height: 6,
  },
  cartItemCard: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 4,
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  productInfo: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 16,
    flexShrink: 1,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00CEC9',
    marginBottom: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quantityButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 8,
    minWidth: 16,
    textAlign: 'center',
  },
  removeButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFE5E5',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  deliveryInfo: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deliveryIconContainer: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#E0F7FA',
  },
  deliveryText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  freeShippingText: {
    fontWeight: '600',
    color: '#00CEC9',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00CEC9',
  },
  checkoutButton: {
    backgroundColor: '#333',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  continueShoppingButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  continueShoppingText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 206, 201, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  shopButton: {
    backgroundColor: '#00CEC9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#00CEC9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 206, 201, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  itemsCountContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemsCountText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00CEC9',
  },
  shippingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00CEC9',
  },
  deleteButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
});

export default CartScreen; 
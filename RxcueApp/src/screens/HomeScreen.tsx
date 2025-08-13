import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  Linking,
  Animated,
  TextInput,
  StatusBar,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { cartAPI } from '../services/api';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerAnimation = useRef(new Animated.Value(-width)).current;
  const flatListRef = useRef<FlatList>(null);
  const [cartCount, setCartCount] = useState(0);

  // Load cart count on component mount and when screen comes into focus
  useEffect(() => {
    loadCartCount();
  }, []);

  const loadCartCount = async () => {
    try {
      const response = await cartAPI.getCart();
      if (response.success && response.data) {
        const items = response.data.items || [];
        const totalItems = items.reduce((sum: number, item: any) => {
          return sum + (parseInt(item.quantity) || 1);
        }, 0);
        setCartCount(totalItems);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('Error loading cart count:', error);
      setCartCount(0);
    }
  };

  // Refresh cart count when screen comes into focus
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCartCount();
    });

    return unsubscribe;
  }, [navigation]);

  // Carousel data
  const carouselData = [
    {
      id: '1',
      title: 'ENHANCE YOUR SEX LIFE',
      subtitle: 'The quality of your sex life is an important ingredient in maintaining a good relationship.',
      tagline: 'Stay protected',
      image: require('../assets/images/pharm1.jpg'),
    },
    {
      id: '2',
      title: 'HEALTHY LIVING',
      subtitle: 'Get your daily vitamins and supplements delivered to your doorstep.',
      tagline: 'Stay healthy',
      image: require('../assets/images/pharm2.jpg'),
    },
    {
      id: '3',
      title: 'PRESCRIPTION MEDICINES',
      subtitle: 'Upload your prescription and get authentic medicines delivered.',
      tagline: 'Fast delivery',
      image: require('../assets/images/pharm1.jpg'),
    },
  ];

  // Set up auto-scrolling for carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => 
        prevIndex === carouselData.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);
    
    return () => clearInterval(interval);
  }, [carouselData.length]);

  // Scroll FlatList when currentBannerIndex changes
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ 
        index: currentBannerIndex, 
        animated: true,
        viewPosition: 0
      });
    }
  }, [currentBannerIndex]);

  // FlatList onViewableItemsChanged to sync index on swipe
  const onViewRef = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      setCurrentBannerIndex(viewableItems[0].index);
    }
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const quickActions = [
    {
      id: '1',
      title: 'Upload Prescription',
      subtitle: 'Quick Medicine Order',
      icon: 'cloud-upload-outline',
      color: '#FF6B6B',
      onPress: () => navigation.navigate('Prescription'),
    },
    {
      id: '2',
      title: 'Shop',
      subtitle: 'Browse Products',
      icon: 'bag-outline',
      color: '#6C5CE7',
      onPress: () => navigation.navigate('Search'),
    },
    {
      id: '3',
      title: 'Talk to Pharmacist',
      subtitle: 'Get Expert Advice',
      icon: 'chatbubble-outline',
      color: '#00CEC9',
      onPress: () => navigation.navigate('Chat'),
    },
    {
      id: '4',
      title: 'My Orders',
      subtitle: 'Track Your Orders',
      icon: 'cube-outline',
      color: '#FF9500',
      onPress: () => navigation.navigate('Main', { screen: 'Orders' }),
    },
    {
      id: '5',
      title: 'WhatsApp',
      subtitle: 'Quick Support',
      icon: 'logo-whatsapp',
      color: '#25D366',
      onPress: () => {
        const phoneNumber = '+233123456789';
        const message = 'Hello! I need help with my order.';
        const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
        Linking.openURL(whatsappUrl).catch(() => {
          Alert.alert('WhatsApp not available', 'Please install WhatsApp or contact us through the app.');
        });
      },
    },
  ];

  const categories = [
    { id: '1', name: 'Pain Relief', image: require('../assets/images/pharm3.jpg') },
    { id: '2', name: 'Allergy', image: require('../assets/images/pharm4.jpg') },
    { id: '3', name: 'Digestive', image: require('../assets/images/pharm5.jpg') },
    { id: '4', name: 'Supplements', image: require('../assets/images/pharm6.jpg') },
    { id: '5', name: 'Skin Care', image: require('../assets/images/pharm3.jpg') },
  ];

  const menuItems = [
    { id: '1', title: 'Home', icon: 'home', onPress: () => navigation.navigate('Main', { screen: 'Home' }) },
    { id: '2', title: 'Search Medicines', icon: 'search', onPress: () => navigation.navigate('Search') },
    { id: '3', title: 'Chat with Pharmacist', icon: 'chatbubbles', onPress: () => navigation.navigate('Chat') },
    { id: '4', title: 'My Orders', icon: 'receipt', onPress: () => navigation.navigate('Orders') },
    { id: '5', title: 'Profile', icon: 'person', onPress: () => navigation.navigate('Main', { screen: 'Profile' }) },
  ];

  const openDrawer = () => {
    setIsDrawerOpen(true);
    Animated.timing(drawerAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnimation, {
      toValue: -width,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setIsDrawerOpen(false));
  };

  const renderBanner = () => (
    <View style={styles.bannerContainer}>
      <FlatList
        ref={flatListRef}
        data={carouselData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.bannerCard, { width: width - 40 }]}>
            <View style={styles.bannerContent}>
              <View style={styles.bannerText}>
                <Text style={styles.bannerTitle}>{item.title}</Text>
                <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                <Text style={styles.bannerTagline}>{item.tagline}</Text>
              </View>
              <View style={styles.bannerImage}>
                <Image 
                  source={item.image} 
                  style={styles.bannerImageStyle}
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>
        )}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        extraData={currentBannerIndex}
        getItemLayout={(data, index) => ({
          length: width - 40,
          offset: (width - 40) * index,
          index,
        })}
      />
      
      {/* Pagination dots */}
      <View style={styles.paginationContainer}>
        {carouselData.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.paginationDot,
              index === currentBannerIndex && styles.paginationDotActive,
            ]}
            onPress={() => setCurrentBannerIndex(index)}
          />
        ))}
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {/* First row - 3 boxes */}
        {quickActions.slice(0, 3).map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickActionCard}
            onPress={action.onPress}
            activeOpacity={0.8}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon as any} size={18} color="#fff" />
            </View>
            <Text style={styles.quickActionTitle}>{action.title}</Text>
            <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={[styles.quickActionsGrid, { marginTop: 8 }]}>
        {/* Second row - 2 boxes centered */}
        {quickActions.slice(3, 5).map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.quickActionCard, { width: '48%' }]}
            onPress={action.onPress}
            activeOpacity={0.8}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon as any} size={18} color="#fff" />
            </View>
            <Text style={styles.quickActionTitle}>{action.title}</Text>
            <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Browse Categories</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((category) => (
          <TouchableOpacity 
            key={category.id} 
            style={styles.categoryItem}
            onPress={() => navigation.navigate('Search', { category: category.name })}
            activeOpacity={0.8}
          >
            <Image source={category.image} style={styles.categoryImage} />
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSideDrawer = () => (
    <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnimation }] }]}>
      <View style={styles.drawerHeader}>
        <Image source={require('../assets/images/logo-black.png')} style={styles.drawerLogo} />
        <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.drawerContent}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.drawerItem}
            onPress={item.onPress}
          >
            <Ionicons name={item.icon as any} size={24} color="#00CEC9" />
            <Text style={styles.drawerItemText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.drawerFooter}>
        <Text style={styles.drawerFooterText}>Rxcue v1.0.0</Text>
      </View>
    </Animated.View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar backgroundColor="#00CEC9" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        {/* Top Banner */}
        <View style={styles.topBanner}>
          <Text style={styles.topBannerText}>🕐 We're Open 24/7</Text>
        </View>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/images/logo-black.png')} style={styles.logo} />
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
              <Ionicons name="cart-outline" size={24} color="#fff" />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.locationButton}>
              <Ionicons name="location-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search medicines, health products..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="camera-outline" size={20} color="#00CEC9" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Banner Carousel */}
          {renderBanner()}
          
          {/* Quick Actions */}
          {renderQuickActions()}
          
          {/* Categories */}
          {renderCategories()}
          
          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Side Drawer */}
        {isDrawerOpen && (
          <TouchableOpacity style={styles.drawerOverlay} onPress={closeDrawer} />
        )}
        {renderSideDrawer()}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  topBanner: {
    backgroundColor: '#000',
    paddingVertical: 4,
    alignItems: 'center',
  },
  topBannerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#00CEC9',
  },
  menuButton: {
    padding: 8,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 32,
    resizeMode: 'contain',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartButton: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  locationButton: {
    padding: 8,
  },
  searchBarContainer: {
    backgroundColor: '#00CEC9',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 40,
    borderWidth: 1,
    borderColor: '#e8f8f7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 12,
    color: '#333',
  },
  searchButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  
  // Banner Styles
  bannerContainer: {
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 18,
  },
  bannerCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerContent: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
  },
  bannerText: {
    flex: 1,
    marginRight: 15,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 18,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  bannerTagline: {
    fontSize: 10,
    color: '#00CEC9',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  bannerImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
  },
  bannerImageStyle: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  paginationDotActive: {
    backgroundColor: '#00CEC9',
    width: 18,
  },
  
  // Quick Actions Styles
  quickActionsContainer: {
    marginHorizontal: 15,
    marginBottom: 18,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 15,
    letterSpacing: -0.3,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quickActionCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f8f9fa',
    marginBottom: 8,
  },
  quickActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
    lineHeight: 12,
  },
  
  // Categories Styles
  categoriesContainer: {
    marginHorizontal: 15,
    marginBottom: 18,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 11,
    color: '#00CEC9',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  categoryScroll: {
    marginLeft: -10,
  },
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 70,
    paddingVertical: 4,
  },
  categoryImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  categoryText: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Side Drawer Styles
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.7,
    height: height,
    backgroundColor: '#fff',
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: 20,
    position: 'relative',
  },
  drawerLogo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginTop: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 10,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 25,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  drawerItemText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 20,
    fontWeight: '600',
  },
  drawerFooter: {
    padding: 25,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  drawerFooterText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  
  bottomSpacing: {
    height: 30,
  },
});

export default HomeScreen;
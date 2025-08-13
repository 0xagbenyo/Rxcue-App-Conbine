import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const TVScreen = ({ navigation }: any) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All', icon: 'grid' },
    { id: 'nutrition', name: 'Nutrition', icon: 'nutrition' },
    { id: 'fitness', name: 'Fitness', icon: 'fitness' },
    { id: 'mental', name: 'Mental Health', icon: 'medical' },
    { id: 'medication', name: 'Medication', icon: 'medical' },
  ];

  const healthUpdates = [
    {
      id: '1',
      title: 'COVID-19 Booster Guidelines Updated',
      category: 'medication',
      duration: '2 min',
      thumbnail: require('../assets/images/pharm1.jpg'),
      isNew: true,
    },
    {
      id: '2',
      title: 'New Diabetes Management Tips',
      category: 'nutrition',
      duration: '5 min',
      thumbnail: require('../assets/images/pharm2.jpg'),
      isNew: false,
    },
    {
      id: '3',
      title: 'Mental Health Awareness Week',
      category: 'mental',
      duration: '3 min',
      thumbnail: require('../assets/images/pharm3.jpg'),
      isNew: true,
    },
    {
      id: '4',
      title: 'Home Workout Routines',
      category: 'fitness',
      duration: '8 min',
      thumbnail: require('../assets/images/pharm4.jpg'),
      isNew: false,
    },
  ];

  const healthTips = [
    {
      id: '1',
      title: 'Stay Hydrated',
      description: 'Drink at least 8 glasses of water daily for optimal health.',
      icon: 'water',
      color: '#00CEC9',
    },
    {
      id: '2',
      title: 'Get Enough Sleep',
      description: 'Aim for 7-9 hours of quality sleep each night.',
      icon: 'moon',
      color: '#FF9500',
    },
    {
      id: '3',
      title: 'Exercise Regularly',
      description: '30 minutes of moderate exercise daily keeps you healthy.',
      icon: 'fitness',
      color: '#FF6B6B',
    },
    {
      id: '4',
      title: 'Eat Balanced Meals',
      description: 'Include fruits, vegetables, and whole grains in your diet.',
      icon: 'nutrition',
      color: '#4CAF50',
    },
  ];

  const filteredUpdates = selectedCategory === 'all' 
    ? healthUpdates 
    : healthUpdates.filter(update => update.category === selectedCategory);

  const renderCategory = (category: any) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.selectedCategory,
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Ionicons 
        name={category.icon as any} 
        size={20} 
        color={selectedCategory === category.id ? '#fff' : '#666'} 
      />
      <Text style={[
        styles.categoryText,
        selectedCategory === category.id && styles.selectedCategoryText,
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const renderUpdate = (update: any) => (
    <TouchableOpacity key={update.id} style={styles.updateCard}>
      <View style={styles.updateThumbnail}>
        <Image source={update.thumbnail} style={styles.thumbnailImage} />
        {update.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{update.duration}</Text>
        </View>
      </View>
      <View style={styles.updateInfo}>
        <Text style={styles.updateTitle}>{update.title}</Text>
        <Text style={styles.updateCategory}>{update.category}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTip = (tip: any) => (
    <View key={tip.id} style={styles.tipCard}>
      <View style={[styles.tipIcon, { backgroundColor: tip.color }]}>
        <Ionicons name={tip.icon as any} size={24} color="#fff" />
      </View>
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{tip.title}</Text>
        <Text style={styles.tipDescription}>{tip.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#00CEC9" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Health TV</Text>
          <Text style={styles.headerSubtitle}>Updates & Tips</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(renderCategory)}
          </ScrollView>
        </View>

        {/* Health Updates */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Updates</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredUpdates.map(renderUpdate)}
          </ScrollView>
        </View>

        {/* Health Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Health Tips</Text>
          {healthTips.map(renderTip)}
        </View>
      </ScrollView>
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
  categoriesContainer: {
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  selectedCategory: {
    backgroundColor: '#00CEC9',
  },
  categoryText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  section: {
    margin: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 13,
    color: '#00CEC9',
    fontWeight: '600',
  },
  updateCard: {
    width: 180,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  updateThumbnail: {
    position: 'relative',
    height: 100,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 10,
    color: '#fff',
  },
  updateInfo: {
    padding: 10,
  },
  updateTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  updateCategory: {
    fontSize: 11,
    color: '#666',
    textTransform: 'capitalize',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

export default TVScreen;
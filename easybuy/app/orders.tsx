import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEasyBuyTheme } from '../constants/ThemeContext';
import { ExperimentalNavigation } from '../components/navigation/ExperimentalNavigation';

const { width } = Dimensions.get('window');

interface OrderStep {
  title: string;
  time?: string;
  status: 'done' | 'active' | 'pending';
}

interface OrderItem {
  id: string;
  orderId: string;
  date: string;
  itemsSummary: string;
  image: string;
  total: string;
  status: 'Out for Delivery' | 'Delivered' | 'Cancelled';
  deliveryTime?: string;
  steps?: OrderStep[];
  courierName?: string;
  courierPhone?: string;
}

const MOCK_ORDERS: OrderItem[] = [
  {
    id: 'ord-1',
    orderId: '#EB-9042',
    date: 'Today, 10:15 AM',
    itemsSummary: '1x Noise Cancelling Pro Headphones (Amber Gold)',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
    total: '₹24,999',
    status: 'Out for Delivery',
    deliveryTime: 'Within 15 mins',
    courierName: 'Rahul Kumar',
    courierPhone: '+91 98765 43210',
    steps: [
      { title: 'Order Confirmed', time: '10:15 AM', status: 'done' },
      { title: 'Packed & Dispatched', time: '10:30 AM', status: 'done' },
      { title: 'Out for Delivery', time: '10:45 AM', status: 'active' },
      { title: 'Delivered', status: 'pending' },
    ],
  },
  {
    id: 'ord-2',
    orderId: '#EB-8712',
    date: '09 Aug 2026',
    itemsSummary: '2x Premium Kerala Cardamom, 1x Darbhanga Roasted Makhana',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=300&auto=format&fit=crop&q=80',
    total: '₹849',
    status: 'Delivered',
  },
  {
    id: 'ord-3',
    orderId: '#EB-7910',
    date: '05 Aug 2026',
    itemsSummary: '1x Heavyweight Tokyo Graphic Tee (Obsidian Black, M)',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80',
    total: '₹1,299',
    status: 'Delivered',
  },
];

export default function OrdersScreen() {
  const router = useRouter();
  const { isDarkMode } = useEasyBuyTheme();
  const isDark = isDarkMode;

  const [activeTrackingOrder, setActiveTrackingOrder] = useState<OrderItem | null>(MOCK_ORDERS[0]);
  const [orderHistory, setOrderHistory] = useState<OrderItem[]>(MOCK_ORDERS);

  const handleCallCourier = (phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  return (
    <SafeAreaView style={[styles.root, isDark ? styles.rootDark : styles.rootLight]} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* HEADER */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <Text style={[styles.headerTitle, isDark && styles.textLight]}>Track Orders 📦</Text>
        <TouchableOpacity
          style={[styles.headerIconBtn, isDark && styles.headerIconBtnDark]}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            router.push('/home');
          }}
        >
          <Ionicons name="home-outline" size={20} color={isDark ? '#F8FAFC' : '#0F172A'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ACTIVE TRACKING CARD */}
        {activeTrackingOrder && (
          <View style={[styles.trackingCard, isDark ? styles.cardDark : styles.cardLight]}>
            <View style={styles.trackingHeader}>
              <View>
                <Text style={styles.trackingLabel}>ACTIVE DELIVERY</Text>
                <Text style={[styles.orderNumber, isDark && styles.textLight]}>
                  Order {activeTrackingOrder.orderId}
                </Text>
              </View>
              <View style={styles.etaPill}>
                <Ionicons name="time" size={14} color="#EA580C" style={{ marginRight: 4 }} />
                <Text style={styles.etaText}>{activeTrackingOrder.deliveryTime}</Text>
              </View>
            </View>

            {/* PROGRESS VISUAL */}
            <View style={styles.progressSection}>
              {activeTrackingOrder.steps?.map((step, idx, arr) => {
                const isLast = idx === arr.length - 1;
                return (
                  <View key={idx} style={styles.stepContainer}>
                    <View style={styles.leftTimeline}>
                      <View
                        style={[
                          styles.dot,
                          step.status === 'done' && styles.dotDone,
                          step.status === 'active' && styles.dotActive,
                          step.status === 'pending' && styles.dotPending,
                        ]}
                      >
                        {step.status === 'done' && (
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        )}
                        {step.status === 'active' && (
                          <View style={styles.innerDotActive} />
                        )}
                      </View>
                      {!isLast && (
                        <View
                          style={[
                            styles.line,
                            step.status === 'done' && styles.lineDone,
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.stepInfo}>
                      <Text
                        style={[
                          styles.stepTitle,
                          step.status === 'active' && styles.stepTitleActive,
                          isDark && styles.textLight,
                          step.status === 'pending' && { color: isDark ? '#475569' : '#94A3B8' },
                        ]}
                      >
                        {step.title}
                      </Text>
                      {step.time && (
                        <Text style={styles.stepTime}>{step.time}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* COURIER CONTACT */}
            {activeTrackingOrder.courierName && (
              <View style={[styles.courierBox, isDark && styles.courierBoxDark]}>
                <View style={styles.courierInfo}>
                  <View style={styles.courierAvatar}>
                    <Ionicons name="person" size={20} color="#64748B" />
                  </View>
                  <View>
                    <Text style={[styles.courierName, isDark && styles.textLight]}>
                      {activeTrackingOrder.courierName}
                    </Text>
                    <Text style={styles.courierSub}>Your delivery partner</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCallCourier(activeTrackingOrder.courierPhone!)}
                >
                  <Ionicons name="call" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.callBtnText}>Call</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ORDER HISTORY */}
        <View style={styles.historySection}>
          <Text style={[styles.sectionTitle, isDark && styles.textLight]}>Order History</Text>

          {orderHistory.map((order) => {
            const isDelivered = order.status === 'Delivered';
            const isOut = order.status === 'Out for Delivery';
            return (
              <View
                key={order.id}
                style={[
                  styles.historyCard,
                  isDark ? styles.historyCardDark : styles.historyCardLight,
                ]}
              >
                <Image source={{ uri: order.image }} style={styles.historyThumb} />
                <View style={styles.historyDetails}>
                  <View style={styles.historyHeaderRow}>
                    <Text style={[styles.historyOrderId, isDark && styles.textLight]}>
                      {order.orderId}
                    </Text>
                    <View
                      style={[
                        styles.statusTag,
                        isDelivered && styles.tagDelivered,
                        isOut && styles.tagOut,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusTagText,
                          isDelivered && styles.textDelivered,
                          isOut && styles.textOut,
                        ]}
                      >
                        {order.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.historyItems, isDark && { color: '#94A3B8' }]} numberOfLines={1}>
                    {order.itemsSummary}
                  </Text>
                  <View style={styles.historyFooter}>
                    <Text style={styles.historyDate}>{order.date}</Text>
                    <Text style={[styles.historyTotal, isDark && styles.textLight]}>
                      {order.total}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* DOCK BAR */}
      <ExperimentalNavigation
        activeTab="orders"
        onTabChange={(tabId) => {
          if (tabId === 'home') router.push('/home');
          if (tabId === 'profile') router.push('/profile');
        }}
        isDarkMode={isDark}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootLight: {
    backgroundColor: '#FAF9F6',
  },
  rootDark: {
    backgroundColor: '#090D16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerDark: {
    backgroundColor: '#121927',
    borderBottomColor: '#1F293D',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconBtnDark: {
    backgroundColor: '#1F293D',
  },
  scrollContent: {
    padding: 20,
  },
  trackingCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
  },
  cardDark: {
    backgroundColor: '#121927',
    borderColor: '#1F293D',
    shadowColor: '#000000',
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  trackingLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#8E44AD',
    letterSpacing: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  etaText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#EA580C',
  },
  progressSection: {
    paddingLeft: 4,
    marginBottom: 24,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  leftTimeline: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: '#2F6E46',
  },
  dotActive: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#2F6E46',
  },
  innerDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2F6E46',
  },
  dotPending: {
    backgroundColor: '#E2E8F0',
  },
  line: {
    width: 2,
    height: 32,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
  },
  lineDone: {
    backgroundColor: '#2F6E46',
  },
  stepInfo: {
    flex: 1,
    paddingTop: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  stepTitleActive: {
    color: '#2F6E46',
    fontWeight: '900',
  },
  stepTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  courierBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  courierBoxDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  courierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courierAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  courierName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  courierSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F6E46',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  historySection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 16,
  },
  historyCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
  },
  historyCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  historyCardDark: {
    backgroundColor: '#121927',
    borderColor: '#1F293D',
  },
  historyThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 14,
  },
  historyDetails: {
    flex: 1,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyOrderId: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagDelivered: {
    backgroundColor: '#E8F5E9',
  },
  tagOut: {
    backgroundColor: '#FFEDD5',
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: '900',
  },
  textDelivered: {
    color: '#2F6E46',
  },
  textOut: {
    color: '#EA580C',
  },
  historyItems: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  historyTotal: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  textLight: {
    color: '#F8FAFC',
  },
});

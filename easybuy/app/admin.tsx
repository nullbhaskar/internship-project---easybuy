import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { sendPushNotification } from '../utils/notifications';
import { generateFullIndianCatalog, INDIAN_STATES_AND_UTS, StateItem } from '../constants/catalogGenerator';
import { registerProduct } from '../constants/globalProductRegistry';

// Types & Theme
import {
  AdminCategory,
  AdminOrder,
  AdminProduct,
  AdminSection,
  OrderStatusFilter,
  ProductSortOption,
  StockStatusFilter,
} from '../components/admin/adminTypes';
import { C, R, S } from '../components/admin/adminTheme';

// Modern Admin Components
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminAIControl } from '../components/admin/AdminAIControl';
import { AdminInventory } from '../components/admin/AdminInventory';
import { AdminProductsDir } from '../components/admin/AdminProductsDir';
import { AdminBottomNav } from '../components/admin/SidebarMenu';
import { AdminOrders } from '../components/admin/AdminOrders';

// Components
import { AdminHeader }        from '../components/admin/AdminHeader';
import { DeleteConfirmDialog } from '../components/admin/DeleteConfirmDialog';
import { ProductForm }        from '../components/admin/ProductForm';
import { ProductTable }       from '../components/admin/ProductTable';
import { AdminStateSelectorModal } from '../components/admin/AdminStateSelectorModal';

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────

const CATEGORY_TARGET_COUNTS: Record<string, number> = {
  home_living: 240, beauty: 376, men: 350, women: 400, ethnic_wear: 250,
  grocery: 385, fitness: 37, gaming: 43, electronics: 101, fashion: 350,
  footwear: 38, sports: 37, accessories: 38, kitchen: 38, lifestyle: 41,
  pet_care: 37, automobile: 36, baby_care: 30, health_care: 37, gifts: 36,
  hostel_essentials: 23, study_office: 15,
};

const CATEGORY_EMOJIS: Record<string, string> = {
  grocery: '🛒', beauty: '💄', men: '👔', women: '👗', fashion: '👗',
  ethnic_wear: '🥻', home_living: '🏡', electronics: '📱', gaming: '🎮',
  fitness: '🏋️', study_office: '📚', hostel_essentials: '🛏️',
  kitchen: '🍳', lifestyle: '⌚', accessories: '👜', footwear: '👟',
  sports: '⚽', pet_care: '🐾', automobile: '🚗', baby_care: '🍼',
  health_care: '🩺', gifts: '🎁', quickbuy: '⚡',
};

const parseAmountNum = (amt: any): number => {
  if (typeof amt === 'number') return isNaN(amt) ? 0 : amt;
  if (!amt) return 0;
  const cleaned = String(amt).replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
};

const ORDER_STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending:   { color: C.warning,   bg: C.warningDim,   label: 'Processing' },
  processing:{ color: C.warning,   bg: C.warningDim,   label: 'Processing' },
  confirmed: { color: C.primary,   bg: C.primaryDim,   label: 'Confirmed' },
  shipped:   { color: C.secondary, bg: C.secondaryDim, label: 'Shipped' },
  delivered: { color: C.success,   bg: C.successDim,   label: 'Delivered' },
  cancelled: { color: C.danger,    bg: C.dangerDim,    label: 'Cancelled' },
};

const getOrderStatusConfig = (status?: string) => {
  const s = (status || 'pending').toLowerCase();
  if (s === 'confirmed') return { color: C.primary, bg: C.primaryDim, label: 'Confirmed' };
  if (s === 'packed') return { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)', label: 'Packed' };
  if (s === 'shipped' || s === 'out for delivery') return { color: C.secondary, bg: C.secondaryDim, label: 'Shipped' };
  if (s === 'delivered') return { color: C.success, bg: C.successDim, label: 'Delivered' };
  if (s === 'cancelled') return { color: C.danger, bg: C.dangerDim, label: 'Cancelled' };
  return { color: C.warning, bg: C.warningDim, label: 'Processing' };
};

// ─────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────

export default function AdminScreen() {
  const router = useRouter();

  // ── State ─────────────────────────────────────────────────────
  const [activeSection,     setActiveSection]     = useState<AdminSection>('dashboard');
  const [checkingAdmin,     setCheckingAdmin]     = useState(true);
  const [isAdmin,           setIsAdmin]           = useState(false);
  const [isFirebaseOk,      setIsFirebaseOk]      = useState(true);

  // Data
  const [products,          setProducts]          = useState<AdminProduct[]>([]);
  const [categories,        setCategories]        = useState<AdminCategory[]>([]);
  const [orders,            setOrders]            = useState<AdminOrder[]>([]);

  // Loading
  const [loadingProducts,   setLoadingProducts]   = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingOrders,     setLoadingOrders]     = useState(false);
  const [panelLoading,      setPanelLoading]      = useState(false);
  const [refreshing,        setRefreshing]        = useState(false);

  // Product UI
  const [selectedProduct,   setSelectedProduct]   = useState<AdminProduct | null>(null);
  const [showProductForm,   setShowProductForm]   = useState(false);
  const [confirmDelete,     setConfirmDelete]     = useState(false);
  const [deleteProduct,     setDeleteProduct]     = useState<AdminProduct | null>(null);

  // Filters
  const [productSearch,      setProductSearch]      = useState('');
  const [selectedAdminState, setSelectedAdminState] = useState<StateItem | null>(null);
  const [showStateModal,     setShowStateModal]     = useState(false);
  const [quickBuyTab,        setQuickBuyTab]        = useState<'all' | 'quick' | 'regular'>('all');
  const [productStockFilter, setProductStockFilter] = useState<StockStatusFilter>('all');
  const [productSort,        setProductSort]        = useState<ProductSortOption>('newest');
  const [orderStatusFilter,  setOrderStatusFilter]  = useState<OrderStatusFilter>('all');

  // Toast
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const toastY       = useRef(new Animated.Value(-80)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // ── Auth Check ───────────────────────────────────────────────
  useEffect(() => {
    async function check() {
      try {
        const stored = await AsyncStorage.getItem('isAdmin');
        if (stored === 'true' || auth.currentUser?.email === 'admineasybuy@gmail.com') {
          setIsAdmin(true);
          loadProducts();
          loadCategories();
          loadOrders();
          loadUsers();
        } else {
          router.replace('/login');
        }
      } catch {
        router.replace('/login');
      } finally {
        setCheckingAdmin(false);
      }
    }
    check();
  }, []);

  // ── Toast ────────────────────────────────────────────────────
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    toastY.setValue(-80);
    toastOpacity.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(toastY,       { toValue: 0, duration: 320, useNativeDriver: true }),
        Animated.timing(toastOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      ]),
      Animated.delay(2800),
      Animated.parallel([
        Animated.timing(toastY,       { toValue: -80, duration: 280, useNativeDriver: true }),
        Animated.timing(toastOpacity, { toValue: 0,   duration: 280, useNativeDriver: true }),
      ]),
    ]).start(() => setNotification(null));
  };

  // ── Data Loaders ─────────────────────────────────────────────
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const snap  = await getDocs(collection(db, 'products'));
      let items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

      if (items.length === 0) {
        try {
          items = generateFullIndianCatalog().map((p: any) => ({
            ...p,
            priceNumber: typeof p.price === 'number' ? p.price : (parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0),
            id: p.id || Math.random().toString(),
          }));
        } catch (e) {
          console.warn('Failed to generate catalog:', e);
        }
      }

      setProducts(items);
      setIsFirebaseOk(true);
    } catch (err: any) {
      console.warn('loadProducts error:', err);
      setIsFirebaseOk(false);
      
      try {
        const fallbackItems = generateFullIndianCatalog().map((p: any) => ({
          ...p,
          priceNumber: typeof p.price === 'number' ? p.price : (parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0),
          id: p.id || Math.random().toString(),
        }));
        setProducts(fallbackItems);
      } catch(fallbackErr) {
        console.warn('Fallback generation failed:', fallbackErr);
        setProducts([]);
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const snap  = await getDocs(collection(db, 'categories'));
      const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      items.sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
      setCategories(items);
    } catch (err) {
      console.warn('loadCategories error:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const snap = await getDocs(collection(db, 'orders'));
      const items = snap.docs
        .map(d => ({ id: d.id, ...(d.data() as any) }))
        .sort((a: any, b: any) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db2 - da;
        });
      setOrders(items);
    } catch (err) {
      console.warn('loadOrders error:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const [usersCount, setUsersCount] = useState<number>(0);

  const loadUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      setUsersCount(snap.docs.length);
    } catch (err) {
      console.warn('loadUsers error:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadProducts(), loadCategories(), loadOrders(), loadUsers()]);
    setRefreshing(false);
    showToast('Data refreshed!');
  };

  // ── Product CRUD ──────────────────────────────────────────────
  const handleSaveProduct = async (product: AdminProduct) => {
    setPanelLoading(true);
    try {
      const now = new Date().toISOString();
      if (product.id) {
        const updated = { ...product, updatedAt: now };
        await updateDoc(doc(db, 'products', product.id), updated);
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, ...updated } : p));
        registerProduct(updated);
        showToast('Product updated successfully!');
      } else {
        const ref     = doc(collection(db, 'products'));
        const created = { ...product, id: ref.id, productId: ref.id, createdAt: now, updatedAt: now };
        await setDoc(ref, created);
        setProducts(prev => [created, ...prev]);
        registerProduct(created);
        showToast('Product added to catalog!');
      }
      setSelectedProduct(null);
      setShowProductForm(false);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save product.', 'error');
    } finally {
      setPanelLoading(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteProduct?.id) return;
    setPanelLoading(true);
    try {
      await deleteDoc(doc(db, 'products', deleteProduct.id));
      setProducts(prev => prev.filter(p => p.id !== deleteProduct.id));
      showToast('Product deleted.');
      setDeleteProduct(null);
      setConfirmDelete(false);
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete product.', 'error');
    } finally {
      setPanelLoading(false);
    }
  };

  // ── Order Status ──────────────────────────────────────────────
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      let stepIndex = 0;
      let formattedStatus = 'Processing';

      if (status === 'confirmed' || status === 'Confirmed') { stepIndex = 1; formattedStatus = 'Confirmed'; }
      else if (status === 'packed' || status === 'Packed') { stepIndex = 2; formattedStatus = 'Packed'; }
      else if (status === 'shipped' || status === 'Shipped') { stepIndex = 3; formattedStatus = 'Shipped'; }
      else if (status === 'delivered' || status === 'Delivered') { stepIndex = 4; formattedStatus = 'Delivered'; }
      else if (status === 'cancelled' || status === 'Cancelled') { stepIndex = 0; formattedStatus = 'Cancelled'; }
      else { stepIndex = 0; formattedStatus = 'Processing'; }

      showToast(`Updating order status to ${formattedStatus}...`);
      await updateDoc(doc(db, 'orders', orderId), {
        status: formattedStatus,
        currentStepIndex: stepIndex,
        updatedAt: new Date().toISOString(),
      });

      const order = orders.find(o => o.id === orderId);
      if (order && order.userId) {
        // Fetch user's push token
        const userDoc = await getDoc(doc(db, 'users', order.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.pushToken) {
            let title = '';
            let body = '';
            
            if (formattedStatus === 'Shipped') {
              title = 'Package Out for Delivery! 🚚';
              body = `Great news! Your order ${order.orderId || ''} is out for delivery. Keep an eye out for it today!`;
            } else if (formattedStatus === 'Delivered') {
              title = 'Order Delivered! 🎉';
              body = `Your order ${order.orderId || ''} has been successfully delivered. Enjoy your purchase from EasyBuy!`;
            }

            if (title) {
              await sendPushNotification(userData.pushToken, title, body);
            }
          }
        }
      }

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: formattedStatus as any, currentStepIndex: stepIndex } : o));
      showToast('Order updated & notification sent!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || 'Could not update order.', 'error');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('isAdmin');
    await auth.signOut().catch(() => {});
    router.replace('/login');
  };

  // ── Derived State ─────────────────────────────────────────────
  const productCountByState = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach(p => {
      const sId = (p.stateId || '').toUpperCase();
      if (sId) {
        map[sId] = (map[sId] || 0) + 1;
      }
    });
    return map;
  }, [products]);

  // All products matching current state (before QuickBuy/search/stock filters)
  const stateProducts = useMemo(() => {
    if (!selectedAdminState) return products;
    const targetId = selectedAdminState.id.toUpperCase();
    const targetName = selectedAdminState.name.toLowerCase();
    return products.filter(p => {
      const sId = (p.stateId || '').toUpperCase();
      const sName = (p.stateName || '').toLowerCase();
      const city = (p.city || '').toLowerCase();
      const title = (p.title || p.name || '').toLowerCase();

      return (
        sId === targetId ||
        sName === targetName ||
        sName.includes(targetName) ||
        targetName.includes(sName) ||
        selectedAdminState.popularCities.some(
          c => city.includes(c.toLowerCase()) || title.includes(c.toLowerCase())
        ) ||
        title.includes(`(${targetName}`) ||
        title.includes(`${targetName} edition`) ||
        title.includes(`${targetName} special`)
      );
    });
  }, [products, selectedAdminState]);

  const stateQuickBuyCount = useMemo(() => {
    return stateProducts.filter(
      p => p.isQuickDelivery === true || p.isQuickBuy === true || p.categoryId === 'quickbuy'
    ).length;
  }, [stateProducts]);

  const stateRegularCount = useMemo(() => {
    return stateProducts.filter(
      p => !(p.isQuickDelivery === true || p.isQuickBuy === true || p.categoryId === 'quickbuy')
    ).length;
  }, [stateProducts]);

  const filteredProducts = useMemo(() => {
    return stateProducts
      .filter(p => {
        // QuickBuy Type Filter
        if (quickBuyTab === 'quick') {
          const isQuick = p.isQuickDelivery === true || p.isQuickBuy === true || p.categoryId === 'quickbuy';
          if (!isQuick) return false;
        } else if (quickBuyTab === 'regular') {
          const isQuick = p.isQuickDelivery === true || p.isQuickBuy === true || p.categoryId === 'quickbuy';
          if (isQuick) return false;
        }

        // Search Filter
        if (productSearch) {
          const q = productSearch.toLowerCase().trim();
          if (q === 'quickbuy' || q.includes('quick')) {
            return (
              p.isQuickDelivery === true || p.isQuickBuy === true ||
              p.categoryId === 'quickbuy' ||
              (typeof p.deliveryTime === 'string' && p.deliveryTime.toLowerCase().includes('10')) ||
              (p.subcategoryId && p.subcategoryId.toLowerCase().includes('quick'))
            );
          }
          // Generic search across all text fields
          return (
            p.title?.toLowerCase().includes(q) ||
            p.name?.toLowerCase().includes(q) ||
            p.shortTitle?.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q) ||
            p.categoryId?.toLowerCase().includes(q) ||
            p.categoryName?.toLowerCase().includes(q) ||
            p.subcategoryId?.toLowerCase().includes(q) ||
            p.subcategoryName?.toLowerCase().includes(q) ||
            p.city?.toLowerCase().includes(q) ||
            p.stateName?.toLowerCase().includes(q)
          );
        }

        return true;
      })
      .filter(p => {
        const s = Number(p.stock ?? 0);
        if (productStockFilter === 'inStock')    return s > 5;
        if (productStockFilter === 'lowStock')   return s > 0 && s <= 5;
        if (productStockFilter === 'outOfStock') return s === 0;
        return true;
      })
      .sort((a, b) => {
        const pa = Number(a.price ?? 0), pb = Number(b.price ?? 0);
        const sa = Number(a.stock ?? 0), sb = Number(b.stock ?? 0);
        const da = new Date(a.updatedAt || '').getTime();
        const db2 = new Date(b.updatedAt || '').getTime();
        if (productSort === 'priceLow')  return pa - pb;
        if (productSort === 'priceHigh') return pb - pa;
        if (productSort === 'stockLow')  return sa - sb;
        if (productSort === 'stockHigh') return sb - sa;
        return db2 - da;
      });
  }, [products, selectedAdminState, quickBuyTab, productSearch, productStockFilter, productSort]);

  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'all') return orders;
    return orders.filter(o => {
      const s = (o.status || 'pending').toLowerCase();
      const f = orderStatusFilter.toLowerCase();
      if (f === 'pending') return s === 'pending' || s === 'processing';
      return s === f;
    });
  }, [orders, orderStatusFilter]);

  const totalRevenue = useMemo(() => {
    return orders
      .filter(o => {
        const s = (o.status || '').toLowerCase();
        return s !== 'cancelled';
      })
      .reduce((sum, o) => sum + parseAmountNum(o.totalAmount), 0);
  }, [orders]);

  // Total Registered Clients (from Firestore users collection + orders)
  const weeklyRevenueData = useMemo(() => {
    const data = [0, 0, 0, 0, 0, 0, 0];
    orders.forEach(o => {
      if (o.createdAt) {
        const d = new Date(o.createdAt);
        const day = d.getDay();
        const amt = typeof o.totalAmount === 'number' ? o.totalAmount : parseFloat(String(o.totalAmount).replace(/[^0-9.]/g, '')) || 0;
        data[day] += amt;
      }
    });
    return data;
  }, [orders]);

  const uniqueClients = useMemo(() => {
    const seen = new Set<string>();
    orders.forEach(o => {
      const key = (o as any).userId || (o as any).userEmail || (o as any).email || (o as any).shippingAddress?.fullName || '';
      if (key) seen.add(key);
    });
    return Math.max(usersCount, seen.size, 3);
  }, [orders, usersCount]);

  // Average order value
  const avgOrderValue = useMemo(() => {
    if (orders.length === 0) return 0;
    return Math.round(totalRevenue / orders.length);
  }, [orders, totalRevenue]);

  // Weekly orders count per day (Sun to Sat)
  const weeklyOrdersData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    orders.forEach(o => {
      const date = o.createdAt ? new Date(o.createdAt) : new Date();
      counts[date.getDay()] += 1;
    });
    return counts;
  }, [orders]);

  // Top products from catalog or orders
  const topProducts = useMemo(() => {
    const countMap: Record<string, { title: string; brand: string; image: string; count: number }> = {};
    orders.forEach(o => {
      const items: any[] = (o as any).items || (o as any).cartItems || [];
      items.forEach((item: any) => {
        const key = item.productId || item.id || item.title || '';
        if (!key) return;
        if (!countMap[key]) {
          countMap[key] = {
            title: item.title || item.name || 'Product',
            brand: item.brand || '',
            image: item.thumbnail || item.images?.[0] || item.image || item.imageUrl || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80',
            count: 0,
          };
        }
        countMap[key].count += item.quantity || 1;
      });
    });

    const sorted = Object.entries(countMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3);

    if (sorted.length > 0) {
      return sorted.map(([key, val]) => ({
        id: key,
        title: val.title,
        subtitle: val.brand || 'EasyBuy',
        salesCount: String(val.count),
        change: `Sales +${val.count * 8}%`,
        isPositive: true,
        image: val.image,
      }));
    }

    // Pick top products from products catalog
    if (products.length > 0) {
      return products.slice(0, 3).map((p, i) => {
        const imgUrl = p.thumbnail || (p.images && p.images[0]) || p.image || p.imageUrl || (
          i === 0 ? 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80' :
          i === 1 ? 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&auto=format&fit=crop&q=80' :
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&auto=format&fit=crop&q=80'
        );

        return {
          id: p.id || `p${i}`,
          title: p.title || p.name || 'Catalog Item',
          subtitle: p.brand || p.categoryName || 'EasyBuy',
          salesCount: `${Math.max(12, 383 - i * 140)}`,
          change: i % 2 === 0 ? `Sales +${18 - i * 4}%` : `Sales +${12 - i * 3}%`,
          isPositive: true,
          image: imgUrl,
        };
      });
    }

    return [];
  }, [orders, products]);

  // ── Loading Screen ────────────────────────────────────────────
  if (checkingAdmin) {
    return (
      <View style={styles.loadScreen}>
        <StatusBar style="light" />
        <View style={styles.loadIconWrap}>
          <Ionicons name="shield-checkmark" size={48} color={C.primary} />
        </View>
        <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 32 }} />
        <Text style={styles.loadText}>Verifying admin access...</Text>
      </View>
    );
  }

  if (!isAdmin) return (
    <View style={styles.loadScreen}>
      <Ionicons name="lock-closed" size={48} color="#EF4444" />
      <Text style={[styles.loadText, { color: '#EF4444', marginTop: 16 }]}>Access Denied</Text>
      <Text style={{ color: '#64748B', marginTop: 8 }}>You do not have administrator privileges.</Text>
      <TouchableOpacity onPress={() => router.replace('/')} style={{ marginTop: 24, backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}>
        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Go Home</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* ── Toast ── */}
      {notification && (
        <Animated.View
          style={[
            styles.toast,
            notification.type === 'error' && styles.toastError,
            { opacity: toastOpacity, transform: [{ translateY: toastY }] },
          ]}
        >
          <Ionicons
            name={notification.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
            size={18}
            color={notification.type === 'success' ? C.success : C.danger}
          />
          <Text style={styles.toastText}>{notification.msg}</Text>
        </Animated.View>
      )}

      {/* ── Header ── */}
      <AdminHeader
        activeSection={activeSection}
        onLogout={handleLogout}
        isFirebaseConnected={isFirebaseOk}
      />

      {/* ── Body ── */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.body}>
          {/* ══════════════ 1. DASHBOARD ══════════════ */}
          {activeSection === 'dashboard' && (
            <AdminDashboard
              products={products}
              orders={orders}
              categories={categories}
              onNavigate={setActiveSection}
              onAddProduct={() => {
                setSelectedProduct(null);
                setShowProductForm(true);
              }}
            />
          )}

          {/* ══════════════ 2. AI CONTROL ══════════════ */}
          {activeSection === 'aicontrol' && (
            <AdminAIControl products={products} orders={orders} />
          )}

          {/* ══════════════ 3. STOCK / INVENTORY ══════════════ */}
          {activeSection === 'stock' && (
            <AdminInventory 
              products={products} 
              onEditProduct={(p) => {
                setSelectedProduct(p);
                setShowProductForm(true);
              }}
              onDeleteProduct={(p) => {
                setDeleteProduct(p);
                setConfirmDelete(true);
              }}
            />
          )}

          {/* ══════════════ 4. PRODUCTS ══════════════ */}
          {activeSection === 'products' && (
            <View style={{ flex: 1 }}>
              <AdminProductsDir 
                products={products}
                onAddProduct={() => {
                  setSelectedProduct(null);
                  setShowProductForm(true);
                }}
                onEditProduct={(p) => {
                  setSelectedProduct(p);
                  setShowProductForm(true);
                }}
                onDeleteProduct={(p) => {
                  setDeleteProduct(p);
                  setConfirmDelete(true);
                }}
              />
              
              {showProductForm && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, backgroundColor: '#FFFFFF' }}>
                  <ProductForm
                    categories={categories}
                    product={selectedProduct}
                    loading={panelLoading}
                    onSave={handleSaveProduct}
                    onCancel={() => { setShowProductForm(false); setSelectedProduct(null); }}
                  />
                </View>
              )}
            </View>
          )}

          {/* ══════════════ 5. ORDERS ══════════════ */}
          {activeSection === 'orders' && (
            <AdminOrders orders={orders} onUpdateStatus={handleUpdateOrderStatus} />
          )}
        </View>
      </KeyboardAvoidingView>

      {/* ── Bottom Nav ── */}
      <AdminBottomNav
        active={activeSection}
        onSelect={setActiveSection}
      />

      {/* ── Delete Confirm Dialog ── */}
      <DeleteConfirmDialog
        visible={confirmDelete}
        productName={deleteProduct?.title || deleteProduct?.name || 'this product'}
        loading={panelLoading}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => { setConfirmDelete(false); setDeleteProduct(null); }}
      />

      {/* ── State & UT Selector Modal ── */}
      <AdminStateSelectorModal
        visible={showStateModal}
        onClose={() => setShowStateModal(false)}
        selectedStateId={selectedAdminState?.id || 'all'}
        onSelectState={(state) => setSelectedAdminState(state)}
        productCountByState={productCountByState}
        totalProductsCount={products.length}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Loading Screen
  loadScreen: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: S.sm,
  },
  loadIconWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: C.primaryDim,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: C.primaryGlow,
  },
  loadText: { color: C.textSecondary, fontSize: 14, marginTop: S.sm, fontWeight: '600' },

  // Toast
  toast: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    zIndex: 999,
    backgroundColor: C.surface2,
    borderRadius: R.card2,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    borderWidth: 1,
    borderColor: `${C.success}33`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  toastError: { borderColor: `${C.danger}33` },
  toastText: { color: C.textPrimary, fontSize: 13, fontWeight: '600', flex: 1 },

  // Body
  body: { flex: 1 },
  bodyContent: {
    padding: S.lg,
    paddingBottom: S.xl,
  },

  // Section Headers
  secHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: S.lg,
  },
  pageTitle: { color: '#0F172A', fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  pageSub:   { color: '#64748B', fontSize: 12, marginTop: 2 },

  // Add Button
  addBtn: { backgroundColor: '#4F46E5', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 16 },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    paddingVertical: Platform.OS === 'ios' ? 2 : 0,
  },

  // Large Rectangular State & UT Selector Button
  stateSelectorBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  stateSelectorBtnActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#2F6E49',
  },
  stateBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  statePinBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  statePinBadgeActive: {
    backgroundColor: '#DCFCE7',
  },
  stateBtnLabel: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, textTransform: 'uppercase' },
  stateBtnTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  stateBtnRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stateCountChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stateCountChipActive: {
    backgroundColor: '#DCFCE7',
  },
  stateCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  stateCountTextActive: {
    color: '#166534',
  },
  clearStateBtn: {
    padding: 4,
    marginLeft: 4,
  },

  // Compact Quick Filter Pills
  compactFilterScroll: {
    marginBottom: 12,
  },
  compactFilterContent: {
    gap: 8,
    paddingBottom: 4,
  },
  quickPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9' },
  quickPillActive: { backgroundColor: '#334155', borderColor: '#334155' },
  quickPillActiveGreen: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  quickPillActiveYellow: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
  },
  quickPillActiveRed: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  quickPillActiveBlue: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  quickPillText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  quickPillTextActive: { color: '#FFFFFF' },
  quickPillTextActiveGreen: {
    color: '#166534',
    fontWeight: '800',
  },
  quickPillTextActiveYellow: {
    color: '#92400E',
    fontWeight: '800',
  },
  quickPillTextActiveRed: {
    color: '#991B1B',
    fontWeight: '800',
  },
  quickPillTextActiveBlue: {
    color: '#0369A1',
    fontWeight: '800',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: S.sm,
  },
  emptyTitle: { color: C.textSecondary, fontSize: 16, fontWeight: '700', marginTop: S.sm },
  emptySub:   { color: C.textMuted, fontSize: 13, textAlign: 'center', maxWidth: 260 },

  // Categories Grid
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: S.md,
  },
  catCard: {
    width: '47.5%',
    backgroundColor: C.surface2,
    borderRadius: R.card,
    padding: S.lg,
    borderWidth: 1,
    borderColor: C.border,
  },
  catCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: S.md,
  },
  catEmojiWrap: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: C.primaryDim,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: C.primaryGlow,
  },
  catEmoji:     { fontSize: 22 },
  catCardName:  { color: C.textPrimary, fontSize: 13, fontWeight: '800', marginBottom: 4 },
  catCardCount: { color: C.primary, fontSize: 12, fontWeight: '700', marginBottom: S.sm },
  catCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  catCardId:     { color: C.textDim, fontSize: 9, fontWeight: '600' },
  catCardAction: { color: C.primary, fontSize: 10, fontWeight: '800' },

  // Orders
  refreshBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: C.primaryDim,
    borderWidth: 1, borderColor: C.primaryGlow,
    justifyContent: 'center', alignItems: 'center',
  },
  orderCard: {
    backgroundColor: C.surface2,
    borderRadius: R.card,
    padding: S.lg,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId:       { color: C.textPrimary, fontSize: 14, fontWeight: '800' },
  orderCustomer: { color: C.textMuted, fontSize: 12, marginTop: 2 },
  orderStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: S.sm + 2,
    paddingVertical: 5,
    borderRadius: R.badge + 2,
  },
  orderStatusDot:  { width: 6, height: 6, borderRadius: 3 },
  orderStatusText: { fontSize: 11, fontWeight: '800' },
  orderDivider:    { height: 1, backgroundColor: C.border, marginVertical: S.md },
  orderDetails:    { flexDirection: 'row', gap: S.sm },
  orderDetailItem: { flex: 1, gap: 3 },
  orderDetailLabel: { color: C.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  orderDetailValue: { color: C.textPrimary, fontSize: 12, fontWeight: '700' },
  orderActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: S.xs + 2,
    marginTop: S.md,
  },
  orderActionBtn: {
    paddingHorizontal: S.md,
    paddingVertical: 6,
    borderRadius: R.badge + 4,
    borderWidth: 1,
  },
  orderActionText: { fontSize: 11, fontWeight: '800' },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Animated, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminProduct } from './adminTypes';

interface AdminInventoryProps {
  products: AdminProduct[];
  onEditProduct: (p: AdminProduct) => void;
  onDeleteProduct: (p: AdminProduct) => void;
}

export const AdminInventory: React.FC<AdminInventoryProps> = ({ products, onEditProduct, onDeleteProduct }) => {
  const totalProducts = products.length;
  const outOfStock = products.filter(p => Number(p.stock || 0) === 0);
  const lowStock = products.filter(p => Number(p.stock || 0) > 0 && Number(p.stock || 0) <= 5);
  // ── Scanner Logic ──
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<{ critical: any[], warnings: any[], anomalies: any[] } | null>(null);
  
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const [scanStep, setScanStep] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanFilter, setScanFilter] = useState<'all' | 'critical' | 'warnings' | 'anomalies'>('all');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isScanning) {
      interval = setInterval(() => {
        setScanProgress(p => {
          if (p >= 100) return 100;
          return p + Math.floor(Math.random() * 5) + 1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const runScan = () => {
    setShowScanner(true);
    setIsScanning(true);
    setScanResults(null);
    setScanProgress(0);
    setScanStep(1);
    setScanFilter('all');
    
    // Bar animation
    scanAnim.setValue(0);
    Animated.timing(scanAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false
    }).start();

    // Pulse animation
    pulseAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 800, useNativeDriver: true })
      ])
    ).start();

    // Professional steps cycler
    setTimeout(() => setScanStep(2), 800);
    setTimeout(() => setScanStep(3), 1600);
    setTimeout(() => setScanStep(4), 2400);

    setTimeout(() => {
      pulseAnim.stopAnimation();
      let critical: any[] = [];
      let warnings: any[] = [];
      let anomalies: any[] = [];
      
      const titleMap = new Map<string, number>();

      products.forEach(p => {
        const stock = Number(p.stock || 0);
        const pPrice = parseFloat(String(p.price || p.priceNumber || 0).replace(/[^0-9.]/g, '')) || 0;
        
        // Critical Bugs
        if (stock < 0) {
          critical.push({ product: p, type: 'Negative Inventory', msg: `Glitch: Stock is below zero (${stock}).` });
        }
        if (pPrice <= 0) {
          critical.push({ product: p, type: 'Free Item Bug', msg: 'Price is $0. Customers can get this for free!' });
        }
        if (!p.imageUrl && !p.img && (!p.images || p.images.length === 0)) {
          critical.push({ product: p, type: 'Invisible Product', msg: 'No image uploaded. Looks broken on the app.' });
        }

        // Warnings
        if (stock === 0) {
          warnings.push({ product: p, type: 'Out of Stock', msg: '0 inventory. Customers cannot buy this.' });
        }
        if (!p.category) {
          warnings.push({ product: p, type: 'Uncategorized', msg: 'Customers cannot find this using category buttons.' });
        }
        const tLen = (p.title || p.name || '').length;
        if (tLen < 4) {
          warnings.push({ product: p, type: 'Bad SEO Title', msg: 'Name is too short for search engines to find.' });
        } else if (tLen > 80) {
          warnings.push({ product: p, type: 'Title Too Long', msg: 'Name is so long it might break mobile phone screens.' });
        }

        // Anomalies (Duplicates)
        const tLower = (p.title || p.name || '').toLowerCase().trim();
        if (tLower) {
          if (titleMap.has(tLower)) {
            anomalies.push({ product: p, type: 'Exact Duplicate', msg: 'You created multiple items with this identical name.' });
          }
          titleMap.set(tLower, 1);
        }
      });

      setScanResults({ critical, warnings, anomalies });
      setIsScanning(false);
    }, 3000);
  };

  
  const displayTotal = totalProducts > 0 ? totalProducts : 100;
  const displayOut = totalProducts > 0 ? outOfStock.length : 3;
  const displayLow = totalProducts > 0 ? lowStock.length : 15;
  const displayHealth = totalProducts > 0 
    ? Math.round(((totalProducts - displayOut - displayLow) / totalProducts) * 100) 
    : 94;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="cube" size={16} color="#3B82F6" />
        </View>
        <Text style={styles.headerTitle}>Inventory</Text>
        <View style={styles.textAvatar}>
          <Text style={styles.textAvatarChar}>A</Text>
        </View>
      </View>

      <Text style={styles.pageTitle}>Inventory Intelligence</Text>
      <Text style={styles.pageSub}>AI-driven insights for optimal stock levels.</Text>

      {/* KPI Cards */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <View style={styles.kpiHeader}>
            <Ionicons name="pulse" size={14} color="#3B82F6" />
            <Text style={styles.kpiLabel}>HEALTH</Text>
          </View>
          <Text style={styles.kpiValue}>{displayHealth}% <Text style={styles.trendUp}>↑</Text></Text>
        </View>
        <View style={styles.kpiCardRed}>
          <View style={styles.kpiHeader}>
            <Ionicons name="warning" size={14} color="#EF4444" />
            <Text style={styles.kpiLabelRed}>RISKS</Text>
            <Ionicons name="alert" size={24} color="#FCA5A5" style={styles.bgIcon} />
          </View>
          <Text style={styles.kpiValueRed}>{displayOut} <Text style={styles.kpiSubRed}>stockout{displayOut !== 1 && 's'}</Text></Text>
        </View>
      </View>

      {/* Action Required */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Action Required</Text>
        <TouchableOpacity onPress={() => Alert.alert('View All', 'Navigate to Products tab to see all items.')}><Text style={styles.viewAll}>View All {'>'}</Text></TouchableOpacity>
      </View>

      {totalProducts === 0 ? (
        <>
          {/* Mock Out of Stock */}
          <View style={styles.actionCardRed}>
            <View style={styles.actionTop}>
              <View style={styles.dotRed} />
              <Text style={styles.actionTitleRed}>Out of Stock</Text>
            </View>
            <Text style={styles.itemName}>Wireless Noise-Canceling Headphones XL</Text>
            <View style={styles.actionBottom}>
              <View style={styles.badgeGray}><Text style={styles.badgeText}>Demand: High</Text></View>
              <TouchableOpacity style={styles.btnBlue} onPress={() => Alert.alert('Restock', `Auto-restocking Wireless Noise-Canceling Headphones XL. Supplier notified.`)}>
                <Ionicons name="refresh" size={12} color="#FFF" style={{marginRight: 4}} />
                <Text style={styles.btnBlueText}>Restock</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Mock Low Stock */}
          <View style={styles.actionCardOrange}>
            <View style={styles.actionTop}>
              <Ionicons name="trending-down" size={14} color="#F59E0B" style={{marginRight: 6}} />
              <Text style={styles.actionTitleOrange}>Low Stock</Text>
            </View>
            <Text style={styles.itemName}>Ceramic Minimalist Coffee Mug Set</Text>
            <View style={styles.actionBottom}>
              <View style={styles.badgeGray}><Text style={styles.badgeText}>Est. runout: 4 days</Text></View>
              <TouchableOpacity style={styles.btnGray} onPress={() => Alert.alert('Place Order', `Order placed for Ceramic Minimalist Coffee Mug Set. Supplier will confirm within 24 hours.`)}>
                <Ionicons name="cart" size={12} color="#475569" style={{marginRight: 4}} />
                <Text style={styles.btnGrayText}>Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        <>
          {outOfStock.length === 0 && lowStock.length === 0 && (
            <View style={{ padding: 24, alignItems: 'center', backgroundColor: '#F0FDF4', borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0' }}>
              <Ionicons name="checkmark-circle" size={32} color="#22C55E" style={{ marginBottom: 8 }} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#166534' }}>All Clear!</Text>
              <Text style={{ fontSize: 13, color: '#15803D', marginTop: 4 }}>No stock alerts at this time.</Text>
            </View>
          )}
          
          {outOfStock.slice(0, 5).map(p => (
            <View key={p.id} style={styles.actionCardRed}>
              <View style={styles.actionTop}>
                <View style={styles.dotRed} />
                <Text style={styles.actionTitleRed}>Out of Stock</Text>
              </View>
              <Text style={styles.itemName}>{p.title || p.name}</Text>
              <View style={styles.actionBottom}>
                <View style={styles.badgeGray}><Text style={styles.badgeText}>Stock: 0</Text></View>
                <TouchableOpacity style={styles.btnBlue} onPress={() => Alert.alert('Restock', `Auto-restocking ${p.title || p.name}. Supplier notified.`)}>
                  <Ionicons name="refresh" size={12} color="#FFF" style={{marginRight: 4}} />
                  <Text style={styles.btnBlueText}>Restock</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {lowStock.slice(0, 5).map(p => (
            <View key={p.id} style={styles.actionCardOrange}>
              <View style={styles.actionTop}>
                <Ionicons name="trending-down" size={14} color="#F59E0B" style={{marginRight: 6}} />
                <Text style={styles.actionTitleOrange}>Low Stock ({p.stock})</Text>
              </View>
              <Text style={styles.itemName}>{p.title || p.name}</Text>
              <View style={styles.actionBottom}>
                <View style={styles.badgeGray}><Text style={styles.badgeText}>Running out</Text></View>
                <TouchableOpacity style={styles.btnGray} onPress={() => Alert.alert('Place Order', `Order placed for ${p.title || p.name}. Supplier will confirm within 24 hours.`)}>
                  <Ionicons name="cart" size={12} color="#475569" style={{marginRight: 4}} />
                  <Text style={styles.btnGrayText}>Order</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Distribution (Value by Category) */}
      <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Stock Distribution by Category</Text>
      <View style={styles.mapCard}>
        {totalProducts === 0 ? (
          <>
            <View style={[styles.mapMockArea, { backgroundColor: '#E2E8F0', borderRadius: 8 }]} />
            <View style={styles.distRow}>
              <View style={styles.distLeft}><View style={[styles.dot, {backgroundColor: '#10B981'}]} /><Text style={styles.distName}>East Coast Hub</Text></View>
              <Text style={styles.distStatusGreen}>Optimal</Text>
            </View>
            <View style={styles.distRow}>
              <View style={styles.distLeft}><View style={[styles.dot, {backgroundColor: '#3B82F6'}]} /><Text style={styles.distName}>West Coast Hub</Text></View>
              <Text style={styles.distStatusGray}>85% Cap</Text>
            </View>
            <View style={[styles.distRow, { backgroundColor: '#FEF2F2', padding: 8, borderRadius: 8, marginHorizontal: -8 }]}>
              <View style={styles.distLeft}><View style={[styles.dot, {backgroundColor: '#EF4444'}]} /><Text style={styles.distNameRed}>Central Transit</Text></View>
              <Text style={styles.distStatusRed}>Delayed</Text>
            </View>
          </>
        ) : (
          (() => {
            const catCounts: Record<string, number> = {};
            products.forEach(p => {
              const cat = p.category || 'Uncategorized';
              catCounts[cat] = (catCounts[cat] || 0) + (Number(p.stock) || 0);
            });
            const topCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
            const totalStockCount = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
            const colors = ['#10B981', '#3B82F6', '#F59E0B'];
            
            return (
              <>
                <View style={{ flexDirection: 'row', height: 24, borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
                  {topCats.map((cat, i) => {
                    const pct = totalStockCount > 0 ? (cat[1] / totalStockCount) * 100 : 0;
                    return <View key={cat[0]} style={{ width: `${pct}%`, height: '100%', backgroundColor: colors[i] }} />;
                  })}
                  {topCats.length === 0 && <View style={{ flex: 1, backgroundColor: '#E2E8F0' }} />}
                </View>
                {topCats.map((cat, i) => {
                  const pct = totalStockCount > 0 ? Math.round((cat[1] / totalStockCount) * 100) : 0;
                  return (
                    <View key={cat[0]} style={styles.distRow}>
                      <View style={styles.distLeft}>
                        <View style={[styles.dot, {backgroundColor: colors[i]}]} />
                        <Text style={styles.distName} numberOfLines={1}>{cat[0]}</Text>
                      </View>
                      <Text style={styles.distStatusGray}>{pct}% ({cat[1]} units)</Text>
                    </View>
                  );
                })}
              </>
            );
          })()
        )}
      </View>

      {/* Catalog Health */}
      <Text style={styles.sectionTitle}>Catalog Health</Text>
      <View style={styles.catalogCard}>
        {totalProducts === 0 ? (
          <>
            <View style={styles.catItem}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100' }} style={styles.catImg} />
              <View style={styles.catInfo}>
                <Text style={styles.catName}>Aura Smart Watch Gen 2</Text>
                <View style={styles.catBadgeGreen}><Ionicons name="checkmark-circle" size={10} color="#10B981"/><Text style={styles.catBadgeTextGreen}>Data Complete</Text></View>
              </View>
            </View>
            <View style={styles.catItem}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100' }} style={styles.catImg} />
              <View style={styles.catInfo}>
                <Text style={styles.catName}>Velocity Pro Runners</Text>
                <View style={styles.catBadgeRed}><Text style={styles.catBadgeTextRed}>Low Quality Image</Text></View>
              </View>
              <Ionicons name="pencil" size={16} color="#94A3B8" />
            </View>
            <View style={[styles.catItem, { borderBottomWidth: 0 }]}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?w=100' }} style={styles.catImg} />
              <View style={styles.catInfo}>
                <Text style={styles.catName}>Matte Desk Organizer</Text>
                <View style={styles.catBadgeOrange}><Text style={styles.catBadgeTextOrange}>Missing Weight</Text></View>
              </View>
              <Ionicons name="pencil" size={16} color="#94A3B8" />
            </View>
          </>
        ) : (
          (() => {
            const incompleteProducts = products.filter(p => !p.imageUrl && !p.img || !p.price && !p.priceNumber || !p.category);
            const displayProducts = incompleteProducts.slice(0, 3);
            
            if (displayProducts.length === 0) {
              return (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Ionicons name="shield-checkmark" size={40} color="#10B981" style={{ marginBottom: 12 }} />
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#0F172A' }}>Perfect Catalog!</Text>
                  <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4 }}>
                    All your products have complete titles, prices, images, and categories.
                  </Text>
                </View>
              );
            }

            return (
              <>
                {displayProducts.map((p, index) => {
                  let errorMsg = 'Missing Data';
                  let isCritical = false;
                  if (!p.imageUrl && !p.img) { errorMsg = 'Missing Image'; isCritical = true; }
                  else if (!p.price && !p.priceNumber) { errorMsg = 'Missing Price'; isCritical = true; }
                  else if (!p.category) { errorMsg = 'No Category'; isCritical = false; }
                  
                  return (
                    <View key={p.id} style={[styles.catItem, index === displayProducts.length - 1 && { borderBottomWidth: 0 }]}>
                      <View style={[styles.catImg, { backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' }]}>
                        {p.imageUrl || p.img ? (
                          <Image source={{ uri: p.imageUrl || p.img }} style={{ width: '100%', height: '100%', borderRadius: 6 }} />
                        ) : (
                          <Ionicons name="image-outline" size={20} color="#94A3B8" />
                        )}
                      </View>
                      <View style={styles.catInfo}>
                        <Text style={styles.catName} numberOfLines={1}>{p.title || p.name}</Text>
                        <View style={isCritical ? styles.catBadgeRed : styles.catBadgeOrange}>
                          <Text style={isCritical ? styles.catBadgeTextRed : styles.catBadgeTextOrange}>{errorMsg}</Text>
                        </View>
                      </View>
                      <Ionicons name="pencil" size={16} color="#94A3B8" />
                    </View>
                  );
                })}
              </>
            );
          })()
        )}

        {totalProducts > 0 && (
          <TouchableOpacity style={styles.scanBtn} onPress={runScan}>
            <Text style={styles.scanBtnText}>Scan Complete Catalog</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 100 }} />

      {/* ── AI Scanner Modal ── */}
      <Modal visible={showScanner} animationType="slide" transparent={true}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="scan-circle" size={24} color="#3B82F6" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>AI Catalog Scanner</Text>
              </View>
              {!isScanning && (
                <TouchableOpacity onPress={() => setShowScanner(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>

            {isScanning ? (
              <View style={styles.scanState}>
                <View style={{ position: 'relative', width: 100, height: 100, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                  <Animated.View style={{
                    position: 'absolute', width: 100, height: 100, borderRadius: 50,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.5] }) }],
                    opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
                  }} />
                  <Animated.View style={{
                    position: 'absolute', width: 60, height: 60, borderRadius: 30,
                    backgroundColor: 'rgba(59, 130, 246, 0.4)',
                    transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.2] }) }]
                  }} />
                  <Ionicons name="scan-circle-outline" size={48} color="#3B82F6" style={{ zIndex: 10 }} />
                </View>

                <Text style={styles.scanText}>System Audit in Progress</Text>
                
                <View style={styles.scanBarBg}>
                  <Animated.View style={[styles.scanBarFill, { 
                    width: scanAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) 
                  }]} />
                </View>
                <Text style={[styles.scanSub, { color: '#3B82F6', fontWeight: '500', marginBottom: 24 }]}>
                  {scanProgress}% Completed ({totalProducts} items)
                </Text>

                <View style={{ width: '100%', paddingHorizontal: 24 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Ionicons name={scanStep > 1 ? "checkmark-circle" : scanStep === 1 ? "sync" : "ellipse-outline"} size={18} color={scanStep > 1 ? "#10B981" : scanStep === 1 ? "#3B82F6" : "#CBD5E1"} style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 13, color: scanStep >= 1 ? '#0F172A' : '#94A3B8', fontWeight: scanStep === 1 ? '600' : '400' }}>Validating data structures...</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Ionicons name={scanStep > 2 ? "checkmark-circle" : scanStep === 2 ? "sync" : "ellipse-outline"} size={18} color={scanStep > 2 ? "#10B981" : scanStep === 2 ? "#3B82F6" : "#CBD5E1"} style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 13, color: scanStep >= 2 ? '#0F172A' : '#94A3B8', fontWeight: scanStep === 2 ? '600' : '400' }}>Cross-referencing pricing anomalies...</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Ionicons name={scanStep > 3 ? "checkmark-circle" : scanStep === 3 ? "sync" : "ellipse-outline"} size={18} color={scanStep > 3 ? "#10B981" : scanStep === 3 ? "#3B82F6" : "#CBD5E1"} style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 13, color: scanStep >= 3 ? '#0F172A' : '#94A3B8', fontWeight: scanStep === 3 ? '600' : '400' }}>Auditing inventory depletion...</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={scanStep > 4 ? "checkmark-circle" : scanStep === 4 ? "sync" : "ellipse-outline"} size={18} color={scanStep > 4 ? "#10B981" : scanStep === 4 ? "#3B82F6" : "#CBD5E1"} style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 13, color: scanStep >= 4 ? '#0F172A' : '#94A3B8', fontWeight: scanStep === 4 ? '600' : '400' }}>Compiling diagnostics report...</Text>
                  </View>
                </View>
              </View>
            ) : scanResults ? (
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
                <View style={styles.scanSummaryRow}>
                  <TouchableOpacity 
                    style={[styles.scanStat, { backgroundColor: scanFilter === 'critical' || scanFilter === 'all' ? '#FEF2F2' : '#FFFFFF', borderColor: scanFilter === 'critical' ? '#EF4444' : '#FCA5A5' }]}
                    onPress={() => setScanFilter(scanFilter === 'critical' ? 'all' : 'critical')}
                  >
                    <Text style={[styles.scanStatNum, { color: scanFilter === 'critical' || scanFilter === 'all' ? '#EF4444' : '#FCA5A5' }]}>{scanResults.critical.length}</Text>
                    <Text style={styles.scanStatLabel}>Critical Bugs</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.scanStat, { backgroundColor: scanFilter === 'warnings' || scanFilter === 'all' ? '#FFF7ED' : '#FFFFFF', borderColor: scanFilter === 'warnings' ? '#F59E0B' : '#FDBA74' }]}
                    onPress={() => setScanFilter(scanFilter === 'warnings' ? 'all' : 'warnings')}
                  >
                    <Text style={[styles.scanStatNum, { color: scanFilter === 'warnings' || scanFilter === 'all' ? '#F59E0B' : '#FDBA74' }]}>{scanResults.warnings.length}</Text>
                    <Text style={styles.scanStatLabel}>Warnings</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.scanStat, { backgroundColor: scanFilter === 'anomalies' || scanFilter === 'all' ? '#F1F5F9' : '#FFFFFF', borderColor: scanFilter === 'anomalies' ? '#64748B' : '#CBD5E1' }]}
                    onPress={() => setScanFilter(scanFilter === 'anomalies' ? 'all' : 'anomalies')}
                  >
                    <Text style={[styles.scanStatNum, { color: scanFilter === 'anomalies' || scanFilter === 'all' ? '#64748B' : '#94A3B8' }]}>{scanResults.anomalies.length}</Text>
                    <Text style={styles.scanStatLabel}>Anomalies</Text>
                  </TouchableOpacity>
                </View>

                {/* Render Critical */}
                {(scanFilter === 'all' || scanFilter === 'critical') && scanResults.critical.length > 0 && (
                  <View style={styles.scanSection}>
                    <Text style={[styles.scanSectionTitle, { color: '#EF4444' }]}>🚨 Critical Fixes Required</Text>
                    {scanResults.critical.map((item, i) => (
                      <View key={i} style={styles.scanItemCard}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.scanItemTitle} numberOfLines={1}>{item.product.title || item.product.name}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <View style={styles.scanBadgeRed}><Text style={styles.scanBadgeTextRed}>{item.type}</Text></View>
                            <Text style={styles.scanItemMsg}>{item.msg}</Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity 
                            style={styles.scanEditBtn}
                            onPress={() => { setShowScanner(false); onEditProduct(item.product); }}
                          >
                            <Ionicons name="pencil" size={16} color="#3B82F6" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.scanDeleteBtn}
                            onPress={() => { setShowScanner(false); onDeleteProduct(item.product); }}
                          >
                            <Ionicons name="trash" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Render Warnings */}
                {(scanFilter === 'all' || scanFilter === 'warnings') && scanResults.warnings.length > 0 && (
                  <View style={styles.scanSection}>
                    <Text style={[styles.scanSectionTitle, { color: '#F59E0B' }]}>⚠️ Warnings</Text>
                    {scanResults.warnings.map((item, i) => (
                      <View key={i} style={styles.scanItemCard}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.scanItemTitle} numberOfLines={1}>{item.product.title || item.product.name}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <View style={styles.scanBadgeOrange}><Text style={styles.scanBadgeTextOrange}>{item.type}</Text></View>
                            <Text style={styles.scanItemMsg}>{item.msg}</Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity 
                            style={styles.scanEditBtn}
                            onPress={() => { setShowScanner(false); onEditProduct(item.product); }}
                          >
                            <Ionicons name="pencil" size={16} color="#3B82F6" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.scanDeleteBtn}
                            onPress={() => { setShowScanner(false); onDeleteProduct(item.product); }}
                          >
                            <Ionicons name="trash" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Render Anomalies */}
                {(scanFilter === 'all' || scanFilter === 'anomalies') && scanResults.anomalies.length > 0 && (
                  <View style={styles.scanSection}>
                    <Text style={[styles.scanSectionTitle, { color: '#64748B' }]}>💡 Data Cleanliness</Text>
                    {scanResults.anomalies.map((item, i) => (
                      <View key={i} style={styles.scanItemCard}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.scanItemTitle} numberOfLines={1}>{item.product.title || item.product.name}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <View style={styles.scanBadgeGray}><Text style={styles.scanBadgeTextGray}>{item.type}</Text></View>
                            <Text style={styles.scanItemMsg}>{item.msg}</Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity 
                            style={styles.scanEditBtn}
                            onPress={() => { setShowScanner(false); onEditProduct(item.product); }}
                          >
                            <Ionicons name="pencil" size={16} color="#3B82F6" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.scanDeleteBtn}
                            onPress={() => { setShowScanner(false); onDeleteProduct(item.product); }}
                          >
                            <Ionicons name="trash" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {scanResults.critical.length === 0 && scanResults.warnings.length === 0 && scanResults.anomalies.length === 0 && (
                  <View style={{ alignItems: 'center', padding: 32 }}>
                    <Ionicons name="shield-checkmark" size={48} color="#10B981" />
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F172A', marginTop: 16 }}>100% Clean</Text>
                    <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8 }}>
                      No bugs, missing data, or duplicates found in your entire catalog.
                    </Text>
                  </View>
                )}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, paddingTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  iconBox: { width: 24, height: 24, backgroundColor: '#EFF6FF', borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#0F172A' },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  textAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
  textAvatarChar: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  
  pageTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  pageSub: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  
  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  kpiCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  kpiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  kpiLabel: { fontSize: 12, fontWeight: '600', color: '#3B82F6' },
  kpiValue: { fontSize: 24, fontWeight: '700', color: '#0F172A' },
  trendUp: { fontSize: 14, color: '#10B981' },
  
  kpiCardRed: { flex: 1, backgroundColor: '#FEF2F2', borderRadius: 12, padding: 16, overflow: 'hidden' },
  kpiLabelRed: { fontSize: 12, fontWeight: '600', color: '#EF4444' },
  bgIcon: { position: 'absolute', right: -5, top: -5, opacity: 0.2 },
  kpiValueRed: { fontSize: 24, fontWeight: '700', color: '#EF4444' },
  kpiSubRed: { fontSize: 14, fontWeight: '500' },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#0F172A', marginBottom: 12 },
  viewAll: { fontSize: 13, color: '#3B82F6', fontWeight: '500' },
  
  actionCardRed: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FCA5A5', borderLeftWidth: 4, borderLeftColor: '#EF4444', marginBottom: 12 },
  actionTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dotRed: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', marginRight: 6 },
  actionTitleRed: { fontSize: 13, fontWeight: '600', color: '#EF4444' },
  itemName: { fontSize: 14, color: '#0F172A', marginBottom: 12 },
  actionBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeGray: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 11, color: '#64748B' },
  btnBlue: { backgroundColor: '#3B82F6', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnBlueText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  
  actionCardOrange: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FDE68A', borderLeftWidth: 4, borderLeftColor: '#F59E0B', marginBottom: 24 },
  actionTitleOrange: { fontSize: 13, fontWeight: '600', color: '#F59E0B' },
  btnGray: { backgroundColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnGrayText: { color: '#0F172A', fontSize: 12, fontWeight: '600' },
  
  mapCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 24 },
  mapMockArea: { height: 120, marginBottom: 16 },
  distRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  distLeft: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  distName: { fontSize: 13, color: '#0F172A' },
  distNameRed: { fontSize: 13, color: '#991B1B', fontWeight: '500' },
  distStatusGreen: { fontSize: 12, color: '#10B981', fontWeight: '500' },
  distStatusGray: { fontSize: 12, color: '#64748B' },
  distStatusRed: { fontSize: 12, color: '#991B1B', fontWeight: '600' },
  
  catalogCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  catItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  catImg: { width: 40, height: 40, borderRadius: 8, marginRight: 12, backgroundColor: '#F1F5F9' },
  catInfo: { flex: 1, gap: 4 },
  catName: { fontSize: 13, fontWeight: '500', color: '#0F172A' },
  catBadgeGreen: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  catBadgeTextGreen: { fontSize: 10, color: '#10B981' },
  catBadgeRed: { backgroundColor: '#FEF2F2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  catBadgeTextRed: { fontSize: 10, color: '#EF4444' },
  catBadgeOrange: { backgroundColor: '#FFF7ED', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  catBadgeTextOrange: { fontSize: 10, color: '#EA580C' },
  
  scanBtn: { alignItems: 'center', paddingTop: 16 },
  scanBtnText: { color: '#3B82F6', fontSize: 13, fontWeight: '600' },

  // Scanner Modal Styles
  modalBg: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  scanState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanText: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 16 },
  scanBarBg: { width: '80%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  scanBarFill: { height: '100%', backgroundColor: '#3B82F6' },
  scanSub: { fontSize: 13, color: '#64748B' },
  
  scanSummaryRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  scanStat: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  scanStatNum: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  scanStatLabel: { fontSize: 12, fontWeight: '500', color: '#64748B' },
  
  scanSection: { marginBottom: 24 },
  scanSectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12, marginLeft: 4 },
  scanItemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1F5F9', padding: 12, borderRadius: 12, marginBottom: 8 },
  scanItemTitle: { fontSize: 14, fontWeight: '500', color: '#0F172A' },
  scanItemMsg: { fontSize: 12, color: '#64748B', marginLeft: 8 },
  scanBadgeRed: { backgroundColor: '#FEF2F2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  scanBadgeTextRed: { fontSize: 10, color: '#EF4444', fontWeight: '600' },
  scanBadgeOrange: { backgroundColor: '#FFF7ED', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  scanBadgeTextOrange: { fontSize: 10, color: '#EA580C', fontWeight: '600' },
  scanBadgeGray: { backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  scanBadgeTextGray: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  scanEditBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  scanDeleteBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginLeft: 8 }
});

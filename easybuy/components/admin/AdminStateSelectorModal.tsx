import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { INDIAN_STATES_AND_UTS, StateItem } from '../../constants/catalogGenerator';

const { width, height } = Dimensions.get('window');

interface AdminStateSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  selectedStateId: string; // 'all' or state code e.g. 'HR', 'BR'
  onSelectState: (state: StateItem | null) => void;
  productCountByState?: Record<string, number>;
  totalProductsCount: number;
}

export const AdminStateSelectorModal: React.FC<AdminStateSelectorModalProps> = ({
  visible,
  onClose,
  selectedStateId,
  onSelectState,
  productCountByState = {},
  totalProductsCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStates = useMemo(() => {
    if (!searchQuery.trim()) return INDIAN_STATES_AND_UTS;
    const q = searchQuery.toLowerCase().trim();
    return INDIAN_STATES_AND_UTS.filter((s) => {
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.capital.toLowerCase().includes(q) ||
        s.popularCities.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [searchQuery]);

  const handleSelect = (state: StateItem | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSelectState(state);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Filter Products by State / UT</Text>
              <Text style={styles.subtitle}>Select a region to view state-specific catalog</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={16} color="#64748B" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search state or city (e.g. Gurugram, Patna, Mumbai)..."
              placeholderTextColor="#94A3B8"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* List of States */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {/* Option: All States & UTs */}
            <TouchableOpacity
              style={[
                styles.stateCard,
                selectedStateId === 'all' && styles.stateCardActive,
              ]}
              onPress={() => handleSelect(null)}
              activeOpacity={0.8}
            >
              <View style={[styles.flagBadge, selectedStateId === 'all' && styles.flagBadgeActive]}>
                <Text style={styles.flagEmoji}>🇮🇳</Text>
              </View>
              <View style={styles.stateInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.stateName, selectedStateId === 'all' && styles.stateNameActive]}>
                    All Products (All States & UTs)
                  </Text>
                  <View style={styles.allPill}>
                    <Text style={styles.allPillText}>Full Catalog</Text>
                  </View>
                </View>
                <Text style={styles.citySub}>Display all items in Firebase database</Text>
              </View>
              <View style={styles.rightWrap}>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{totalProductsCount}</Text>
                </View>
                {selectedStateId === 'all' && (
                  <Ionicons name="checkmark-circle" size={20} color="#2F6E49" style={{ marginLeft: 6 }} />
                )}
              </View>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider} />
            <Text style={styles.sectionHeader}>INDIAN STATES & UNION TERRITORIES (36)</Text>

            {/* State Cards */}
            {filteredStates.map((s) => {
              const isSelected = selectedStateId.toUpperCase() === s.id.toUpperCase();
              const count = productCountByState[s.id] || 54;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.stateCard, isSelected && styles.stateCardActive]}
                  onPress={() => handleSelect(s)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.codeBadge, isSelected && styles.codeBadgeActive]}>
                    <Text style={[styles.codeText, isSelected && styles.codeTextActive]}>{s.code}</Text>
                  </View>

                  <View style={styles.stateInfo}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.stateName, isSelected && styles.stateNameActive]}>
                        {s.name}
                      </Text>
                      <Text style={styles.typeBadge}>{s.type === 'Union Territory' ? 'UT' : 'State'}</Text>
                    </View>
                    <Text style={styles.citySub} numberOfLines={1}>
                      📍 {s.popularCities.slice(0, 3).join(', ')}
                    </Text>
                  </View>

                  <View style={styles.rightWrap}>
                    <View style={[styles.countBadge, isSelected && styles.countBadgeActive]}>
                      <Text style={[styles.countBadgeText, isSelected && styles.countBadgeTextActive]}>
                        {count} items
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color="#2F6E49" style={{ marginLeft: 6 }} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.82,
    paddingTop: 12,
    paddingHorizontal: 18,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  listContent: {
    paddingBottom: 24,
    gap: 8,
  },
  stateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  stateCardActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#2F6E49',
  },
  flagBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  flagBadgeActive: {
    backgroundColor: '#DCFCE7',
  },
  flagEmoji: {
    fontSize: 20,
  },
  codeBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  codeBadgeActive: {
    backgroundColor: '#2F6E49',
  },
  codeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  codeTextActive: {
    color: '#FFFFFF',
  },
  stateInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stateName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  stateNameActive: {
    color: '#166534',
  },
  allPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  allPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },
  typeBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  citySub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  rightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countBadgeActive: {
    backgroundColor: '#DCFCE7',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  countBadgeTextActive: {
    color: '#166534',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
});

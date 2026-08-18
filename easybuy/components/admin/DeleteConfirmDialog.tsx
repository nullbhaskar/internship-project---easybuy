import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, R, S } from './adminTheme';

interface DeleteConfirmDialogProps {
  visible: boolean;
  productName?: string;
  title?: string;
  message?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  visible,
  productName,
  title,
  message,
  loading,
  onConfirm,
  onCancel,
}) => {
  const displayTitle   = title   || 'Delete Product?';
  const displayMessage = message || `Are you sure you want to delete "${productName || 'this product'}"? This action cannot be undone.`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.iconWrap}>
            <Ionicons name="trash-outline" size={32} color={C.danger} />
          </View>
          <Text style={styles.title}>{displayTitle}</Text>
          <Text style={styles.message}>{displayMessage}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Keep It</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteBtn, loading && styles.deleteBtnDisabled]}
              onPress={onConfirm}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="trash" size={16} color="#fff" />
                  <Text style={styles.deleteText}>Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: S.xl,
  },
  dialog: {
    backgroundColor: C.surface2,
    borderRadius: R.card + 4,
    padding: S.xxl,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${C.danger}33`,
    shadowColor: C.danger,
    shadowOpacity: 0.15,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  iconWrap: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: C.dangerDim,
    borderWidth: 1, borderColor: `${C.danger}33`,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: S.xl,
  },
  title: {
    color: C.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: S.sm,
  },
  message: {
    color: C.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: S.xxl,
  },
  actions: {
    flexDirection: 'row',
    gap: S.md,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: S.lg,
    borderRadius: R.btn,
    backgroundColor: C.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border2,
  },
  cancelText: { color: C.textSecondary, fontWeight: '700', fontSize: 15 },
  deleteBtn: {
    flex: 1.5,
    flexDirection: 'row',
    paddingVertical: S.lg,
    borderRadius: R.btn,
    backgroundColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
    gap: S.sm,
  },
  deleteBtnDisabled: { opacity: 0.5 },
  deleteText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});

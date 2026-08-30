import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const BRAND_THEME = {
  PRIMARY: '#0F172A', // Deep navy/black from the screenshot header
  ACCENT: '#10B981',  // Emerald green for success/badges
  BACKGROUND: '#F8FAFC',
  SURFACE: '#FFFFFF',
  TEXT_MAIN: '#0F172A',
  TEXT_MUTED: '#64748B',
  BORDER: '#E2E8F0',
};

interface ReturnFlowModalProps {
  visible: boolean;
  order: any;
  onClose: () => void;
  onReturnComplete: (orderId: string) => void;
}

export const ReturnFlowModal: React.FC<ReturnFlowModalProps> = ({
  visible,
  order,
  onClose,
  onReturnComplete,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [returnMethod, setReturnMethod] = useState<'credit' | 'original'>('credit');
  const [returnReason, setReturnReason] = useState<string>('');
  const [comments, setComments] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setStep(1);
      setReturnMethod('credit');
      setReturnReason('');
      setComments('');
      setLoading(false);
    }
  }, [visible]);

  if (!order) return null;

  const product = order.products?.[0] || {};
  const refundAmount = order.totalAmount || '$0.00';

  const handleProcessReturn = async () => {
    if (!returnReason) return;
    setLoading(true);
    try {
      if (order.id) {
        await updateDoc(doc(db, 'orders', order.id), {
          status: 'Return Requested',
          returnMethod,
          returnReason,
          returnComments: comments,
          returnDate: new Date().toISOString(),
        });
      }
      setStep(4); // Move to confirmation
      onReturnComplete(order.id);
    } catch (e) {
      console.error('Error processing return:', e);
      alert('Failed to process return. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = (title: string, showBack: boolean = true) => (
    <View style={S.header}>
      {showBack ? (
        <TouchableOpacity style={S.backBtn} onPress={() => setStep(step - 1)}>
          <Ionicons name="arrow-back" size={24} color={BRAND_THEME.PRIMARY} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} />
      )}
      <View style={S.headerTitleRow}>
        <View style={S.headerIconBox}>
          <Ionicons name="cube" size={16} color="#FFF" />
        </View>
        <Text style={S.headerTitle}>{title}</Text>
      </View>
      <TouchableOpacity style={S.closeBtn} onPress={onClose}>
        <Ionicons name="close" size={24} color={BRAND_THEME.TEXT_MUTED} />
      </TouchableOpacity>
    </View>
  );

  const renderStep1 = () => (
    <View style={S.stepContainer}>
      {renderHeader('Select Items', false)}
      <Text style={S.sectionTitle}>Your Orders</Text>
      
      <View style={S.productCard}>
        <View style={S.productCardTop}>
          <View style={S.imgPlaceholder}>
            {product.image ? (
              <Image source={{ uri: product.image }} style={S.productImg} />
            ) : (
              <Ionicons name="image-outline" size={24} color="#94A3B8" />
            )}
          </View>
          <View style={S.productInfo}>
            <Text style={S.productName} numberOfLines={2}>
              {product.title || 'Product Item'}
            </Text>
            <Text style={S.productMeta}>
              Delivered on {order.deliveredDate || 'Recent'}
            </Text>
            <Text style={S.productPrice}>{refundAmount}</Text>
          </View>
        </View>
        
        <View style={S.productCardBottom}>
          <TouchableOpacity 
            style={S.primaryBtn}
            onPress={() => setStep(2)}
          >
            <Ionicons name="return-down-back" size={16} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={S.primaryBtnText}>Initiate Return</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={S.stepContainer}>
      {renderHeader('Return Method')}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scrollContent}>
        <Text style={S.methodTitle}>Refund Method</Text>
        <Text style={S.methodSub}>How would you like to receive your {refundAmount} refund?</Text>

        {/* Store Credit Option */}
        <TouchableOpacity 
          style={[S.methodCard, returnMethod === 'credit' && S.methodCardActive]}
          onPress={() => setReturnMethod('credit')}
          activeOpacity={0.8}
        >
          {returnMethod === 'credit' && (
            <View style={S.recommendedBadge}>
              <Text style={S.recommendedText}>RECOMMENDED</Text>
            </View>
          )}
          <View style={S.methodCardInner}>
            <View style={[S.methodIconBox, returnMethod === 'credit' ? S.methodIconBoxActive : null]}>
              <Ionicons name="wallet" size={20} color={returnMethod === 'credit' ? '#FFF' : BRAND_THEME.TEXT_MUTED} />
            </View>
            <View style={S.methodInfo}>
              <Text style={[S.methodName, returnMethod === 'credit' && S.methodNameActive]}>Store Credit</Text>
              <Text style={S.methodDesc}>Available instantly. Use it immediately on your next purchase.</Text>
            </View>
            <View style={S.radioCircle}>
              {returnMethod === 'credit' && <View style={S.radioInner} />}
            </View>
          </View>
        </TouchableOpacity>

        {/* Original Payment Option */}
        <TouchableOpacity 
          style={[S.methodCard, returnMethod === 'original' && S.methodCardActive]}
          onPress={() => setReturnMethod('original')}
          activeOpacity={0.8}
        >
          <View style={S.methodCardInner}>
            <View style={S.methodIconBox}>
              <Ionicons name="card" size={20} color={BRAND_THEME.TEXT_MUTED} />
            </View>
            <View style={S.methodInfo}>
              <Text style={S.methodName}>Original Payment</Text>
              <Text style={S.methodDesc}>Usually takes 3-5 business days to process.</Text>
            </View>
            <View style={S.radioCircle}>
              {returnMethod === 'original' && <View style={S.radioInner} />}
            </View>
          </View>
        </TouchableOpacity>

        {/* Summary */}
        <View style={S.summaryBox}>
          <Text style={S.summaryTitle}>Summary</Text>
          <View style={S.summaryRow}>
            <Text style={S.summaryLabel}>Subtotal</Text>
            <Text style={S.summaryValue}>{refundAmount}</Text>
          </View>
          <View style={[S.summaryRow, S.summaryTotalRow]}>
            <Text style={S.summaryTotalLabel}>Total Refund</Text>
            <Text style={S.summaryTotalValue}>{refundAmount}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={S.footer}>
        <TouchableOpacity style={S.continueBtn} onPress={() => setStep(3)}>
          <Text style={S.continueBtnText}>Continue</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={S.stepContainer}
    >
      {renderHeader('Reason For Return')}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scrollContent}>
        <Text style={S.methodTitle}>Why are you returning this item?</Text>
        <Text style={S.methodSub}>Please select the main reason for your return. This helps us improve our products.</Text>

        <View style={S.miniProductCard}>
          {product.image ? (
             <Image source={{ uri: product.image }} style={S.miniImg} />
          ) : (
             <View style={[S.miniImg, { backgroundColor: '#CBD5E1' }]} />
          )}
          <Text style={S.miniProductTitle} numberOfLines={2}>{product.title || 'Product Item'}</Text>
        </View>

        <View style={S.reasonsList}>
          {[
            { id: 'size', label: 'Wrong size/fit', icon: 'shirt-outline' },
            { id: 'damaged', label: 'Item damaged', icon: 'alert-circle-outline' },
            { id: 'changed_mind', label: 'Changed my mind', icon: 'sync-outline' },
            { id: 'price', label: 'Better price elsewhere', icon: 'pricetag-outline' },
          ].map((reason) => (
            <TouchableOpacity 
              key={reason.id}
              style={[S.reasonItem, returnReason === reason.label && S.reasonItemActive]}
              onPress={() => setReturnReason(reason.label)}
            >
              <View style={S.reasonRadio}>
                {returnReason === reason.label && <View style={S.reasonRadioInner} />}
              </View>
              <Text style={S.reasonLabel}>{reason.label}</Text>
              <Ionicons name={reason.icon as any} size={18} color="#94A3B8" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={S.commentsLabel}>Additional comments (optional)</Text>
        <TextInput
          style={S.commentsInput}
          placeholder="Tell us more about the issue..."
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={4}
          value={comments}
          onChangeText={setComments}
          maxLength={200}
        />
        <Text style={S.charCount}>{comments.length}/200</Text>
      </ScrollView>

      <View style={S.footer}>
        <TouchableOpacity 
          style={[S.continueBtn, !returnReason && S.continueBtnDisabled]} 
          onPress={handleProcessReturn}
          disabled={!returnReason || loading}
        >
          <Text style={S.continueBtnText}>{loading ? 'Processing...' : 'Next Step'}</Text>
          {!loading && <Ionicons name="arrow-forward" size={16} color="#FFF" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderStep4 = () => (
    <View style={S.stepContainer}>
      {renderHeader('Confirmation', false)}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.confirmationContent}>
        
        <View style={S.successCircle}>
          <Ionicons name="checkmark" size={40} color={BRAND_THEME.ACCENT} />
        </View>
        <Text style={S.successTitle}>Return Initiated!</Text>
        <Text style={S.successSub}>
          Your return has been successfully processed. Here's what to do next.
        </Text>

        <View style={S.qrCard}>
          <Text style={S.qrTitle}>Show this code at drop-off</Text>
          <View style={S.qrBox}>
            <Ionicons name="qr-code" size={80} color={BRAND_THEME.PRIMARY} />
          </View>
          <Text style={S.returnId}>Return ID: RET-{order.id.substring(0, 6).toUpperCase()}</Text>
          <TouchableOpacity style={S.downloadBtn}>
            <Ionicons name="download-outline" size={16} color={BRAND_THEME.TEXT_MAIN} style={{ marginRight: 6 }} />
            <Text style={S.downloadBtnText}>Download Label PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={S.dropoffCard}>
          <View style={S.dropoffIconBox}>
            <Ionicons name="cube" size={20} color={BRAND_THEME.PRIMARY} />
          </View>
          <View style={S.dropoffInfo}>
            <Text style={S.dropoffTitle}>Nearest Drop-off</Text>
            <Text style={S.dropoffName}>Delivery Partner Hub</Text>
            <Text style={S.dropoffAddress}>Check email for nearest location based on your address.</Text>
          </View>
        </View>

      </ScrollView>

      <View style={S.footer}>
        <TouchableOpacity style={S.homeBtn} onPress={onClose}>
          <Text style={S.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={S.backdrop}>
        <View style={S.sheet}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </View>
      </View>
    </Modal>
  );
};

const S = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: BRAND_THEME.BACKGROUND,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    overflow: 'hidden',
  },
  stepContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: BRAND_THEME.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_THEME.BORDER,
  },
  backBtn: {
    padding: 8,
  },
  closeBtn: {
    padding: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBox: {
    backgroundColor: BRAND_THEME.PRIMARY,
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: BRAND_THEME.PRIMARY,
  },

  // Step 1
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BRAND_THEME.PRIMARY,
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: BRAND_THEME.SURFACE,
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND_THEME.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  productCardTop: {
    flexDirection: 'row',
    gap: 16,
  },
  imgPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: BRAND_THEME.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BRAND_THEME.BORDER,
  },
  productImg: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: BRAND_THEME.TEXT_MAIN,
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 12,
    color: BRAND_THEME.TEXT_MUTED,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: BRAND_THEME.TEXT_MAIN,
  },
  productCardBottom: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BRAND_THEME.BORDER,
    alignItems: 'flex-end',
  },
  primaryBtn: {
    backgroundColor: BRAND_THEME.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Step 2 & 3 text
  methodTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: BRAND_THEME.TEXT_MAIN,
    marginBottom: 6,
  },
  methodSub: {
    fontSize: 14,
    color: BRAND_THEME.TEXT_MUTED,
    marginBottom: 24,
    lineHeight: 20,
  },

  // Method Cards
  methodCard: {
    backgroundColor: BRAND_THEME.SURFACE,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  methodCardActive: {
    borderColor: BRAND_THEME.PRIMARY,
  },
  methodCardInner: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
    gap: 16,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: BRAND_THEME.ACCENT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  recommendedText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  methodIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BRAND_THEME.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconBoxActive: {
    backgroundColor: BRAND_THEME.PRIMARY,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '700',
    color: BRAND_THEME.TEXT_MAIN,
    marginBottom: 4,
  },
  methodNameActive: {
    color: BRAND_THEME.PRIMARY,
  },
  methodDesc: {
    fontSize: 13,
    color: BRAND_THEME.TEXT_MUTED,
    lineHeight: 18,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: BRAND_THEME.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND_THEME.PRIMARY,
  },

  // Summary
  summaryBox: {
    marginTop: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: BRAND_THEME.BORDER,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BRAND_THEME.TEXT_MAIN,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: BRAND_THEME.TEXT_MUTED,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND_THEME.TEXT_MAIN,
  },
  summaryTotalRow: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BRAND_THEME.BORDER,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: BRAND_THEME.TEXT_MAIN,
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: BRAND_THEME.PRIMARY,
  },

  // Footer & Buttons
  footer: {
    padding: 24,
    backgroundColor: BRAND_THEME.SURFACE,
    borderTopWidth: 1,
    borderTopColor: BRAND_THEME.BORDER,
  },
  continueBtn: {
    backgroundColor: BRAND_THEME.PRIMARY,
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  homeBtn: {
    backgroundColor: BRAND_THEME.PRIMARY,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Step 3
  miniProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: BRAND_THEME.SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BRAND_THEME.BORDER,
    marginBottom: 24,
    gap: 12,
  },
  miniImg: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  miniProductTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: BRAND_THEME.TEXT_MAIN,
  },
  reasonsList: {
    gap: 12,
    marginBottom: 24,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_THEME.SURFACE,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BRAND_THEME.BORDER,
    gap: 12,
  },
  reasonItemActive: {
    borderColor: BRAND_THEME.PRIMARY,
    backgroundColor: '#F1F5F9',
  },
  reasonRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND_THEME.PRIMARY,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: BRAND_THEME.TEXT_MAIN,
  },
  commentsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND_THEME.TEXT_MAIN,
    marginBottom: 8,
  },
  commentsInput: {
    backgroundColor: BRAND_THEME.SURFACE,
    borderWidth: 1,
    borderColor: BRAND_THEME.BORDER,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: BRAND_THEME.TEXT_MAIN,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: BRAND_THEME.TEXT_MUTED,
    textAlign: 'right',
    marginTop: 8,
  },

  // Step 4 Confirmation
  confirmationContent: {
    padding: 24,
    alignItems: 'center',
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: BRAND_THEME.TEXT_MAIN,
    marginBottom: 8,
  },
  successSub: {
    fontSize: 14,
    color: BRAND_THEME.TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  qrCard: {
    backgroundColor: BRAND_THEME.SURFACE,
    width: '100%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BRAND_THEME.BORDER,
    marginBottom: 16,
  },
  qrTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: BRAND_THEME.TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  qrBox: {
    padding: 16,
    backgroundColor: BRAND_THEME.BACKGROUND,
    borderRadius: 12,
    marginBottom: 16,
  },
  returnId: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND_THEME.TEXT_MAIN,
    marginBottom: 16,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_THEME.BACKGROUND,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  downloadBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: BRAND_THEME.TEXT_MAIN,
  },
  dropoffCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    width: '100%',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  dropoffIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropoffInfo: {
    flex: 1,
  },
  dropoffTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: BRAND_THEME.PRIMARY,
    marginBottom: 4,
  },
  dropoffName: {
    fontSize: 15,
    fontWeight: '700',
    color: BRAND_THEME.TEXT_MAIN,
    marginBottom: 4,
  },
  dropoffAddress: {
    fontSize: 12,
    color: '#3B82F6',
    lineHeight: 18,
  },
});

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EasyBuyBrandLogoProps {
  timeBadgeText?: string;
  timeBadgeBg?: string;
}

export const EasyBuyBrandLogo: React.FC<EasyBuyBrandLogoProps> = ({
  timeBadgeText,
  timeBadgeBg = '#E8F5E9',
}) => {
  return (
    <View style={styles.container}>
      {/* Official EasyBuy Logo Icon (Forest Green Box + Yellow Bag + Check Arrow) */}
      <View style={styles.logoBadgeBox}>
        {/* Yellow Bag Body */}
        <View style={styles.bagBody}>
          {/* Oval Loop with Checkmark & Upward Arrow */}
          <View style={styles.loopCheckContainer}>
            <Ionicons name="checkmark-circle" size={14} color="#1E513B" />
          </View>
        </View>
      </View>

      <Text style={styles.brandTitle}>EasyBuy</Text>

      {/* Dynamic Time Edition Badge */}
      {timeBadgeText && (
        <View style={[styles.timeBadge, { backgroundColor: timeBadgeBg }]}>
          <Text style={styles.timeBadgeText}>{timeBadgeText}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  logoBadgeBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#1E513B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    shadowColor: '#1E513B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bagBody: {
    width: 20,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#F5B743',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  loopCheckContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E513B',
    letterSpacing: -0.4,
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8EADF',
  },
  timeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#166534',
  },
});

// Product Details Screen
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Product } from '../types/product';

interface Props {
  product: Product;
  fromCache: boolean;
  onClose: () => void;
}

export default function ProductScreen({ product, fromCache, onClose }: Props) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>← Back</Text>
        </TouchableOpacity>
        {fromCache && (
          <View style={styles.cacheBadge}>
            <Text style={styles.cacheText}>📦 Cached</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        {product.image_url ? (
          <Image source={{ uri: product.image_url }} style={styles.image} />
        ) : (
          <View style={styles.noImage}>
            <Text style={styles.noImageText}>🍽️</Text>
          </View>
        )}

        {/* Product Info */}
        <Text style={styles.name}>{product.name}</Text>
        {product.brand && <Text style={styles.brand}>{product.brand}</Text>}
        <Text style={styles.barcode}>Barcode: {product.barcode}</Text>

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Ingredients</Text>
          {product.ingredients.length > 0 ? (
            product.ingredients.map((ing, idx) => (
              <View key={ing.id} style={styles.ingredientItem}>
                <Text style={styles.ingredientText}>
                  {idx + 1}. {ing.text}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>No ingredient data available for this product</Text>
          )}
        </View>

        {/* Nutrition Facts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Nutrition (per 100g)</Text>
          {hasNutritionData(product.nutrition) ? (
            <View style={styles.nutritionGrid}>
              <NutritionRow label="Energy" value={product.nutrition.energy_kcal} unit="kcal" />
              <NutritionRow label="Fat" value={product.nutrition.fat} unit="g" />
              <NutritionRow label="Saturated Fat" value={product.nutrition.saturated_fat} unit="g" />
              <NutritionRow label="Carbs" value={product.nutrition.carbohydrates} unit="g" />
              <NutritionRow label="Sugars" value={product.nutrition.sugars} unit="g" />
              <NutritionRow label="Fiber" value={product.nutrition.fiber} unit="g" />
              <NutritionRow label="Protein" value={product.nutrition.proteins} unit="g" />
              <NutritionRow label="Salt" value={product.nutrition.salt} unit="g" />
            </View>
          ) : (
            <Text style={styles.noData}>No nutrition data available for this product</Text>
          )}
        </View>

        {/* Additives */}
        {product.additives && product.additives.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Additives</Text>
            <View style={styles.tagContainer}>
              {product.additives.map((add, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{add}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Allergens */}
        {product.allergens && product.allergens.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 Allergens</Text>
            <View style={styles.tagContainer}>
              {product.allergens.map((all, idx) => (
                <View key={idx} style={[styles.tag, styles.allergenTag]}>
                  <Text style={styles.tagText}>{all}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

function NutritionRow({ label, value, unit }: { label: string; value?: number; unit: string }) {
  if (value === undefined) return null;
  return (
    <View style={styles.nutritionRow}>
      <Text style={styles.nutritionLabel}>{label}</Text>
      <Text style={styles.nutritionValue}>{value.toFixed(1)} {unit}</Text>
    </View>
  );
}

function hasNutritionData(nutrition: any): boolean {
  return Object.values(nutrition).some(v => v !== undefined && v !== null);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  cacheBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cacheText: {
    fontSize: 12,
    color: '#1976D2',
  },
  scroll: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
  noImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 60,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  brand: {
    fontSize: 16,
    color: '#757575',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  barcode: {
    fontSize: 12,
    color: '#9E9E9E',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  ingredientItem: {
    paddingVertical: 6,
  },
  ingredientText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  noData: {
    fontSize: 14,
    color: '#9E9E9E',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  nutritionGrid: {
    gap: 8,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#616161',
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  allergenTag: {
    backgroundColor: '#FFEBEE',
  },
  tagText: {
    fontSize: 13,
    color: '#424242',
  },
  bottomPadding: {
    height: 40,
  },
});

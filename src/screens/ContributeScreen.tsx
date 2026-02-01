// Contribute Screen - Let users add missing product data
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { extractTextFromImage, OCRResult } from '../services/ocrService';
import { submitContribution, uploadLabelImage, isSupabaseConfigured } from '../services/supabaseService';

interface Props {
  barcode: string;
  productName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'capture' | 'review' | 'submit';

export default function ContributeScreen({ barcode, productName, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('capture');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [editedIngredients, setEditedIngredients] = useState<string>('');
  const [editedName, setEditedName] = useState(productName || '');
  const [brand, setBrand] = useState('');
  const [loading, setLoading] = useState(false);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      processImage(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      processImage(result.assets[0].uri);
    }
  };

  const processImage = async (uri: string) => {
    setImageUri(uri);
    setLoading(true);

    const result = await extractTextFromImage(uri);
    setOcrResult(result);
    
    if (result.success) {
      setEditedIngredients(result.ingredients.join(', '));
    }
    
    setLoading(false);
    setStep('review');
  };

  const handleSubmit = async () => {
    if (!editedName.trim()) {
      Alert.alert('Missing Info', 'Please enter a product name');
      return;
    }
    if (!editedIngredients.trim()) {
      Alert.alert('Missing Info', 'Please enter at least some ingredients');
      return;
    }

    setLoading(true);
    setStep('submit');

    try {
      // Upload image if we have one
      let uploadedImageUrl: string | undefined;
      if (imageUri) {
        const url = await uploadLabelImage(barcode, imageUri);
        if (url) uploadedImageUrl = url;
      }

      // Parse ingredients back to array
      const ingredientsParsed = editedIngredients
        .split(/[,;،]/)
        .map(i => i.trim())
        .filter(i => i.length > 0);

      // Submit contribution
      const result = await submitContribution({
        barcode,
        product_name: editedName.trim(),
        brand: brand.trim() || undefined,
        ingredients_text: editedIngredients,
        ingredients_parsed: ingredientsParsed,
        image_url: uploadedImageUrl,
      });

      setLoading(false);

      if (result.success) {
        Alert.alert(
          '🎉 Thank You!',
          'Your contribution has been submitted for review. Other users will be able to use this data once approved!',
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to submit. Please try again.');
        setStep('review');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setStep('review');
    }
  };

  // Warning if Supabase not configured
  if (!isSupabaseConfigured()) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningTitle}>Backend Not Configured</Text>
          <Text style={styles.warningText}>
            Community contributions require a Supabase backend.{'\n\n'}
            This feature will be available once the backend is set up.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contribute Data</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Capture */}
        {step === 'capture' && (
          <View style={styles.stepContainer}>
            <Text style={styles.dogIcon}>🐕‍🦺</Text>
            <Text style={styles.title}>Help Us Sniff It Out!</Text>
            <Text style={styles.subtitle}>
              Take a photo of the ingredient label so others can benefit from this product's data.
            </Text>
            
            <Text style={styles.barcodeInfo}>Barcode: {barcode}</Text>

            <TouchableOpacity style={styles.primaryButton} onPress={takePhoto}>
              <Text style={styles.primaryButtonText}>📷 Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={pickImage}>
              <Text style={styles.secondaryButtonText}>🖼️ Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Review */}
        {step === 'review' && (
          <View style={styles.stepContainer}>
            {loading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>🔍 Sniffing out ingredients...</Text>
              </View>
            ) : (
              <>
                {imageUri && (
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                )}

                {ocrResult && !ocrResult.success && (
                  <View style={styles.warningBox}>
                    <Text style={styles.warningBoxText}>
                      ⚠️ Couldn't read text clearly. Please type the ingredients manually.
                    </Text>
                  </View>
                )}

                <Text style={styles.inputLabel}>Product Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="e.g., Egyptian Seeds"
                  placeholderTextColor="#999"
                />

                <Text style={styles.inputLabel}>Brand</Text>
                <TextInput
                  style={styles.textInput}
                  value={brand}
                  onChangeText={setBrand}
                  placeholder="e.g., Al Rifai"
                  placeholderTextColor="#999"
                />

                <Text style={styles.inputLabel}>Ingredients *</Text>
                <Text style={styles.inputHint}>
                  Separate with commas. Edit as needed.
                </Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={editedIngredients}
                  onChangeText={setEditedIngredients}
                  placeholder="e.g., Pumpkin seeds, salt, vegetable oil"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />

                <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
                  <Text style={styles.primaryButtonText}>✅ Submit Contribution</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.secondaryButton} 
                  onPress={() => setStep('capture')}
                >
                  <Text style={styles.secondaryButtonText}>📷 Retake Photo</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Step 3: Submitting */}
        {step === 'submit' && loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>📤 Submitting your contribution...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#212121',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  stepContainer: {
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  dogIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#616161',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
    lineHeight: 22,
  },
  barcodeInfo: {
    fontSize: 14,
    color: '#9E9E9E',
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#E0E0E0',
  },
  warningBox: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  warningBoxText: {
    color: '#E65100',
    fontSize: 14,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#424242',
    alignSelf: 'flex-start',
    marginBottom: 6,
    marginTop: 12,
  },
  inputHint: {
    fontSize: 13,
    color: '#9E9E9E',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#212121',
    width: '100%',
  },
  textArea: {
    minHeight: 120,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#616161',
  },
  warningIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 12,
  },
  warningText: {
    fontSize: 15,
    color: '#616161',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 22,
  },
});

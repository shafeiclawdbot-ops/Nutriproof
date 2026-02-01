// Nutriproof - Food Scanner App
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import ProductScreen from './src/screens/ProductScreen';
import ContributeScreen from './src/screens/ContributeScreen';
import { Product, ScanResult } from './src/types/product';
import { initDatabase } from './src/services/database';
import { scanProduct } from './src/services/productService';

type Screen = 'home' | 'scanner' | 'product' | 'contribute';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentBarcode, setCurrentBarcode] = useState<string>('');
  const [fromCache, setFromCache] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    // Initialize database on app start
    initDatabase()
      .then(() => setLoading(false))
      .catch((err) => {
        console.error('DB init error:', err);
        setLoading(false);
      });
  }, []);

  const handleScan = async (barcode: string) => {
    setScanning(true);
    setCurrentBarcode(barcode);
    const result: ScanResult = await scanProduct(barcode);
    setScanning(false);

    if (result.success && result.product) {
      setCurrentProduct(result.product);
      setFromCache(result.source === 'cache');
      setScreen('product');
    } else {
      // Product not found - offer to contribute
      setCurrentProduct(null);
      setScreen('contribute');
    }
  };

  const handleProductFromHistory = (product: Product) => {
    setCurrentProduct(product);
    setCurrentBarcode(product.barcode);
    setFromCache(true);
    setScreen('product');
  };

  const handleContribute = () => {
    setScreen('contribute');
  };

  const handleContributeSuccess = () => {
    setScreen('home');
    setCurrentProduct(null);
    setCurrentBarcode('');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Starting Nutriproof...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  if (scanning) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>🐕 Sniffing for product...</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {screen === 'home' && (
        <HomeScreen
          onScanPress={() => setScreen('scanner')}
          onProductPress={handleProductFromHistory}
        />
      )}
      {screen === 'scanner' && (
        <ScannerScreen onScan={handleScan} />
      )}
      {screen === 'product' && currentProduct && (
        <ProductScreen
          product={currentProduct}
          fromCache={fromCache}
          onClose={() => {
            setScreen('home');
            setCurrentProduct(null);
          }}
          onContribute={handleContribute}
        />
      )}
      {screen === 'contribute' && (
        <ContributeScreen
          barcode={currentBarcode}
          productName={currentProduct?.name}
          onClose={() => {
            if (currentProduct) {
              setScreen('product');
            } else {
              setScreen('scanner');
            }
          }}
          onSuccess={handleContributeSuccess}
        />
      )}
      <StatusBar style={screen === 'scanner' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
});

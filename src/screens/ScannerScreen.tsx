// Barcode Scanner Screen
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';

interface Props {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function ScannerScreen({ onScan, onClose }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButtonTop} onPress={onClose}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.message}>
          Camera permission is required to scan barcodes
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    onScan(data);
    setTimeout(() => setScanned(false), 2000);
  };

  return (
    <View style={styles.container}>
      {/* Camera - no children to avoid warning */}
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      
      {/* Overlay with absolute positioning */}
      <View style={styles.overlay} pointerEvents="box-none">
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        
        {/* Scan frame */}
        <View style={styles.scanArea}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        
        <Text style={styles.hint}>
          {scanned ? '🐕 Sniffing...' : 'Point at a barcode'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonTop: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scanArea: {
    width: 280,
    height: 180,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#4CAF50',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  hint: {
    marginTop: 30,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

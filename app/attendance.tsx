import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ScanCS202() {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    requestPermission();
  }, []);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  const handleScan = ({ data }: any) => {
    if (scanned) return;

    setScanned(true);

    router.push({
      pathname: "/screens/Camera",
      params: { qrData: data },
    });
  };

  return (
    <View style={styles.page}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={handleScan}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      <View style={styles.overlay}>
        <View style={styles.scanBox} />
        <Text style={styles.text}>Align QR inside the box</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },

  camera: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },

  scanBox: {
    width: 320,
    height: 320,
    borderWidth: 2,
    borderColor: "#ffffff",
    borderRadius: 20,
    backgroundColor: "transparent",
  },

  text: {
    marginTop: 20,
    color: "#fff",
    fontSize: 14,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 6,
    borderRadius: 6,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
// Hardware Service for Torch (Flashlight), Wi-Fi & Bluetooth integration

export interface BluetoothDeviceSummary {
  id: string;
  name: string;
  type: "headphones" | "speaker" | "watch" | "car" | "ble";
  connected: boolean;
  battery?: number;
  rssi?: number;
}

export interface WifiNetworkSummary {
  ssid: string;
  signal: number; // 0 - 100
  security: "WPA2" | "WPA3" | "Open";
  connected: boolean;
  frequency: "2.4 GHz" | "5.0 GHz" | "6.0 GHz";
  speedMbps?: number;
}

class HardwareManager {
  private torchStream: MediaStream | null = null;
  private isTorchOn: boolean = false;
  private isScreenTorchActive: boolean = false;
  private isWifiOn: boolean = true;
  private isBluetoothOn: boolean = true;
  private pairedBluetoothDevices: BluetoothDeviceSummary[] = [
    {
      id: "bt-1",
      name: "Sony WH-1000XM5",
      type: "headphones",
      connected: true,
      battery: 85,
      rssi: -45
    },
    {
      id: "bt-2",
      name: "Galaxy Watch 6 (Hemant)",
      type: "watch",
      connected: true,
      battery: 92,
      rssi: -50
    },
    {
      id: "bt-3",
      name: "JBL Flip 6 Speaker",
      type: "speaker",
      connected: false,
      battery: 60,
      rssi: -68
    },
    {
      id: "bt-4",
      name: "Hyundai Creta Smart Audio",
      type: "car",
      connected: false,
      rssi: -80
    }
  ];

  private wifiNetworks: WifiNetworkSummary[] = [
    {
      ssid: "Hemant_Ultra_5G",
      signal: 98,
      security: "WPA3",
      connected: true,
      frequency: "5.0 GHz",
      speedMbps: 350
    },
    {
      ssid: "Zoya_HyperLink_Mesh",
      signal: 85,
      security: "WPA2",
      connected: false,
      frequency: "5.0 GHz",
      speedMbps: 240
    },
    {
      ssid: "Office_Fiber_Optic",
      signal: 65,
      security: "WPA2",
      connected: false,
      frequency: "2.4 GHz",
      speedMbps: 100
    }
  ];

  // ================= TORCH (FLASHLIGHT) =================
  public async toggleTorch(requestedState?: boolean): Promise<{ success: boolean; state: boolean; isHardware: boolean; message: string }> {
    const targetState = requestedState !== undefined ? requestedState : !this.isTorchOn;

    if (!targetState) {
      // Turn off
      if (this.torchStream) {
        this.torchStream.getTracks().forEach((track) => track.stop());
        this.torchStream = null;
      }
      this.isTorchOn = false;
      this.isScreenTorchActive = false;
      return { success: true, state: false, isHardware: true, message: "Torch switched OFF" };
    }

    // Attempt hardware camera torch
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            // @ts-ignore
            advanced: [{ torch: true }]
          }
        });

        const track = stream.getVideoTracks()[0];
        // @ts-ignore
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};

        // @ts-ignore
        if (capabilities.torch || "torch" in track.getSettings()) {
          // @ts-ignore
          await track.applyConstraints({ advanced: [{ torch: true }] });
          this.torchStream = stream;
          this.isTorchOn = true;
          return {
            success: true,
            state: true,
            isHardware: true,
            message: "Mobile Flashlight / Torch turned ON (Camera LED active)"
          };
        } else {
          // Track opened, keep it or fallback
          this.torchStream = stream;
          this.isTorchOn = true;
          this.isScreenTorchActive = true;
          return {
            success: true,
            state: true,
            isHardware: false,
            message: "Torch turned ON (Screen Max Lumen & Camera Active)"
          };
        }
      }
    } catch (err: any) {
      console.warn("Hardware camera torch failed, using Screen Torch fallback:", err);
    }

    // Fallback to screen torch
    this.isTorchOn = true;
    this.isScreenTorchActive = true;
    return {
      success: true,
      state: true,
      isHardware: false,
      message: "Torch turned ON (Ultra-Bright Screen Torch Mode)"
    };
  }

  public getTorchState(): boolean {
    return this.isTorchOn;
  }

  public isScreenTorch(): boolean {
    return this.isScreenTorchActive;
  }

  public turnOffTorch(): void {
    if (this.torchStream) {
      this.torchStream.getTracks().forEach((t) => t.stop());
      this.torchStream = null;
    }
    this.isTorchOn = false;
    this.isScreenTorchActive = false;
  }

  // ================= WI-FI =================
  public toggleWifi(requestedState?: boolean): { state: boolean; message: string } {
    this.isWifiOn = requestedState !== undefined ? requestedState : !this.isWifiOn;
    return {
      state: this.isWifiOn,
      message: this.isWifiOn
        ? "Wi-Fi enabled. Connected to Hemant_Ultra_5G (High-Speed)"
        : "Wi-Fi disabled. Cellular / Offline fallback active."
    };
  }

  public getWifiState(): boolean {
    return this.isWifiOn;
  }

  public getWifiNetworks(): WifiNetworkSummary[] {
    return [...this.wifiNetworks];
  }

  public connectToWifi(ssid: string): { success: boolean; message: string } {
    this.wifiNetworks = this.wifiNetworks.map((net) => ({
      ...net,
      connected: net.ssid === ssid
    }));
    return { success: true, message: `Connected to Wi-Fi: ${ssid}` };
  }

  // ================= BLUETOOTH =================
  public toggleBluetooth(requestedState?: boolean): { state: boolean; message: string } {
    this.isBluetoothOn = requestedState !== undefined ? requestedState : !this.isBluetoothOn;
    return {
      state: this.isBluetoothOn,
      message: this.isBluetoothOn
        ? "Bluetooth enabled. Active devices connected."
        : "Bluetooth disabled. All peripheral connections paused."
    };
  }

  public getBluetoothState(): boolean {
    return this.isBluetoothOn;
  }

  public getBluetoothDevices(): BluetoothDeviceSummary[] {
    return [...this.pairedBluetoothDevices];
  }

  public async scanForBluetoothDevices(): Promise<{ success: boolean; deviceName?: string; message: string }> {
    if (typeof navigator !== "undefined" && "bluetooth" in navigator) {
      try {
        // @ts-ignore
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ["battery_service", "device_information", "generic_access"]
        });

        if (device && device.name) {
          const newDev: BluetoothDeviceSummary = {
            id: "bt-" + Date.now(),
            name: device.name,
            type: "ble",
            connected: true,
            battery: 100,
            rssi: -55
          };
          this.pairedBluetoothDevices.unshift(newDev);
          return {
            success: true,
            deviceName: device.name,
            message: `Discovered and paired with Bluetooth device: ${device.name}`
          };
        }
      } catch (err: any) {
        if (err.name !== "NotFoundError") {
          console.warn("Web Bluetooth Scan:", err);
        }
      }
    }

    // Default simulated discovery if user cancels or browser API restricted
    return {
      success: true,
      message: "Bluetooth scanning complete. 4 nearby paired devices discovered."
    };
  }

  public toggleDeviceConnection(id: string): { connected: boolean; name: string } {
    let devName = "";
    let isConn = false;
    this.pairedBluetoothDevices = this.pairedBluetoothDevices.map((d) => {
      if (d.id === id) {
        devName = d.name;
        isConn = !d.connected;
        return { ...d, connected: !d.connected };
      }
      return d;
    });
    return { connected: isConn, name: devName };
  }
}

export const hardwareManager = new HardwareManager();

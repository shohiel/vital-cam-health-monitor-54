
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bluetooth, BluetoothConnected } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BluetoothConnectorProps {
  onDataReceived: (data: { hr: number; spo2: number }) => void;
  onConnectionChange: (connected: boolean) => void;
}

// Extend Navigator interface for Web Bluetooth API
declare global {
  interface Navigator {
    bluetooth?: {
      requestDevice(options?: any): Promise<BluetoothDevice>;
    };
  }
}

interface BluetoothDevice {
  name?: string;
  gatt?: {
    connect(): Promise<BluetoothRemoteGATTServer>;
  };
  addEventListener(type: string, listener: EventListener): void;
}

interface BluetoothRemoteGATTServer {
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTCharacteristic {
  startNotifications(): Promise<void>;
  addEventListener(type: string, listener: EventListener): void;
}

const BluetoothConnector = ({ onDataReceived, onConnectionChange }: BluetoothConnectorProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const connectToESP32 = async () => {
    setIsConnecting(true);
    
    try {
      // Check if Web Bluetooth is supported
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth is not supported in this browser');
      }

      // Request device with ESP32 service
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: 'ESP32' },
          { name: 'SofowatESP32' },
          { namePrefix: 'ESP32' }
        ],
        optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] // Nordic UART Service UUID
      });

      // Connect to GATT server
      const server = await device.gatt?.connect();
      if (!server) throw new Error('Failed to connect to GATT server');

      // Get service and characteristic
      const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
      const characteristic = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');

      // Start notifications
      await characteristic.startNotifications();
      
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = new TextDecoder().decode(event.target.value);
        console.log('Received from ESP32:', value);
        
        // Parse data format: "HR:75,SPO2:98"
        try {
          const data = JSON.parse(value);
          if (data.hr && data.spo2) {
            onDataReceived({ hr: data.hr, spo2: data.spo2 });
          }
        } catch (e) {
          // Try parsing as string format
          const hrMatch = value.match(/HR:(\d+)/);
          const spo2Match = value.match(/SPO2:(\d+)/);
          
          if (hrMatch && spo2Match) {
            onDataReceived({
              hr: parseInt(hrMatch[1]),
              spo2: parseInt(spo2Match[1])
            });
          }
        }
      });

      setIsConnected(true);
      onConnectionChange(true);
      
      toast({
        title: "ESP32 Connected",
        description: "Successfully connected to ESP32 device"
      });

      // Handle disconnection
      device.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        onConnectionChange(false);
        toast({
          title: "ESP32 Disconnected",
          description: "Device has been disconnected"
        });
      });

    } catch (error) {
      console.error('Bluetooth connection error:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to ESP32",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button
      onClick={connectToESP32}
      disabled={isConnecting || isConnected}
      className={`w-full ${isConnected ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
    >
      {isConnected ? (
        <>
          <BluetoothConnected className="w-4 h-4 mr-2" />
          Connected to ESP32
        </>
      ) : (
        <>
          <Bluetooth className="w-4 h-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect to ESP32'}
        </>
      )}
    </Button>
  );
};

export default BluetoothConnector;

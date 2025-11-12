"use client"; 
// ✅ Tells Next.js that this code runs on the client (browser) side

import { useEffect, useCallback, useRef } from 'react';

// ✅ Define the types of props this custom hook will accept
interface UseBarcodeProps {
  onScan: (barcode: string) => void; // Function to call when a full barcode is detected
  enabled?: boolean; // Optional: whether scanning is active or not
  timeout?: number;  // Optional: time (ms) after which input buffer resets if no key pressed
}

// ✅ The custom hook itself
export const useBarcode = ({ 
  onScan, 
  enabled = true,  // Default: scanning is enabled
  timeout = 100     // Default: 100ms timeout between key presses
}: UseBarcodeProps) => {

  // 🧠 'barcodeBuffer' stores characters coming from barcode input
  const barcodeBuffer = useRef<string>('');  

  // ⏱ 'timeoutRef' stores a timer ID, so we can clear it when needed
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🧩 'handleKeyPress' runs every time a key is pressed
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!enabled) return; // If scanning disabled, do nothing

    // 🔄 Clear any existing timeout (because a new key was pressed)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // ⏎ If the Enter key is pressed, barcode input is complete
    if (event.key === 'Enter') {
      if (barcodeBuffer.current.length > 0) {
        // ✅ Call the provided callback function with the barcode string
        onScan(barcodeBuffer.current);
        // 🔄 Reset the buffer for the next barcode
        barcodeBuffer.current = '';
      }
      return;
    }

    // 🔤 If a normal character key (length === 1) is pressed, add it to buffer
    if (event.key.length === 1) {
      barcodeBuffer.current += event.key;

      // 🕐 Start/reset a timeout — if no key is pressed for 'timeout' ms, clear the buffer
      timeoutRef.current = setTimeout(() => {
        barcodeBuffer.current = ''; // Clear incomplete barcode
      }, timeout);
    }
  }, [enabled, onScan, timeout]); 
  // 👆 Dependencies: recreate this callback if these values change

  // 📡 useEffect sets up the event listener and cleanup
  useEffect(() => {
    // 🖱 Listen to all keypress events on the page
    document.addEventListener('keypress', handleKeyPress);

    return () => {
      // 🧹 Cleanup when hook unmounts or dependencies change
      document.removeEventListener('keypress', handleKeyPress);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleKeyPress]);
};

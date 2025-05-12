// /* eslint-disable lingui/no-unlocalized-strings */
// // TODO: i18n this file once Marchfeld is readyimport { showToast } from '~components/common/Toaster';
// import { sendAdvertisementData } from '~services/washroom-api';

// interface AdvertisementData {
//   networkId: string;
//   manufacturerData: string;
//   deviceType: number;
//   oemType: number;
//   timestamp: number;
//   deviceId: number;
// }

// const QUEUE_TIMEOUT = 10000; // 10 seconds in milliseconds

// // Private state using closure
// const queues = new Map<string, AdvertisementData[]>();
// let isScanning = false;

// const cleanup = (networkId: string, currentTime: number): void => {
//   let queue = queues.get(networkId);
//   if (!queue) return;

//   // Remove entries older than QUEUE_TIMEOUT
//   queue = queue.filter((item) => currentTime - item.timestamp < QUEUE_TIMEOUT);

//   if (queue.length === 0) {
//     queues.delete(networkId);
//   } else {
//     queues.set(networkId, queue);
//   }
// };

// export const advertisementQueue = {
//   startScanSession(): void {
//     isScanning = true;
//     // Clear any existing queues when starting a new scan session
//     queues.clear();
//   },

//   endScanSession(): void {
//     isScanning = false;
//     // Clear all queues when ending the scan session
//     queues.clear();
//   },

//   async addAdvertisement({
//     networkId,
//     manufacturerData,
//     deviceType,
//     oemType,
//     deviceId,
//   }: Omit<AdvertisementData, 'timestamp'>): Promise<{
//     success: boolean;
//     deviceId: number;
//   }> {
//     if (!isScanning) return { success: false, deviceId };

//     const now = Date.now();
//     const data: AdvertisementData = {
//       networkId,
//       manufacturerData,
//       deviceType,
//       oemType,
//       timestamp: now,
//       deviceId,
//     };

//     // Get or create queue for this networkId
//     const queue = queues.get(networkId) || [];

//     // Check if we have identical data in the queue for this specific device
//     const isDuplicate = queue.some(
//       (item) =>
//         item.manufacturerData === manufacturerData &&
//         item.networkId === networkId
//     );

//     if (!isDuplicate) {
//       console.log('New data from device:', networkId, {
//         deviceType,
//         oemType,
//         manufacturerData,
//       });

//       // Add to queue
//       queue.push(data);
//       queues.set(networkId, queue);

//       // Send the data to backend
//       try {
//         await sendAdvertisementData({ networkId, manufacturerData });
//         return { success: true, deviceId };
//       } catch (error) {
//         console.error('Failed to send advertisement data:', error);
//         return { success: false, deviceId };
//       }
//     }

//     // Clean up old entries
//     cleanup(networkId, now);
//     return { success: false, deviceId };
//   },

//   clearQueue(networkId: string): void {
//     queues.delete(networkId);
//   },

//   clearAllQueues(): void {
//     queues.clear();
//   },

//   // Debug method to get current queue state
//   getQueueState(): Map<string, AdvertisementData[]> {
//     return new Map(queues);
//   },
// };

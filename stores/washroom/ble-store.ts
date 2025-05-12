import { create } from "zustand";

export type ResourceValue = {
  tlvId: number;
  value: any;
  resourceType: number;
  instance: number;
  tms: number;
};

export type PendingRequest = {
  tlvId: number;
  resourceType: number;
  instance: number;
  tms: number;
};

interface DeviceBleData {
  thingseeId: string;
  resources: ResourceValue[];
  pendingRequests: PendingRequest[];
}

interface BleState {
  devices: DeviceBleData[];
}

interface BleActions {
  actions: {
    addPendingRequest: (thingseeId: string, request: PendingRequest) => void;
    resolvePendingRequest: (
      thingseeId: string,
      tlvId: number,
      value: any
    ) => void;
    clearDevice: (thingseeId: string) => void;
    resetStore: () => void;
  };
}

export const bleStore = create<BleState & BleActions>((set, get) => ({
  devices: [],

  actions: {
    addPendingRequest: (thingseeId, request) => {
      const state = get();
      const device = state.devices.find((d) => d.thingseeId === thingseeId);

      if (device) {
        device.pendingRequests.push(request);
      } else {
        state.devices.push({
          thingseeId,
          resources: [],
          pendingRequests: [request],
        });
      }

      set({ devices: [...state.devices] });
    },

    resolvePendingRequest: (thingseeId, tlvId, value) => {
      const state = get();
      const device = state.devices.find((d) => d.thingseeId === thingseeId);
      if (!device) return;

      const reqIndex = device.pendingRequests.findIndex(
        (r) => r.tlvId === tlvId
      );
      if (reqIndex === -1) return;

      const [request] = device.pendingRequests.splice(reqIndex, 1);

      // Replace or add new resource value
      const existingIndex = device.resources.findIndex(
        (res) =>
          res.resourceType === request.resourceType &&
          res.instance === request.instance
      );

      const newResourceValue: ResourceValue = {
        tlvId,
        value,
        resourceType: request.resourceType,
        instance: request.instance,
        tms: Date.now(),
      };

      if (existingIndex !== -1) {
        device.resources[existingIndex] = newResourceValue;
      } else {
        device.resources.push(newResourceValue);
      }
      console.log(`🔁 TLV ${tlvId} resolved with value:`, value);
      set({ devices: [...state.devices] });
    },

    clearDevice: (thingseeId) => {
      const updated = get().devices.filter((d) => d.thingseeId !== thingseeId);
      set({ devices: updated });
    },

    resetStore: () => {
      set({ devices: [] });
    },
  },
}));

const useBleStore = bleStore;

export const useBleDevices = () => useBleStore((s) => s.devices);

export const useBleActions = () => useBleStore((s) => s.actions);

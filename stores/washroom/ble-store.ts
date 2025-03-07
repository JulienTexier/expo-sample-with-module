import { create } from "zustand";
import { DecryptedMessagePayload } from "~modules/hsm-device-communications";

interface BLEState {
  activeRequests: {
    id: string;
    requests: Record<
      number,
      { value: string | null; instance: number; resourceType: number }
    >;
  }[];
  addRequest: (
    deviceId: string,
    tlvId: number,
    instance: number,
    resourceType: number
  ) => void;
  handleResponse: (deviceId: string, response: DecryptedMessagePayload) => void;
}

export const bleStore = create<BLEState>((set) => ({
  activeRequests: [],
  addRequest: (deviceId, tlvId, instance, resourceType) =>
    set((state) => {
      const deviceIndex = state.activeRequests.findIndex(
        (d) => d.id === deviceId
      );
      const newRequests = [...state.activeRequests];

      if (deviceIndex === -1) {
        newRequests.push({
          id: deviceId,
          requests: { [tlvId]: { value: null, instance, resourceType } },
        });
      } else {
        newRequests[deviceIndex].requests[tlvId] = {
          value: null,
          instance,
          resourceType,
        };
      }
      return { activeRequests: newRequests };
    }),

  handleResponse: (deviceId, response) =>
    set((state) => {
      const deviceIndex = state.activeRequests.findIndex(
        (d) => d.id === deviceId
      );
      if (deviceIndex === -1) return state;
      const newRequests = [...state.activeRequests];
      newRequests[deviceIndex].requests[response.tlvId] = {
        ...newRequests[deviceIndex].requests[response.tlvId],
        value: response.value,
      };

      return { activeRequests: newRequests };
    }),
}));

export const useBleStore = bleStore;

export function addRequest(
  deviceId: string,
  tlvId: number,
  instance: number,
  resourceType: number
) {
  bleStore.getState().addRequest(deviceId, tlvId, instance, resourceType);
}

export function handleResponse(
  deviceId: string,
  response: DecryptedMessagePayload
) {
  bleStore.getState().handleResponse(deviceId, response);
}

export function clearStore() {
  bleStore.getState().activeRequests = [];
}

export const activeRequests = bleStore.getState().activeRequests;

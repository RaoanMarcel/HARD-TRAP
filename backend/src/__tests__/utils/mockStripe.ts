import { vi } from "vitest";

export const stripeMocks = {
  create: vi.fn(),
};

export default function StripeMock() {
  return {
    paymentIntents: {
      create: stripeMocks.create,
    },
  };
}
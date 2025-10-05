import { vi } from "vitest";

export const uploadImageToCloudinary = vi.fn();

export const clearUploadMocks = () => {
  uploadImageToCloudinary.mockReset();
};

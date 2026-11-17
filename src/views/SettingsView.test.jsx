import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SettingsView from "./SettingsView";
import { supabase } from "../supabaseClient";
import { vi } from "vitest";

// Mock Supabase
vi.mock("../supabaseClient", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    }),
  },
}));

describe("SettingsView Edge Cases & Coverage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Menangani error saat memuat pengaturan (Baris 28)", async () => {
    supabase.from().maybeSingle.mockRejectedValueOnce(new Error("Database offline"));

    render(<SettingsView />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Pengaturan toko gagal dimuat: Database offline");
    });
  });

  test("Menangani error saat gagal menyimpan pengaturan (Baris 75-77)", async () => {
    // Berhasil load data awal
    supabase.from().maybeSingle.mockResolvedValueOnce({
      data: { id: 1, store_name: "Toko Awal" },
      error: null
    });
    // Gagal saat update
    supabase.from().single.mockRejectedValueOnce(new Error("Gagal mengupdate data"));

    render(<SettingsView />);

    // Tunggu loading selesai
    await waitFor(() => {
      expect(screen.getByLabelText(/Nama Toko/i)).toHaveValue("Toko Awal");
    });

    // Simpan pengaturan
    fireEvent.click(screen.getByRole("button", { name: /Simpan Pengaturan/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Pengaturan toko gagal disimpan: Gagal mengupdate data");
    });
  });
});
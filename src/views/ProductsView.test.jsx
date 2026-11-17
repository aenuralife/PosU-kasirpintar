import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProductsView from "../views/ProductsView";
import { supabase } from "../supabaseClient";
import { vi } from "vitest";

// Mock Supabase & window methods
vi.mock("../supabaseClient", () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      }),
    },
  },
}));

describe("ProductsView Edge Cases & Error Handling", () => {
  // Variabel ini sekarang bisa diakses oleh SEMUA tes di dalam blok describe ini
  const mockProducts = [
    { id: 1, name: "Kopi Susu", price: 18000, stock: 10, category: "Coffee" },
  ];

  beforeAll(() => {
    window.scrollTo = vi.fn(); // Atasi error jsdom untuk window.scrollTo
    window.URL.createObjectURL = vi.fn(() => "blob:mock-url");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("Validasi upload gambar: format salah dan ukuran melebihi 5MB", async () => {
    render(<ProductsView products={mockProducts} />);
    const fileInput = screen.getByLabelText(/Upload gambar/i);

    // Test format salah
    const txtFile = new File(["hello"], "hello.txt", { type: "text/plain" });
    fireEvent.change(fileInput, { target: { files: [txtFile] } });
    
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Gunakan gambar JPG, PNG/i,
    );

    // Test ukuran > 5MB
    const largeFile = new File(["x".repeat(6 * 1024 * 1024)], "large.png", {
      type: "image/png",
    });
    Object.defineProperty(largeFile, "size", { value: 6 * 1024 * 1024 });
    fireEvent.change(fileInput, { target: { files: [largeFile] } });
    
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /Ukuran gambar maksimal 5 MB/i,
    );
  });

  test("Menangani batal hapus (window.confirm = false)", async () => {
    window.confirm = vi.fn(() => false);
    const mockOnDelete = vi.fn();
    render(<ProductsView products={mockProducts} onDelete={mockOnDelete} />);

    fireEvent.click(screen.getByRole("button", { name: /Hapus/i }));
    expect(window.confirm).toHaveBeenCalledWith("Hapus produk “Kopi Susu”?");
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  test("Menangani error catch saat submit gagal", async () => {
    const mockOnSave = vi.fn().mockRejectedValue(new Error("Koneksi terputus"));
    render(<ProductsView products={mockProducts} onSave={mockOnSave} />);

    // Isi form seadanya untuk submit
    fireEvent.change(screen.getByLabelText(/Nama produk/i), {
      target: { value: "Produk Baru" },
    });
    fireEvent.change(screen.getByLabelText(/Harga/i), {
      target: { value: "10000" },
    });
    fireEvent.change(screen.getByLabelText(/Stok/i), {
      target: { value: "5" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Tambah produk/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Produk gagal disimpan: Koneksi terputus",
      );
    });
  });

  test("Berhasil mengisi form dan menyimpan produk (dengan gambar valid)", async () => {
    const mockOnSave = vi.fn().mockResolvedValue({});
    supabase.storage.from().upload.mockResolvedValue({ error: null });
    supabase.storage.from().getPublicUrl.mockReturnValue({ 
      data: { publicUrl: "http://mock-url.com/image.png" } 
    });

    render(<ProductsView products={[]} onSave={mockOnSave} userId="user123" />);

    fireEvent.change(screen.getByLabelText(/Nama produk/i), { target: { value: "Teh Manis" } });
    fireEvent.change(screen.getByLabelText(/Kategori/i), { target: { value: "Drinks" } });
    fireEvent.change(screen.getByLabelText(/Harga/i), { target: { value: "5000" } });
    fireEvent.change(screen.getByLabelText(/Stok/i), { target: { value: "20" } });

    const validFile = new File(["dummy"], "teh.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText(/Upload gambar/i), { target: { files: [validFile] } });

    fireEvent.click(screen.getByRole("button", { name: /Tambah produk/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        name: "Teh Manis",
        category: "Drinks",
        price: 5000,
        stock: 20,
        image: "http://mock-url.com/image.png",
        user_id: "user123"
      }));
      expect(screen.getByRole("status")).toHaveTextContent("Produk berhasil ditambahkan.");
    });
  });

  test("Berhasil memuat data saat tombol Edit diklik, lalu dikosongkan saat Batal", () => {
    render(<ProductsView products={mockProducts} />);
    
    fireEvent.click(screen.getByRole("button", { name: /Edit/i }));
    
    expect(screen.getByLabelText(/Nama produk/i)).toHaveValue("Kopi Susu");
    expect(screen.getByLabelText(/Harga/i)).toHaveValue(18000);
    
    fireEvent.click(screen.getByRole("button", { name: /Batal/i }));
    
    expect(screen.getByLabelText(/Nama produk/i)).toHaveValue("");
  });

  test("Berhasil menghapus produk (window.confirm = true)", async () => {
    window.confirm = vi.fn(() => true); 
    const mockOnDelete = vi.fn().mockResolvedValue({});
    render(<ProductsView products={mockProducts} onDelete={mockOnDelete} />);

    fireEvent.click(screen.getByRole("button", { name: /Hapus/i }));
    
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(1); 
      expect(screen.getByRole("status")).toHaveTextContent("Produk berhasil dihapus.");
    });
  });

  test("Gagal menghapus produk (Error dari API)", async () => {
    window.confirm = vi.fn(() => true); 
    const mockOnDelete = vi.fn().mockRejectedValue(new Error("Database error"));
    render(<ProductsView products={mockProducts} onDelete={mockOnDelete} />);

    fireEvent.click(screen.getByRole("button", { name: /Hapus/i }));
    
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Produk gagal dihapus: Database error");
    });
  });

  test("Pencarian produk berdasarkan nama", () => {
    const multipleProducts = [
      ...mockProducts,
      { id: 2, name: "Teh Es", price: 5000, stock: 10, category: "Drinks" }
    ];
    render(<ProductsView products={multipleProducts} />);
    
    expect(screen.getByText("Kopi Susu")).toBeInTheDocument();
    expect(screen.getByText("Teh Es")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Cari produk/i), { target: { value: "teh" } });

    expect(screen.queryByText("Kopi Susu")).not.toBeInTheDocument();
    expect(screen.getByText("Teh Es")).toBeInTheDocument();
  });
});
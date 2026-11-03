# language: id
Fitur: Penjualan pada halaman Sales PosU

  Skenario: Menambahkan produk ke keranjang dan memeriksa total bayar
    Dengan membuka halaman Sales PosU
    Ketika saya menambahkan satu produk yang tersedia ke keranjang
    Maka jumlah item di keranjang bertambah menjadi 1
    Dan total bayar menampilkan nilai yang lebih besar dari nol

  Skenario: Memfilter daftar produk berdasarkan kategori
    Dengan membuka halaman Sales PosU
    Ketika saya memilih kategori "Coffee"
    Maka daftar produk hanya menampilkan produk kategori Coffee
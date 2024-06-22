const express = require("express");
const app = express();
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const port = process.env.PORT || 5000;
const path = require("path");
const PengeluaranRouter = require('./routes/pengeluarans');
const StokRouter = require('./routes/stoks');
const CustomerRouter = require('./routes/customers');
const NonBakuRouter = require('./routes/nonbakus');
const ProdukRouter = require('./routes/productRouter');
const HargaJualRouter = require('./routes/hargajualRouter');
const TransaksiRouter = require('./routes/transaksiRouter');
const TestimoniRouter = require('./routes/testimoniRouter');
const RekapRouter = require('./routes/rekapRouter');
const LaporanRouter = require('./routes/laporanRouter');
const KartuStokRouter = require('./routes/kartustokRouter');
const DashboardRouter = require('./routes/dashboardRouter');
const AuthRouter = require('./routes/AuthRouter');

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

dotenv.config();
// Menggunakan morgan untuk logging informasi request ke konsol
app.use(morgan('dev'))
// Menggunakan cors untuk mengatasi masalah CORS (Cross-Origin Resource Sharing)
app.use(cors())
app.use(
  "/public/uploads",
  express.static(path.join(__dirname + "/public/uploads"))
);

app.use('/api/produk', ProdukRouter)
app.use('/api/testimoni', TestimoniRouter)
app.use('/api/stok', StokRouter)
app.use('/api/dashboard', DashboardRouter)
app.use('/api/auth', AuthRouter)
app.use('/api/customer', CustomerRouter)
app.use('/api/laporan', LaporanRouter)
app.use('/api/kartustok', KartuStokRouter)
app.use('/api/pengeluaran', PengeluaranRouter)
app.use('/api/nonbaku', NonBakuRouter)
app.use('/api/transaksi', TransaksiRouter)
app.use('/api/hargajual', HargaJualRouter)
app.use('/api/rekap', RekapRouter)

app.get("/", (req, res) => {
  res.send("Welcome to API E-COPRINT");
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})
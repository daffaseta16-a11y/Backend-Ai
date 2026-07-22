const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const U = 'https://images.unsplash.com/photo-';
const P = '?w=600&h=600&fit=crop';

const products = [
  // FACIAL WASH (5)
  {
    nama: 'Gentle Bubble Foam Cleanser', brand: "Pretty's", harga: 125000, stok: 150, rating: 4.7,
    skin_type: 'All Skin Types', berat: '120 ml', ukuran: '120ml',
    ingredients: 'Amino Acids, Aloe Vera, Chamomile, Glycerin, Tea Tree, Panthenol',
    manfaat: 'Gentle Cleansing\nRemoves Impurities\nNon-stripping\nSoothes Skin\nMaintains pH Balance',
    cara_pakai: 'Pump 2-3 kali ke tangan basah, busakan, dan pijat lembut ke wajah. Bilas dengan air hangat. Gunakan pagi dan malam.',
    deskripsi: 'Foaming cleanser dengan amino acid yang membersihkan tanpa membuat kulit kering. Busa lembut seperti awan cocok untuk semua jenis kulit.',
    category_id: 1,
    images: [U+'1556228578-0d85b1a4d571'+P, U+'1608248543803-ba4f8c70ae0b'+P, U+'1627389956659-7e72b2c61a8e'+P]
  },
  {
    nama: 'Daily Mild Facial Wash', brand: "Pretty's", harga: 99000, stok: 200, rating: 4.6,
    skin_type: 'Normal, Dry, Sensitive', berat: '150 ml', ukuran: '150ml',
    ingredients: 'Aloe Vera, Green Tea, Glycerin, Allantoin, Vitamin B5, Calendula',
    manfaat: 'Gentle Daily Cleanse\nMaintains pH Balance\nNon-drying\nFreshens Skin\nRemoves Makeup',
    cara_pakai: 'Basahi wajah, pump 1-2 kali, pijat lembut, dan bilas dengan air hangat. Cocok untuk penggunaan pagi dan malam.',
    deskripsi: 'Gel cleanser lembut untuk penggunaan sehari-hari. Diperkaya dengan Aloe Vera dan Green Tea yang menenangkan kulit.',
    category_id: 1,
    images: [U+'1611930022073-b7a4ba5fcccd'+P, U+'1570197053300-69b1b635a694'+P, U+'1556228578-0d85b1a4d571'+P]
  },
  {
    nama: 'Tea Tree Purifying Cleanser', brand: 'Lumina Beauty', harga: 135000, stok: 100, rating: 4.8,
    skin_type: 'Oily, Acne-prone, Combination', berat: '100 ml', ukuran: '100ml',
    ingredients: 'Tea Tree Oil, Salicylic Acid, Niacinamide, Zinc PCA, Centella Asiatica',
    manfaat: 'Fights Acne\nControls Oil\nMinimizes Pores\nAntibacterial\nCalms Inflammation',
    cara_pakai: 'Gunakan pada wajah basah, pijat selama 1 menit fokus pada area berminyak. Bilas hingga bersih.',
    deskripsi: 'Purifying cleanser dengan Tea Tree Oil dan Salicylic Acid untuk mengatasi jerawat dan minyak berlebih.',
    category_id: 1,
    images: [U+'1608248543803-ba4f8c70ae0b'+P, U+'1627389956659-7e72b2c61a8e'+P, U+'1611930022073-b7a4ba5fcccd'+P]
  },
  {
    nama: 'Enzyme Powder Wash', brand: 'PureSkin Lab', harga: 175000, stok: 80, rating: 4.7,
    skin_type: 'All Skin Types, Sensitive', berat: '60 g', ukuran: '60g',
    ingredients: 'Papain Enzyme, Bromelain, Rice Bran, Vitamin C, Kaolin Clay',
    manfaat: 'Gentle Exfoliation\nBrightens Skin\nRemoves Dead Cells\nSmooths Texture\nDeep Pore Cleanse',
    cara_pakai: 'Tuang 1/2 sdt ke telapak tangan, tambah sedikit air, busakan, dan pijat lembut ke wajah. Bilas.',
    deskripsi: 'Powder wash dengan enzyme alami yang teraktivasi dengan air. Eksfoliasi lembut tanpa iritasi.',
    category_id: 1,
    images: [U+'1627389956659-7e72b2c61a8e'+P, U+'1570197053300-69b1b635a694'+P, U+'1608248543803-ba4f8c70ae0b'+P]
  },
  {
    nama: 'Moisture Cream Cleanser', brand: 'Heritage Korea', harga: 115000, stok: 120, rating: 4.5,
    skin_type: 'Dry, Very Dry, Sensitive', berat: '200 ml', ukuran: '200ml',
    ingredients: 'Shea Butter, Squalane, Ceramides, Royal Jelly, Honey Extract',
    manfaat: 'Deep Moisture\nNon-stripping\nSoothes Dryness\nLeaves Skin Soft\npH Balanced',
    cara_pakai: 'Aplikasikan pada wajah kering, pijat lembut, lalu bilas atau lap dengan tisu basah.',
    deskripsi: 'Cream cleanser dengan tekstur kaya yang melembapkan sambil membersihkan. Cocok untuk kulit kering.',
    category_id: 1,
    images: [U+'1570197053300-69b1b635a694'+P, U+'1556228578-0d85b1a4d571'+P, U+'1611930022073-b7a4ba5fcccd'+P]
  },
  // TONER (5)
  {
    nama: 'Rice Bright Milky Toner', brand: 'Lumina Beauty', harga: 145000, stok: 90, rating: 4.8,
    skin_type: 'Normal, Dry, Combination', berat: '150 ml', ukuran: '150ml',
    ingredients: 'Rice Water, Niacinamide, Squalane, Panthenol, Allantoin, Betaine',
    manfaat: 'Brightens Skin Tone\nHydrates Deeply\nSoothes Irritation\nImproves Texture\nNourishes Skin',
    cara_pakai: 'Tuang ke telapak tangan dan tekan-tekan ke wajah setelah cleansing. Bisa juga digunakan dengan cotton pad.',
    deskripsi: 'Milky toner dengan rice water extract yang mencerahkan dan melembapkan. Teksturnya ringan dan cepat meresap.',
    category_id: 5,
    images: [U+'1596755389378-c31d21fd1273'+P, U+'1620916566398-39f1143ab7be'+P, U+'1570197053300-69b1b635a694'+P]
  },
  {
    nama: 'Pore Refining AHA Toner', brand: 'DermaGlow', harga: 155000, stok: 75, rating: 4.6,
    skin_type: 'Oily, Combination, Acne-prone', berat: '120 ml', ukuran: '120ml',
    ingredients: 'Glycolic Acid 5%, Lactic Acid, Niacinamide, Witch Hazel, Aloe Vera',
    manfaat: 'Refines Pores\nExfoliates Gently\nControls Sebum\nSmooths Texture\nBrightens Skin',
    cara_pakai: 'Gunakan setelah facial wash. Tuang ke cotton pad dan usap ke seluruh wajah hindari area mata.',
    deskripsi: 'AHA toner dengan Glycolic Acid 5% yang membantu mengecilkan pori dan tekstur kulit.',
    category_id: 5,
    images: [U+'1620916566398-39f1143ab7be'+P, U+'1596755389378-c31d21fd1273'+P, U+'1512304295953-f0ac4b2c6180'+P]
  },
  {
    nama: 'Glacier Water Hydrating Toner', brand: "Pretty's", harga: 129000, stok: 110, rating: 4.7,
    skin_type: 'All Skin Types', berat: '200 ml', ukuran: '200ml',
    ingredients: 'Glacier Water, Hyaluronic Acid, Glycerin, Panthenol, Allantoin, Aloe',
    manfaat: 'Deep Hydration\nRefreshes Skin\nSoothes Irritation\nPrepares Skin\nPlumps Fine Lines',
    cara_pakai: 'Aplikasikan setelah cleanser. Tuang ke tangan dan tepuk-tepuk ke wajah hingga meresap.',
    deskripsi: 'Hydrating toner dengan glacier water dan hyaluronic acid untuk memberikan kelembapan instan.',
    category_id: 5,
    images: [U+'1512304295953-f0ac4b2c6180'+P, U+'1567726171822-989b571e4db9'+P, U+'1620916566398-39f1143ab7be'+P]
  },
  {
    nama: 'Heartleaf Calming Toner', brand: 'Heritage Korea', harga: 139000, stok: 85, rating: 4.8,
    skin_type: 'Sensitive, Acne-prone, Redness', berat: '150 ml', ukuran: '150ml',
    ingredients: 'Heartleaf Extract 90%, Panthenol, Beta-glucan, Madecassoside, Allantoin',
    manfaat: 'Calms Redness\nSoothes Acne\nStrengthens Barrier\nAnti-inflammatory\nHydrates',
    cara_pakai: 'Gunakan setelah cleansing. Aplikasikan dengan cotton pad atau langsung dengan tangan.',
    deskripsi: 'Toner dengan 90% Heartleaf Extract untuk menenangkan kulit sensitif dan meradang.',
    category_id: 5,
    images: [U+'1567726171822-989b571e4db9'+P, U+'1512304295953-f0ac4b2c6180'+P, U+'1596755389378-c31d21fd1273'+P]
  },
  {
    nama: 'Vitamin C Bright Toner', brand: 'PureSkin Lab', harga: 159000, stok: 60, rating: 4.5,
    skin_type: 'Normal, Dull, Uneven Tone', berat: '120 ml', ukuran: '120ml',
    ingredients: 'Vitamin C 10%, Ferulic Acid, Niacinamide, Licorice Root, Aloe Vera',
    manfaat: 'Brightens Skin\nFades Dark Spots\nAntioxidant\nEven Tone\nHydrates',
    cara_pakai: 'Kocok sebelum digunakan. Tuang ke cotton pad dan usap ke wajah setelah cleansing pagi hari.',
    deskripsi: 'Brightening toner dengan Vitamin C 10% yang stabil untuk mencerahkan dan meratakan warna kulit.',
    category_id: 5,
    images: [U+'1596755389378-c31d21fd1273'+P, U+'1620916566398-39f1143ab7be'+P, U+'1567726171822-989b571e4db9'+P]
  },
  // SERUM (6)
  {
    nama: 'Glow Dew Hydrating Serum', brand: 'Lumina Beauty', harga: 169000, stok: 120, rating: 4.9,
    skin_type: 'All Skin Types', berat: '30 ml', ukuran: '30ml',
    ingredients: 'Niacinamide, Hyaluronic Acid, Centella Asiatica, Vitamin B5, Peptides',
    manfaat: 'Brightening\nDeep Hydration\nRepair Skin Barrier\nReduces Redness\nAnti-aging',
    cara_pakai: 'Gunakan 2-3 tetes setelah toner sebelum moisturizer. Pagi dan malam.',
    deskripsi: 'Serum ringan dengan Niacinamide dan Hyaluronic Acid untuk mencerahkan dan melembapkan kulit.',
    category_id: 2,
    images: [U+'1620916566398-39f1143ab7be'+P, U+'1576426863848-c21f53c60b19'+P, U+'1596462502278-27bfdc403348'+P]
  },
  {
    nama: 'Hyaluron Deep Serum', brand: 'PureSkin Lab', harga: 199000, stok: 60, rating: 4.8,
    skin_type: 'Dry, Dehydrated, All Skin Types', berat: '30 ml', ukuran: '30ml',
    ingredients: 'Sodium Hyaluronate, Hydrolyzed HA, HA Crosspolymer, Glycerin, Vitamin B5',
    manfaat: 'Intense Hydration\nPlumps Fine Lines\nBouncy Skin\nImproves Elasticity\nDewy Glow',
    cara_pakai: 'Aplikasikan 2 tetes setelah toner. Gunakan pagi dan malam untuk hasil optimal.',
    deskripsi: 'Serum dengan 3 jenis Hyaluronic Acid untuk hidrasi intensif. Kulit terasa kenyal dan terhidrasi.',
    category_id: 2,
    images: [U+'1576426863848-c21f53c60b19'+P, U+'1596462502278-27bfdc403348'+P, U+'1608571423902-eed4a5ad8108'+P]
  },
  {
    nama: 'Vitamin C Brightening Serum', brand: 'Lumina Beauty', harga: 215000, stok: 55, rating: 4.8,
    skin_type: 'Normal, Dull, Hyperpigmentation', berat: '30 ml', ukuran: '30ml',
    ingredients: 'Pure Vitamin C 15%, Ferulic Acid, Vitamin E, Hyaluronic Acid, Niacinamide',
    manfaat: 'Brightens Skin\nFades Dark Spots\nAntioxidant Protection\nBoosts Glow\nCollagen Boost',
    cara_pakai: 'Gunakan 3-4 tetes di pagi hari setelah toner. Lanjutkan dengan sunscreen.',
    deskripsi: 'Serum vitamin C stabil dengan 15% Pure Vitamin C untuk mencerahkan dan meratakan warna kulit.',
    category_id: 2,
    images: [U+'1596462502278-27bfdc403348'+P, U+'1608571423902-eed4a5ad8108'+P, U+'1596755389378-c31d21fd1273'+P]
  },
  {
    nama: 'Retinol Night Renewal Serum', brand: 'DermaGlow', harga: 249000, stok: 40, rating: 4.7,
    skin_type: 'Mature, Aging, Textured', berat: '30 ml', ukuran: '30ml',
    ingredients: 'Retinol 0.3%, Peptides, Ceramides, Bakuchiol, Vitamin E, Squalane',
    manfaat: 'Reduces Wrinkles\nImproves Texture\nBoosts Collagen\nEven Skin Tone\nFirms Skin',
    cara_pakai: 'Gunakan 2 tetes di malam hari setelah toner. Mulai 2x seminggu, tingkatkan bertahap.',
    deskripsi: 'Night serum dengan retinol dan peptides untuk regenerasi kulit saat tidur.',
    category_id: 2,
    images: [U+'1608571423902-eed4a5ad8108'+P, U+'1610878180933-123728745d22'+P, U+'1576426863848-c21f53c60b19'+P]
  },
  {
    nama: 'Niacinamide 10% Face Serum', brand: "Pretty's", harga: 159000, stok: 90, rating: 4.8,
    skin_type: 'Oily, Acne-prone, Large Pores', berat: '30 ml', ukuran: '30ml',
    ingredients: 'Niacinamide 10%, Zinc PCA, Centella Asiatica, Licorice Root, Allantoin',
    manfaat: 'Minimizes Pores\nControls Oil\nFades Dark Spots\nCalms Acne\nStrengthens Barrier',
    cara_pakai: 'Aplikasikan 2-3 tetes setelah toner. Cocok digunakan pagi dan malam.',
    deskripsi: 'Serum dengan 10% Niacinamide dan Zinc PCA untuk mengontrol minyak dan mengecilkan pori.',
    category_id: 2,
    images: [U+'1596755389378-c31d21fd1273'+P, U+'1620916566398-39f1143ab7be'+P, U+'1596462502278-27bfdc403348'+P]
  },
  {
    nama: 'Propolis Glow Ampoule', brand: 'Heritage Korea', harga: 189000, stok: 70, rating: 4.9,
    skin_type: 'Dull, Dry, All Skin Types', berat: '15 ml', ukuran: '15ml',
    ingredients: 'Propolis Extract 87%, Honey Extract, Vitamin E, Beta-glucan, Panthenol',
    manfaat: 'Glow Boost\nDeep Nourishment\nAntibacterial\nSoothes\nMoisture Lock',
    cara_pakai: 'Gunakan setengah pipet setelah toner. Tepuk-tepuk hingga meresap ke kulit.',
    deskripsi: 'Ampoule dengan 87% Propolis Extract untuk memberikan efek glowing dan nutrisi intensif.',
    category_id: 2,
    images: [U+'1610878180933-123728745d22'+P, U+'1596462502278-27bfdc403348'+P, U+'1608571423902-eed4a5ad8108'+P]
  },
  // ESSENCE (3)
  {
    nama: 'Mugwort Soothing Essence', brand: 'Heritage Korea', harga: 175000, stok: 85, rating: 4.7,
    skin_type: 'Sensitive, Acne-prone, Redness', berat: '120 ml', ukuran: '120ml',
    ingredients: 'Mugwort Extract 90%, Hyaluronic Acid, Panthenol, Beta-glucan, Aloe',
    manfaat: 'Soothes Redness\nCalms Acne\nHydrates\nAnti-inflammatory\nStrengthens Barrier',
    cara_pakai: 'Aplikasikan setelah toner, sebelum serum. Tepuk-tepuk hingga meresap.',
    deskripsi: 'Essence dengan mugwort (Artemisia) untuk menenangkan kulit merah dan irritated.',
    category_id: 6,
    images: [U+'1596462502278-27bfdc403348'+P, U+'1576426863848-c21f53c60b19'+P, U+'1608571423902-eed4a5ad8108'+P]
  },
  {
    nama: 'Ferment Essence Mist', brand: 'PureSkin Lab', harga: 169000, stok: 65, rating: 4.6,
    skin_type: 'All Skin Types', berat: '100 ml', ukuran: '100ml',
    ingredients: 'Galactomyces Ferment Filtrate 88%, Niacinamide, Glycerin, Panthenol',
    manfaat: 'Brightens\nHydrates\nImproves Texture\nNourishes\nRefreshes',
    cara_pakai: 'Semprotkan ke wajah setelah cleansing atau kapan saja kulit terasa kering.',
    deskripsi: 'Essence mist dengan ferment untuk mencerahkan dan menyegarkan kulit. Bisa digunakan kapan saja.',
    category_id: 6,
    images: [U+'1576426863848-c21f53c60b19'+P, U+'1608571423902-eed4a5ad8108'+P, U+'1596462502278-27bfdc403348'+P]
  },
  {
    nama: 'Snail Mucin Repair Essence', brand: 'DermaGlow', harga: 195000, stok: 50, rating: 4.8,
    skin_type: 'Damaged, Dry, Aging', berat: '50 ml', ukuran: '50ml',
    ingredients: 'Snail Mucin Filter 96%, Hyaluronic Acid, Peptides, Ceramides, Panthenol',
    manfaat: 'Repairs Skin\nDeep Hydration\nAnti-aging\nSoothes\nFades Scars',
    cara_pakai: 'Aplikasikan 1-2 pump setelah toner. Ratakan ke seluruh wajah dan leher.',
    deskripsi: 'Essence dengan 96% Snail Mucin Filter untuk memperbaiki kulit rusak dan tanda penuaan.',
    category_id: 6,
    images: [U+'1608571423902-eed4a5ad8108'+P, U+'1596462502278-27bfdc403348'+P, U+'1576426863848-c21f53c60b19'+P]
  },
  // MOISTURIZER (5)
  {
    nama: 'Cica Calming Moisturizer', brand: 'DermaGlow', harga: 189000, stok: 75, rating: 4.7,
    skin_type: 'Sensitive, All Skin Types', berat: '50 g', ukuran: '50g',
    ingredients: 'Centella Asiatica, Ceramides, Squalane, Panthenol, Green Tea, Shea Butter',
    manfaat: 'Calms Irritation\nStrengthens Barrier\nDeep Moisture\nNon-comedogenic\nSoothes Redness',
    cara_pakai: 'Aplikasikan setelah serum. Gunakan pagi dan malam untuk hasil optimal.',
    deskripsi: 'Pelembap dengan Centella Asiatica untuk menenangkan kulit sensitif dan memperbaiki skin barrier.',
    category_id: 3,
    images: [U+'1598440947619-2c35fc9aa908'+P, U+'1585386959984-a4155224a1ad'+P, U+'1608248543803-ba4f8c70ae0b'+P]
  },
  {
    nama: 'Panthenol Barrier Cream', brand: 'DermaGlow', harga: 159000, stok: 95, rating: 4.7,
    skin_type: 'Damaged, Sensitive, Dry', berat: '50 ml', ukuran: '50ml',
    ingredients: 'Panthenol 5%, Ceramides, Squalane, Shea Butter, Allantoin, Niacinamide',
    manfaat: 'Repairs Barrier\nSoothes Sensitive Skin\nDeep Nourishment\nNon-greasy\nCalms Irritation',
    cara_pakai: 'Aplikasikan lapisan tipis setelah serum. Cocok untuk pagi dan malam.',
    deskripsi: 'Cream kaya panthenol untuk memperbaiki skin barrier yang rusak. Cocok untuk kulit sensitif.',
    category_id: 3,
    images: [U+'1585386959984-a4155224a1ad'+P, U+'1512304295953-f0ac4b2c6180'+P, U+'1576426863848-c21f53c60b19'+P]
  },
  {
    nama: 'Retinol Renewal Night Cream', brand: 'PureSkin Lab', harga: 245000, stok: 40, rating: 4.6,
    skin_type: 'Mature, Aging, Dry', berat: '50 g', ukuran: '50g',
    ingredients: 'Retinol, Peptides, Ceramides, Shea Butter, Vitamin E, Squalane',
    manfaat: 'Reduces Fine Lines\nImproves Texture\nBoosts Collagen\nEven Skin Tone\nFirms',
    cara_pakai: 'Aplikasikan sebagai langkah terakhir skincare malam. Gunakan 3x seminggu untuk awal.',
    deskripsi: 'Night cream dengan retinol dan peptides untuk regenerasi kulit saat tidur.',
    category_id: 3,
    images: [U+'1512304295953-f0ac4b2c6180'+P, U+'1576426863848-c21f53c60b19'+P, U+'1598440947619-2c35fc9aa908'+P]
  },
  {
    nama: 'Water Blur Gel Cream', brand: "Pretty's", harga: 175000, stok: 80, rating: 4.8,
    skin_type: 'Oily, Combination, Normal', berat: '50 ml', ukuran: '50ml',
    ingredients: 'Water, Glycerin, Niacinamide, Hyaluronic Acid, Green Tea, Vitamin C',
    manfaat: 'Lightweight Hydration\nBlurs Pores\nMatte Finish\nOil Control\nFresh Feel',
    cara_pakai: 'Aplikasikan setelah serum pagi dan malam. Tekstur gel cepat meresap tanpa lengket.',
    deskripsi: 'Water gel cream ringan yang melembapkan tanpa rasa berat. Cocok untuk kulit berminyak.',
    category_id: 3,
    images: [U+'1608248543803-ba4f8c70ae0b'+P, U+'1598440947619-2c35fc9aa908'+P, U+'1585386959984-a4155224a1ad'+P]
  },
  {
    nama: 'Honey Ceramide Lotion', brand: 'Heritage Korea', harga: 169000, stok: 70, rating: 4.7,
    skin_type: 'Dry, Very Dry, Sensitive', berat: '100 ml', ukuran: '100ml',
    ingredients: 'Honey Extract, Ceramides, Squalane, Shea Butter, Royal Jelly, Vitamin E',
    manfaat: 'Intense Moisture\nNourishes\nRepairs Barrier\nSoftens Skin\nGlow Boost',
    cara_pakai: 'Aplikasikan setelah serum. Gunakan pagi dan malam. Cocok untuk lapisan akhir.',
    deskripsi: 'Lotion kaya dengan Honey dan Ceramides untuk melembapkan intensif kulit kering.',
    category_id: 3,
    images: [U+'1576426863848-c21f53c60b19'+P, U+'1608248543803-ba4f8c70ae0b'+P, U+'1585386959984-a4155224a1ad'+P]
  },
  // SUNSCREEN (4)
  {
    nama: 'Watery Sun Gel SPF 50 PA++++', brand: 'DermaGlow', harga: 165000, stok: 200, rating: 4.9,
    skin_type: 'All Skin Types', berat: '50 ml', ukuran: '50ml',
    ingredients: 'Zinc Oxide, Niacinamide, Hyaluronic Acid, Vitamin E, Aloe Vera, Green Tea',
    manfaat: 'Maximum UV Protection\nNo White Cast\nHydrating Finish\nLightweight Texture\nBrightening',
    cara_pakai: 'Aplikasikan sebagai langkah terakhir skincare pagi. Reapply setiap 3-4 jam.',
    deskripsi: 'Sunscreen gel ringan dengan tekstur watery yang cepat meresap tanpa white cast.',
    category_id: 4,
    images: [U+'1611930022073-b7a4ba5fcccd'+P, U+'1556228578-0d85b1a4d571'+P, U+'1608248543803-ba4f8c70ae0b'+P]
  },
  {
    nama: 'UV Tone Up Sunscreen SPF 50', brand: 'Heritage Korea', harga: 185000, stok: 130, rating: 4.8,
    skin_type: 'Normal, Dull, Uneven Tone', berat: '50 ml', ukuran: '50ml',
    ingredients: 'Titanium Dioxide, Niacinamide, Vitamin C, Hyaluronic Acid, Ceramides',
    manfaat: 'UV Protection\nTone Up Effect\nBrightens Complexion\nHydrates Skin\nPrimer Effect',
    cara_pakai: 'Aplikasikan setelah moisturizer. Ratakan merata ke seluruh wajah dan leher.',
    deskripsi: 'Sunscreen dengan tone up effect yang membuat wajah tampak lebih cerah alami.',
    category_id: 4,
    images: [U+'1556228578-0d85b1a4d571'+P, U+'1608248543803-ba4f8c70ae0b'+P, U+'1585386959984-a4155224a1ad'+P]
  },
  {
    nama: 'Daily Sunscreen SPF 35 PA+++', brand: "Pretty's", harga: 115000, stok: 180, rating: 4.5,
    skin_type: 'All Skin Types, Sensitive', berat: '60 ml', ukuran: '60ml',
    ingredients: 'Zinc Oxide 20%, Aloe Vera, Vitamin E, Green Tea, Chamomile, Calendula',
    manfaat: 'Daily Protection\nGentle Formula\nMoisturizing\nNon-irritating\nSafe for Sensitive',
    cara_pakai: 'Aplikasikan setiap pagi sebagai langkah akhir skincare. Cocok untuk penggunaan sehari-hari.',
    deskripsi: 'Daily sunscreen dengan zinc oxide yang aman untuk kulit sensitif. Tekstur ringan dan nyaman.',
    category_id: 4,
    images: [U+'1608248543803-ba4f8c70ae0b'+P, U+'1611930022073-b7a4ba5fcccd'+P, U+'1556228578-0d85b1a4d571'+P]
  },
  {
    nama: 'Cool Sun Stick SPF 50+ PA++++', brand: 'Lumina Beauty', harga: 145000, stok: 100, rating: 4.7,
    skin_type: 'All Skin Types', berat: '20 g', ukuran: '20g',
    ingredients: 'Zinc Oxide, Titanium Dioxide, Vitamin E, Squalane, Menthol, Aloe Vera',
    manfaat: 'Easy Reapplication\nPortable\nCooling Effect\nWater Resistant\nNo Mess',
    cara_pakai: 'Gosokkan stick ke wajah secara merata. Cocok untuk reapply sunscreen di luar rumah.',
    deskripsi: 'Sun stick praktis dengan SPF 50+ yang mudah diaplikasikan kapan saja dan di mana saja.',
    category_id: 4,
    images: [U+'1585386959984-a4155224a1ad'+P, U+'1611930022073-b7a4ba5fcccd'+P, U+'1556228578-0d85b1a4d571'+P]
  },
  // MASK (2)
  {
    nama: 'Collagen Hydrogel Mask', brand: 'PureSkin Lab', harga: 55000, stok: 300, rating: 4.6,
    skin_type: 'All Skin Types, Aging, Dry', berat: '25 g', ukuran: '25g',
    ingredients: 'Collagen, Hyaluronic Acid, Vitamin C, Peptides, Aloe Vera, Green Tea',
    manfaat: 'Instant Glow\nDeep Hydration\nFirms Skin\nBrightens\nSoothes',
    cara_pakai: 'Aplikasikan pada wajah bersih selama 15-20 menit. Angkat dan tepuk sisa essence hingga meresap.',
    deskripsi: 'Hydrogel mask dengan collagen yang memberikan efek glowing instan dan hidrasi intensif.',
    category_id: 7,
    images: [U+'1598440947619-2c35fc9aa908'+P, U+'1585386959984-a4155224a1ad'+P, U+'1608248543803-ba4f8c70ae0b'+P]
  },
  {
    nama: 'Sleeping Recovery Mask', brand: 'Heritage Korea', harga: 135000, stok: 90, rating: 4.8,
    skin_type: 'Dry, Damaged, All Skin Types', berat: '70 ml', ukuran: '70ml',
    ingredients: 'Squalane, Ceramides, Panthenol, Honey Extract, Shea Butter, Vitamin E',
    manfaat: 'Overnight Repair\nDeep Nourishment\nWake Up Glowing\nLocks Moisture\nSmooths',
    cara_pakai: 'Aplikasikan lapisan tipis sebagai langkah terakhir skincare malam. Bilas keesokan paginya.',
    deskripsi: 'Sleeping mask dengan squalane dan ceramides yang memperbaiki kulit saat tidur.',
    category_id: 7,
    images: [U+'1585386959984-a4155224a1ad'+P, U+'1598440947619-2c35fc9aa908'+P, U+'1608248543803-ba4f8c70ae0b'+P]
  }
];

const seed = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
  });

  try {
    await connection.query('CREATE DATABASE IF NOT EXISTS skincare_db');
    await connection.query('USE skincare_db');

    await connection.query('DROP TABLE IF EXISTS order_items');
    await connection.query('DROP TABLE IF EXISTS orders');
    await connection.query('DROP TABLE IF EXISTS cart_items');
    await connection.query('DROP TABLE IF EXISTS carts');
    await connection.query('DROP TABLE IF EXISTS customers');
    await connection.query('DROP TABLE IF EXISTS reviews');
    await connection.query('DROP TABLE IF EXISTS product_images');
    await connection.query('DROP TABLE IF EXISTS products');

    const tables = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(200) NOT NULL,
        brand VARCHAR(100) DEFAULT "Pretty's",
        harga DECIMAL(12,2) NOT NULL,
        stok INT DEFAULT 0,
        skin_type VARCHAR(200) DEFAULT 'All Skin Types',
        berat VARCHAR(50) DEFAULT '',
        ukuran VARCHAR(50) DEFAULT '',
        deskripsi TEXT,
        kandungan TEXT,
        cara_pakai TEXT,
        manfaat TEXT,
        rating DECIMAL(2,1) DEFAULT 0.0,
        gambar VARCHAR(500) DEFAULT NULL,
        images JSON DEFAULT NULL,
        category_id INT,
        best_seller BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        pekerjaan VARCHAR(100),
        pesan TEXT,
        foto VARCHAR(255) DEFAULT NULL
      );

      CREATE TABLE IF NOT EXISTS promotions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        judul VARCHAR(200) NOT NULL,
        deskripsi TEXT,
        gambar VARCHAR(255) DEFAULT NULL
      );

      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        no_hp VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL,
        alamat TEXT NOT NULL,
        provinsi VARCHAR(50) NOT NULL,
        kota VARCHAR(50) NOT NULL,
        kode_pos VARCHAR(10) NOT NULL,
        catatan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kode_pesanan VARCHAR(50) NOT NULL UNIQUE,
        customer_id INT NOT NULL,
        total_harga DECIMAL(12,2) NOT NULL,
        ongkir DECIMAL(10,2) DEFAULT 0,
        grand_total DECIMAL(12,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Menunggu Pembayaran',
        metode_pembayaran VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT,
        nama_produk VARCHAR(200) NOT NULL,
        harga DECIMAL(12,2) NOT NULL,
        quantity INT NOT NULL,
        subtotal DECIMAL(12,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT DEFAULT NULL,
        product_id INT NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        city VARCHAR(50) DEFAULT NULL,
        product_name VARCHAR(200) DEFAULT NULL,
        rating DECIMAL(2,1) NOT NULL,
        comment TEXT,
        image VARCHAR(500) DEFAULT NULL,
        status VARCHAR(20) DEFAULT 'visible',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `;
    await connection.query(tables);

    const [adminRows] = await connection.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (adminRows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', hashedPassword]);
      console.log('Admin user created (admin / admin123)');
    }

    const [catRows] = await connection.query('SELECT COUNT(*) as count FROM categories');
    if (catRows[0].count === 0) {
      const categories = ['Facial Wash', 'Serum', 'Moisturizer', 'Sunscreen', 'Toner', 'Essence', 'Mask'];
      for (const cat of categories) {
        await connection.query('INSERT INTO categories (nama) VALUES (?)', [cat]);
      }
      console.log('Categories seeded');
    }

    const [prodRows] = await connection.query('SELECT COUNT(*) as count FROM products');
    if (prodRows[0].count === 0) {
      for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const gambar = p.images[0];
        const imagesJson = JSON.stringify(p.images);
        const [result] = await connection.query(
          `INSERT INTO products (nama, brand, harga, stok, skin_type, berat, ukuran, deskripsi, kandungan, cara_pakai, manfaat, rating, gambar, images, category_id, best_seller)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
           [p.nama, p.brand, p.harga, p.stok, p.skin_type, p.berat, p.ukuran, p.deskripsi,
           p.ingredients, p.cara_pakai, p.manfaat, p.rating, gambar, imagesJson, p.category_id, i < 8 ? 1 : 0]
        );
        
        // Insert additional images into product_images table
        const productId = result.insertId;
        for (let j = 0; j < p.images.length; j++) {
          await connection.query(
            'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)',
            [productId, p.images[j], j + 1]
          );
        }
      }
      console.log('30 products seeded');
    }

    const [testRows] = await connection.query('SELECT COUNT(*) as count FROM testimonials');
    if (testRows[0].count === 0) {
      const testimonials = [
        { nama: 'Nadhira Putri', pekerjaan: 'Content Creator', pesan: 'Glow Dew Hydrating Serum is amazing! My skin has never looked this radiant. The texture is so lightweight and absorbs instantly.' },
        { nama: 'Alyssa Kirana', pekerjaan: 'Marketing Executive', pesan: 'The Cica Calming Moisturizer saved my sensitive skin! No more redness or irritation. Holy grail!' },
        { nama: 'Saskia Aurelia', pekerjaan: 'Mahasiswi', pesan: 'Watery Sun Gel is the best sunscreen ever. No white cast, no sticky feeling, just pure protection. Bottol ketiga!' },
        { nama: 'Mega Sari', pekerjaan: 'Pramugari', pesan: 'Rice Bright Milky Toner gives me such a beautiful glow even with my hectic schedule. My skin looks so healthy.' },
        { nama: 'Clarissa Wijaya', pekerjaan: 'Yoga Instructor', pesan: 'Mugwort Soothing Essence is a game changer for my acne-prone skin. Calms breakouts overnight.' },
        { nama: 'Gita Pramesti', pekerjaan: 'Graphic Designer', pesan: 'Vitamin C Brightening Serum faded my dark spots significantly. My skin tone is much more even now!' },
        { nama: 'Dian Permata', pekerjaan: 'Dokter Umum', pesan: 'Niacinamide 10% Serum really minimized my pores. Hasilnya terlihat dalam 2 minggu pemakaian.' },
        { nama: 'Rani Andriani', pekerjaan: 'Pengusaha', pesan: 'Propolis Glow Ampoule gives me the glass skin effect I have always wanted. Highly recommend!' },
      ];
      for (const t of testimonials) {
        await connection.query(
          'INSERT INTO testimonials (nama, pekerjaan, pesan) VALUES (?, ?, ?)',
          [t.nama, t.pekerjaan, t.pesan]
        );
      }
      console.log('Testimonials seeded');
    }

    const [promoRows] = await connection.query('SELECT COUNT(*) as count FROM promotions');
    if (promoRows[0].count === 0) {
      const promotions = [
        { judul: 'Spring Radiance Event - Up to 35% Off', deskripsi: 'Welcome the new season with glowing skin. Enjoy special discounts on our best-selling serums and moisturizers.' },
        { judul: 'Starter Kit Bundle - 20% Off', deskripsi: 'New to Veloura? Get our complete starter routine at a special bundle price. Includes cleanser, toner, serum, and moisturizer.' },
        { judul: 'Buy 2 Get 1 Free on All Sunscreens', deskripsi: 'Protect your skin every day. Stock up on your favorite sunscreens with our special promotion.' },
        { judul: 'Free Shipping - No Minimum Purchase', deskripsi: 'Enjoy free shipping on all orders for a limited time. No minimum purchase required.' },
      ];
      for (const p of promotions) {
        await connection.query(
          'INSERT INTO promotions (judul, deskripsi) VALUES (?, ?)',
          [p.judul, p.deskripsi]
        );
      }
      console.log('Promotions seeded');
    }

    const [revRows] = await connection.query('SELECT COUNT(*) as count FROM reviews');
    if (revRows[0].count === 0) {
      const [allProducts] = await connection.query('SELECT id, nama FROM products ORDER BY id ASC');
      const reviewData = [
        { name: 'Sarah', city: 'Jakarta', rating: 5.0, comment: 'Aku suka banget sama serumnya. Kulit jadi lebih lembap dan glowing setelah dua minggu pemakaian.', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80' },
        { name: 'Amanda', city: 'Bandung', rating: 5.0, comment: 'Teksturnya ringan, cepat menyerap dan tidak lengket. Cocok banget buat kulit berminyak.', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' },
        { name: 'Bunga', city: 'Surabaya', rating: 4.0, comment: 'Produknya bagus, tapi pengiriman agak lama. Overall puas dengan hasilnya.', img: null },
        { name: 'Citra', city: 'Yogyakarta', rating: 5.0, comment: 'Masker wajahnya sangat menenangkan. Kulit jadi kenyal dan segar.', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&q=80' },
        { name: 'Dewi', city: 'Bali', rating: 4.0, comment: 'Tonernya gentle banget di kulit sensitifku. Tidak perih sama sekali.', img: null },
        { name: 'Eka', city: 'Medan', rating: 5.0, comment: 'Sunscreen ini holy grail! Tidak ada white cast dan tidak berat di wajah.', img: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&q=80' },
        { name: 'Fitri', city: 'Semarang', rating: 3.0, comment: 'Hasilnya oke tapi butuh waktu lama baru kelihatan. Sabar ya pemakaiannya.', img: null },
        { name: 'Gita', city: 'Makassar', rating: 5.0, comment: 'Moisturizer terbaik yang pernah aku coba. Kulit keringku langsung plump.', img: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=100&q=80' },
        { name: 'Hana', city: 'Palembang', rating: 4.0, comment: 'Facial wash nya bikin wajah bersih tapi nggak kering. Recommended!', img: null },
        { name: 'Indah', city: 'Lampung', rating: 5.0, comment: 'Essence ini bikin glow natural. Temen-temen pada nanya aku pakai apa.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
        { name: 'Jihan', city: 'Bogor', rating: 4.0, comment: 'Serum brightening nya memudarkan flek hitam di wajahku. Puas.', img: null },
        { name: 'Kirana', city: 'Depok', rating: 5.0, comment: 'Packagingnya lucu, produknya juga manjur. Bakal repurchase terus.', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80' },
      ];
      for (let i = 0; i < reviewData.length; i++) {
        const r = reviewData[i];
        const prod = allProducts[(i * 3) % allProducts.length];
        await connection.query(
          'INSERT INTO reviews (customer_id, product_id, customer_name, city, product_name, rating, comment, image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [null, prod.id, r.name, r.city, prod.nama, r.rating, r.comment, r.img, 'visible']
        );
      }
      console.log('Reviews seeded');
    }

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await connection.end();
  }
};

seed();

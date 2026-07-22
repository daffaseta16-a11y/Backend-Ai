CREATE DATABASE IF NOT EXISTS skincare_db;
USE skincare_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(200) NOT NULL,
  harga DECIMAL(12,2) NOT NULL,
  stok INT DEFAULT 0,
  deskripsi TEXT,
  kandungan TEXT,
  cara_pakai TEXT,
  manfaat TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  gambar VARCHAR(255) DEFAULT NULL,
  category_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  pekerjaan VARCHAR(100),
  pesan TEXT,
  foto VARCHAR(255) DEFAULT NULL
);

CREATE TABLE promotions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(200) NOT NULL,
  deskripsi TEXT,
  gambar VARCHAR(255) DEFAULT NULL
);

INSERT INTO categories (nama) VALUES
('Moisturizer'),
('Serum'),
('Toner'),
('Sunscreen'),
('Cleanser'),
('Mask'),
('Eye Care'),
('Lip Care');

INSERT INTO users (username, password) VALUES
('admin', '$2b$10$dummyhashfordevelopment1234567890abcdef');

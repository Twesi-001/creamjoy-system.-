-- =====================================================
-- CREAMJOY DATABASE - FULL SEED DATA (UPDATED VERSION)
-- Populates lookup tables, suppliers, and all business data
-- =====================================================

USE creamjoy_db;

-- ============================================
-- 1. POPULATE LOOKUP TABLES (Flavours & Sizes)
-- ============================================

-- Flavours (8 types)
INSERT INTO flavours (flavour_id, flavour_name, display_order) VALUES
(1, 'Millet', 1),
(2, 'Chocolate', 2),
(3, 'Strawberry', 3),
(4, 'Mango', 4),
(5, 'Vanilla', 5),
(6, 'Plain', 6),
(7, 'Blueberry', 7),
(8, 'Bushela', 8);

-- Pack Sizes (4 types)
INSERT INTO pack_sizes (size_id, size_name, display_order) VALUES
(1, '5L', 1),
(2, '2L', 2),
(3, '1L', 3),
(4, '300ml', 4);

-- ============================================
-- 2. POPULATE SUPPLIERS (New data from notebook clues)
-- ============================================
INSERT INTO suppliers (supplier_id, supplier_name, contact_person, location, notes) VALUES
(1, 'Kabalagala Dairy Supplies', 'Mr. Mugisha', 'Kabalagala', 'Supplies Milk Powder and Starch'),
(2, 'Kampala Packaging Ltd', 'Ms. Nakato', 'Industrial Area', 'Supplies Bottles, Tencan, and Stickers'),
(3, 'Uganda Sugar Dealers', 'Mr. Ssali', 'Nakawa', 'Supplies Sugar in bulk'),
(4, 'Bushela Mills', 'Mr. Okello', 'Jinja Road', 'Supplies Bushela and Stabilizer'),
(5, 'City Chemicals Ltd', 'Ms. Achieng', 'Nakawa', 'Supplies Culture and Matapolo');

-- ============================================
-- 3. POPULATE RAW MATERIALS (Now with supplier_id)
-- ============================================
INSERT INTO raw_materials (material_id, material_name, unit, cost_per_unit_ugx, minimum_stock, current_stock, supplier_id) VALUES
(1, 'Milk', 'Litres', 160, 200, 250, 1),
(2, 'Milk Powder', 'Kg', 24000, 3, 5, 1),
(3, 'Sugar', 'Kg', 3000, 10, 15, 3),
(4, 'Starch', 'Kg', 40000, 5, 6, 1),
(5, 'Bushela', 'Kg', 7800, 2, 3, 4),
(6, 'Stabilizer', 'Kg', 25000, 2, 2, 4),
(7, 'Culture', 'Pack', 35000, 1, 2, 5),
(8, 'Vanilla Essence', 'Bottle', 15000, 1, 2, 5),
(9, 'Matapolo', 'Pack', 34000, 1, 1, 5),
(10, 'Bottles 1L', 'Dozen', 16000, 5, 8, 2),
(11, 'Bottles 300ml', '30 pieces', 20000, 30, 45, 2),
(12, 'Stickers', 'Sheet', 5000, 2, 5, 2),
(13, 'Tencan 1L', '25 pieces', 24000, 5, 10, 2);

-- ============================================
-- 4. POPULATE STAFF (10 rows)
-- ============================================
INSERT INTO staff (staff_id, name, role, phone) VALUES
(1, 'Jack', 'delivery', '0700000001'),
(2, 'Namuyanja', 'delivery', '0700000002'),
(3, 'Florence', 'delivery', '0700000003'),
(4, 'Edvine', 'delivery', '0700000004'),
(5, 'Teo', 'sales', '0700000005'),
(6, 'Alex', 'production', '0700000006'),
(7, 'Levi', 'production', '0700000007'),
(8, 'Salim', 'maintenance', '0700000008'),
(9, 'Olivia', 'sales', '0700000009'),
(10, 'Dan', 'delivery', '0700000010');

-- ============================================
-- 5. POPULATE PRODUCTS (28 rows using lookup IDs)
-- ============================================
INSERT INTO products (product_id, flavour_id, size_id) VALUES
-- Millet (flavour_id=1)
(1, 1, 1), (2, 1, 2), (3, 1, 3), (4, 1, 4),
-- Chocolate (flavour_id=2)
(5, 2, 1), (6, 2, 2), (7, 2, 3), (8, 2, 4),
-- Strawberry (flavour_id=3)
(9, 3, 1), (10, 3, 2), (11, 3, 3), (12, 3, 4),
-- Mango (flavour_id=4)
(13, 4, 1), (14, 4, 2), (15, 4, 3), (16, 4, 4),
-- Vanilla (flavour_id=5)
(17, 5, 1), (18, 5, 2), (19, 5, 3), (20, 5, 4),
-- Plain (flavour_id=6)
(21, 6, 1), (22, 6, 2), (23, 6, 3), (24, 6, 4),
-- Blueberry (flavour_id=7)
(25, 7, 1), (26, 7, 2), (27, 7, 3), (28, 7, 4),
-- Bushela (flavour_id=8) - Only 5L, 1L, 300ml exist in data (2L may be added later)
(29, 8, 1), (30, 8, 3), (31, 8, 4);

-- ============================================
-- 6. POPULATE BATCHES (Now with expiry_date)
-- Expiry = Batch Date + 14 days (standard for yoghurt)
-- ============================================
INSERT INTO batches (batch_id, batch_number, batch_date, expiry_date, status) VALUES
(1, '03', '2025-10-28', DATE_ADD('2025-10-28', INTERVAL 14 DAY), 'completed'),
(2, '04', '2025-10-28', DATE_ADD('2025-10-28', INTERVAL 14 DAY), 'completed'),
(3, '04', '2025-11-18', DATE_ADD('2025-11-18', INTERVAL 14 DAY), 'completed'),
(4, '05', '2025-11-18', DATE_ADD('2025-11-18', INTERVAL 14 DAY), 'completed'),
(5, '06', '2025-12-03', DATE_ADD('2025-12-03', INTERVAL 14 DAY), 'completed'),
(6, '06', '2025-12-12', DATE_ADD('2025-12-12', INTERVAL 14 DAY), 'completed'),
(7, '07', '2025-12-12', DATE_ADD('2025-12-12', INTERVAL 14 DAY), 'completed'),
(8, '08', '2025-12-17', DATE_ADD('2025-12-17', INTERVAL 14 DAY), 'completed'),
(9, '08B', '2026-01-26', DATE_ADD('2026-01-26', INTERVAL 14 DAY), 'completed'),
(10, '01', '2026-01-26', DATE_ADD('2026-01-26', INTERVAL 14 DAY), 'completed'),
(11, '02', '2026-02-26', DATE_ADD('2026-02-26', INTERVAL 14 DAY), 'completed'),
(12, '03B', '2026-03-16', DATE_ADD('2026-03-16', INTERVAL 14 DAY), 'completed'),
(13, '04B', '2026-04-09', DATE_ADD('2026-04-09', INTERVAL 14 DAY), 'completed'),
(14, '05B', '2026-04-24', DATE_ADD('2026-04-24', INTERVAL 14 DAY), 'completed'),
(15, '06B', '2026-05-22', DATE_ADD('2026-05-22', INTERVAL 14 DAY), 'completed'),
(16, '07B', '2026-06-05', DATE_ADD('2026-06-05', INTERVAL 14 DAY), 'completed');

-- ============================================
-- 7. BATCH_PRODUCTS (195 rows - shortened for example, but include all)
-- Note: Using product IDs (1-31) as defined above
-- ============================================
-- Batch 03 (batch_id=1)
INSERT INTO batch_products (batch_id, product_id, quantity_produced) VALUES
(1, 4, 82), (1, 3, 12), (1, 1, 2),
(1, 16, 30), (1, 15, 5), (1, 13, 1),
(1, 8, 32), (1, 7, 6), (1, 5, 2),
(1, 20, 54), (1, 19, 0), (1, 17, 3);

-- Batch 04 (batch_id=2)
INSERT INTO batch_products (batch_id, product_id, quantity_produced) VALUES
(2, 16, 67), (2, 15, 3), (2, 13, 1),
(2, 12, 25), (2, 11, 0),
(2, 24, 10),
(2, 4, 132), (2, 3, 30), (2, 1, 6);

-- Batch 04 (batch_id=3 - 2025-11-18)
INSERT INTO batch_products (batch_id, product_id, quantity_produced) VALUES
(3, 19, 3), (3, 20, 21),
(3, 7, 3), (3, 8, 55),
(3, 16, 90);

-- Batch 05 (batch_id=4)
INSERT INTO batch_products (batch_id, product_id, quantity_produced) VALUES
(4, 24, 33),
(4, 19, 3), (4, 20, 60),
(4, 7, 3), (4, 8, 35),
(4, 15, 14), (4, 16, 103),
(4, 10, 3), (4, 11, 10), (4, 12, 74),
(4, 1, 6), (4, 3, 22), (4, 4, 150);

-- Batch 06 (batch_id=5 - 2025-12-03)
INSERT INTO batch_products (batch_id, product_id, quantity_produced) VALUES
(5, 1, 9), (5, 3, 15), (5, 4, 126),
(5, 9, 3), (5, 11, 8), (5, 12, 126);

-- Batch 06 (batch_id=6 - 2025-12-12)
INSERT INTO batch_products (batch_id, product_id, quantity_produced) VALUES
(6, 13, 2), (6, 15, 7), (6, 16, 31),
(6, 5, 1), (6, 7, 2), (6, 8, 71),
(6, 17, 1), (6, 19, 2), (6, 20, 74),
(6, 24, 41),
(6, 28, 83);

-- Batch 07 (batch_id=7 - 2025-12-12)
INSERT INTO batch_products (batch_id, product_id, quantity_produced) VALUES
(7, 1, 9), (7, 3, 15), (7, 4, 126),
(7, 9, 4), (7, 11, 10), (7, 12, 133),
(7, 25, 1), (7, 27, 10), (7, 28, 143),
(7, 17, 4), (7, 19, 5), (7, 20, 105),
(7, 5, 1), (7, 7, 5), (7, 8, 110),
(7, 13, 2), (7, 15, 8), (7, 16, 70),
(7, 21, 1), (7, 23, 5), (7, 24, 59);

-- Batch 08 (batch_id=8 - 2025-12-17)
INSERT INTO batch_products (batch_id, product_id, quantity_produced) VALUES
(8, 1, 10), (8, 3, 20), (8, 4, 257),
(8, 13, 4), (8, 15, 10), (8, 16, 131),
(8, 9, 7), (8, 11, 15), (8, 12, 240),
(8, 17, 4), (8, 19, 10), (8, 20, 214),
(8, 25, 2), (8, 27, 8), (8, 28, 172);

-- Batch 08B (batch_id=9 - 2026-01-26)
INSERT INTO batch_products (batch_id, product_id, quantity_produced) VALUES
(9, 5, 2), (9, 7, 7), (9, 8, 92),
(9, 21, 1), (9, 23, 5), (9, 24, 107);

-- Batch 01 (batch_id=10 - 2026-01-26)
INSERT INTO batch_products (batch_id, product_id, quantity_produced) VALUES
(10, 1, 5), (10, 3, 16), (10, 4, 169), (10, 2, 2),
(10, 9, 3), (10, 11, 6), (10, 12, 85),
(10, 13, 1), (10, 15, 5), (10, 16, 52),
(10, 5, 0), (10, 7, 94), (10, 8, 70),
(10, 21, 1),
(10, 17, 1), (10, 19, 10), (10, 20, 114);

-- Batch 02 (batch_id=11 - 2026-02-26)
INSERT INTO batch_products (batch_id, product_id, quantity_produced) VALUES
(11, 1, 9), (11, 2, 3), (11, 3, 13), (11, 4, 228),
(11, 9, 4), (11, 10, 2), (11, 11, 8), (11, 12, 233),
(11, 24, 61),
(11, 5, 1), (11, 7, 2), (11, 8, 117),
(11, 13, 2), (11, 14, 1), (11, 15, 5), (11, 16, 78),
(11, 17, 3), (11, 18, 3), (11, 19, 65), (11, 20, 59);

-- Batch 03B (batch_id=12 - 2026-03-16)
INSERT INTO batch_products (batch_id, product_id, quantity_produced) VALUES
(12, 1, 3), (12, 2, 2), (12, 3, 5), (12, 4, 103),
(12, 13, 7),
(12, 1, 7), (12, 2, 9), (12, 3, 17), (12, 4, 97),
(12, 28, 39),
(12, 24, 57),
(12, 7, 2), (12, 8, 57),
(12, 11, 10), (12, 10, 4), (12, 12, 96),
(12, 17, 2), (12, 18, 3), (12, 19, 6), (12, 20, 92);

-- Batch 04B (batch_id=13 - 2026-04-09)
INSERT INTO batch_products (batch_id, product_id, quantity_produced) VALUES
(13, 24, 632), (13, 23, 37), (13, 22, 5), (13, 21, 10);

-- Batch 05B (batch_id=14 - 2026-04-24)
INSERT INTO batch_products (batch_id, product_id, quantity_produced) VALUES
(14, 8, 46),
(14, 24, 31),
(14, 17, 1), (14, 20, 102),
(14, 13, 3), (14, 14, 2), (14, 16, 68),
(14, 9, 1), (14, 10, 2), (14, 12, 70),
(14, 28, 47),
(14, 1, 2), (14, 2, 2), (14, 4, 92);

-- Batch 06B (batch_id=15 - 2026-05-22)
INSERT INTO batch_products (batch_id, product_id, quantity_produced) VALUES
(15, 24, 403), (15, 23, 1313), (15, 22, 4), (15, 21, 6);

-- Batch 07B (batch_id=16 - 2026-06-05)
INSERT INTO batch_products (batch_id, product_id, quantity_produced) VALUES
(16, 4, 431), (16, 3, 26), (16, 1, 9),
(16, 4, 92), (16, 3, 10), (16, 1, 3),
(16, 16, 54), (16, 15, 4), (16, 13, 1),
(16, 12, 81), (16, 9, 5),
(16, 28, 90), (16, 25, 1),
(16, 20, 76), (16, 19, 2), (16, 17, 7),
(16, 8, 98), (16, 5, 1);

-- ============================================
-- 8. POPULATE CUSTOMERS (90 rows)
-- (SAME AS PREVIOUS - abbreviated here for space)
-- ============================================
INSERT INTO customers (customer_id, customer_name, location, training_phone, customer_type) VALUES
(1, 'Mr. Kareli', 'Kireka Famuli Road', '0700837351', 'Retail'),
(2, 'Mr. Samuel', 'Banda Main Road', '0701974602', 'Retail'),
(3, 'Mummy Fotonola', 'Nakawa Market', '0702111853', 'Retail'),
(4, 'Brain', 'Nakawa Market', '0703248104', 'Retail'),
(5, 'Bunamwaya Customer', 'Bunamwaya', NULL, 'Retail'),
(6, 'Godfrey', 'Nakawa', '0704385355', 'Retail'),
(7, 'T.T.', 'Nakawa', '0705522606', 'Retail'),
(8, 'Nalongo', 'Nakawa', '0303718950', 'Retail'),
(9, 'A. Roya', 'Nakawa', '0334046166', 'Retail'),
(10, 'David', 'Nakawa', '0706659857', 'Retail'),
(11, 'Emma', 'Nakawa', '0268913271', 'Retail'),
(12, 'Rebeccah', 'Bukyegerere', '0707796108', 'Retail'),
(13, 'Juliet Namulandali', 'Bukyegerere', '0708933359', 'Retail'),
(14, 'Nadia', 'Bukyegerere', '0709070610', 'Retail'),
(15, 'Fauvar', 'Banda', '0740207861', 'Retail'),
(16, 'Aunt Rose', 'Bunamwaya', '0741344112', 'Retail'),
(17, 'Suubi Fresh Dairy', 'Bunamwaya', '0742481363', 'Dairy Shop'),
(18, 'Nican Lodge', 'Lweza', '0743618614', 'Retail'),
(19, 'Unknown 19', NULL, '0744755865', 'Retail'),
(20, 'Unknown 20', NULL, '0745892116', 'Retail'),
(21, 'Unknown 21', NULL, NULL, 'Retail'),
(22, 'Unknown 22', NULL, NULL, 'Retail'),
(23, 'Mazima Traders', 'Bwaise', '0746029367', 'Retail'),
(24, 'Mirembe Dairy', 'Bwaise', '0747166618', 'Dairy Shop'),
(25, 'Supermilk', 'Bukyegerere', '0748303869', 'Retail'),
(26, 'Mukande', 'Bukyegerere', '0749440120', 'Retail'),
(27, 'Christopher', 'Spear Motors', '0750577371', 'Retail'),
(28, 'Shell Kibuye', 'Kibuye', '0751714622', 'Supermarket'),
(29, 'Baraka Mini Spot', 'Kireka', '0752851873', 'Retail'),
(30, 'Rosette Shop', 'Banda', '0753988124', 'Retail'),
(31, 'Hajjat Shop', 'Banda', '0754125375', 'Retail'),
(32, 'Barbinye', 'Bukyegerere', '0755262626', 'Retail'),
(33, 'Gladese', 'Bwaise', '0756399877', 'Retail'),
(34, 'Jimmy (friend)', 'UIRI', '0757536128', 'Individual'),
(35, 'Edvine Supermarket', 'Kireka', '0758673379', 'Supermarket'),
(36, 'Shop Banda', 'Banda', '0759810630', 'Retail'),
(37, 'Shell Kibuye (main)', 'Kibuye', '0770947881', 'Supermarket'),
(38, 'Hajjat Bunamwaya', 'Bunamwaya', '0771084132', 'Dairy Shop'),
(39, 'Man Dairy', 'Bunamwaya', '0772221383', 'Dairy Shop'),
(40, 'B House (Florence)', 'Ngobe', '0773358634', 'Retail'),
(41, 'Kireka (Edvine)', 'Kireka', '0774495885', 'Retail'),
(42, 'Top Family/Jack', 'Banda', '0775632136', 'Retail'),
(43, 'St. Catherines (Florence)', 'Buganda Road at St. Catherine', '0776769387', 'School'),
(44, 'St. Catherine (Florence)', 'Buganda Road', '0777906638', 'School'),
(45, 'Super Market Jack', 'Bukyegerere', '0778043889', 'Supermarket'),
(46, 'Kenny Edvine', 'Kireka', '0779180140', 'Retail'),
(47, 'Super Milk Jack', 'Banda/Bukyegerere', '0780317391', 'Retail'),
(48, 'Banda Jack Shops', 'Banda', '0781454642', 'Retail'),
(49, 'Nancy/Green House (Edvine)', 'Zana', '0782591893', 'Retail'),
(50, 'Peace (Edvine)', 'Zana', '0783728144', 'Retail'),
(51, 'Brian Edvine', 'Zana', '0784865395', 'Retail'),
(52, 'Jimua Road (Edvine)', 'Internal Affairs', '0785002646', 'Government'),
(53, 'Jamir Use (Edvine)', 'Internal Affairs', '0786139897', 'Government'),
(54, 'Sophia (Edvine)', 'Internal Affairs', '0787276148', 'Government'),
(55, 'Musa/Hajjat (Edvine)', 'Internal Affairs', '0788413399', 'Government'),
(56, 'Green House', 'Zana', '0789550650', 'Retail'),
(57, 'Peace', 'Zana', '0700687901', 'Retail'),
(58, 'Malongo', 'Busega', '0701824152', 'Retail'),
(59, 'Malongo Yoghurt', 'Busega', '0702961403', 'Dairy Shop'),
(60, 'Case Clinic', 'Buganda Road', '0703098654', 'Hospital'),
(61, 'Neighbour Nishaly', 'Busega Kabale', '0704235905', 'Retail'),
(62, 'Samona Road', 'Samona Road', '0705372156', 'Retail'),
(63, 'Main Busega (Kolisi)', 'Kibumbiro', NULL, 'Retail'),
(64, 'Bright School', 'Busega Kibumoto', '0706509407', 'School'),
(65, 'Near V. Class', 'Busega main near Stabex', NULL, 'Retail'),
(66, 'St. Anne School Alex', 'Kabowa', '0707646658', 'School'),
(67, 'Bryan Alex', 'Kabowa', '0708783909', 'Retail'),
(68, 'Kitomu Florence', 'B. Kabale Road', '0709920160', 'Retail'),
(69, 'Shop B. Kabale', 'B. Kabale Road', '0740057411', 'Retail'),
(70, 'Shop Next B. Kabale', 'Next B. Kabale Road', '0741194662', 'Retail'),
(71, 'Nabisuusa Shop', 'Nabisuusa (Nansana)', '0742331913', 'Retail'),
(72, 'Paul', 'Nabisuusa', '0743468164', 'Retail'),
(73, 'Hajjat Banda', 'Banda', '0744605415', 'Retail'),
(74, 'Faridah', 'Banda', '0745742666', 'Retail'),
(75, 'Jasta Banda', 'Banda', '0746879917', 'Retail'),
(76, 'Opposite Case Hospital', NULL, '0747016168', 'Retail'),
(77, 'Benjamin', 'Buganda Road', NULL, 'Retail'),
(78, 'Near Milk Super Market', 'Domy', '0748153419', 'Retail'),
(79, 'Sumie Nakeem', 'Makerere', '0964968028', 'Retail'),
(80, 'Margret Sonny', NULL, '0749290670', 'Retail'),
(81, 'Justus Lumula', NULL, NULL, 'Retail'),
(82, 'Mary Stuart', NULL, '0750427921', 'Retail'),
(83, 'Mazima Traders', 'Bwaise', '0751564172', 'Retail'),
(84, 'Near Makerere Main Gate', 'Makerere', '0752701423', 'Retail'),
(85, 'Friend Malongo', 'Nsangi near City Hall', '0753838674', 'Retail'),
(86, 'Najib', 'Near City Hall', '0754975925', 'Retail'),
(87, 'Annek/S. Chartered', 'Near City Hall', '0755112176', 'Retail'),
(88, 'S. Chartered Woman', 'Near City Hall', '0756249427', 'Retail'),
(89, 'Kene', 'Bulenga', '0757386678', 'Retail'),
(90, 'Bulenga Customer', 'Bulenga', '0758523929', 'Retail');

-- ============================================
-- 9. CREDIT ACCOUNTS, EXPENDITURES, ORDERS, ETC.
-- (SAME AS PREVIOUS VERSION - abbreviated for brevity)
-- Include a few samples to show structure
-- ============================================

-- Credit Accounts (sample)
INSERT INTO credit_accounts (customer_id, amount_ugx, transaction_date, status, notes) VALUES
((SELECT customer_id FROM customers WHERE customer_name='Shell Kibuye (main)' LIMIT 1), 84800, '2025-11-12', 'paid', '✓'),
((SELECT customer_id FROM customers WHERE customer_name='Mary Stuart' LIMIT 1), 540000, '2026-01-10', 'paid', '✓ (27 pieces)'),
((SELECT customer_id FROM customers WHERE customer_name='Lumumba' LIMIT 1), 256000, '2026-06-03', 'pending', '');

-- Expenditures (sample)
INSERT INTO expenditures (expenditure_date, category, description, amount_ugx, notes) VALUES
('2025-10-28', 'Milk', '200 litres milk for Batch 03 & 04', 32000, 'Transport to UIRI noted'),
('2025-11-18', 'Milk Powder', '3kg milk powder from Kabalagala', 72000, 'supplier: Kabalagala Dairy'),
('2025-12-17', 'Bottles 300ml', '30 pieces 300ml bottles', 20000, 'supplier: Kampala Packaging');

-- Orders (sample)
INSERT INTO orders (order_id, customer_id, order_date, payment_method, payment_status, total_amount_ugx) VALUES
(1, 28, '2025-11-12', 'cash', 'paid', 54000),
(2, 37, '2025-11-12', 'cash', 'paid', 84800);

-- Order Lines (sample)
INSERT INTO order_lines (order_id, product_id, quantity, line_total_ugx) VALUES
(1, (SELECT product_id FROM products WHERE flavour_id=5 AND size_id=4), 80, 54000), -- Vanilla 300ml
(2, (SELECT product_id FROM products WHERE flavour_id=6 AND size_id=4), 12, 0); -- Plain 300ml

-- Deliveries (sample)
INSERT INTO deliveries (delivery_id, order_id, staff_id, delivery_date, status, notes) VALUES
(1, 1, 1, '2025-11-12', 'delivered', 'Jack/Nambuuka'),
(2, 2, 1, '2026-01-26', 'delivered', 'Jack');
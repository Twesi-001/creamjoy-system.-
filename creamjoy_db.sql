-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: creamjoy_db
-- ------------------------------------------------------
-- Server version	9.7.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;

--
-- GTID state at the beginning of the backup 
--


--
-- Table structure for table `batch_materials`
--

DROP TABLE IF EXISTS `batch_materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batch_materials` (
  `batch_material_id` int NOT NULL AUTO_INCREMENT,
  `batch_id` int NOT NULL,
  `material_id` int NOT NULL,
  `quantity_consumed` decimal(10,2) NOT NULL,
  PRIMARY KEY (`batch_material_id`),
  UNIQUE KEY `unique_batch_material` (`batch_id`,`material_id`),
  KEY `material_id` (`material_id`),
  CONSTRAINT `batch_materials_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`batch_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `batch_materials_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `raw_materials` (`material_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batch_materials`
--

LOCK TABLES `batch_materials` WRITE;
/*!40000 ALTER TABLE `batch_materials` DISABLE KEYS */;
INSERT INTO `batch_materials` VALUES (1,1,1,120.00),(2,1,2,5.00),(3,1,3,15.00),(4,1,4,4.00),(5,1,6,2.00),(6,1,7,1.00),(7,1,11,250.00);
/*!40000 ALTER TABLE `batch_materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `batch_products`
--

DROP TABLE IF EXISTS `batch_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batch_products` (
  `batch_product_id` int NOT NULL AUTO_INCREMENT,
  `batch_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity_produced` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`batch_product_id`),
  UNIQUE KEY `unique_batch_product` (`batch_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `batch_products_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`batch_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `batch_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=182 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batch_products`
--

LOCK TABLES `batch_products` WRITE;
/*!40000 ALTER TABLE `batch_products` DISABLE KEYS */;
INSERT INTO `batch_products` VALUES (1,1,4,82),(2,1,3,12),(3,1,1,2),(4,1,16,30),(5,1,15,5),(6,1,13,1),(7,1,8,32),(8,1,7,6),(9,1,5,2),(10,1,20,54),(11,1,19,0),(12,1,17,3),(13,2,16,67),(14,2,15,3),(15,2,13,1),(16,2,12,25),(17,2,11,0),(18,2,24,10),(19,2,4,132),(20,2,3,30),(21,2,1,6),(22,3,19,3),(23,3,20,21),(24,3,7,3),(25,3,8,55),(26,3,16,90),(27,4,24,33),(28,4,19,3),(29,4,20,60),(30,4,7,3),(31,4,8,35),(32,4,15,14),(33,4,16,103),(34,4,10,3),(35,4,11,10),(36,4,12,74),(37,4,1,6),(38,4,3,22),(39,4,4,150),(40,5,1,9),(41,5,3,15),(42,5,4,126),(43,5,9,3),(44,5,11,8),(45,5,12,126),(46,6,13,2),(47,6,15,7),(48,6,16,31),(49,6,5,1),(50,6,7,2),(51,6,8,71),(52,6,17,1),(53,6,19,2),(54,6,20,74),(55,6,24,41),(56,6,28,83),(57,7,1,9),(58,7,3,15),(59,7,4,126),(60,7,9,4),(61,7,11,10),(62,7,12,133),(63,7,25,1),(64,7,27,10),(65,7,28,143),(66,7,17,4),(67,7,19,5),(68,7,20,105),(69,7,5,1),(70,7,7,5),(71,7,8,110),(72,7,13,2),(73,7,15,8),(74,7,16,70),(75,7,21,1),(76,7,23,5),(77,7,24,59),(78,8,1,10),(79,8,3,20),(80,8,4,257),(81,8,13,4),(82,8,15,10),(83,8,16,131),(84,8,9,7),(85,8,11,15),(86,8,12,240),(87,8,17,4),(88,8,19,10),(89,8,20,214),(90,8,25,2),(91,8,27,8),(92,8,28,172),(93,9,5,2),(94,9,7,7),(95,9,8,92),(96,9,21,1),(97,9,23,5),(98,9,24,107),(99,10,1,5),(100,10,3,16),(101,10,4,169),(102,10,2,2),(103,10,9,3),(104,10,11,6),(105,10,12,85),(106,10,13,1),(107,10,15,5),(108,10,16,52),(109,10,5,0),(110,10,7,94),(111,10,8,70),(112,10,21,1),(113,10,17,1),(114,10,19,10),(115,10,20,114),(116,11,1,9),(117,11,2,3),(118,11,3,13),(119,11,4,228),(120,11,9,4),(121,11,10,2),(122,11,11,8),(123,11,12,233),(124,11,24,61),(125,11,5,1),(126,11,7,2),(127,11,8,117),(128,11,13,2),(129,11,14,1),(130,11,15,5),(131,11,16,78),(132,11,17,3),(133,11,18,3),(134,11,19,65),(135,11,20,59),(156,13,24,632),(157,13,23,37),(158,13,22,5),(159,13,21,10),(160,14,8,46),(161,14,24,31),(162,14,17,1),(163,14,20,102),(164,14,13,3),(165,14,14,2),(166,14,16,68),(167,14,9,1),(168,14,10,2),(169,14,12,70),(170,14,28,47),(171,14,1,2),(172,14,2,2),(173,14,4,92),(174,15,24,403),(175,15,23,1313),(176,15,22,4),(177,15,21,6);
/*!40000 ALTER TABLE `batch_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `batches`
--

DROP TABLE IF EXISTS `batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batches` (
  `batch_id` int NOT NULL AUTO_INCREMENT,
  `batch_number` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `batch_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `status` enum('pending','in_progress','completed','cancelled') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `staff_id` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_general_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`batch_id`),
  KEY `supervisor_id` (`staff_id`),
  KEY `idx_batch_date` (`batch_date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `batches_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batches`
--

LOCK TABLES `batches` WRITE;
/*!40000 ALTER TABLE `batches` DISABLE KEYS */;
INSERT INTO `batches` VALUES (1,'03','2025-10-28','2025-11-11','completed',NULL,NULL,'2026-06-16 02:04:02'),(2,'04','2025-10-28','2025-11-11','completed',NULL,NULL,'2026-06-16 02:04:02'),(3,'04','2025-11-18','2025-12-02','completed',NULL,NULL,'2026-06-16 02:04:02'),(4,'05','2025-11-18','2025-12-02','completed',NULL,NULL,'2026-06-16 02:04:02'),(5,'06','2025-12-03','2025-12-17','completed',NULL,NULL,'2026-06-16 02:04:02'),(6,'06','2025-12-12','2025-12-26','completed',NULL,NULL,'2026-06-16 02:04:02'),(7,'07','2025-12-12','2025-12-26','completed',NULL,NULL,'2026-06-16 02:04:02'),(8,'08','2025-12-17','2025-12-31','completed',NULL,NULL,'2026-06-16 02:04:02'),(9,'08B','2026-01-26','2026-02-09','completed',NULL,NULL,'2026-06-16 02:04:02'),(10,'01','2026-01-26','2026-02-09','completed',NULL,NULL,'2026-06-16 02:04:02'),(11,'02','2026-02-26','2026-03-12','completed',NULL,NULL,'2026-06-16 02:04:02'),(12,'03B','2026-03-16','2026-03-30','completed',NULL,NULL,'2026-06-16 02:04:02'),(13,'04B','2026-04-09','2026-04-23','completed',NULL,NULL,'2026-06-16 02:04:02'),(14,'05B','2026-04-24','2026-05-08','completed',NULL,NULL,'2026-06-16 02:04:02'),(15,'06B','2026-05-22','2026-06-05','completed',NULL,NULL,'2026-06-16 02:04:02'),(16,'07B','2026-06-05','2026-06-19','completed',NULL,NULL,'2026-06-16 02:04:02');
/*!40000 ALTER TABLE `batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `credit_accounts`
--

DROP TABLE IF EXISTS `credit_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_accounts` (
  `credit_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `amount_ugx` decimal(12,2) NOT NULL,
  `transaction_date` date NOT NULL,
  `status` enum('pending','partial','paid','overdue') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `amount_paid_ugx` decimal(12,2) DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_general_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`credit_id`),
  KEY `idx_customer_credit` (`customer_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `credit_accounts_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credit_accounts`
--

LOCK TABLES `credit_accounts` WRITE;
/*!40000 ALTER TABLE `credit_accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `credit_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `location` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `training_phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `customer_type` enum('Retail','Supermarket','Hospital','School','Dairy Shop','Government','Individual') COLLATE utf8mb4_general_ci DEFAULT 'Retail',
  `notes` text COLLATE utf8mb4_general_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  KEY `idx_customer_name` (`customer_name`),
  KEY `idx_location` (`location`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'Mr. Kareli','Kireka Famuli Road','0700837351','Retail',NULL,'2026-06-16 02:04:03'),(2,'Mr. Samuel','Banda Main Road','0701974602','Retail',NULL,'2026-06-16 02:04:03'),(3,'Mummy Fotonola','Nakawa Market','0702111853','Retail',NULL,'2026-06-16 02:04:03'),(4,'Brain','Nakawa Market','0703248104','Retail',NULL,'2026-06-16 02:04:03'),(5,'Bunamwaya Customer','Bunamwaya',NULL,'Retail',NULL,'2026-06-16 02:04:03'),(6,'Godfrey','Nakawa','0704385355','Retail',NULL,'2026-06-16 02:04:03'),(7,'T.T.','Nakawa','0705522606','Retail',NULL,'2026-06-16 02:04:03'),(8,'Nalongo','Nakawa','0303718950','Retail',NULL,'2026-06-16 02:04:03'),(9,'A. Roya','Nakawa','0334046166','Retail',NULL,'2026-06-16 02:04:03'),(10,'David','Nakawa','0706659857','Retail',NULL,'2026-06-16 02:04:03'),(11,'Emma','Nakawa','0268913271','Retail',NULL,'2026-06-16 02:04:03'),(12,'Rebeccah','Bukyegerere','0707796108','Retail',NULL,'2026-06-16 02:04:03'),(13,'Juliet Namulandali','Bukyegerere','0708933359','Retail',NULL,'2026-06-16 02:04:03'),(14,'Nadia','Bukyegerere','0709070610','Retail',NULL,'2026-06-16 02:04:03'),(15,'Fauvar','Banda','0740207861','Retail',NULL,'2026-06-16 02:04:03'),(16,'Aunt Rose','Bunamwaya','0741344112','Retail',NULL,'2026-06-16 02:04:03'),(17,'Suubi Fresh Dairy','Bunamwaya','0742481363','Dairy Shop',NULL,'2026-06-16 02:04:03'),(18,'Nican Lodge','Lweza','0743618614','Retail',NULL,'2026-06-16 02:04:03'),(19,'Unknown 19',NULL,'0744755865','Retail',NULL,'2026-06-16 02:04:03'),(20,'Unknown 20',NULL,'0745892116','Retail',NULL,'2026-06-16 02:04:03'),(21,'Unknown 21',NULL,NULL,'Retail',NULL,'2026-06-16 02:04:03'),(22,'Unknown 22',NULL,NULL,'Retail',NULL,'2026-06-16 02:04:03'),(23,'Mazima Traders','Bwaise','0746029367','Retail',NULL,'2026-06-16 02:04:03'),(24,'Mirembe Dairy','Bwaise','0747166618','Dairy Shop',NULL,'2026-06-16 02:04:03'),(25,'Supermilk','Bukyegerere','0748303869','Retail',NULL,'2026-06-16 02:04:03'),(26,'Mukande','Bukyegerere','0749440120','Retail',NULL,'2026-06-16 02:04:03'),(27,'Christopher','Spear Motors','0750577371','Retail',NULL,'2026-06-16 02:04:03'),(28,'Shell Kibuye','Kibuye','0751714622','Supermarket',NULL,'2026-06-16 02:04:03'),(29,'Baraka Mini Spot','Kireka','0752851873','Retail',NULL,'2026-06-16 02:04:03'),(30,'Rosette Shop','Banda','0753988124','Retail',NULL,'2026-06-16 02:04:03'),(31,'Hajjat Shop','Banda','0754125375','Retail',NULL,'2026-06-16 02:04:03'),(32,'Barbinye','Bukyegerere','0755262626','Retail',NULL,'2026-06-16 02:04:03'),(33,'Gladese','Bwaise','0756399877','Retail',NULL,'2026-06-16 02:04:03'),(34,'Jimmy (friend)','UIRI','0757536128','Individual',NULL,'2026-06-16 02:04:03'),(35,'Edvine Supermarket','Kireka','0758673379','Supermarket',NULL,'2026-06-16 02:04:03'),(36,'Shop Banda','Banda','0759810630','Retail',NULL,'2026-06-16 02:04:03'),(37,'Shell Kibuye (main)','Kibuye','0770947881','Supermarket',NULL,'2026-06-16 02:04:03'),(38,'Hajjat Bunamwaya','Bunamwaya','0771084132','Dairy Shop',NULL,'2026-06-16 02:04:03'),(39,'Man Dairy','Bunamwaya','0772221383','Dairy Shop',NULL,'2026-06-16 02:04:03'),(40,'B House (Florence)','Ngobe','0773358634','Retail',NULL,'2026-06-16 02:04:03'),(41,'Kireka (Edvine)','Kireka','0774495885','Retail',NULL,'2026-06-16 02:04:03'),(42,'Top Family/Jack','Banda','0775632136','Retail',NULL,'2026-06-16 02:04:03'),(43,'St. Catherines (Florence)','Buganda Road at St. Catherine','0776769387','School',NULL,'2026-06-16 02:04:03'),(44,'St. Catherine (Florence)','Buganda Road','0777906638','School',NULL,'2026-06-16 02:04:03'),(45,'Super Market Jack','Bukyegerere','0778043889','Supermarket',NULL,'2026-06-16 02:04:03'),(46,'Kenny Edvine','Kireka','0779180140','Retail',NULL,'2026-06-16 02:04:03'),(47,'Super Milk Jack','Banda/Bukyegerere','0780317391','Retail',NULL,'2026-06-16 02:04:03'),(48,'Banda Jack Shops','Banda','0781454642','Retail',NULL,'2026-06-16 02:04:03'),(49,'Nancy/Green House (Edvine)','Zana','0782591893','Retail',NULL,'2026-06-16 02:04:03'),(50,'Peace (Edvine)','Zana','0783728144','Retail',NULL,'2026-06-16 02:04:03'),(51,'Brian Edvine','Zana','0784865395','Retail',NULL,'2026-06-16 02:04:03'),(52,'Jimua Road (Edvine)','Internal Affairs','0785002646','Government',NULL,'2026-06-16 02:04:03'),(53,'Jamir Use (Edvine)','Internal Affairs','0786139897','Government',NULL,'2026-06-16 02:04:03'),(54,'Sophia (Edvine)','Internal Affairs','0787276148','Government',NULL,'2026-06-16 02:04:03'),(55,'Musa/Hajjat (Edvine)','Internal Affairs','0788413399','Government',NULL,'2026-06-16 02:04:03'),(56,'Green House','Zana','0789550650','Retail',NULL,'2026-06-16 02:04:03'),(57,'Peace','Zana','0700687901','Retail',NULL,'2026-06-16 02:04:03'),(58,'Malongo','Busega','0701824152','Retail',NULL,'2026-06-16 02:04:03'),(59,'Malongo Yoghurt','Busega','0702961403','Dairy Shop',NULL,'2026-06-16 02:04:03'),(60,'Case Clinic','Buganda Road','0703098654','Hospital',NULL,'2026-06-16 02:04:03'),(61,'Neighbour Nishaly','Busega Kabale','0704235905','Retail',NULL,'2026-06-16 02:04:03'),(62,'Samona Road','Samona Road','0705372156','Retail',NULL,'2026-06-16 02:04:03'),(63,'Main Busega (Kolisi)','Kibumbiro',NULL,'Retail',NULL,'2026-06-16 02:04:03'),(64,'Bright School','Busega Kibumoto','0706509407','School',NULL,'2026-06-16 02:04:03'),(65,'Near V. Class','Busega main near Stabex',NULL,'Retail',NULL,'2026-06-16 02:04:03'),(66,'St. Anne School Alex','Kabowa','0707646658','School',NULL,'2026-06-16 02:04:03'),(67,'Bryan Alex','Kabowa','0708783909','Retail',NULL,'2026-06-16 02:04:03'),(68,'Kitomu Florence','B. Kabale Road','0709920160','Retail',NULL,'2026-06-16 02:04:03'),(69,'Shop B. Kabale','B. Kabale Road','0740057411','Retail',NULL,'2026-06-16 02:04:03'),(70,'Shop Next B. Kabale','Next B. Kabale Road','0741194662','Retail',NULL,'2026-06-16 02:04:03'),(71,'Nabisuusa Shop','Nabisuusa (Nansana)','0742331913','Retail',NULL,'2026-06-16 02:04:03'),(72,'Paul','Nabisuusa','0743468164','Retail',NULL,'2026-06-16 02:04:03'),(73,'Hajjat Banda','Banda','0744605415','Retail',NULL,'2026-06-16 02:04:03'),(74,'Faridah','Banda','0745742666','Retail',NULL,'2026-06-16 02:04:03'),(75,'Jasta Banda','Banda','0746879917','Retail',NULL,'2026-06-16 02:04:03'),(76,'Opposite Case Hospital',NULL,'0747016168','Retail',NULL,'2026-06-16 02:04:03'),(77,'Benjamin','Buganda Road',NULL,'Retail',NULL,'2026-06-16 02:04:03'),(78,'Near Milk Super Market','Domy','0748153419','Retail',NULL,'2026-06-16 02:04:03'),(79,'Sumie Nakeem','Makerere','0964968028','Retail',NULL,'2026-06-16 02:04:03'),(80,'Margret Sonny',NULL,'0749290670','Retail',NULL,'2026-06-16 02:04:03'),(81,'Justus Lumula',NULL,NULL,'Retail',NULL,'2026-06-16 02:04:03'),(82,'Mary Stuart',NULL,'0750427921','Retail',NULL,'2026-06-16 02:04:03'),(83,'Mazima Traders','Bwaise','0751564172','Retail',NULL,'2026-06-16 02:04:03'),(84,'Near Makerere Main Gate','Makerere','0752701423','Retail',NULL,'2026-06-16 02:04:03'),(85,'Friend Malongo','Nsangi near City Hall','0753838674','Retail',NULL,'2026-06-16 02:04:03'),(86,'Najib','Near City Hall','0754975925','Retail',NULL,'2026-06-16 02:04:03'),(87,'Annek/S. Chartered','Near City Hall','0755112176','Retail',NULL,'2026-06-16 02:04:03'),(88,'S. Chartered Woman','Near City Hall','0756249427','Retail',NULL,'2026-06-16 02:04:03'),(89,'Kene','Bulenga','0757386678','Retail',NULL,'2026-06-16 02:04:03'),(90,'Bulenga Customer','Bulenga','0758523929','Retail',NULL,'2026-06-16 02:04:03');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deliveries`
--

DROP TABLE IF EXISTS `deliveries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deliveries` (
  `delivery_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `delivery_type` enum('incoming','outgoing') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'outgoing',
  `staff_id` int NOT NULL,
  `delivery_date` date NOT NULL,
  `status` enum('received','pending_inspection','quality_checked','stored','pending','dispatched','delivered','failed','returned') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_general_ci,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`delivery_id`),
  KEY `order_id` (`order_id`),
  KEY `staff_id` (`staff_id`),
  KEY `idx_delivery_date` (`delivery_date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `deliveries_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON UPDATE CASCADE,
  CONSTRAINT `deliveries_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliveries`
--

LOCK TABLES `deliveries` WRITE;
/*!40000 ALTER TABLE `deliveries` DISABLE KEYS */;
INSERT INTO `deliveries` VALUES (1,1,'outgoing',1,'2025-11-12','delivered','Jack/Nambuuka','2026-06-16 02:04:04'),(2,2,'outgoing',1,'2026-01-26','delivered','Jack','2026-06-16 02:04:04'),(3,3,'outgoing',1,'2026-01-26','delivered','Jack','2026-06-16 02:04:04'),(4,4,'outgoing',4,'2026-01-26','delivered','Edvine','2026-06-16 02:04:04'),(5,5,'outgoing',1,'2026-01-26','dispatched','Jack','2026-06-16 02:04:04'),(6,6,'outgoing',2,'2025-12-05','delivered','Namuyanja field','2026-06-16 02:04:04'),(7,7,'outgoing',1,'2026-01-26','delivered','Jack','2026-06-16 02:04:04'),(8,8,'outgoing',2,'2025-12-15','delivered','Namuyanja in field','2026-06-16 02:04:04');
/*!40000 ALTER TABLE `deliveries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_audit`
--

DROP TABLE IF EXISTS `delivery_audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_audit` (
  `audit_id` int NOT NULL AUTO_INCREMENT,
  `delivery_id` int NOT NULL,
  `old_status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `new_status` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `changed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `changed_by` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`audit_id`),
  KEY `delivery_id` (`delivery_id`),
  CONSTRAINT `delivery_audit_ibfk_1` FOREIGN KEY (`delivery_id`) REFERENCES `deliveries` (`delivery_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_audit`
--

LOCK TABLES `delivery_audit` WRITE;
/*!40000 ALTER TABLE `delivery_audit` DISABLE KEYS */;
INSERT INTO `delivery_audit` VALUES (1,1,'pending','delivered','2026-06-16 02:04:06','Jack');
/*!40000 ALTER TABLE `delivery_audit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenditures`
--

DROP TABLE IF EXISTS `expenditures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenditures` (
  `expenditure_id` int NOT NULL AUTO_INCREMENT,
  `expenditure_date` date NOT NULL,
  `category` enum('Milk','Milk Powder','Sugar','Starch','Bushela','Stabilizer','Culture','Matapolo','Vanilla Essence','Bottles 1L','Bottles 300ml','Stickers','Tencan','Transport','Uniform Washing','Allowance','Ice','Other') COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `unit` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `amount_ugx` decimal(12,2) NOT NULL,
  `paid_by_id` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_general_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`expenditure_id`),
  KEY `paid_by_id` (`paid_by_id`),
  KEY `idx_expenditure_date` (`expenditure_date`),
  KEY `idx_category` (`category`),
  CONSTRAINT `expenditures_ibfk_1` FOREIGN KEY (`paid_by_id`) REFERENCES `staff` (`staff_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenditures`
--

LOCK TABLES `expenditures` WRITE;
/*!40000 ALTER TABLE `expenditures` DISABLE KEYS */;
INSERT INTO `expenditures` VALUES (1,'2025-10-28','Milk','200 litres milk for Batch 03 & 04',NULL,NULL,32000.00,NULL,'Transport to UIRI noted','2026-06-16 02:04:04'),(2,'2025-10-28','Sugar','Sugar for Batch 03',NULL,NULL,60000.00,NULL,'25 April production cost','2026-06-16 02:04:04'),(3,'2025-10-28','Starch','Starch from Kabalagala',NULL,NULL,40000.00,NULL,'','2026-06-16 02:04:04'),(4,'2025-11-18','Milk Powder','3kg milk powder',NULL,NULL,72000.00,NULL,'from Kabalagala','2026-06-16 02:04:04'),(5,'2025-11-18','Bushela','2kg bushela',NULL,NULL,15600.00,NULL,'stabilising ingredient','2026-06-16 02:04:04'),(6,'2025-11-18','Stabilizer','2kg stabilizer',NULL,NULL,50000.00,NULL,'','2026-06-16 02:04:04'),(7,'2025-12-03','Culture','Yoghurt culture starter',NULL,NULL,35000.00,NULL,'','2026-06-16 02:04:04'),(8,'2025-12-03','Vanilla Essence','Vanilla essence bottle',NULL,NULL,15000.00,NULL,'','2026-06-16 02:04:04'),(9,'2025-12-12','Matapolo','Matapolo pack',NULL,NULL,34000.00,NULL,'stabiliser','2026-06-16 02:04:04'),(10,'2025-12-12','Bottles 1L','1L bottles dozen',NULL,NULL,16000.00,NULL,'','2026-06-16 02:04:04'),(11,'2025-12-17','Bottles 300ml','30 pieces 300ml bottles',NULL,NULL,20000.00,NULL,'','2026-06-16 02:04:04'),(12,'2025-12-17','Stickers','New stickers',NULL,NULL,48000.00,NULL,'','2026-06-16 02:04:04'),(13,'2025-12-17','Tencan','Tencan 1L (25 pieces)',NULL,NULL,24000.00,NULL,'','2026-06-16 02:04:04'),(14,'2025-12-20','Transport','Delivery transport',NULL,NULL,2000.00,NULL,'from Jack delivery note','2026-06-16 02:04:04'),(15,'2025-12-22','Allowance','Staff allowance production',NULL,NULL,50000.00,NULL,'Alex and Levi','2026-06-16 02:04:04'),(16,'2026-01-10','Uniform Washing','Uniform washing',NULL,NULL,10000.00,NULL,'','2026-06-16 02:04:04'),(17,'2026-01-26','Milk','Milk for Batch 08B',NULL,NULL,64000.00,NULL,'400 litres','2026-06-16 02:04:04'),(18,'2026-04-09','Sugar','Sugar for Plain batch',NULL,NULL,120000.00,NULL,'','2026-06-16 02:04:04'),(19,'2026-04-24','Bottles 300ml','300ml bottles 90 pieces',NULL,NULL,60000.00,NULL,'','2026-06-16 02:04:04'),(20,'2026-06-05','Milk','Milk for Batch 07B',NULL,NULL,80000.00,NULL,'500 litres','2026-06-16 02:04:04');
/*!40000 ALTER TABLE `expenditures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flavours`
--

DROP TABLE IF EXISTS `flavours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flavours` (
  `flavour_id` int NOT NULL AUTO_INCREMENT,
  `flavour_name` enum('Millet','Chocolate','Strawberry','Mango','Vanilla','Plain','Blueberry','Bushela') COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`flavour_id`),
  UNIQUE KEY `flavour_name` (`flavour_name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flavours`
--

LOCK TABLES `flavours` WRITE;
/*!40000 ALTER TABLE `flavours` DISABLE KEYS */;
INSERT INTO `flavours` VALUES (1,'Millet'),(2,'Chocolate'),(3,'Strawberry'),(4,'Mango'),(5,'Vanilla'),(6,'Plain'),(7,'Blueberry'),(8,'Bushela');
/*!40000 ALTER TABLE `flavours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_lines`
--

DROP TABLE IF EXISTS `order_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_lines` (
  `order_line_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price_ugx` decimal(10,2) DEFAULT NULL,
  `line_total_ugx` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`order_line_id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_lines_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_lines_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_lines`
--

LOCK TABLES `order_lines` WRITE;
/*!40000 ALTER TABLE `order_lines` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `order_date` date NOT NULL,
  `delivery_date` date DEFAULT NULL,
  `payment_method` enum('cash','mobile_money','credit','bank_transfer') COLLATE utf8mb4_general_ci DEFAULT 'cash',
  `payment_status` enum('pending','partial','paid','overdue') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `total_amount_ugx` decimal(12,2) DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_general_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `customer_id` (`customer_id`),
  KEY `idx_order_date` (`order_date`),
  KEY `idx_payment_status` (`payment_status`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,28,'2025-11-12',NULL,'cash','paid',54000.00,NULL,'2026-06-16 02:04:04'),(2,37,'2025-11-12',NULL,'cash','paid',84800.00,NULL,'2026-06-16 02:04:04'),(3,52,'2026-01-26',NULL,'cash','paid',30000.00,NULL,'2026-06-16 02:04:04'),(4,53,'2026-01-26',NULL,'cash','paid',30000.00,NULL,'2026-06-16 02:04:04'),(5,38,'2026-01-26',NULL,'credit','pending',0.00,NULL,'2026-06-16 02:04:04'),(6,2,'2025-12-05',NULL,'credit','partial',0.00,NULL,'2026-06-16 02:04:04'),(7,51,'2026-01-26',NULL,'cash','paid',54000.00,NULL,'2026-06-16 02:04:04'),(8,12,'2025-12-15',NULL,'cash','paid',64800.00,NULL,'2026-06-16 02:04:04');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pack_sizes`
--

DROP TABLE IF EXISTS `pack_sizes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pack_sizes` (
  `size_id` int NOT NULL AUTO_INCREMENT,
  `size_name` enum('300ml','1L','2L','5L') COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`size_id`),
  UNIQUE KEY `size_name` (`size_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pack_sizes`
--

LOCK TABLES `pack_sizes` WRITE;
/*!40000 ALTER TABLE `pack_sizes` DISABLE KEYS */;
INSERT INTO `pack_sizes` VALUES (1,'300ml'),(2,'1L'),(3,'2L'),(4,'5L');
/*!40000 ALTER TABLE `pack_sizes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `flavour` enum('Millet','Chocolate','Strawberry','Mango','Vanilla','Plain','Blueberry','Bushela') COLLATE utf8mb4_general_ci NOT NULL,
  `size` enum('5L','2L','1L','300ml') COLLATE utf8mb4_general_ci NOT NULL,
  `unit_price_ugx` decimal(10,2) DEFAULT NULL,
  `flavour_id` int NOT NULL,
  `size_id` int NOT NULL,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `unique_product` (`flavour`,`size`),
  KEY `fk_products_flavour` (`flavour_id`),
  KEY `fk_products_size` (`size_id`),
  CONSTRAINT `fk_products_flavour` FOREIGN KEY (`flavour_id`) REFERENCES `flavours` (`flavour_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_products_size` FOREIGN KEY (`size_id`) REFERENCES `pack_sizes` (`size_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Millet','5L',NULL,1,4),(2,'Millet','2L',NULL,1,3),(3,'Millet','1L',NULL,1,2),(4,'Millet','300ml',NULL,1,1),(5,'Chocolate','5L',NULL,2,4),(6,'Chocolate','2L',NULL,2,3),(7,'Chocolate','1L',NULL,2,2),(8,'Chocolate','300ml',NULL,2,1),(9,'Strawberry','5L',NULL,3,4),(10,'Strawberry','2L',NULL,3,3),(11,'Strawberry','1L',NULL,3,2),(12,'Strawberry','300ml',NULL,3,1),(13,'Mango','5L',NULL,4,4),(14,'Mango','2L',NULL,4,3),(15,'Mango','1L',NULL,4,2),(16,'Mango','300ml',NULL,4,1),(17,'Vanilla','5L',NULL,5,4),(18,'Vanilla','2L',NULL,5,3),(19,'Vanilla','1L',NULL,5,2),(20,'Vanilla','300ml',NULL,5,1),(21,'Plain','5L',NULL,6,4),(22,'Plain','2L',NULL,6,3),(23,'Plain','1L',NULL,6,2),(24,'Plain','300ml',NULL,6,1),(25,'Blueberry','5L',NULL,7,4),(26,'Blueberry','2L',NULL,7,3),(27,'Blueberry','1L',NULL,7,2),(28,'Blueberry','300ml',NULL,7,1),(29,'Bushela','5L',NULL,8,4),(30,'Bushela','2L',NULL,8,3),(31,'Bushela','1L',NULL,8,2),(32,'Bushela','300ml',NULL,8,1);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `raw_materials`
--

DROP TABLE IF EXISTS `raw_materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `raw_materials` (
  `material_id` int NOT NULL AUTO_INCREMENT,
  `material_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `unit` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `cost_per_unit_ugx` decimal(10,2) NOT NULL,
  `current_stock` decimal(10,2) DEFAULT '0.00',
  `minimum_stock` decimal(10,2) NOT NULL,
  `last_restocked` date DEFAULT NULL,
  `supplier_id` int DEFAULT NULL,
  PRIMARY KEY (`material_id`),
  UNIQUE KEY `material_name` (`material_name`),
  KEY `fk_raw_materials_supplier` (`supplier_id`),
  CONSTRAINT `fk_raw_materials_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `raw_materials`
--

LOCK TABLES `raw_materials` WRITE;
/*!40000 ALTER TABLE `raw_materials` DISABLE KEYS */;
INSERT INTO `raw_materials` VALUES (1,'Milk','Litres',1800.00,500.00,100.00,'2026-06-19',1),(2,'Milk Powder','Kg',12000.00,50.00,10.00,NULL,1),(3,'Sugar','Kg',5000.00,80.00,20.00,NULL,3),(4,'Starch','Kg',4000.00,30.00,10.00,NULL,1),(5,'Bushela','Kg',6000.00,40.00,10.00,NULL,4),(6,'Stabilizer','Kg',15000.00,20.00,5.00,NULL,4),(7,'Culture','Packets',10000.00,25.00,5.00,NULL,NULL),(8,'Vanilla Essence','Litres',18000.00,15.00,3.00,NULL,NULL),(9,'Matapolo','Pack',34000.00,1.00,1.00,NULL,NULL),(10,'Bottles 1L','Pieces',800.00,300.00,50.00,NULL,2),(11,'Bottles 300ml','Pieces',300.00,1000.00,200.00,NULL,2),(12,'Stickers','Sheet',5000.00,5.00,2.00,NULL,2),(13,'Tencan 1L','25 pieces',24000.00,10.00,5.00,NULL,2);
/*!40000 ALTER TABLE `raw_materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `staff_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` enum('production','delivery','sales','maintenance','supervisor','admin') COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`staff_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,'Jack',NULL,NULL,'delivery','0700000001','2026-06-16 02:04:02','2026-06-16 02:04:02'),(2,'Namuyanja',NULL,NULL,'delivery','0700000002','2026-06-16 02:04:02','2026-06-16 02:04:02'),(3,'Florence',NULL,NULL,'delivery','0700000003','2026-06-16 02:04:02','2026-06-16 02:04:02'),(4,'Edvine',NULL,NULL,'delivery','0700000004','2026-06-16 02:04:02','2026-06-16 02:04:02'),(5,'Teo',NULL,NULL,'sales','0700000005','2026-06-16 02:04:02','2026-06-16 02:04:02'),(6,'Alex',NULL,NULL,'production','0700000006','2026-06-16 02:04:02','2026-06-16 02:04:02'),(7,'Levi',NULL,NULL,'production','0700000007','2026-06-16 02:04:02','2026-06-16 02:04:02'),(8,'Salim',NULL,NULL,'maintenance','0700000008','2026-06-16 02:04:02','2026-06-16 02:04:02'),(9,'Olivia',NULL,NULL,'sales','0700000009','2026-06-16 02:04:02','2026-06-16 02:04:02'),(10,'Dan',NULL,NULL,'delivery','0700000010','2026-06-16 02:04:02','2026-06-16 02:04:02'),(11,'Jack','jack@creamjoy.com','pbkdf2:sha256:600000$3V5jNfpkmNwGaOBc$ee06dd61ffb30afdaa7da419bd59a83415197efdcd0461fd7df23ccf606b1368','delivery',NULL,'2026-06-19 10:46:34','2026-06-27 17:21:27'),(12,'A','a@test.com','scrypt:32768:8:1$roIluAZKiyt155Nn$37ce331e6863f8023e822cc8ce53434ba5dc64bd1bead8636f49ff77ae3b340fa307cc4c2c5cfc063e18257152b633d186e425d70bd1f88047c84872a07306dc','delivery',NULL,'2026-06-19 12:01:42','2026-06-19 12:01:42'),(13,'System Admin','admin@creamjoy.com','pbkdf2:sha256:600000$XL1UTYbwcGL18ONS$10e145668e7298ec9647b64d8152305adb3ce982efc5e9d93c82848e30c9ed8b','admin','0777000000','2026-06-27 16:54:06','2026-06-27 17:10:49'),(15,'Production User','production@creamjoy.com','pbkdf2:sha256:600000$mIrR28nuolYgWSo4$7c65999a0a8190abf50f998d32a5d1fdccc301bd9b10b86ce7041645c96bb9e6','production','0777000000','2026-06-27 17:21:27','2026-06-27 17:21:27'),(16,'Delivery User','delivery@creamjoy.com','pbkdf2:sha256:600000$0RVRSfsgIQYt2xpE$847ce8cf562ec26dd4785c43f62284cfc44a2fe6b1acb43fad8e1950604d500b','delivery','0777000000','2026-06-27 17:21:28','2026-06-27 17:21:28'),(17,'Sales User','sales@creamjoy.com','pbkdf2:sha256:600000$JW0HenXDg18IRYLe$78ecb5475456553bee8f1f0331eb6deab0a5884515a3cf2d1fab539b33a319ec','sales','0777000000','2026-06-27 17:21:29','2026-06-27 17:21:29'),(18,'Supervisor User','supervisor@creamjoy.com','pbkdf2:sha256:600000$HyNVM3LfgQtPxXGO$99eddddc420fa46317055d4b66c843162efdeb91018249e61b9ea551b012565e','supervisor','0777000004','2026-06-27 17:37:41','2026-06-27 17:49:41');
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `supplier_id` int NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `contact_person` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `location` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_general_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'Kabalagala Dairy Supplies','Mr. Mugisha',NULL,NULL,'Kabalagala','Supplies Milk Powder and Starch','2026-06-16 10:11:01'),(2,'Kampala Packaging Ltd','Ms. Nakato',NULL,NULL,'Industrial Area','Supplies Bottles, Tencan, and Stickers','2026-06-16 10:11:01'),(3,'Uganda Sugar Dealers','Mr. Ssali',NULL,NULL,'Nakawa','Supplies Sugar in bulk','2026-06-16 10:11:01'),(4,'Bushela Mills','Mr. Okello',NULL,NULL,'Jinja Road','Supplies Bushela and Stabilizer','2026-06-16 10:11:01'),(5,'City Chemicals Ltd','Ms. Achieng',NULL,NULL,'Nakawa','Supplies Culture, Vanilla Essence, and Matapolo','2026-06-16 10:11:01'),(6,'collinsug','Tonny','0760108564','tonnytwesigye001@gmail.com','mbarara','great','2026-06-27 17:56:51');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-27 22:55:29

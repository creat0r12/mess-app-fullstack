-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: mess_app
-- ------------------------------------------------------
-- Server version	8.0.44

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

--
-- Table structure for table `mess_cycles`
--

DROP TABLE IF EXISTS `mess_cycles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mess_cycles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `cycle_start_date` date NOT NULL,
  `cycle_end_date` date NOT NULL,
  `base_amount` int NOT NULL,
  `gender` enum('MALE','FEMALE','OTHER') NOT NULL,
  `free_absence_limit` int DEFAULT '5',
  PRIMARY KEY (`id`),
  KEY `fk_cycles_student` (`student_id`),
  CONSTRAINT `fk_cycles_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mess_cycles_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mess_cycles`
--

LOCK TABLES `mess_cycles` WRITE;
/*!40000 ALTER TABLE `mess_cycles` DISABLE KEYS */;
/*!40000 ALTER TABLE `mess_cycles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mess_settings`
--

DROP TABLE IF EXISTS `mess_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mess_settings` (
  `id` int NOT NULL DEFAULT '1',
  `mess_open` tinyint(1) DEFAULT '1',
  `notice` text,
  `menu` text,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `boys_monthly_amount` int DEFAULT '0',
  `girls_monthly_amount` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mess_settings`
--

LOCK TABLES `mess_settings` WRITE;
/*!40000 ALTER TABLE `mess_settings` DISABLE KEYS */;
INSERT INTO `mess_settings` VALUES (1,1,'','',NULL,'2026-04-07 11:56:41',0,0);
/*!40000 ALTER TABLE `mess_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messes`
--

DROP TABLE IF EXISTS `messes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `owner_user_id` int DEFAULT NULL,
  `phone` varchar(15) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text NOT NULL,
  `description` text,
  `status` enum('DRAFT','PENDING_VERIFICATION','APPROVED','ACTIVE','REJECTED','SUSPENDED','CLOSED') NOT NULL DEFAULT 'DRAFT',
  `last_activity_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `payment_mode` enum('SIMPLE','ADVANCED') DEFAULT 'SIMPLE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_mess_phone` (`phone`),
  UNIQUE KEY `uq_one_mess_per_admin` (`owner_user_id`),
  CONSTRAINT `fk_mess_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messes`
--

LOCK TABLES `messes` WRITE;
/*!40000 ALTER TABLE `messes` DISABLE KEYS */;
INSERT INTO `messes` VALUES (1,'raj',5,'9322824378','kushalpatil12112@gmail.com','gandhi nagar nandurbar','jii','ACTIVE',NULL,'2026-03-20 16:08:53','2026-03-20 16:09:24','SIMPLE'),(2,'divesh',13,'1234567891',NULL,'hello','byy','ACTIVE',NULL,'2026-03-22 15:03:25','2026-03-22 15:03:45','SIMPLE'),(3,'dasha mata mess',16,'8263818696','malikunal304@gmail.com','balaji nagar','give me fast responses','REJECTED',NULL,'2026-04-07 11:49:31','2026-04-07 12:03:36','SIMPLE'),(4,'devdatt mess',17,'8263818698','ganeshchadhary@gmail.com','balaji nagar','give fast response','ACTIVE',NULL,'2026-04-07 11:54:41','2026-04-07 11:55:17','SIMPLE');
/*!40000 ALTER TABLE `messes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_settings`
--

DROP TABLE IF EXISTS `payment_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_settings` (
  `id` int NOT NULL DEFAULT '1',
  `mess_id` int DEFAULT NULL,
  `upi_enabled` tinyint(1) DEFAULT '1',
  `cash_enabled` tinyint(1) DEFAULT '1',
  `upi_id` varchar(100) DEFAULT NULL,
  `qr_image` varchar(255) DEFAULT NULL,
  `boys_one_time` int DEFAULT '0',
  `boys_two_time` int DEFAULT '0',
  `girls_one_time` int DEFAULT '0',
  `girls_two_time` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `mess_id` (`mess_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_settings`
--

LOCK TABLES `payment_settings` WRITE;
/*!40000 ALTER TABLE `payment_settings` DISABLE KEYS */;
INSERT INTO `payment_settings` VALUES (1,1,1,1,'9322824378','1774207990225-385322108.png',1300,2200,1100,1800);
/*!40000 ALTER TABLE `payment_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_transactions`
--

DROP TABLE IF EXISTS `payment_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `membership_id` int NOT NULL,
  `payment_id` int DEFAULT NULL,
  `amount` int NOT NULL,
  `proof_url` varchar(255) NOT NULL,
  `status` enum('PENDING','APPLIED','REJECTED') DEFAULT 'PENDING',
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `action_at` datetime DEFAULT NULL,
  `admin_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `membership_id` (`membership_id`),
  KEY `payment_id` (`payment_id`),
  CONSTRAINT `payment_transactions_ibfk_1` FOREIGN KEY (`membership_id`) REFERENCES `student_mess_membership` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_transactions_ibfk_2` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_transactions`
--

LOCK TABLES `payment_transactions` WRITE;
/*!40000 ALTER TABLE `payment_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mess_id` int NOT NULL,
  `membership_id` int NOT NULL,
  `cycle_id` int DEFAULT NULL,
  `amount` int NOT NULL,
  `due_amount` int DEFAULT NULL,
  `paid_amount` int DEFAULT NULL,
  `payment_month` varchar(20) DEFAULT NULL,
  `payment_year` int DEFAULT NULL,
  `status` enum('DUE','PENDING','PAID') DEFAULT 'DUE',
  `proof_url` varchar(255) DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `payment_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cycle_id` (`cycle_id`),
  KEY `idx_mess_id` (`mess_id`),
  KEY `idx_membership_id` (`membership_id`),
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`cycle_id`) REFERENCES `mess_cycles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,15,NULL,1800,1800,0,'March',2026,'DUE',NULL,NULL,NULL),(2,1,16,NULL,1800,1800,0,'March',2026,'DUE',NULL,NULL,NULL),(3,1,24,NULL,1300,1300,0,'March',2026,'DUE',NULL,NULL,NULL),(4,1,25,NULL,2200,2200,0,'March',2026,'DUE',NULL,NULL,NULL);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments_simple`
--

DROP TABLE IF EXISTS `payments_simple`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments_simple` (
  `id` int NOT NULL AUTO_INCREMENT,
  `membership_id` int NOT NULL,
  `mess_id` int NOT NULL,
  `amount` int DEFAULT NULL,
  `proof_url` varchar(255) NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','CANCELLED') DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `mess_id` (`mess_id`),
  KEY `fk_membership` (`membership_id`),
  CONSTRAINT `fk_membership` FOREIGN KEY (`membership_id`) REFERENCES `student_mess_membership` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_simple_ibfk_2` FOREIGN KEY (`mess_id`) REFERENCES `messes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments_simple`
--

LOCK TABLES `payments_simple` WRITE;
/*!40000 ALTER TABLE `payments_simple` DISABLE KEYS */;
INSERT INTO `payments_simple` VALUES (8,1,1,11251,'/uploads/payments/1775473496442-222905117.png','CANCELLED','2026-04-06 11:04:56'),(9,1,1,2200,'/uploads/payments/1775473568020-20101120.png','APPROVED','2026-04-06 11:06:08'),(10,1,1,1250,'/uploads/payments/1775478008901-257644785.png','REJECTED','2026-04-06 12:20:08'),(11,1,1,1548,'/uploads/payments/1775478031997-247493718.png','PENDING','2026-04-06 12:20:32');
/*!40000 ALTER TABLE `payments_simple` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_leaves`
--

DROP TABLE IF EXISTS `student_leaves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_leaves` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `leave_date` date NOT NULL,
  `reason` text,
  `status` varchar(30) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `verified_at` timestamp NULL DEFAULT NULL,
  `returned_at` datetime DEFAULT NULL,
  `actual_leave_date` date DEFAULT NULL,
  `actual_return_date` datetime DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejected_at` datetime DEFAULT NULL,
  `membership_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_leaves_user_fk` (`user_id`),
  CONSTRAINT `student_leaves_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_leaves`
--

LOCK TABLES `student_leaves` WRITE;
/*!40000 ALTER TABLE `student_leaves` DISABLE KEYS */;
INSERT INTO `student_leaves` VALUES (1,6,'2026-03-20','byy','RETURNED','2026-03-20 16:11:47','2026-03-20 16:44:30','2026-03-20 22:14:30',NULL,NULL,NULL,NULL,NULL),(2,6,'2026-03-21',NULL,'REJECTED','2026-03-20 19:47:24','2026-03-21 18:00:27',NULL,NULL,NULL,NULL,NULL,NULL),(3,8,'2026-03-23',NULL,'RETURN_REQUESTED','2026-03-22 08:39:04','2026-03-24 03:49:24',NULL,NULL,NULL,NULL,NULL,NULL),(4,6,'2026-04-06','byee','RETURNED','2026-04-06 14:17:13','2026-04-06 14:21:42','2026-04-06 19:51:42',NULL,NULL,NULL,NULL,NULL),(5,6,'2026-04-06',NULL,'REJECTED','2026-04-06 14:22:03','2026-04-06 14:22:22',NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `student_leaves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_mess_membership`
--

DROP TABLE IF EXISTS `student_mess_membership`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_mess_membership` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `mess_id` int NOT NULL,
  `meal_slot` enum('LUNCH','DINNER','BOTH') NOT NULL,
  `status` enum('PENDING','ACTIVE','REJECTED','LEFT') NOT NULL DEFAULT 'PENDING',
  `joined_at` timestamp NULL DEFAULT NULL,
  `left_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `gender` enum('MALE','FEMALE','OTHER') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_slot` (`user_id`,`meal_slot`),
  KEY `idx_user_mess_status` (`user_id`,`mess_id`,`status`),
  KEY `idx_single_active_membership` (`user_id`,`status`),
  KEY `fk_smm_mess_strict` (`mess_id`),
  CONSTRAINT `fk_smm_mess` FOREIGN KEY (`mess_id`) REFERENCES `messes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_smm_mess_strict` FOREIGN KEY (`mess_id`) REFERENCES `messes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_smm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_mess_membership`
--

LOCK TABLES `student_mess_membership` WRITE;
/*!40000 ALTER TABLE `student_mess_membership` DISABLE KEYS */;
INSERT INTO `student_mess_membership` VALUES (1,6,1,'LUNCH','ACTIVE',NULL,NULL,'2026-03-20 16:09:47','FEMALE'),(2,6,1,'DINNER','ACTIVE',NULL,NULL,'2026-03-20 16:09:47','FEMALE'),(15,8,1,'LUNCH','ACTIVE',NULL,NULL,'2026-03-21 18:45:49','FEMALE'),(16,8,1,'DINNER','ACTIVE',NULL,NULL,'2026-03-21 18:45:49','FEMALE'),(17,9,1,'LUNCH','REJECTED',NULL,NULL,'2026-03-21 18:59:50','MALE'),(18,9,1,'DINNER','REJECTED',NULL,NULL,'2026-03-21 18:59:50','MALE'),(21,7,1,'LUNCH','PENDING',NULL,NULL,'2026-03-21 19:10:17','MALE'),(22,7,1,'DINNER','PENDING',NULL,NULL,'2026-03-21 19:10:17','MALE'),(23,10,1,'LUNCH','PENDING',NULL,NULL,'2026-03-22 09:13:04','MALE'),(24,11,1,'LUNCH','ACTIVE',NULL,NULL,'2026-03-22 09:19:50','MALE'),(25,11,1,'DINNER','ACTIVE',NULL,NULL,'2026-03-22 09:19:50','MALE'),(26,12,1,'DINNER','PENDING',NULL,NULL,'2026-03-22 09:25:45','OTHER'),(27,14,1,'LUNCH','ACTIVE',NULL,NULL,'2026-03-25 07:19:25','MALE'),(28,14,1,'DINNER','ACTIVE',NULL,NULL,'2026-03-25 07:19:25','MALE'),(29,15,2,'LUNCH','PENDING',NULL,NULL,'2026-04-07 11:26:06','MALE'),(30,15,2,'DINNER','PENDING',NULL,NULL,'2026-04-07 11:26:06','MALE'),(31,18,4,'LUNCH','ACTIVE',NULL,NULL,'2026-04-07 11:59:15','MALE'),(32,18,4,'DINNER','ACTIVE',NULL,NULL,'2026-04-07 11:59:15','MALE');
/*!40000 ALTER TABLE `student_mess_membership` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(10) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `status` enum('PENDING','ACTIVE','INACTIVE') DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `legacy_note` varchar(100) DEFAULT 'DO NOT USE - moved to users',
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `password_set` tinyint(1) DEFAULT '0',
  `role` enum('STUDENT','MESS_ADMIN','PLATFORM_ADMIN') NOT NULL,
  `requested_mess_id` int DEFAULT NULL,
  `status` enum('PENDING','ACTIVE','INACTIVE') DEFAULT 'PENDING',
  `fraud_flag` tinyint(1) DEFAULT '0',
  `last_activity_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  KEY `fk_requested_mess` (`requested_mess_id`),
  CONSTRAINT `fk_requested_mess` FOREIGN KEY (`requested_mess_id`) REFERENCES `messes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (4,'Raj Dev','9999999999','admin@gmail.com',NULL,'$2b$10$YioTIQvI5hCJhaNgw.yczuAbzzbHuEFG0uEzAcTOxaxvdCYjy6VjK',0,'PLATFORM_ADMIN',NULL,'ACTIVE',0,NULL,'2026-03-20 16:06:43','2026-03-20 16:06:43'),(5,'raj','9322824378','kushalpatil12112@gmail.com',NULL,'$2b$10$5fsFwAZ8KxKoRKt8V9OcWe0gEzhXcWh2Db4devdLjX2oJ92dF8mPC',0,'MESS_ADMIN',NULL,'ACTIVE',0,NULL,'2026-03-20 16:08:53','2026-03-20 16:08:53'),(6,'mitu','1111111111',NULL,NULL,'$2b$10$JASPKnSV9sXG8M6wpMZi4eG/mL.Nkisxkyx5XXdpI5YMhcfEVGNyq',0,'STUDENT',NULL,'ACTIVE',0,NULL,'2026-03-20 16:09:47','2026-03-20 16:11:19'),(7,'kushal ','2222222222',NULL,NULL,'$2b$10$sS.zoxytBrZ/2ENxNTFmCelG8joslng5K4N41xNaFTqJFu1GVzKiC',0,'STUDENT',NULL,'ACTIVE',0,NULL,'2026-03-21 18:28:30','2026-03-22 08:36:10'),(8,'kushal ','3333333333',NULL,NULL,'$2b$10$idQtkXWLqOhc0myGXZ84hOMa3JILBXfhVd1gvS0phq/yXCm2St1l6',0,'STUDENT',NULL,'ACTIVE',0,NULL,'2026-03-21 18:45:49','2026-03-22 08:38:20'),(9,'divu','4444444444',NULL,NULL,NULL,0,'STUDENT',NULL,'ACTIVE',0,NULL,'2026-03-21 18:59:50','2026-03-21 18:59:50'),(10,'vedu','5555555555',NULL,NULL,NULL,0,'STUDENT',NULL,'PENDING',0,NULL,'2026-03-22 09:13:04','2026-03-22 09:32:33'),(11,'hitu','6666666666',NULL,NULL,NULL,0,'STUDENT',NULL,'PENDING',0,NULL,'2026-03-22 09:19:50','2026-03-22 09:32:33'),(12,'yash','7777777777',NULL,NULL,NULL,0,'STUDENT',NULL,'PENDING',0,NULL,'2026-03-22 09:25:45','2026-03-22 09:32:33'),(13,'divesh','1234567891',NULL,NULL,'$2b$10$jfpLmqoEYjylzA/tVC7ZAeVYb.SyVaVDm02byv.KerjbwFwQ41CIq',0,'MESS_ADMIN',NULL,'PENDING',0,NULL,'2026-03-22 15:03:25','2026-03-22 15:03:25'),(14,'rupesh dhabadhe ','1212121212',NULL,NULL,NULL,0,'STUDENT',NULL,'PENDING',0,NULL,'2026-03-25 07:19:25','2026-03-25 07:19:25'),(15,'jayesh','6356356351',NULL,NULL,NULL,0,'STUDENT',NULL,'PENDING',0,NULL,'2026-04-07 11:26:06','2026-04-07 11:26:06'),(16,'kunal mali','8263818696','malikunal304@gmail.com',NULL,'$2b$10$rYYMqJWkXOLMocgUtjoH7OZID1r/.frkD.My3d7rMb9r0lWnAM6V2',0,'MESS_ADMIN',NULL,'PENDING',0,NULL,'2026-04-07 11:49:31','2026-04-07 11:49:31'),(17,'ganesh','8263818698','ganeshchadhary@gmail.com',NULL,'$2b$10$85WzGWKS82aCSsgVBQ58JOjLO9shWQnWLUhYn4KbO7onmr3jcMnEK',0,'MESS_ADMIN',NULL,'PENDING',0,NULL,'2026-04-07 11:54:41','2026-04-07 11:54:41'),(18,'fgfhfr','1234123412',NULL,NULL,NULL,0,'STUDENT',NULL,'PENDING',0,NULL,'2026-04-07 11:59:15','2026-04-07 11:59:15');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-08 16:50:55

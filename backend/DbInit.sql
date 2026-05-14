-- Configuración inicial de sesión
SET NAMES utf8mb4;
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
SET @OLD_TIME_ZONE=@@TIME_ZONE;
SET TIME_ZONE='+00:00';

-- 1. Crear y usar la Base de Datos
CREATE DATABASE IF NOT EXISTS `VolvemosFutbol` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `VolvemosFutbol`;

-- 2. Estructura de tablas (Orden lógico de dependencias)

-DROP TABLE IF EXISTS `Events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Events` (
  `Id` int NOT NULL,
  `Name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Events`
--

LOCK TABLES `Events` WRITE;
/*!40000 ALTER TABLE `Events` DISABLE KEYS */;
INSERT INTO `Events` VALUES (1,'Gol'),(2,'Asistencia'),(3,'OwnGoal');
/*!40000 ALTER TABLE `Events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MatchEvents`
--

DROP TABLE IF EXISTS `MatchEvents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MatchEvents` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `MatchId` int NOT NULL,
  `PlayerId` int NOT NULL,
  `IdEventType` int NOT NULL,
  `IdTeam` int NOT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `FK_MatchEvents_Matches` (`MatchId`),
  KEY `FK_MatchEvents_Players` (`PlayerId`),
  CONSTRAINT `FK_MatchEvents_Matches` FOREIGN KEY (`MatchId`) REFERENCES `Matches` (`Id`),
  CONSTRAINT `FK_MatchEvents_Players` FOREIGN KEY (`PlayerId`) REFERENCES `Players` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MatchEvents`
--

LOCK TABLES `MatchEvents` WRITE;
/*!40000 ALTER TABLE `MatchEvents` DISABLE KEYS */;
INSERT INTO `MatchEvents` VALUES (6,2,4,1,1,'2026-03-21 02:46:03'),(7,2,11,2,1,'2026-03-21 02:47:42'),(8,2,12,1,1,'2026-03-21 02:53:31'),(11,2,7,1,2,'2026-03-21 04:05:30'),(12,2,1,2,2,'2026-03-21 04:05:41');
/*!40000 ALTER TABLE `MatchEvents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MatchPlayers`
--

DROP TABLE IF EXISTS `MatchPlayers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MatchPlayers` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `MatchId` int NOT NULL,
  `PlayerId` int NOT NULL,
  `TeamId` int NOT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `FK_MatchPlayers_Matches` (`MatchId`),
  KEY `FK_MatchPlayers_Players` (`PlayerId`),
  CONSTRAINT `FK_MatchPlayers_Matches` FOREIGN KEY (`MatchId`) REFERENCES `Matches` (`Id`),
  CONSTRAINT `FK_MatchPlayers_Players` FOREIGN KEY (`PlayerId`) REFERENCES `Players` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MatchPlayers`
--

LOCK TABLES `MatchPlayers` WRITE;
/*!40000 ALTER TABLE `MatchPlayers` DISABLE KEYS */;
INSERT INTO `MatchPlayers` VALUES (5,2,4,1,'2026-03-16 21:33:22'),(6,2,12,1,'2026-03-16 21:33:36'),(7,2,11,1,'2026-03-16 21:33:45'),(8,2,6,1,'2026-03-16 21:33:56'),(9,2,2,2,'2026-03-16 21:34:11'),(10,2,1,2,'2026-03-16 21:34:18'),(11,2,17,2,'2026-03-16 21:34:26'),(12,2,7,2,'2026-03-16 21:34:36'),(14,2,5,2,'2026-03-16 21:34:53'),(15,2,15,2,'2026-03-21 01:20:45'),(16,2,18,2,'2026-03-21 01:28:51'),(17,2,19,2,'2026-03-21 01:30:48'),(18,2,21,1,'2026-03-21 01:36:21'),(19,2,24,1,'2026-03-21 01:36:50'),(20,2,22,1,'2026-03-21 01:37:03'),(21,2,23,1,'2026-03-21 01:37:12'),(22,2,20,2,'2026-03-21 01:37:29'),(23,2,14,1,'2026-03-21 01:38:13');
/*!40000 ALTER TABLE `MatchPlayers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Matches`
--

DROP TABLE IF EXISTS `Matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Matches` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `MatchDate` datetime NOT NULL,
  `HomeTeamId` int DEFAULT NULL,
  `AwayTeamId` int DEFAULT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `FK_Matches_AwayTeam` (`AwayTeamId`),
  KEY `FK_Matches_HomeTeam` (`HomeTeamId`),
  CONSTRAINT `FK_Matches_AwayTeam` FOREIGN KEY (`AwayTeamId`) REFERENCES `Teams` (`Id`) ON DELETE SET NULL,
  CONSTRAINT `FK_Matches_HomeTeam` FOREIGN KEY (`HomeTeamId`) REFERENCES `Teams` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Matches`
--

LOCK TABLES `Matches` WRITE;
/*!40000 ALTER TABLE `Matches` DISABLE KEYS */;
INSERT INTO `Matches` VALUES (2,'2026-03-11 20:00:00',1,2,'2026-03-16 21:32:00','2026-03-18 03:59:29');
/*!40000 ALTER TABLE `Matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Players`
--

DROP TABLE IF EXISTS `Players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Players` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(100) NOT NULL,
  `LastName` varchar(100) NOT NULL,
  `IdPosition` int DEFAULT NULL,
  `Goals` int NOT NULL DEFAULT (0),
  `Assists` int NOT NULL DEFAULT (0),
  `Matches` int NOT NULL DEFAULT (0),
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Players`
--

LOCK TABLES `Players` WRITE;
/*!40000 ALTER TABLE `Players` DISABLE KEYS */;
INSERT INTO `Players` VALUES (1,'German','Piña',4,0,0,2,'2026-03-16 21:24:47','2026-03-16 21:24:47'),(2,'Eric','Cifuentes',3,0,0,2,'2026-03-16 21:24:47','2026-03-16 21:24:47'),(3,'Hernan','Foronda',3,0,0,1,'2026-03-16 21:24:47','2026-03-16 21:24:47'),(4,'Julio','Atencio',4,0,0,1,'2026-03-16 21:24:47','2026-03-16 21:24:47'),(5,'Juan David','Rincon',1,0,0,2,'2026-03-16 21:24:47','2026-03-16 21:24:47'),(6,'Santiago','Arango',2,0,0,0,'2026-03-16 21:24:47','2026-03-16 21:24:47'),(7,'Enoc','Marchan',4,0,0,0,'2026-03-16 21:24:47','2026-03-16 21:24:47'),(8,'Juan David','Duque',1,0,0,0,'2026-03-16 21:24:47','2026-03-16 21:24:47'),(9,'Andres','Hernandez',3,0,0,0,'2026-03-16 21:24:47','2026-03-16 21:24:47'),(10,'David','Chacon',4,0,0,0,'2026-03-16 21:24:47','2026-03-16 21:24:47'),(11,'Juan Diego','Piña',3,0,0,0,'2026-03-16 21:24:47','2026-03-16 21:24:47'),(12,'Juan','Fajardo',3,0,0,0,'2026-03-16 21:24:47','2026-03-16 21:24:47'),(13,'Hernan','Lopera',2,0,0,0,'2026-03-16 21:24:47','2026-03-16 21:24:47'),(14,'Esteban','Delgado',2,0,0,0,'2026-03-16 21:24:47','2026-03-16 21:24:47'),(15,'Camilo','Dimate',2,0,0,0,'2026-03-16 21:24:47','2026-03-16 21:24:47'),(16,'Mauricio','Lopez',3,0,0,0,'2026-03-16 21:24:47','2026-03-16 21:24:47'),(17,'Julian','Mejia',2,0,0,0,'2026-03-16 21:24:47','2026-03-16 21:24:47'),(18,'Roberto Carlos','Garcia ',4,0,0,0,'2026-03-21 01:27:49','2026-03-21 01:27:49'),(19,'Don  Hernan','Escobar',2,0,0,0,'2026-03-21 01:28:35','2026-03-21 01:28:35'),(20,'Chepe','Rafa',2,0,0,0,'2026-03-21 01:33:46','2026-03-21 01:33:46'),(21,'Luis','Castro',4,0,0,0,'2026-03-21 01:35:01','2026-03-21 01:35:01'),(22,'Calvo',' Amigo Mario',2,0,0,0,'2026-03-21 01:35:48','2026-03-21 01:35:48'),(23,'David','Z',2,0,0,0,'2026-03-21 01:36:05','2026-03-21 01:36:05'),(24,'Juan David','Correa',1,0,0,0,'2026-03-21 01:36:41','2026-03-21 01:36:41');
/*!40000 ALTER TABLE `Players` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Positions`
--

DROP TABLE IF EXISTS `Positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Positions` (
  `Id` int NOT NULL,
  `Name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Positions`
--

LOCK TABLES `Positions` WRITE;
/*!40000 ALTER TABLE `Positions` DISABLE KEYS */;
INSERT INTO `Positions` VALUES (1,'Portero'),(2,'Defensa'),(3,'Mediocampista'),(4,'Delantero');
/*!40000 ALTER TABLE `Positions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Teams`
--

DROP TABLE IF EXISTS `Teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Teams` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Color` varchar(50) DEFAULT NULL,
  `MatchesPlayed` int NOT NULL DEFAULT (0),
  `Wins` int NOT NULL DEFAULT (0),
  `Draws` int NOT NULL DEFAULT (0),
  `Losses` int NOT NULL DEFAULT (0),
  `GoalsFor` int NOT NULL DEFAULT (0),
  `GoalsAgainst` int NOT NULL DEFAULT (0),
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Teams`
--

LOCK TABLES `Teams` WRITE;
/*!40000 ALTER TABLE `Teams` DISABLE KEYS */;
INSERT INTO `Teams` VALUES (1,'Equipo Blanco','White',2,2,0,0,9,3,'2026-03-16 21:24:47','2026-03-16 21:24:47'),(2,'Equipo Negro','Black',2,0,0,2,3,9,'2026-03-16 21:24:47','2026-03-16 21:24:47');
/*!40000 ALTER TABLE `Teams` ENABLE KEYS */;
UNLOCK TABLES;

-- Restaurar configuraciones de sesión
SET TIME_ZONE=@OLD_TIME_ZONE;
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
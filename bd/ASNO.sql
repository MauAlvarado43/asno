-- MySQL dump 10.13  Distrib 5.7.25, for Win64 (x86_64)
--
-- Host: localhost    Database: asno
-- ------------------------------------------------------
-- Server version	5.7.25-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cprivilegio`
--

DROP TABLE IF EXISTS `cprivilegio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cprivilegio` (
  `id_pri` int(11) NOT NULL AUTO_INCREMENT,
  `des_pri` varchar(50) NOT NULL,
  PRIMARY KEY (`id_pri`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cprivilegio`
--

LOCK TABLES `cprivilegio` WRITE;
/*!40000 ALTER TABLE `cprivilegio` DISABLE KEYS */;
/*!40000 ALTER TABLE `cprivilegio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ctipo_producto`
--

DROP TABLE IF EXISTS `ctipo_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ctipo_producto` (
  `id_tpo` int(11) NOT NULL AUTO_INCREMENT,
  `nom_tpo` varchar(30) NOT NULL,
  `id_neg` int(11) NOT NULL,
  PRIMARY KEY (`id_tpo`),
  KEY `fk5` (`id_neg`),
  CONSTRAINT `fk5` FOREIGN KEY (`id_neg`) REFERENCES `dnegocio` (`id_neg`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ctipo_producto`
--

LOCK TABLES `ctipo_producto` WRITE;
/*!40000 ALTER TABLE `ctipo_producto` DISABLE KEYS */;
INSERT INTO `ctipo_producto` VALUES (4,'xd',3),(5,'ayuda',3);
/*!40000 ALTER TABLE `ctipo_producto` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 trigger deleteTipoProducto before delete on ctipo_producto
for each row
begin
delete from mproducto where id_tpo = old.id_tpo;
end */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `cunidad_medida`
--

DROP TABLE IF EXISTS `cunidad_medida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cunidad_medida` (
  `id_unm` int(11) NOT NULL AUTO_INCREMENT,
  `nom_unm` varchar(30) NOT NULL,
  `id_neg` int(11) NOT NULL,
  PRIMARY KEY (`id_unm`),
  KEY `fk6` (`id_neg`),
  CONSTRAINT `fk6` FOREIGN KEY (`id_neg`) REFERENCES `dnegocio` (`id_neg`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cunidad_medida`
--

LOCK TABLES `cunidad_medida` WRITE;
/*!40000 ALTER TABLE `cunidad_medida` DISABLE KEYS */;
INSERT INTO `cunidad_medida` VALUES (6,'Holi',3),(7,'xd',3),(8,'ahuevo',3);
/*!40000 ALTER TABLE `cunidad_medida` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 trigger deleteUnidadMedida before delete on cunidad_medida
for each row
begin
delete from mproducto where id_unm = old.id_unm;
end */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `dnegocio`
--

DROP TABLE IF EXISTS `dnegocio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dnegocio` (
  `id_neg` int(11) NOT NULL AUTO_INCREMENT,
  `nom_neg` varchar(40) NOT NULL,
  `id_use` int(11) NOT NULL,
  PRIMARY KEY (`id_neg`),
  KEY `fk4` (`id_use`),
  CONSTRAINT `fk4` FOREIGN KEY (`id_use`) REFERENCES `musuario` (`id_use`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dnegocio`
--

LOCK TABLES `dnegocio` WRITE;
/*!40000 ALTER TABLE `dnegocio` DISABLE KEYS */;
INSERT INTO `dnegocio` VALUES (3,'07k=',5);
/*!40000 ALTER TABLE `dnegocio` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 trigger deleteDeal before delete on dnegocio
for each row
begin
delete from mproducto where id_neg = old.id_neg;
delete from cunidad_medida where id_neg = old.id_neg;
delete from ctipo_producto where id_neg = old.id_neg;
end */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `dtipo_usuario`
--

DROP TABLE IF EXISTS `dtipo_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dtipo_usuario` (
  `id_tus` int(11) NOT NULL AUTO_INCREMENT,
  `nom_tus` varchar(20) NOT NULL,
  PRIMARY KEY (`id_tus`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dtipo_usuario`
--

LOCK TABLES `dtipo_usuario` WRITE;
/*!40000 ALTER TABLE `dtipo_usuario` DISABLE KEYS */;
INSERT INTO `dtipo_usuario` VALUES (1,'Administrador'),(2,'Dueño de negocio'),(3,'Empleado'),(4,'No registrado');
/*!40000 ALTER TABLE `dtipo_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `etipo`
--

DROP TABLE IF EXISTS `etipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `etipo` (
  `id_tpr` int(11) NOT NULL AUTO_INCREMENT,
  `con_tpr` bit(1) NOT NULL,
  `id_pri` int(11) NOT NULL,
  `id_tus` int(11) NOT NULL,
  PRIMARY KEY (`id_tpr`),
  KEY `fk1` (`id_tus`),
  KEY `fk2` (`id_pri`),
  CONSTRAINT `fk1` FOREIGN KEY (`id_tus`) REFERENCES `dtipo_usuario` (`id_tus`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk2` FOREIGN KEY (`id_pri`) REFERENCES `cprivilegio` (`id_pri`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `etipo`
--

LOCK TABLES `etipo` WRITE;
/*!40000 ALTER TABLE `etipo` DISABLE KEYS */;
/*!40000 ALTER TABLE `etipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventa`
--

DROP TABLE IF EXISTS `eventa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `eventa` (
  `id_eve` int(11) NOT NULL AUTO_INCREMENT,
  `tot_eve` float NOT NULL,
  `can_eve` int(11) NOT NULL,
  `fecven_eve` date NOT NULL,
  `horven_eve` time NOT NULL,
  `id_pro` int(11) NOT NULL,
  `id_use` int(11) NOT NULL,
  PRIMARY KEY (`id_eve`),
  KEY `fk9` (`id_pro`),
  KEY `fk69` (`id_use`),
  CONSTRAINT `fk69` FOREIGN KEY (`id_use`) REFERENCES `musuario` (`id_use`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk9` FOREIGN KEY (`id_pro`) REFERENCES `mproducto` (`id_pro`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventa`
--

LOCK TABLES `eventa` WRITE;
/*!40000 ALTER TABLE `eventa` DISABLE KEYS */;
/*!40000 ALTER TABLE `eventa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mproducto`
--

DROP TABLE IF EXISTS `mproducto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mproducto` (
  `id_pro` int(11) NOT NULL AUTO_INCREMENT,
  `nom_pro` varchar(30) NOT NULL,
  `preven_pro` float NOT NULL,
  `fecivt_pro` datetime NOT NULL,
  `precom_pro` float NOT NULL,
  `canivt_pro` int(11) NOT NULL,
  `des_pro` varchar(200) NOT NULL,
  `id_unm` int(11) NOT NULL,
  `id_tpo` int(11) NOT NULL,
  `id_neg` int(11) NOT NULL,
  PRIMARY KEY (`id_pro`),
  KEY `fk7` (`id_unm`),
  KEY `fk8` (`id_tpo`),
  KEY `id_neg` (`id_neg`),
  CONSTRAINT `fk7` FOREIGN KEY (`id_unm`) REFERENCES `cunidad_medida` (`id_unm`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk8` FOREIGN KEY (`id_tpo`) REFERENCES `ctipo_producto` (`id_tpo`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `mproducto_ibfk_1` FOREIGN KEY (`id_neg`) REFERENCES `dnegocio` (`id_neg`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mproducto`
--

LOCK TABLES `mproducto` WRITE;
/*!40000 ALTER TABLE `mproducto` DISABLE KEYS */;
/*!40000 ALTER TABLE `mproducto` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 trigger deleteVenta before delete on mproducto
for each row
begin
delete from eventa where id_pro = old.id_pro
;
end */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `musuario`
--

DROP TABLE IF EXISTS `musuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `musuario` (
  `id_use` int(11) NOT NULL AUTO_INCREMENT,
  `nom_use` varchar(150) NOT NULL,
  `pas_use` varchar(150) NOT NULL,
  `tel_use` int(10) NOT NULL,
  `cor_use` varchar(150) NOT NULL,
  `caneg_use` tinyint(4) NOT NULL,
  `con_use` datetime NOT NULL,
  `id_tus` int(11) NOT NULL,
  `code_use` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_use`),
  KEY `fk3` (`id_tus`),
  CONSTRAINT `fk3` FOREIGN KEY (`id_tus`) REFERENCES `dtipo_usuario` (`id_tus`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `musuario`
--

LOCK TABLES `musuario` WRITE;
/*!40000 ALTER TABLE `musuario` DISABLE KEYS */;
INSERT INTO `musuario` VALUES (4,'5rzANig7qDrHUU9JZrLGPFw=','j5OFKXI08To=',0,'xrzCLTYx82XWUERSZqnLdlDaqg==',0,'2019-11-08 11:26:17',2,'BBV-1965-B'),(5,'6rPSIS0=','6rPSIS1q9GTS',0,'yrPSJSMqqDCLIBEONYDANVLcq17t/PQ=',0,'2019-11-12 06:00:24',2,'AGU-8485-Y');
/*!40000 ALTER TABLE `musuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-11-12  6:05:22

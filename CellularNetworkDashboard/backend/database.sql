-- Cellular Network Dashboard - MySQL Database
-- This file contains all the raw SQL required to reconstruct the database, tables, and seed data.

-- 1. Towers Table
CREATE TABLE IF NOT EXISTS `Towers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `radio` VARCHAR(255) NOT NULL,
  `operatorName` VARCHAR(255) NOT NULL,
  `mcc` INT NOT NULL,
  `mnc` INT NOT NULL,
  `longitude` FLOAT NOT NULL,
  `latitude` FLOAT NOT NULL,
  `coverageRadius` INT NOT NULL DEFAULT 1000,
  `cid` INT NOT NULL,
  `locationName` VARCHAR(255),
  `status` VARCHAR(255) DEFAULT 'GOOD',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Telemetries Table
CREATE TABLE IF NOT EXISTS `Telemetrics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `towerId` INT NOT NULL,
  `latency` INT NOT NULL DEFAULT 0,
  `callTotal` INT NOT NULL DEFAULT 0,
  `callAccepted` INT NOT NULL DEFAULT 0,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. SpeedTest Table
CREATE TABLE IF NOT EXISTS `SpeedTests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `downloadSpeed` FLOAT NOT NULL,
  `uploadSpeed` FLOAT NOT NULL,
  `latency` INT NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Initial tower location Data (Jio, Airtel, Vi, BSNL Towers)
INSERT INTO `Towers` (`radio`, `operatorName`, `mcc`, `mnc`, `longitude`, `latitude`, `coverageRadius`, `cid`, `locationName`, `status`) VALUES
('4G', 'Jio', 404, 5, 70.38047791, 20.91316223, 1000, 2171, 'Rajkot', 'GOOD'),
('4G', 'Jio', 404, 5, 70.12367249, 21.12602234, 1000, 12805, 'Rajkot', 'GOOD'),
('4G', 'Jio', 404, 69, 73.01994324, 19.03999329, 1000, 40912, 'Mumbai', 'GOOD'),
('4G', 'Jio', 404, 10, 77.23640400, 28.60130300, 1000, 27942, 'Delhi', 'GOOD'),
('4G', 'Jio', 404, 42, 79.67903100, 12.25985900, 1286, 38596, 'Chennai', 'GOOD'),
('4G', 'Airtel', 404, 58, 83.37730400, 21.87171900, 1000, 60092, 'Kolkata', 'DEGRADED'),
('4G', 'Airtel', 404, 86, 75.00434900, 15.44403100, 1000, 2221, 'Pune', 'GOOD'),
('4G', 'Airtel', 404, 43, 78.12480900, 9.92717700, 1000, 57292, 'Madurai', 'GOOD'),
('4G', 'Airtel', 404, 57, 72.59971619, 23.02116394, 1000, 62141, 'Ahmedabad', 'GOOD'),
('4G', 'Airtel', 404, 75, 86.52900696, 22.54188538, 1000, 12302, 'Kolkata', 'GOOD'),
('4G', 'Vi', 404, 75, 86.82838440, 22.29469299, 1000, 12252, 'Kolkata', 'OFFLINE'),
('4G', 'Vi', 404, 27, 73.78074646, 18.56346130, 1000, 10742, 'Pune', 'GOOD'),
('4G', 'Vi', 404, 27, 72.84690857, 19.34898376, 1000, 6399, 'Mumbai', 'GOOD'),
('4G', 'Vi', 404, 5, 70.94078064, 22.62840271, 1000, 14318, 'Ahmedabad', 'GOOD'),
('4G', 'Vi', 404, 45, 77.64374500, 12.96963500, 1000, 62641, 'Bangalore', 'GOOD'),
('4G', 'Vi', 404, 58, 83.32923889, 21.72752380, 1000, 63199, 'Kolkata', 'GOOD'),
('4G', 'Vi', 404, 2, 75.89424133, 30.77751160, 1000, 32851, 'Pune', 'GOOD'),
('4G', 'BSNL', 404, 74, 87.23350525, 22.32215881, 1000, 61103, 'Kolkata', 'DEGRADED'),
('4G', 'BSNL', 404, 45, 77.66069700, 12.96285700, 1000, 15111, 'Bangalore', 'GOOD'),
('4G', 'Jio', 404, 92, 72.838668823242, 18.986434936523, 1000, 211314, 'Mumbai', 'GOOD'),
('4G', 'Jio', 404, 92, 72.830429077148, 18.997421264648, 1000, 231736067, 'Mumbai', 'GOOD'),
('4G', 'Jio', 404, 92, 72.834548950195, 18.952102661133, 1000, 113666, 'Mumbai', 'GOOD'),
('4G', 'Jio', 404, 92, 72.83317565918, 18.96858215332, 1000, 1435650, 'Mumbai', 'GOOD'),
('4G', 'Jio', 404, 92, 72.834548950195, 18.949356079102, 1000, 1418755, 'Mumbai', 'GOOD'),
('4G', 'Jio', 404, 92, 72.831802368164, 18.961715698242, 1000, 1240835, 'Mumbai', 'GOOD'),
('4G', 'Jio', 404, 92, 72.83317565918, 18.97819519043, 1000, 1480963, 'Mumbai', 'GOOD'),
('4G', 'Jio', 404, 92, 72.834548950195, 18.950729370117, 1000, 205086978, 'Mumbai', 'GOOD'),
('4G', 'Jio', 404, 92, 72.83317565918, 18.97819519043, 1000, 668674, 'Mumbai', 'GOOD'),
('4G', 'Jio', 404, 92, 72.837295532227, 18.953475952148, 1000, 205885954, 'Mumbai', 'GOOD'),
('4G', 'Airtel', 404, 31, 88.360175, 22.578818, 1000, 7412, 'Kolkata', 'GOOD'),
('4G', 'Airtel', 404, 31, 88.360624, 22.578964, 1000, 7411, 'Kolkata', 'GOOD'),
('4G', 'Airtel', 404, 31, 88.36025, 22.577164, 1000, 7422, 'Kolkata', 'GOOD'),
('4G', 'Airtel', 404, 31, 88.3665, 22.574014, 1000, 7141, 'Kolkata', 'GOOD'),
('4G', 'Airtel', 404, 31, 88.363772, 22.575784, 1000, 7873, 'Kolkata', 'GOOD'),
('4G', 'Airtel', 404, 31, 88.363266, 22.577591, 1000, 25903, 'Kolkata', 'GOOD'),
('4G', 'Airtel', 404, 31, 88.361695, 22.578215, 1000, 26181, 'Kolkata', 'GOOD');

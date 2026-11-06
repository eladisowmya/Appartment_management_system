CREATE DATABASE IF NOT EXISTS apartment_visitors;
USE apartment_visitors;

CREATE TABLE IF NOT EXISTS residents (
  resident_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  flat_no VARCHAR(20) NOT NULL,
  phone VARCHAR(15),
  email VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS visitors (
  visitor_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15),
  vehicle_no VARCHAR(20),
  resident_id INT NOT NULL,
  purpose VARCHAR(200),
  entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  exit_time DATETIME NULL,
  status ENUM('IN','OUT') DEFAULT 'IN',
  FOREIGN KEY (resident_id) REFERENCES residents(resident_id)
);

INSERT INTO residents (name, flat_no, phone, email) VALUES
('Sowmya', 'A-101', '9876543210', 'sowmya@example.com'),
('Ravi Kumar', 'B-202', '9876501234', 'ravi@example.com');

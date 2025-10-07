-- ======================================
-- TABLA USUARIO
-- ======================================
CREATE TABLE tb_usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- TABLA TOKEN
-- ======================================
CREATE TABLE tb_token (
  id_token INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(500) NOT NULL UNIQUE,
  tipo_token ENUM('BEARER') DEFAULT 'BEARER',
  removido BOOLEAN DEFAULT FALSE,
  expirado BOOLEAN DEFAULT FALSE,
  id_usuario INT,
  FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario)
);

-- ======================================
-- TABLA ROL
-- ======================================
CREATE TABLE tb_rol (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(150)
);

-- ======================================
-- TABLA USUARIO_ROL (relación N:N)
-- ======================================
CREATE TABLE tb_usuario_rol (
  id_usuario INT NOT NULL,
  id_rol INT NOT NULL,
  PRIMARY KEY (id_usuario, id_rol),
  FOREIGN KEY (id_usuario) REFERENCES tb_usuario(id_usuario),
  FOREIGN KEY (id_rol) REFERENCES tb_rol(id_rol)
);

-- ======================================
-- TABLA MENU
-- ======================================
CREATE TABLE tb_menu (
  id_menu INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  ruta VARCHAR(255),
  icono VARCHAR(100),
  id_menu_padre INT,
  FOREIGN KEY (id_menu_padre) REFERENCES tb_menu(id_menu)
);

-- ======================================
-- TABLA ROL_MENU (relación N:N)
-- ======================================
CREATE TABLE tb_rol_menu (
  id_rol INT NOT NULL,
  id_menu INT NOT NULL,
  PRIMARY KEY (id_rol, id_menu),
  FOREIGN KEY (id_rol) REFERENCES tb_rol(id_rol),
  FOREIGN KEY (id_menu) REFERENCES tb_menu(id_menu)
);

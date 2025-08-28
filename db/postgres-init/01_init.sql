CREATE SCHEMA IF NOT EXISTS vismel;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
SET search_path TO vismel;

-- Tablas con schema explícito

CREATE TABLE "usuario" (
	"id" SERIAL NOT NULL UNIQUE,
	"nombre" VARCHAR(255) NOT NULL UNIQUE,
	"username" VARCHAR(255),
	"password" VARCHAR(255),
	"rol_id" INTEGER,
	PRIMARY KEY("id")
);




CREATE TABLE "maquina" (
	"id" SERIAL NOT NULL UNIQUE,
	"codigo" INTEGER NOT NULL UNIQUE,
	"modelo_id" INTEGER NOT NULL,
	"tipo_id" INTEGER NOT NULL,
	"conector" BOOLEAN,
	"tarjetero" BOOLEAN,
	"billetero" BOOLEAN,
	"orain_visa" BOOLEAN,
	"usuario_predeterminado_id" INTEGER,
	"cliente_id" INTEGER,
	"frecuencia_revision_id" INTEGER,
	"coste" NUMERIC(10,2),
	"fecha_inicio_amortizacion" DATE,
	"observaciones" VARCHAR(255),
	PRIMARY KEY("id")
);




CREATE TABLE "tipo_maquina" (
	"id" SERIAL NOT NULL UNIQUE,
	"tipo" VARCHAR(255) NOT NULL UNIQUE,
	PRIMARY KEY("id")
);




CREATE TABLE "modelo_maquina" (
	"id" SERIAL NOT NULL UNIQUE,
	"modelo" VARCHAR(255) NOT NULL UNIQUE,
	PRIMARY KEY("id")
);




CREATE TABLE "frecuencia_revision" (
	"id" SERIAL NOT NULL UNIQUE,
	"frecuencia" VARCHAR(255) NOT NULL UNIQUE,
	"num_meses" SMALLINT NOT NULL,
	PRIMARY KEY("id")
);




CREATE TABLE "revision_maquina" (
	"id" SERIAL NOT NULL UNIQUE,
	"usuario_id" INTEGER NOT NULL,
	"maquina_id" INTEGER NOT NULL,
	"tipo_revision_id" INTEGER NOT NULL,
	"fecha_prevista" DATE NOT NULL,
	"fecha_realizada" DATE,
	"comentarios" VARCHAR(255),
	PRIMARY KEY("id")
);




CREATE TABLE "tipo_revision" (
	"id" SERIAL NOT NULL UNIQUE,
	"tipo" VARCHAR(255) NOT NULL UNIQUE,
	PRIMARY KEY("id")
);




CREATE TABLE "recaudacion_semanal" (
	"id" SERIAL NOT NULL UNIQUE,
	"semana" SMALLINT NOT NULL,
	"año" INTEGER NOT NULL,
	"maquina_id" INTEGER NOT NULL,
	"usuario_id" INTEGER,
	"lectura" INTEGER,
	"importe_recaudado" NUMERIC(10,2),
	PRIMARY KEY("id")
);




CREATE TABLE "averia" (
	"id" SERIAL NOT NULL UNIQUE,
	"fecha" DATE NOT NULL,
	"maquina_id" INTEGER NOT NULL,
	"usuario_id" INTEGER,
	"comentarios" VARCHAR(255),
	"prioridad" INTEGER NOT NULL,
	"completado" BOOLEAN NOT NULL DEFAULT false,
	"fecha_completado" DATE,
	PRIMARY KEY("id")
);




CREATE TABLE "cliente" (
	"id" SERIAL NOT NULL UNIQUE,
	"nombre" VARCHAR(255) NOT NULL UNIQUE,
	"direccion" VARCHAR(255),
	"telefono" BIGINT,
	"telefono2" BIGINT,
	"fax" BIGINT,
	"movil" BIGINT,
	"email" VARCHAR(255),
	"persona_contacto" VARCHAR(255),
	"observaciones" TEXT,
	"poblacion_id" INTEGER,
	PRIMARY KEY("id")
);




CREATE TABLE "poblacion" (
	"codigo_postal" INTEGER NOT NULL UNIQUE,
	"nombre" VARCHAR(255) NOT NULL,
	PRIMARY KEY("codigo_postal")
);




CREATE TABLE "articulo" (
	"id" SERIAL NOT NULL UNIQUE,
	"nombre" VARCHAR(255) NOT NULL UNIQUE,
	"precio" NUMERIC(10,2),
	"coste" NUMERIC(10,2),
	"familia_id" INTEGER,
	"cantidad" BIGINT,
	"iva" INTEGER,
	PRIMARY KEY("id")
);




CREATE TABLE "familia_articulo" (
	"id" SERIAL NOT NULL UNIQUE,
	"nombre" VARCHAR(255) NOT NULL UNIQUE,
	PRIMARY KEY("id")
);




CREATE TABLE "entradas_salidas" (
	"id" SERIAL NOT NULL UNIQUE,
	"articulo_id" INTEGER NOT NULL,
	"usuario_id" INTEGER,
	"fecha_hora" TIMESTAMP NOT NULL,
	"entrada_salida" BIT(1) NOT NULL,
	"cantidad" INTEGER NOT NULL,
	PRIMARY KEY("id")
);




CREATE TABLE "rol" (
	"id" SERIAL NOT NULL UNIQUE,
	"rol" VARCHAR(255),
	PRIMARY KEY("id")
);


-- Foreign Keys

ALTER TABLE "maquina"
ADD FOREIGN KEY("modelo_id") REFERENCES "modelo_maquina"("id")
ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE "maquina"
ADD FOREIGN KEY("tipo_id") REFERENCES "tipo_maquina"("id")
ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE "maquina"
ADD FOREIGN KEY("usuario_predeterminado_id") REFERENCES "usuario"("id")
ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "maquina"
ADD FOREIGN KEY("frecuencia_revision_id") REFERENCES "frecuencia_revision"("id")
ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "revision_maquina"
ADD FOREIGN KEY("usuario_id") REFERENCES "usuario"("id")
ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE "revision_maquina"
ADD FOREIGN KEY("maquina_id") REFERENCES "maquina"("id")
ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE "revision_maquina"
ADD FOREIGN KEY("tipo_revision_id") REFERENCES "tipo_revision"("id")
ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE "recaudacion_semanal"
ADD FOREIGN KEY("maquina_id") REFERENCES "maquina"("id")
ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE "recaudacion_semanal"
ADD FOREIGN KEY("usuario_id") REFERENCES "usuario"("id")
ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE "averia"
ADD FOREIGN KEY("maquina_id") REFERENCES "maquina"("id")
ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE "averia"
ADD FOREIGN KEY("usuario_id") REFERENCES "usuario"("id")
ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "maquina"
ADD FOREIGN KEY("cliente_id") REFERENCES "cliente"("id")
ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "articulo"
ADD FOREIGN KEY("familia_id") REFERENCES "familia_articulo"("id")
ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "entradas_salidas"
ADD FOREIGN KEY("articulo_id") REFERENCES "articulo"("id")
ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE "usuario"
ADD FOREIGN KEY("rol_id") REFERENCES "rol"("id")
ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "cliente"
ADD FOREIGN KEY("poblacion_id") REFERENCES "poblacion"("codigo_postal")
ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "entradas_salidas"
ADD FOREIGN KEY("usuario_id") REFERENCES "usuario"("id")
ON UPDATE CASCADE ON DELETE SET NULL;

COMMENT ON TABLE vismel.tipo_maquina IS 'Esta tabla contiene los tipos de maquinas que existen. La tabla maquina tiene una fk a esta tabla para identificar de que tipo es.';
COMMENT ON TABLE vismel.usuario IS 'Esta tabla contiene los usuarios principalmente empleados de la empresa, no contiene información de clientes ni usuarios externos.';
COMMENT ON TABLE vismel.frecuencia_revision IS 'Esta tabla contiene los tipos de frecuencias para las revisiones de las máquinas. La tabla maquina tiene una fk a esta tabla para indicar cada cuando se tiene que revisar.';
COMMENT ON TABLE vismel.articulo IS 'Esta tabla contiene los artículos del inventario, su cantidad y atributos como el precio o una fk a la tabla de familias para indicar su tipo.';
COMMENT ON TABLE vismel.averia IS 'Esta tabla registra las averias de las máquinas junto a varia información entre la que esta una fk a la maquina averiada y una fk al usuario encargado de la avería.';
COMMENT ON TABLE vismel.cliente IS 'Esta tabla contiene los clientes registrados que tienen máquinas de la empresa. La tabla contiene información adicional de estos.';
COMMENT ON TABLE vismel.entradas_salidas IS 'Esta tabla contiene el registro histórico y actual de las entradas o salidas de artículos del inventario. Con una fk al artículo y una fk al usuario responsable.';
COMMENT ON TABLE vismel.familia_articulo IS 'Esta tabla contiene las familias (o tipos) de los artículos.';
COMMENT ON TABLE vismel.maquina IS 'Esta tabla contiene registradas todas las máquinas junto información de estas como ubicación, coste, cliente que tiene la maquina, características físicas,...';
COMMENT ON TABLE vismel.modelo_maquina IS 'Esta tabla contiene los modelos de las maquinas. La tabla maquina tiene una fk a esta tabla para identificar que modelo es.';
COMMENT ON TABLE vismel.poblacion IS 'Esta tabla contiene registradas las poblaciones con las que se trabajan (o no) en la empresa. Por ejemplo, un cliente esta en una población. Se supone que todas las maquinas de un cliente estan en la misma población que este.';
COMMENT ON TABLE vismel.recaudacion_semanal IS 'Esta tabla contiene los registros históricos y actuales de las recaudaciones semanales que se han hecho de cada maquina. Contiene información como la semana del año, el año, fk a la maquina, fk al usuario que ha recaudado el dinero,...';
COMMENT ON TABLE vismel.revision_maquina IS 'Esta tabla contiene el registro de revisiones que se han ido haciendo a las maquinas. Tiene una fk a la maquina revisada, una fj al usuario encargadod de la revisión, fecha prevista de la revisión, fecha en la que la revisión fue realizada,...';
COMMENT ON TABLE vismel.rol IS 'Esta tabla contiene los roles que pueden tener los usuarios. La tabla usuario tiene una fk a esta para saber que rol tiene un usuario.';
COMMENT ON TABLE vismel.tipo_revision IS 'Esta tabla contiene los tipos de revisiones que se le puede hacer a una máquina.';

COMMENT ON COLUMN articulo.id IS 'Identificador único del artículo.';
COMMENT ON COLUMN articulo.nombre IS 'Nombre del artículo.';
COMMENT ON COLUMN articulo.precio IS 'Precio de venta del artículo.';
COMMENT ON COLUMN articulo.coste IS 'Coste del artículo.';
COMMENT ON COLUMN articulo.familia_id IS 'ID de la familia a la que pertenece el artículo.';
COMMENT ON COLUMN articulo.cantidad IS 'Cantidad disponible en inventario.';
COMMENT ON COLUMN articulo.iva IS 'Porcentaje de IVA aplicado al artículo.';

COMMENT ON COLUMN averia.id IS 'Identificador único de la avería.';
COMMENT ON COLUMN averia.fecha IS 'Fecha en la que se registró la avería.';
COMMENT ON COLUMN averia.maquina_id IS 'ID de la máquina averiada.';
COMMENT ON COLUMN averia.usuario_id IS 'ID del usuario encargado de la avería.';
COMMENT ON COLUMN averia.comentarios IS 'Comentarios o detalles sobre la avería.';
COMMENT ON COLUMN averia.prioridad IS 'Nivel de prioridad de la avería. Va de 1 (más prioritario) a 3 (menos prioritario).';
COMMENT ON COLUMN averia.completado IS 'Indica si la avería ha sido resuelta (TRUE/FALSE).';
COMMENT ON COLUMN averia.fecha_completado IS 'Fecha en la que se completó la reparación.';

COMMENT ON COLUMN cliente.id IS 'Identificador único del cliente.';
COMMENT ON COLUMN cliente.nombre IS 'Nombre del cliente.';
COMMENT ON COLUMN cliente.direccion IS 'Dirección del cliente.';
COMMENT ON COLUMN cliente.telefono IS 'Número de teléfono principal del cliente.';
COMMENT ON COLUMN cliente.telefono2 IS 'Número de teléfono secundario del cliente.';
COMMENT ON COLUMN cliente.fax IS 'Número de fax del cliente.';
COMMENT ON COLUMN cliente.movil IS 'Número de móvil del cliente.';
COMMENT ON COLUMN cliente.email IS 'Correo electrónico del cliente.';
COMMENT ON COLUMN cliente.persona_contacto IS 'Nombre de la persona de contacto.';
COMMENT ON COLUMN cliente.observaciones IS 'Observaciones adicionales sobre el cliente.';
COMMENT ON COLUMN cliente.poblacion_id IS 'ID de la población asociada al cliente.';

COMMENT ON COLUMN entradas_salidas.id IS 'Identificador único del registro.';
COMMENT ON COLUMN entradas_salidas.articulo_id IS 'ID del artículo afectado.';
COMMENT ON COLUMN entradas_salidas.usuario_id IS 'ID del usuario que realizó el movimiento.';
COMMENT ON COLUMN entradas_salidas.fecha_hora IS 'Fecha y hora del movimiento.';
COMMENT ON COLUMN entradas_salidas.entrada_salida IS 'Indica si fue una entrada (1) o salida (0) del inventario.';
COMMENT ON COLUMN entradas_salidas.cantidad IS 'Cantidad de artículos movidos.';

COMMENT ON COLUMN familia_articulo.id IS 'Identificador único de la familia de artículo.';
COMMENT ON COLUMN familia_articulo.nombre IS 'Nombre de la familia de artículo.';

COMMENT ON COLUMN frecuencia_revision.id IS 'Identificador único de la frecuencia.';
COMMENT ON COLUMN frecuencia_revision.frecuencia IS 'Nombre o descripción de la frecuencia.';
COMMENT ON COLUMN frecuencia_revision.num_meses IS 'Número de meses entre revisiones.';

COMMENT ON COLUMN maquina.id IS 'Identificador único de la máquina.';
COMMENT ON COLUMN maquina.codigo IS 'Código interno de la máquina.';
COMMENT ON COLUMN maquina.modelo_id IS 'ID del modelo de la máquina.';
COMMENT ON COLUMN maquina.tipo_id IS 'ID del tipo de máquina.';
COMMENT ON COLUMN maquina.conector IS 'Indica si la máquina tiene conector.';
COMMENT ON COLUMN maquina.tarjetero IS 'Indica si la máquina tiene tarjetero.';
COMMENT ON COLUMN maquina.billetero IS 'Indica si la máquina tiene billetero.';
COMMENT ON COLUMN maquina.orain_visa IS 'Indica si la máquina acepta pagos con Orain/VISA.';
COMMENT ON COLUMN maquina.usuario_predeterminado_id IS 'ID del usuario predeterminado asignado a la máquina.';
COMMENT ON COLUMN maquina.cliente_id IS 'ID del cliente propietario de la máquina.';
COMMENT ON COLUMN maquina.frecuencia_revision_id IS 'ID de la frecuencia con la que se revisa la máquina.';
COMMENT ON COLUMN maquina.coste IS 'Coste de adquisición de la máquina.';
COMMENT ON COLUMN maquina.fecha_inicio_amortizacion IS 'Fecha en la que comienza la amortización.';
COMMENT ON COLUMN maquina.observaciones IS 'Observaciones adicionales sobre la máquina.';

COMMENT ON COLUMN modelo_maquina.id IS 'Identificador único del modelo.';
COMMENT ON COLUMN modelo_maquina.modelo IS 'Nombre o descripción del modelo de la máquina.';

COMMENT ON COLUMN poblacion.codigo_postal IS 'Código postal de la población. Corresponde también a la primary key o ID de la población.';
COMMENT ON COLUMN poblacion.nombre IS 'Nombre de la población.';

COMMENT ON COLUMN recaudacion_semanal.id IS 'Identificador único del registro.';
COMMENT ON COLUMN recaudacion_semanal.semana IS 'Semana del año en la que se hizo la recaudación.';
COMMENT ON COLUMN recaudacion_semanal.año IS 'Año de la recaudación.';
COMMENT ON COLUMN recaudacion_semanal.maquina_id IS 'ID de la máquina recaudada.';
COMMENT ON COLUMN recaudacion_semanal.usuario_id IS 'ID del usuario que hizo la recaudación.';
COMMENT ON COLUMN recaudacion_semanal.lectura IS 'Lectura del contador de la máquina.';
COMMENT ON COLUMN recaudacion_semanal.importe_recaudado IS 'Cantidad de dinero recaudado.';

COMMENT ON COLUMN revision_maquina.id IS 'Identificador único de la revisión.';
COMMENT ON COLUMN revision_maquina.usuario_id IS 'ID del usuario que realizó la revisión.';
COMMENT ON COLUMN revision_maquina.maquina_id IS 'ID de la máquina revisada.';
COMMENT ON COLUMN revision_maquina.tipo_revision_id IS 'ID del tipo de revisión realizada.';
COMMENT ON COLUMN revision_maquina.fecha_prevista IS 'Fecha prevista para la revisión.';
COMMENT ON COLUMN revision_maquina.fecha_realizada IS 'Fecha en la que se realizó la revisión.';
COMMENT ON COLUMN revision_maquina.comentarios IS 'Comentarios o notas sobre la revisión.';

COMMENT ON COLUMN rol.id IS 'Identificador único del rol.';
COMMENT ON COLUMN rol.rol IS 'Nombre del rol asignado al usuario.';

COMMENT ON COLUMN tipo_maquina.id IS 'Identificador único del tipo de máquina.';
COMMENT ON COLUMN tipo_maquina.tipo IS 'Nombre o descripción del tipo de máquina.';

COMMENT ON COLUMN tipo_revision.id IS 'Identificador único del tipo de revisión.';
COMMENT ON COLUMN tipo_revision.tipo IS 'Nombre o descripción del tipo de revisión.';

COMMENT ON COLUMN usuario.id IS 'Identificador único del usuario.';
COMMENT ON COLUMN usuario.nombre IS 'Nombre completo del usuario.';
COMMENT ON COLUMN usuario.username IS 'Nombre de usuario para autenticación.';
COMMENT ON COLUMN usuario.password IS 'Contraseña del usuario (hash).';
COMMENT ON COLUMN usuario.rol_id IS 'ID del rol asignado al usuario.';

INSERT INTO "rol" (id,rol) VALUES
	 (1,'default'),
	 (2,'admin'),
	 (3,'empleado'),
	 (4,'developer');

CREATE OR REPLACE VIEW full_usuario AS
SELECT 
  u.id AS id,
  u.nombre AS nombre,
  u.username as username,
  u.password AS password,
  r.id AS rol_id,
  r.rol AS rol
FROM "usuario" u
JOIN "rol" r ON u.rol_id = r.id;

INSERT INTO "usuario" (id,nombre,username,password,rol_id) VALUES
	 (12,'admin','admin','$2b$10$qmgfluB/FH6/bQQoqYHr5eJYFuuPrVYPnmKg0XtXObwhOPAa8s39K',2),
	 (13,'empleado','empleado','$2b$10$RtQGZVWx1Ll/kRwQKYNe8uksNs23bGgS96HvLkcRoXXd2Os9/9RSu',3),
	 (14,'developer','developer','$2b$10$Qh2IzEn/1d6AA.3TYxKF8.qWs0V.bPWrpuKNbWlkUEvxPWT2GrQye',4);

INSERT INTO "familia_articulo" (id,nombre) VALUES
	 (1,'PRODUCTOS DE CAFE'),
	 (2,'RECAMBIOS MAQUINARIA'),
	 (3,'OTROS'),
	 (4,'HORAS Y DESPLAZAMIENTOS'),
	 (5,'VENTA RECAUDACION DE MAQUINAS'),
	 (6,'BEBIDAS');

INSERT INTO "frecuencia_revision" (id,frecuencia,num_meses) VALUES
	 (1,'Mensual',1),
	 (2,'Trimestral',3),
	 (3,'Semestral',6);

INSERT INTO "modelo_maquina" (id,modelo) VALUES
	 (1,'CHIP'),
	 (2,'CHIP XXI'),
	 (3,'BRISAS 3'),
	 (4,'STELA'),
	 (7,'LLAUNESVISMEL(sin lec.)'),
	 (8,'CRISTEL(sin lec.)'),
	 (9,'ARTIC V-4'),
	 (11,'BRISAS 5'),
	 (12,'NIKI SNACKS'),
	 (14,'INCONTRO');
INSERT INTO "modelo_maquina" (id,modelo) VALUES
	 (15,'OPTIMA CAFÉ'),
	 (16,'AGPEPSI MIXTA(sin lec.)'),
	 (20,'LLAUNES PEPSI(sin lec.)'),
	 (22,'SGUARDO'),
	 (23,'PRISMA'),
	 (25,'SECONDO ME'),
	 (26,'NOVA'),
	 (27,'ARTIC 272'),
	 (28,'PALMA B'),
	 (29,'PALMA H');
INSERT INTO "modelo_maquina" (id,modelo) VALUES
	 (31,'NORIA'),
	 (32,'VENDO'),
	 (33,'ROJA(sin lec.)'),
	 (34,'FAS(sin lec.)'),
	 (35,'DIANA'),
	 (36,'GUSGUS'),
	 (37,'OM VENDING(sin lec.)'),
	 (38,'BRISAS PRO(sin lec.)'),
	 (39,'SHOPPING 7'),
	 (40,'COFFEMAR250');
INSERT INTO "modelo_maquina" (id,modelo) VALUES
	 (41,'ARTIC 510'),
	 (42,'VISION'),
	 (44,'JOFFEMAR'),
	 (45,'PRINGLES'),
	 (46,'SAECO'),
	 (47,'PALMA H NORIA'),
	 (48,'NOVA FRIO'),
	 (49,'NIKI FRIO'),
	 (50,'COFFEMAR500'),
	 (51,'SECONDOME AUTOMATICA');
INSERT INTO "modelo_maquina" (id,modelo) VALUES
	 (52,'SECONDOME MUEBLE'),
	 (53,'NOVA PEQ. FRIO'),
	 (54,'NOVA GRANDE'),
	 (55,'KIKKO CAPSULA'),
	 (56,'NOVA ZEUS'),
	 (57,'COFFEMAR230'),
	 (58,'COFFEMAR300BLUE'),
	 (59,'VISION ESCLAVA'),
	 (60,'EXTERNO'),
	 (61,'CAMBIO TECNICOS');

INSERT INTO "tipo_maquina" (id,tipo) VALUES
	 (1,'CAFÉ'),
	 (2,'SNACKS'),
	 (4,'REFRESCOS'),
	 (5,'ZUMOS'),
	 (6,'ZUMOS SNACKS'),
	 (7,'AGUA 1,5L'),
	 (8,'AGUA 0,5L'),
	 (9,'MAT PISCINA'),
	 (10,'HELADOS'),
	 (11,'MIXTA CAFÉ BEGUDA');
INSERT INTO "tipo_maquina" (id,tipo) VALUES
	 (12,'SNACK/CAFÉ'),
	 (13,'SNACK/BEBIDA'),
	 (14,'DESGUACE'),
	 (15,'CAMBIO TEC'),
	 (16,'EXTERNAS');

INSERT INTO "tipo_revision" (id,tipo) VALUES
	 (1,'Revisión'),
	 (2,'Limpieza');

INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (300353,'POL. IND CABEZO BEAZA APTO.2193'),
	 (97999,'IGERSHEIM'),
	 (92131,'SAN DIEGO'),
	 (84018,'SCAFATI'),
	 (81570,'SEMALENS'),
	 (75001,'PARIS'),
	 (74736,'HARDHEIM'),
	 (70012,'PALMA'),
	 (70009,'PALMA'),
	 (51519,'ODENTHAL');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (50410,'CUARTE DE HUELVA'),
	 (50180,'UTEBO'),
	 (50004,'ZARAGOZA'),
	 (48710,'BERRIATUA'),
	 (48230,'ELORRIO'),
	 (48196,'LEZAMA'),
	 (48005,'5 BILBAO (VIZCAYA)'),
	 (48001,'BILBAO'),
	 (47520,'LE PASSAGE'),
	 (47420,'ISCAR');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (47015,'VALLADOLID'),
	 (46980,'Paterna'),
	 (46970,'Alaquas'),
	 (46950,'XIRIVELLA'),
	 (46930,'QUART DE POBLET'),
	 (46920,'MISLATA'),
	 (46900,'TORRENT'),
	 (46890,'AGULLENT'),
	 (46722,'BENIARJO (VALENCIA)'),
	 (46680,'ALGEMESI (VALENCIA)');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (46600,'ALZIRA'),
	 (46500,'SAGUNTO'),
	 (46470,'MASSANASSA'),
	 (46418,'FORTALENY'),
	 (46130,'MASAMAGRELL'),
	 (46020,'VALENCIA'),
	 (46016,'TAVERNES BLANQUES'),
	 (46009,'VALENCIA'),
	 (45526,'VAL DE STO DOMINGO CAUDILLA'),
	 (45517,'ESCALONILLA, TOLEDO');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (45500,'TORRIJOS (TOLEDO)'),
	 (44789,'BOCHUM'),
	 (43515,'LA GALERA'),
	 (43424,'SARRAL'),
	 (43206,'REUS (TARRAGONA)'),
	 (42280,'LEQUEITIO'),
	 (42191,'LOS RÁBANOS (SORIA)'),
	 (41500,'ALCALA DE GUADAIRA'),
	 (41126,'modena (italia)'),
	 (41013,'SEVILLA');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (40721,'HILDEN'),
	 (39011,'SANTANDER'),
	 (37188,'SALAMANCA'),
	 (37132,'VERONA'),
	 (37056,'SALIZZOLE'),
	 (36201,'VIGO'),
	 (36001,'PONTEVEDRA'),
	 (35572,'2 TIAS (LAS PALMAS DE GRAN CANARIA)'),
	 (35100,'0 MASPALOMAS (LAS PALMAS DE GRAN CANARIA)'),
	 (34005,'PALENCIA');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (33007,'7 OVIEDO (ASTURIAS)'),
	 (31550,'RIBAFORADA'),
	 (31350,'PERALTA (NAVARRA)'),
	 (31048,'S,BIAGIO DI C'),
	 (30730,'SAN JAVIER'),
	 (30640,'ALBANILLA (MURCIA)'),
	 (30500,'MOLINA DE SEGURA (MURCIA)'),
	 (30151,'SANTO ANGEL'),
	 (30140,'Santomera'),
	 (29006,'MÁLAGA');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (29004,'MALAGA'),
	 (28917,'LEGANES'),
	 (28914,'LEGANES'),
	 (28850,'TORREJON DE ARDOZ'),
	 (28830,'San Fernando de Henares'),
	 (28821,'COSLADA'),
	 (28809,'AIA'),
	 (28806,'ALCALÁ DE HENARES'),
	 (28703,'SAN SEBASTIAN DE LOS REYES'),
	 (28702,'San Sebastian de los Reyes');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (28522,'Rivas-Vaciamadrid'),
	 (28500,'ARGANDA DEL REY'),
	 (28400,'COLLADO VILLALBA'),
	 (28320,'PINTO'),
	 (28232,'LAS ROZAS'),
	 (28224,'POZUELO DE ALARCON'),
	 (28223,'pozuelo de alarcon'),
	 (28222,'MADRIS'),
	 (28108,'ALCOBENDAS'),
	 (28071,'MADRID');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (28050,'MADRID (MADRID)'),
	 (28046,'6 MADRID (MADRID)'),
	 (28045,'MADRID (MADRID)'),
	 (28044,'MADRID'),
	 (28042,'CAP.NACIONES MADRID'),
	 (28041,'MADRIS'),
	 (28040,'MADRID'),
	 (28037,'MADRID'),
	 (28036,'MADRDID'),
	 (28033,'MADRID');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (28031,'MADRID'),
	 (28028,'MADRID'),
	 (28027,'Madrid'),
	 (28023,'MADRID'),
	 (28022,'MADRID'),
	 (28020,'0 MADRID (MADRID)'),
	 (28013,'MADRID'),
	 (28010,'MADRID'),
	 (28009,'MADRID'),
	 (28006,'6 MADRID (MADRID)');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (28001,'MADRID'),
	 (27430,'LUGO'),
	 (26006,'LOGROÑO'),
	 (25180,'ALCARRAS'),
	 (25001,'LLEIDA'),
	 (23300,'VILLACARRILLO'),
	 (20870,'ELGOIBAR'),
	 (20800,'ZARAUTZ'),
	 (20500,'ARRASATE-MONDRAGON'),
	 (20400,'TOLOSA');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (20305,'IRUN'),
	 (20303,'IRÚN'),
	 (20301,'IRUN'),
	 (20230,'LEGAZPI'),
	 (20180,'OIARTZUM'),
	 (20148,'MILANO'),
	 (20135,'MILANO'),
	 (20120,'HERNANI'),
	 (20088,'Rosate'),
	 (20009,'SAN SEBASTIAN');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (18567,'DEHESAS VIEJAS'),
	 (18220,'ALBOLOTE'),
	 (18015,'GRANADA'),
	 (17844,'CORNELLA DEL TERRI'),
	 (17600,'FIGUERES'),
	 (17469,'VILAMALLA'),
	 (17460,'CELRA'),
	 (17457,'RIUDELLOTS DE LA SELVA'),
	 (17412,'MAÇANET DE LA SELVA'),
	 (17244,'CASA DE LA SELVA GIRONA');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (15404,'FERROL'),
	 (14900,'LUCENA'),
	 (13127,'VITROLLES'),
	 (9400,'ARANDA DE DUERO (BURGOS)'),
	 (9100,'LA TOUR DU CRIEU'),
	 (8980,'Sant Feliu de Llobregat'),
	 (8950,'ESPLUGUES DE LLOBREGAT'),
	 (8940,'CORNELLA (BARCELONA)'),
	 (8918,'BADALONA'),
	 (8917,'BADALONA');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (8912,'BADALONA'),
	 (8907,'HOSPITALET DE LLOBREGAT'),
	 (8902,'HOSPITALET'),
	 (8870,'SITGES'),
	 (8840,'VILADECANS'),
	 (8830,'SANT BOI DE LLOBREGAT'),
	 (8820,'PRAT DE LLOBREGAT'),
	 (8800,'VILANOVA I LA GELTRU'),
	 (8792,'LA GRANADA'),
	 (8760,'MARTORELL');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (8758,'Cervelló'),
	 (8755,'CASTELLBISBAL'),
	 (8754,'EL PAPIOL'),
	 (8635,'SANT ESTEVE SES ROVIRES'),
	 (8503,'GURB'),
	 (8450,'LLINARS DEL VALLÈS'),
	 (8440,'CARDEDEU'),
	 (8370,'CALELLA'),
	 (8360,'CANET DE MAR'),
	 (8340,'VILASSAR DE MAR');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (8339,'VILASSAR DE DALT'),
	 (8310,'ARGENTONA'),
	 (8302,'MATARO'),
	 (8295,'sant vicenç de castellet'),
	 (8290,'CERDANYOLA DEL VALLÈS'),
	 (8251,'SANTPEDOR'),
	 (8228,'TERRASSA'),
	 (8224,'TERRASSA'),
	 (8223,'TERRASSA'),
	 (8211,'CASTELLAR DEL VALLES');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (8210,'BARBERA DEL VALLES'),
	 (8206,'SABADELL'),
	 (8201,'SABADELL'),
	 (8192,'BARCELONA'),
	 (8191,'RUBI'),
	 (8190,'SAN CUGAT DEL VALLES'),
	 (8187,'STA. EULÀLIA DE RONÇANA'),
	 (8184,'PALAU SOLITA I PLEGAMANS'),
	 (8174,'Sant cugat del Vallés'),
	 (8170,'MONTORNES DEL VALLES');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (8160,'MONTMELÓ'),
	 (8150,'PARETS DEL VAL'),
	 (8130,'STA. PERPETUA DE LA  MOGODA'),
	 (8110,'MONTCADA I REIXAC (BARCELONA)'),
	 (8100,'SANT FOST'),
	 (8041,'BARCELONA'),
	 (8040,'MERCABARNA'),
	 (8039,'BARCELONA'),
	 (8034,'4 BARCELONA (BARCELONA)'),
	 (8032,'BARCELONA');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (8030,'BARCELONA'),
	 (8028,'BARCELONA'),
	 (8024,'BARCELONA'),
	 (8023,'BARCELONA'),
	 (8022,'BARCELONA'),
	 (8021,'BARCELONA'),
	 (8020,'BARCELONA'),
	 (8019,'BARCELONA'),
	 (8018,'BARCELONA'),
	 (8015,'BARCELONA');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (8014,'BARCELONA'),
	 (8011,'barcelona'),
	 (8009,'BARCELONA'),
	 (8008,'BARCELONA'),
	 (8007,'BARCELONA'),
	 (8005,'BARCELONA'),
	 (8003,'BARCELONA'),
	 (8002,'BARCELONA'),
	 (8001,'barcelona'),
	 (7840,'STA. EULÀLIA');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (7830,'0 SANT JOSEP (IBIZA)'),
	 (7817,'SANT JORDI (MALLORCA)'),
	 (7816,'6 SAN RAFAEL/IBIZA'),
	 (7800,'EIVISSA'),
	 (7766,'CIUTADELLA'),
	 (7760,'0 CIUTADELLA (BALEARES)'),
	 (7740,'ES MERCADAL'),
	 (7730,'ALAIOR'),
	 (7720,'ES CASTELL'),
	 (7690,'LLOMBARDS (MALLORCA)');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (7687,'7 SA COMA (BALEARES)'),
	 (7680,'PORTO CRISTO (BALEARES)'),
	 (7670,'PORTO COLOM (BALEARES)'),
	 (7660,'CALA D''OR'),
	 (7630,'CAMPOS (BALEARES)'),
	 (7620,'LLUCMAJOR'),
	 (7610,'0 C´AN PASTILLA (BALEARES)'),
	 (7609,'LLUCMAJOR'),
	 (7600,'0 S´ARENAL (BALEARES)'),
	 (7590,'CAPDEPERA');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (7589,'9 CANYAMEL (BALEARES)'),
	 (7580,'CAPDEPERA (BALEARES)'),
	 (7570,'ARTA (BALEARES)'),
	 (7560,'0 CALA MILLOR (BALEARES)'),
	 (7550,'SON SERVERA (BALEARES)'),
	 (7530,'SANT LLORENÇ (BALEARES)'),
	 (7529,'ARIANY'),
	 (7520,'PETRA'),
	 (7519,'MARIA DE LA SALUT (BALEARES)'),
	 (7518,'LLORET VISTALEGRE');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (7510,'SINEU'),
	 (7500,'MANACOR'),
	 (7470,'PTO. POLLENSA'),
	 (7469,'CALA SANT VICENÇ (BALEARES)'),
	 (7460,'POLLENSA'),
	 (7458,'CAN PICAFORT'),
	 (7450,'SANTA MARGALIDA'),
	 (7440,'MURO'),
	 (7430,'LLUBI'),
	 (7420,'SA POBLA');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (7410,'PTO. DE ALCUDIA'),
	 (7408,'PTO. ALCUDIA'),
	 (7400,'ALCUDIA'),
	 (7369,'BINIAMAR'),
	 (7360,'LLOSETA'),
	 (7350,'BINISSALEM'),
	 (7340,'ALARO'),
	 (7330,'CONSELL'),
	 (7320,'STA. MARIA DEL CAMI'),
	 (7315,'ESCORCA');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (7314,'CAIMARI'),
	 (7313,'SELVA'),
	 (7312,'MANCOR'),
	 (7311,'BUGER'),
	 (7310,'CAMPANET'),
	 (7300,'INCA'),
	 (7260,'PORRERES (BALEARES)'),
	 (7250,'VILAFRANCA DE BONANY'),
	 (7240,'SANT JOAN'),
	 (7230,'MONTUIRI');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (7220,'PINA'),
	 (7210,'ALGAIDA (BALEARES)'),
	 (7199,'SANT JORDI '),
	 (7198,'SON FERRIOL'),
	 (7193,'PALMANYOLA'),
	 (7190,'ESPORLAS (BALEARES)'),
	 (7184,'CALVIA'),
	 (7182,'2 MAGALLUF (BALEARES)'),
	 (7181,'1 PALMA NOVA (BALEARES)'),
	 (7180,'SANTA PONSA');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (7160,'0 PAGUERA (BALEARES)'),
	 (7157,'ANDRATX'),
	 (7150,'0 ANDRATX (BALEARES)'),
	 (7144,'COSTITX'),
	 (7143,'POL.INDUST.MARRATXI (BALEARES)'),
	 (7141,'MARRATXI'),
	 (7140,'SENCELLES'),
	 (7122,'Palma'),
	 (7121,'PALMA'),
	 (7120,'PALMA');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (7110,'BUNYOLA'),
	 (7109,'FORNALUTX'),
	 (7100,'SOLLER'),
	 (7080,'PALMA'),
	 (7041,'MARRATXI'),
	 (7035,'PALMA'),
	 (7016,'PALMA DE MALLORCA'),
	 (7015,'PALMA'),
	 (7014,'PALMA'),
	 (7013,'PALMA');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (7012,'PALMA'),
	 (7011,'PALMA'),
	 (7010,'PALMA'),
	 (7009,'PGNO. SON CASTELLO . PALMA'),
	 (7008,'PALMA'),
	 (7007,'7 COLL D´EN REBASSA (BALEARES)'),
	 (7006,'PALMA'),
	 (7005,'PALMA'),
	 (7004,'PALMA'),
	 (7003,'PALMA DE MALLORCA (BALEARES)');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (7002,'PALMA'),
	 (7001,'PALMA'),
	 (3660,'NOVELDA (ALICANTE)'),
	 (3503,'ALICANTE'),
	 (3440,'IBI'),
	 (3293,'ELCHE'),
	 (3113,'ALICANTE (ALICANTE)'),
	 (3006,'ALICANTE'),
	 (2520,'CHINCHILLA-ALBACETE'),
	 (1015,'VITORIA');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (1013,'VITORIA'),
	 (710,'PALMA'),
	 (700,'SOLLER'),
	 (420,'SA POBLA'),
	 (7,'PALMA'),
	 (7559,'Cala Bona'),
	 (7189,'Nova Santa Ponsa'),
	 (7650,'Santanyí'),
	 (7309,'Son Castello'),
	 (7639,'Sa Ràpita');
INSERT INTO "poblacion" (codigo_postal,nombre) VALUES
	 (7200,'Felanitx'),
	 (7108,'Sóller'),
	 (70209,'Gran Via Asima');

SELECT setval('articulo_id_seq', (SELECT MAX(id) FROM "articulo"));
SELECT setval('averia_id_seq', (SELECT MAX(id) FROM "averia"));
SELECT setval('cliente_id_seq', (SELECT MAX(id) FROM "cliente"));
SELECT setval('entradas_salidas_id_seq', (SELECT MAX(id) FROM "entradas_salidas"));
SELECT setval('familia_articulo_id_seq', (SELECT MAX(id) FROM "familia_articulo"));
SELECT setval('frecuencia_revision_id_seq', (SELECT MAX(id) FROM "frecuencia_revision"));
SELECT setval('maquina_id_seq', (SELECT MAX(id) FROM "maquina"));
SELECT setval('modelo_maquina_id_seq', (SELECT MAX(id) FROM "modelo_maquina"));
SELECT setval('tipo_revision_id_seq', (SELECT MAX(id) FROM "tipo_revision"));
SELECT setval('tipo_maquina_id_seq', (SELECT MAX(id) FROM "tipo_maquina"));
SELECT setval('rol_id_seq', (SELECT MAX(id) FROM "rol"));
SELECT setval('revision_maquina_id_seq', (SELECT MAX(id) FROM "revision_maquina"));
SELECT setval('recaudacion_semanal_id_seq', (SELECT MAX(id) FROM "recaudacion_semanal"));
SELECT setval('usuario_id_seq', (SELECT MAX(id) FROM "usuario"));
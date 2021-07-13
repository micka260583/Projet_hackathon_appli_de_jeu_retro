/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `game`;
DROP TABLE IF EXISTS `soloscore`;
DROP TABLE IF EXISTS `multiscore`;

CREATE TABLE `user` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `created_at` DATE NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `game` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `data_name` VARCHAR(255) NOT NULL,
  `status` VARCHAR(5) NOT NULL,
  `released_at` DATE NOT NULL,
  `rules` text DEFAULT NULL,
  `facts` text DEFAULT NULL,
  `image` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `soloscore` (
  `game_id` INT(11) NOT NULL,
  `user_id` INT(11) NOT NULL,
  `score` INT(11) NOT NULL,
  KEY `game_id` (`game_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `soloscore_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `game` (`id`),
  CONSTRAINT `soloscore_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `multiscore` (
  `game_id` INT(11) NOT NULL,
  `user_id` INT(11) NOT NULL,
  `opponent_id` INT(11) NOT NULL,
  `result` BOOLEAN NOT NULL,
  `score` text,
  KEY `game_id` (`game_id`),
  KEY `user_id` (`user_id`),
  KEY `opponent_id` (`opponent_id`),
  CONSTRAINT `multiscore_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `multiscore_ibfk_2` FOREIGN KEY (`opponent_id`) REFERENCES `user` (`id`),
  CONSTRAINT `multiscore_ibfk_3` FOREIGN KEY (`game_id`) REFERENCES `game` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `game` (name, data_name, status, released_at, rules, facts, image) VALUES
  (
  'Snake',
  'snake',
  'solo',
  '1997-01-01',
  'Mangez la nouriture mais pas votre queue ! Evitez les murs.',
  'La version la plus connue de Snake est la version sortie en 2000 sur Nokia 3310.',
  '/assets/images/games/snake.png'
  ),

  (
  'Morpion',
  'morpion',
  'multi',
  '1900-01-01',
  'Chacun leur tour les joueurs placent leur pions (X ou O) sur le plateau. Le premier joueur à aligner 3 de ses pions remporte la partie.',
  "OXO est un jeu vidéo de morpion apparu en 1952. Il s'agit du premier jeu graphique connu tournant sur un ordinateur. La date de création de ce jeu reste inconnue.",
  '/assets/images/games/morpion.png'
  ),

  (
  'Démineur',
  'demineur',
  'solo',
  '1960-01-01',
  'Trouvez et marquez toutes mines présentes sur le tableau pour remporter la partie. Le nombre indiqué dans les cases représente le nombre de mines adjacentes.',
  'Les records pour chaque catégorie sont détenus par la même personne: le polonais Kamil Murański: débutant - 0,49s / intermédiaire - 7,03s / expert - 31,133s.',
  '/assets/images/games/demineur.png'
  ),

  (
  'Pong',
  'pong',
  'solo',
  '1972-11-29',
  'Utilisez les flèches haut et bas pour renvoyez la balle dans le camp adverse et marquez pour gagner des points !',
  'Sorti sur Atari en 1972, ce jeu a pour la première fois été conçu en 1958 par William Higinbotham sur un oscilloscope.',
  '/assets/images/games/pong.png'
  ),

  (
  'Casse-brique',
  'casseBrique',
  'solo',
  '1976-01-01',
  'Cassez toutes les briques en renvoyant la balle avec la plateforme.',
  'Casse-brique est le cousin solo de Pong en quelque sorte apparu initialement sous le nom de Breakout.',
  '/assets/images/games/casse-brique.png'
  ),

  (
  'Mahjong',
  'mahjong',
  'solo',
  '1900-01-01',
  "Rassemblez les tuiles par paires jusqu'à vider le plateau de jeu.",
  "L'origine de ce jeu est toujours en discussion, mais ce qui est sûr c'est qu'il date de la Chine du 19ème siècle et qu'il est issu d'un jeu de cartes ancien qui aurait progressivement muté en jeu de tuile comme aujourd'hui.",
  '/assets/images/games/mahjong.png'
  ),

  (
  'Puissance 4',
  'puissance',
  'multi',
  '1974-01-01',
  'Jouez tour à tour avec votre adversaire et alignez 4 de vos pions en ligne (ligne, colonne ou diagonale) pour remporter la partie.',
  'Aussi appelé 4 en ligne, ce jeu de stratégie combinatoire abstrait est détenu depuis 1984 par Hasbro',
  '/assets/images/games/puissance4.png'
  ),

  (
  'Memory',
  'memory',
  'solo',
  '1959-01-01',
  'Retrouvez les paires de cartes pour les retirer du tableau. Une fois toutes cartes apparayées vous gagnez la partie.',
  'Ce jeu peut aussi se jouer à plusieurs, mais pas ici ...',
  '/assets/images/games/memory.png'
  ),

  (
    'Space Invader',
    'spaceinvader',
    'solo',
    '1978-01-01',
    "Détruisez les vaisseaux aliens avant qu'il n'atterissent sur vote planète ! Utilisez les flèches gauche et droite pour vous déplacer et X pour tirer.",
    "Le score le plus élevé à Space Invaders serait détenu par Eric Furrer à l'âge de 12 ans à Toronto, Ontario, Canada. Il a obtenu le score de 1 114 020 en 38 heures et 30 minutes.",
    '/assets/images/games/spaceInvader.png'
  )
;

INSERT INTO `user` (username, password, created_at) VALUES
  (
  'Percy',
  '13aef0865dcae54b2e4db0067e3fd5c6',
  '2021-02-18'
  ),

  (
  'Ginny',
  '843cccd5c669fb8679f73051ac92ced9',
  '2021-02-18'
  )
;

INSERT INTO `soloscore` (game_id, user_id, score) VALUES 
  (
  1,
  1,
  40
  ),

  (
  1,
  1,
  32
  ),

  (
  1,
  2,
  42
  ),

  (
  5,
  1,
  132
  ),

  (
  5,
  2,
  195
  ),

  (
  5,
  2,
  130
  )
;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
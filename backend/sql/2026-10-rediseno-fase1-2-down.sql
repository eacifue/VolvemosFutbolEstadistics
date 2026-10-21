-- Reversa del rediseño fase 1 y 2 (cancha, apodo, posiciones compartidas). MySQL 8.
-- Antes de correrlo: respalda la base (mysqldump) y despliega un backend sin estas columnas,
-- porque SchemaMigrator las vuelve a crear al arrancar.
ALTER TABLE `Matches` DROP COLUMN `Venue`;
ALTER TABLE `Players` DROP COLUMN `Nickname`;
ALTER TABLE `MatchPlayers` DROP COLUMN `PitchX`, DROP COLUMN `PitchY`;

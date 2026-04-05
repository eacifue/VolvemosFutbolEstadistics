USE VolvemosFutbol;

-- Drop tables if they exist to recreate with new schema
DROP TABLE IF EXISTS MatchEvents;
DROP TABLE IF EXISTS MatchPlayers;
DROP TABLE IF EXISTS Matches;
DROP TABLE IF EXISTS Players;
DROP TABLE IF EXISTS Teams;
DROP TABLE IF EXISTS Events;


CREATE TABLE `Events` (
  IdEvents int NOT NULL,
  Name varchar(45) DEFAULT NULL,
  PRIMARY KEY (`IdEvents`)
);


-- Teams table
CREATE TABLE Teams (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Color VARCHAR(50) NULL,
    MatchesPlayed INT NOT NULL DEFAULT(0),
    Wins INT NOT NULL DEFAULT(0),
    Draws INT NOT NULL DEFAULT(0),
    Losses INT NOT NULL DEFAULT(0),
    GoalsFor INT NOT NULL DEFAULT(0),
    GoalsAgainst INT NOT NULL DEFAULT(0),
    CreatedAt DATETIME NOT NULL DEFAULT NOW(),
    UpdatedAt DATETIME NOT NULL DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS Players (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Number INT NOT NULL,
    Position VARCHAR(50) NULL,
    Height VARCHAR(50) NULL,
    Weight VARCHAR(50) NULL,
    Nationality VARCHAR(100) NULL,
    Goals INT NOT NULL DEFAULT(0),
    Assists INT NOT NULL DEFAULT(0),
    Matches INT NOT NULL DEFAULT(0),
    TeamId INT NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT NOW(),
    UpdatedAt DATETIME NOT NULL DEFAULT NOW(),
    CONSTRAINT FK_Players_Teams FOREIGN KEY(TeamId) REFERENCES Teams(Id)
);

-- Matches table
CREATE TABLE IF NOT EXISTS Matches (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    MatchDate DATETIME NOT NULL,
    HomeTeamId INT NULL,
    AwayTeamId INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT NOW(),
    UpdatedAt DATETIME NOT NULL DEFAULT NOW(),
    CONSTRAINT FK_Matches_HomeTeam FOREIGN KEY(HomeTeamId) REFERENCES Teams(Id) ON DELETE SET NULL,
    CONSTRAINT FK_Matches_AwayTeam FOREIGN KEY(AwayTeamId) REFERENCES Teams(Id) ON DELETE SET NULL
);

-- MatchPlayers table
CREATE TABLE IF NOT EXISTS MatchPlayers (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    MatchId INT NOT NULL,
    PlayerId INT NOT NULL,
    Team VARCHAR(10) NOT NULL, -- 'white' or 'black'
    CreatedAt DATETIME NOT NULL DEFAULT NOW(),
    CONSTRAINT FK_MatchPlayers_Matches FOREIGN KEY(MatchId) REFERENCES Matches(Id),
    CONSTRAINT FK_MatchPlayers_Players FOREIGN KEY(PlayerId) REFERENCES Players(Id)
);

-- MatchEvents table
CREATE TABLE IF NOT EXISTS MatchEvents (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    MatchId INT NOT NULL,
    PlayerId INT NOT NULL,
    EventType VARCHAR(50) NOT NULL,
    Team VARCHAR(10) NOT NULL, -- 'white' or 'black'
    Minute INT NULL,
    Description VARCHAR(500) NULL,
    CreatedAt DATETIME NOT NULL DEFAULT NOW(),
    CONSTRAINT FK_MatchEvents_Matches FOREIGN KEY(MatchId) REFERENCES Matches(Id),
    CONSTRAINT FK_MatchEvents_Players FOREIGN KEY(PlayerId) REFERENCES Players(Id)
);

-- Insert sample data (Enhanced for testing matches)

-- teams (4 rows)
INSERT INTO Teams (Name, Color, MatchesPlayed, Wins, Draws, Losses, GoalsFor, GoalsAgainst)
VALUES
('Blanco', 'White', 2,2,0,0,9,3),
('Negro', 'Black', 2,0,0,2,3,9);

-- players (12 rows - 3 per team)
INSERT INTO Players (FirstName, LastName, Number, Position, Goals, Assists, Matches, TeamId)
VALUES
('German', 'Piña', 1, 'Forward', 0, 0, 0, 1),
('Eric', 'Cifuentes', 2, 'Midfielder', 0, 0, 0, 1),
('Hernan', 'Foronda', 3, 'Midfielder', 0, 0, 0, 1),
('Julio', 'Atencio', 4, 'Forward', 0, 0, 0, 2),
('Juan David', 'Rincon', 5, 'Portero', 0, 0, 0, 2),
('Santiago', 'Arango', 6, 'Defensa', 0, 0, 0, 2),
('Enoc', 'Marchan', 7, 'Forward', 0, 0, 0, 1),
('Juan David', 'Duque', 8, 'Portero', 0, 0, 0, 1),
('Andres', 'Hernandez', 9, 'Midfielder', 0, 0, 0, 2),
('David', 'Chacon', 10, 'Forward', 0, 0, 0, 2),
('Juan Diego', 'Piña', 11, 'Midfielder', 0, 0, 0, 1),
('Juan', 'Fajardo', 12, 'Midfielder', 0, 0, 0, 1),
('Hernan', 'Lopera', 13, 'Defensa', 0, 0, 0, 1),
('Esteban', 'Delgado', 14, 'Defensa', 0, 0, 0, 1),
('Camilo', 'Dimate', 15, 'Defensa', 0, 0, 0, 1),
('Mauricio', 'Lopez', 16, 'Midfielder', 0, 0, 0, 1),
('Julian', 'Mejia', 17, 'Defensa', 0, 0, 0, 1);

-- matches (1 row)
INSERT INTO Matches (MatchDate)
VALUES (NOW());

-- match players (example: assign some players to white and black)
INSERT INTO MatchPlayers (MatchId, PlayerId, Team)
VALUES
(1, 1, 'white'), -- German Piña
(1, 2, 'white'), -- Eric Cifuentes
(1, 4, 'black'), -- Daniel Lopez
(1, 5, 'black'); -- Hugo Martinez

-- match events (example events)
INSERT INTO MatchEvents (MatchId, PlayerId, EventType, Team, Minute, Description)
VALUES
(1, 1, 'Goal', 'white', 1, 'Gol de German'),
(1, 2, 'Assist', 'white', 2, 'Asistencia de Eric'),
(1, 4, 'Goal', 'black', 3, 'Gol de Hernan Foronda');
using System;
using System.Collections.Generic;
using MyApi.Models;

namespace MyApi.Data
{
    public class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            // Create the database if it doesn't exist (for in-memory)
            context.Database.EnsureCreated();

            // Check if we already have data
            if (context.Teams.Any())
                return;

            // Create positions
            var positions = new Position[]
            {
                new Position { Name = "Portero" },
                new Position { Name = "Defensa" },
                new Position { Name = "Mediocampista" },
                new Position { Name = "Delantero" }
            };

            foreach (var position in positions)
            {
                context.Positions.Add(position);
            }
            context.SaveChanges();

            // Create teams
            var teams = new Team[]
            {
                new Team
                {
                    Name = "Real Madrid",
                    Color = "White",
                    MatchesPlayed = 0,
                    Wins = 0,
                    Draws = 0,
                    Losses = 0,
                    GoalsFor = 0,
                    GoalsAgainst = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Team
                {
                    Name = "Barcelona",
                    Color = "Blue",
                    MatchesPlayed = 0,
                    Wins = 0,
                    Draws = 0,
                    Losses = 0,
                    GoalsFor = 0,
                    GoalsAgainst = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Team
                {
                    Name = "Atletico Madrid",
                    Color = "Red",
                    MatchesPlayed = 0,
                    Wins = 0,
                    Draws = 0,
                    Losses = 0,
                    GoalsFor = 0,
                    GoalsAgainst = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Team
                {
                    Name = "Valencia",
                    Color = "Orange",
                    MatchesPlayed = 0,
                    Wins = 0,
                    Draws = 0,
                    Losses = 0,
                    GoalsFor = 0,
                    GoalsAgainst = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            foreach (Team team in teams)
            {
                context.Teams.Add(team);
            }
            context.SaveChanges();

            // Create players
            var players = new Player[]
            {
                // Real Madrid players
                new Player
                {
                    FirstName = "Cristiano",
                    LastName = "Ronaldo",
                    PositionId = positions.Single(p => p.Name == "Delantero").Id,
                    Goals = 0,
                    Assists = 0,
                    Matches = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Player
                {
                    FirstName = "Sergio",
                    LastName = "Ramos",
                    PositionId = positions.Single(p => p.Name == "Defensa").Id,
                    Goals = 0,
                    Assists = 0,
                    Matches = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Player
                {
                    FirstName = "Andriy",
                    LastName = "Lunin",
                    PositionId = positions.Single(p => p.Name == "Portero").Id,
                    Goals = 0,
                    Assists = 0,
                    Matches = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },

                // Barcelona players
                new Player
                {
                    FirstName = "Lionel",
                    LastName = "Messi",
                    PositionId = positions.Single(p => p.Name == "Delantero").Id,
                    Goals = 0,
                    Assists = 0,
                    Matches = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Player
                {
                    FirstName = "Gerard",
                    LastName = "Piqué",
                    PositionId = positions.Single(p => p.Name == "Defensa").Id,
                    Goals = 0,
                    Assists = 0,
                    Matches = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Player
                {
                    FirstName = "Marc-André",
                    LastName = "ter Stegen",
                    PositionId = positions.Single(p => p.Name == "Portero").Id,
                    Goals = 0,
                    Assists = 0,
                    Matches = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },

                // Atletico Madrid players
                new Player
                {
                    FirstName = "João",
                    LastName = "Félix",
                    PositionId = positions.Single(p => p.Name == "Delantero").Id,
                    Goals = 0,
                    Assists = 0,
                    Matches = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Player
                {
                    FirstName = "José",
                    LastName = "Giménez",
                    PositionId = positions.Single(p => p.Name == "Defensa").Id,
                    Goals = 0,
                    Assists = 0,
                    Matches = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },

                // Valencia players
                new Player
                {
                    FirstName = "Gonçalo",
                    LastName = "Guedes",
                    PositionId = positions.Single(p => p.Name == "Delantero").Id,
                    Goals = 0,
                    Assists = 0,
                    Matches = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            foreach (Player player in players)
            {
                context.Players.Add(player);
            }
            context.SaveChanges();
        }
    }
}

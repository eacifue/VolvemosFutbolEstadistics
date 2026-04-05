using System;
using System.Collections.Generic;

namespace MyApi.Models
{
    public class Team
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Color { get; set; }
        public int MatchesPlayed { get; set; }
        public int Wins { get; set; }
        public int Draws { get; set; }
        public int Losses { get; set; }
        public int GoalsFor { get; set; }
        public int GoalsAgainst { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public int Points => (Wins * 3) + Draws;
    }
}

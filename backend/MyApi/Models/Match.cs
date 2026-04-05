using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace MyApi.Models
{
    public class Match
    {
        public int Id { get; set; }
        public DateTime MatchDate { get; set; }
        public int? HomeTeamId { get; set; }
        public int? AwayTeamId { get; set; }
        
        // Relationships
        public Team? HomeTeam { get; set; }
        public Team? AwayTeam { get; set; }
        [JsonIgnore]
        public ICollection<MatchPlayer> MatchPlayers { get; set; } = new List<MatchPlayer>();
        [JsonIgnore]
        public ICollection<MatchEvent> Events { get; set; } = new List<MatchEvent>();
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}

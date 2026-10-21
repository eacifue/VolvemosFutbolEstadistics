using System;
using System.Text.Json.Serialization;

namespace MyApi.Models
{
    public class MatchPlayer
    {
        public int Id { get; set; }
        public int MatchId { get; set; }
        [JsonIgnore]
        public Match? Match { get; set; }
        public int PlayerId { get; set; }
        public Player? Player { get; set; } // Included in API response

        // Team in match: 1=Home, 2=Away (or whatever convention)
        public int TeamId { get; set; }

        // Posición en la cancha compartida, en % del ancho/alto (0–100). Null = ubicación automática por posición.
        public decimal? PitchX { get; set; }
        public decimal? PitchY { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
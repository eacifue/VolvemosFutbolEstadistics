using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MyApi.Models
{
    public class MatchEvent
    {
        public int Id { get; set; }
        public int MatchId { get; set; }
        [JsonIgnore]
        public Match? Match { get; set; }

        public int PlayerId { get; set; }
        [JsonIgnore]
        public virtual Player? Player { get; set; }

        [Column("IdEventType")]
        public int EventTypeId { get; set; }
        public virtual EventType? EventType { get; set; }

        [Column("IdTeam")]
        public int TeamId { get; set; }

 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

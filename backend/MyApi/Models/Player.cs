using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MyApi.Models
{
public class Player
{
    public int Id { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    [Column("IdPosition")]
    public int? PositionId { get; set; }
    public Position? Position { get; set; }

    public int Goals { get; set; }
    public int Assists { get; set; }
    public int Matches { get; set; }

    [NotMapped]
    public int OwnGoals { get; set; }

    [NotMapped]
    public decimal GoalsPerGame { get; set; }

    [NotMapped]
    public int Wins { get; set; }

    [NotMapped]
    public int Losses { get; set; }

    [NotMapped]
    public int Draws { get; set; }

    [NotMapped]
    public int GoalStreak { get; set; }

    [NotMapped]
    public int NoGoalStreak { get; set; }

    // Relationships
    [JsonIgnore]
    public ICollection<MatchEvent> MatchEvents { get; set; } = new List<MatchEvent>();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
}


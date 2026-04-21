namespace MyApi.DTOs
{
    public class PlayerDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public int? PositionId { get; set; }
        public PositionDto? Position { get; set; }
        public int Goals { get; set; }
        public int Assists { get; set; }
        public int Matches { get; set; }
        public decimal GoalsPerGame { get; set; }
        public int Wins { get; set; }
        public int Losses { get; set; }
        public int Draws { get; set; }
        public int GoalStreak { get; set; }
        public int NoGoalStreak { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
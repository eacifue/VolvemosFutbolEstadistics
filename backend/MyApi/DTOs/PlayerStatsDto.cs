namespace MyApi.DTOs
{
    public class PlayerStatsDto
    {
        public int PlayerId { get; set; }
        public int Goals { get; set; }
        public int Assists { get; set; }
        public int Matches { get; set; }
        public int OwnGoals { get; set; }
        public decimal GoalsPerGame { get; set; }
        public int Wins { get; set; }
        public int Losses { get; set; }
        public int Draws { get; set; }
        public int GoalStreak { get; set; }
        public int NoGoalStreak { get; set; }
    }
}
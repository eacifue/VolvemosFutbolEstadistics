namespace MyApi.DTOs.Dashboard
{
    public record TeamStatsDto
    {
        public int Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Color { get; init; } = string.Empty;
        public int MatchesPlayed { get; init; }
        public int Wins { get; init; }
        public int Draws { get; init; }
        public int Losses { get; init; }
        public int GoalsFor { get; init; }
        public int GoalsAgainst { get; init; }
    }
}
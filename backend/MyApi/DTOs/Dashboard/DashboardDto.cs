namespace MyApi.DTOs.Dashboard
{
    public record DashboardDto
    {
        public int TotalMatches { get; init; }
        public int WhiteTeamWins { get; init; }
        public int BlackTeamWins { get; init; }
        public int Draws { get; init; }
        public int WhiteGoalsFor { get; init; }
        public int BlackGoalsFor { get; init; }
        public int GoalDifference { get; init; }
        public IEnumerable<RecentMatchDto> RecentMatches { get; init; } = new List<RecentMatchDto>();
        public IEnumerable<TopPlayerDto> TopScorers { get; init; } = new List<TopPlayerDto>();
        public IEnumerable<TopPlayerDto> TopAssists { get; init; } = new List<TopPlayerDto>();
        public IEnumerable<TeamStatsDto> TeamComparison { get; init; } = new List<TeamStatsDto>();
    }
}
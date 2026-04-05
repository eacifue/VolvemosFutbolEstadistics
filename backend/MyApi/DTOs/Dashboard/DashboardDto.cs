namespace MyApi.DTOs.Dashboard
{
    public record DashboardDto
    {
        public IEnumerable<RecentMatchDto> RecentMatches { get; init; } = new List<RecentMatchDto>();
        public IEnumerable<TopPlayerDto> TopScorers { get; init; } = new List<TopPlayerDto>();
        public IEnumerable<TopPlayerDto> TopAssists { get; init; } = new List<TopPlayerDto>();
        public IEnumerable<TeamStatsDto> TeamComparison { get; init; } = new List<TeamStatsDto>();
    }
}
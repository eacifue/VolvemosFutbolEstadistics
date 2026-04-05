namespace MyApi.DTOs.Dashboard
{
    public record RecentMatchDto
    {
        public int Id { get; init; }
        public DateTime MatchDate { get; init; }
        public int? HomeTeamId { get; init; }
        public int? AwayTeamId { get; init; }
        public IEnumerable<MatchEventSummaryDto> Events { get; init; } = new List<MatchEventSummaryDto>();
        public int HomeGoals { get; init; }
        public int AwayGoals { get; init; }
        public string Winner { get; init; } = string.Empty;
    }
}
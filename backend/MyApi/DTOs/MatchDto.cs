namespace MyApi.DTOs
{
    public class MatchDto
    {
        public int Id { get; set; }
        public DateTime MatchDate { get; set; }
        public int? HomeTeamId { get; set; }
        public int? AwayTeamId { get; set; }
        public TeamDto? HomeTeam { get; set; }
        public TeamDto? AwayTeam { get; set; }
        public List<MatchPlayerDto> MatchPlayers { get; set; } = new List<MatchPlayerDto>();
        public List<MatchEventDto> Events { get; set; } = new List<MatchEventDto>();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
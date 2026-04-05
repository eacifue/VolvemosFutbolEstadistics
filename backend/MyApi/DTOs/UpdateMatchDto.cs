namespace MyApi.DTOs
{
public record UpdateMatchDto
{
    public DateTime? MatchDate { get; init; }
    public int? HomeTeamId { get; init; }
    public int? AwayTeamId { get; init; }
}
}
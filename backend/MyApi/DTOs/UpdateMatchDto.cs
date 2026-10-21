namespace MyApi.DTOs
{
public record UpdateMatchDto
{
    public DateTime? MatchDate { get; init; }
    public int? HomeTeamId { get; init; }
    public int? AwayTeamId { get; init; }

    // null = no cambia; "" = borra la cancha.
    [System.ComponentModel.DataAnnotations.MaxLength(120)]
    public string? Venue { get; init; }
}
}
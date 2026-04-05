using System.ComponentModel.DataAnnotations;

namespace MyApi.DTOs
{
    public record CreateMatchDto
    {
        [Required]
        public DateTime MatchDate { get; init; }

        [Required]
        public int HomeTeamId { get; init; }

        [Required]
        public int AwayTeamId { get; init; }

        public List<CreateMatchPlayerDto> MatchPlayers { get; init; } = [];
    }

}
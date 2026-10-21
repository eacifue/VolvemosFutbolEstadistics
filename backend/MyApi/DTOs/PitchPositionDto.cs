using System.ComponentModel.DataAnnotations;

namespace MyApi.DTOs
{
    // Posición de un jugador en la cancha compartida, en % (0–100). X e Y en null = volver a la ubicación automática.
    public record PitchPositionDto
    {
        [Required]
        public int PlayerId { get; init; }

        [Range(0, 100)]
        public decimal? X { get; init; }

        [Range(0, 100)]
        public decimal? Y { get; init; }
    }

    public record ChangeTeamDto
    {
        [Range(1, 2)]
        public int TeamId { get; init; }
    }
}

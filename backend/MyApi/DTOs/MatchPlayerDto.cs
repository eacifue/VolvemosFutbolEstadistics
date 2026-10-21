namespace MyApi.DTOs
{
    public class MatchPlayerDto
    {
        public int Id { get; set; }
        public int MatchId { get; set; }
        public int PlayerId { get; set; }
        public PlayerDto Player { get; set; } = null!;
        public int TeamId { get; set; } // 1 = home, 2 = away
        public decimal? PitchX { get; set; }
        public decimal? PitchY { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
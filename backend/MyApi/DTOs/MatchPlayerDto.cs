namespace MyApi.DTOs
{
    public class MatchPlayerDto
    {
        public int Id { get; set; }
        public int MatchId { get; set; }
        public int PlayerId { get; set; }
        public PlayerDto Player { get; set; } = null!;
        public int TeamId { get; set; } // 1 = home, 2 = away
        public DateTime CreatedAt { get; set; }
    }
}
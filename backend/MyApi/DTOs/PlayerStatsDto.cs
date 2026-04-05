namespace MyApi.DTOs
{
    public class PlayerStatsDto
    {
        public int PlayerId { get; set; }
        public int Goals { get; set; }
        public int Assists { get; set; }
        public int Matches { get; set; }
    }
}
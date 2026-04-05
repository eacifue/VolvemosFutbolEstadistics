namespace MyApi.DTOs
{
    public class MatchEventDto
    {
        public int Id { get; set; }
        public int MatchId { get; set; }
        public int PlayerId { get; set; }
        public PlayerDto Player { get; set; } = null!;
        public int EventTypeId { get; set; }
        public EventTypeDto? EventType { get; set; }
        public int TeamId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
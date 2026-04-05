namespace MyApi.DTOs.Dashboard
{
    public record MatchEventSummaryDto
    {
        public int Id { get; init; }
        public int PlayerId { get; init; }
        public string PlayerFullName { get; init; } = string.Empty;
        public int EventTypeId { get; init; }
        public string EventTypeName { get; init; } = string.Empty;
        public int TeamId { get; init; }
    }
}
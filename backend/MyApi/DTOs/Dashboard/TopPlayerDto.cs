namespace MyApi.DTOs.Dashboard
{
    public record TopPlayerDto
    {
        public int PlayerId { get; init; }
        public string FirstName { get; init; } = string.Empty;
        public string LastName { get; init; } = string.Empty;
        public string TeamName { get; init; } = string.Empty;
        public int Goals { get; init; }
        public int Assists { get; init; }
        public int OwnGoals { get; init; }
    }
}
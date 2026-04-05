using System.Collections.Generic;

namespace MyApi.Models
{
    public class Position
    {
        public int Id { get; set; }
        public string? Name { get; set; }

        // Relationships
        public ICollection<Player> Players { get; set; } = new List<Player>();
    }
}

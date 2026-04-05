using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MyApi.Models
{
    [Table("Events")]
    public class EventType
    {
        public int Id { get; set; }
        public string? Name { get; set; }

        // Relationships
        [JsonIgnore]
        public ICollection<MatchEvent> MatchEvents { get; set; } = new List<MatchEvent>();
    }
}

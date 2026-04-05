using System.Collections.Generic;
using System.Threading.Tasks;
using MyApi.Models;

namespace MyApi.Services
{
    public interface IMatchEventService
    {
        Task<IEnumerable<MatchEvent>> GetEventsByMatchIdAsync(int matchId);
        Task<MatchEvent> CreateEventAsync(MatchEvent matchEvent);
        Task<MatchEvent> UpdateEventAsync(int id, MatchEvent matchEvent);
        Task<bool> DeleteEventAsync(int id);
        Task<bool> DeleteEventsByMatchIdAsync(int matchId);
    }
}

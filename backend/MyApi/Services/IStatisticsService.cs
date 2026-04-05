using System.Collections.Generic;
using System.Threading.Tasks;
using MyApi.Models;

namespace MyApi.Services
{
    public interface IStatisticsService
    {
        Task<IEnumerable<Player>> GetTopScorersAsync(int limit = 10);
        Task<IEnumerable<Player>> GetTopAssistsAsync(int limit = 10);
        Task<Player> GetPlayerStatisticsAsync(int playerId);
        Task<Team> GetTeamStatisticsAsync(int teamId);
    }
}

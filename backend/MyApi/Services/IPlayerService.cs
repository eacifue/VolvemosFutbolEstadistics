using System.Collections.Generic;
using System.Threading.Tasks;
using MyApi.DTOs;
using MyApi.Models;

namespace MyApi.Services
{
    public interface IPlayerService
    {
        Task<IEnumerable<Player>> GetAllPlayersAsync();
        Task<Player> GetPlayerByIdAsync(int id);
        Task<Player> CreatePlayerAsync(Player player);
        Task<Player> UpdatePlayerAsync(int id, Player player);
        Task<bool> DeletePlayerAsync(int id);
        Task<IEnumerable<Player>> GetPlayersByTeamAsync(int teamId);
        Task<decimal> GetGoalsPerGame(int playerId);
        Task<PlayerMatchResultsDto> GetMatchResults(int playerId);
        Task<int> GetGoalStreak(int playerId);
        Task<int> GetNoGoalStreak(int playerId);
        Task<PlayerStatsDto> GetPlayerStatsAsync(int playerId);
        Task<IEnumerable<PlayerStatsDto>> GetAllPlayersStatsAsync();
    }
}

using System.Collections.Generic;
using System.Threading.Tasks;
using MyApi.DTOs;
using MyApi.Models;

namespace MyApi.Services
{
    public interface IMatchPlayerService
    {
        Task<MatchPlayer> AddPlayerToMatchAsync(int matchId, int playerId, int teamId);
        Task<bool> RemovePlayerFromMatchAsync(int matchId, int playerId);
        Task<IEnumerable<MatchPlayer>> GetMatchPlayersAsync(int matchId);
        Task<IEnumerable<MatchPlayer>?> UpdatePitchPositionsAsync(int matchId, IReadOnlyCollection<PitchPositionDto> positions);
        Task<MatchPlayer?> ChangeTeamAsync(int matchId, int playerId, int teamId);
    }
}
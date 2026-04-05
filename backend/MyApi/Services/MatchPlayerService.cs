using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.Models;

namespace MyApi.Services
{
    public class MatchPlayerService : IMatchPlayerService
    {
        private readonly ApplicationDbContext _context;

        public MatchPlayerService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<MatchPlayer> AddPlayerToMatchAsync(int matchId, int playerId, int teamId)
        {
            // Check if match exists
            var match = await _context.Matches.FindAsync(matchId);
            if (match == null) return null;

            // Check if player exists
            var player = await _context.Players.FindAsync(playerId);
            if (player == null) return null;

            // Ensure team value is valid (1 or 2)
            if (teamId != 1 && teamId != 2) return null;

            // Check if player is already in this match
            var existing = await _context.MatchPlayers
                .FirstOrDefaultAsync(mp => mp.MatchId == matchId && mp.PlayerId == playerId && mp.TeamId == teamId);
            if (existing != null) return null;

            var matchPlayer = new MatchPlayer
            {
                MatchId = matchId,
                PlayerId = playerId,
                TeamId = teamId
            };

            _context.MatchPlayers.Add(matchPlayer);
            await _context.SaveChangesAsync();
            return matchPlayer;
        }

        public async Task<bool> RemovePlayerFromMatchAsync(int matchId, int playerId)
        {
            var matchPlayer = await _context.MatchPlayers
                .FirstOrDefaultAsync(mp => mp.MatchId == matchId && mp.PlayerId == playerId);
            if (matchPlayer == null) return false;

            _context.MatchPlayers.Remove(matchPlayer);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<MatchPlayer>> GetMatchPlayersAsync(int matchId)
        {
            return await _context.MatchPlayers
                .Where(mp => mp.MatchId == matchId)
                .Include(mp => mp.Player)
                .ToListAsync();
        }
    }
}
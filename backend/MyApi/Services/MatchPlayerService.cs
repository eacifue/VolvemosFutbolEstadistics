using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.DTOs;
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

            // Un jugador juega con un solo equipo por partido (para cambiarlo de lado está ChangeTeamAsync)
            var existing = await _context.MatchPlayers
                .FirstOrDefaultAsync(mp => mp.MatchId == matchId && mp.PlayerId == playerId);
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

        // Guarda en bloque las posiciones de la cancha que ven todos. Devuelve null si algún jugador no está en el partido.
        public async Task<IEnumerable<MatchPlayer>?> UpdatePitchPositionsAsync(int matchId, IReadOnlyCollection<PitchPositionDto> positions)
        {
            var lineup = await _context.MatchPlayers
                .Where(mp => mp.MatchId == matchId)
                .ToListAsync();
            if (lineup.Count == 0) return null;

            var byPlayer = lineup.ToDictionary(mp => mp.PlayerId);
            if (positions.Any(p => !byPlayer.ContainsKey(p.PlayerId))) return null;

            foreach (var position in positions)
            {
                var matchPlayer = byPlayer[position.PlayerId];
                var reset = position.X == null || position.Y == null;
                matchPlayer.PitchX = reset ? null : decimal.Round(position.X!.Value, 2);
                matchPlayer.PitchY = reset ? null : decimal.Round(position.Y!.Value, 2);
            }

            await _context.SaveChangesAsync();
            return lineup;
        }

        // Pasa al jugador al otro equipo sin borrarlo del partido; su posición vuelve a la automática
        // porque cada equipo ocupa su propia mitad de la cancha.
        public async Task<MatchPlayer?> ChangeTeamAsync(int matchId, int playerId, int teamId)
        {
            if (teamId != 1 && teamId != 2) return null;

            var matchPlayer = await _context.MatchPlayers
                .FirstOrDefaultAsync(mp => mp.MatchId == matchId && mp.PlayerId == playerId);
            if (matchPlayer == null) return null;

            if (matchPlayer.TeamId != teamId)
            {
                matchPlayer.TeamId = teamId;
                matchPlayer.PitchX = null;
                matchPlayer.PitchY = null;
                await _context.SaveChangesAsync();
            }

            return matchPlayer;
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
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.DTOs;
using MyApi.Models;

namespace MyApi.Services
{
    public class PlayerService : IPlayerService
    {
        private const int GoalEventTypeId = 1;
        private const int AssistEventTypeId = 2;

        private readonly ApplicationDbContext _context;

        public PlayerService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Player>> GetAllPlayersAsync()
        {
            var players = await _context.Players
                .AsNoTracking()
                .Include(p => p.Position)
                .OrderBy(p => p.Id)
                .ToListAsync();

            var statsByPlayerId = await GetDynamicPlayerStatsAsync(players.Select(p => p.Id));

            foreach (var player in players)
            {
                if (statsByPlayerId.TryGetValue(player.Id, out var stats))
                {
                    player.Goals = stats.Goals;
                    player.Assists = stats.Assists;
                    player.Matches = stats.Matches;
                }
                else
                {
                    player.Goals = 0;
                    player.Assists = 0;
                    player.Matches = 0;
                }
            }

            return players;
        }

        public async Task<Player> GetPlayerByIdAsync(int id)
        {
            var player = await _context.Players
                .AsNoTracking()
                .Include(p => p.Position)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (player == null)
            {
                return null;
            }

            var statsByPlayerId = await GetDynamicPlayerStatsAsync(new[] { id });
            if (statsByPlayerId.TryGetValue(id, out var stats))
            {
                player.Goals = stats.Goals;
                player.Assists = stats.Assists;
                player.Matches = stats.Matches;
            }
            else
            {
                player.Goals = 0;
                player.Assists = 0;
                player.Matches = 0;
            }

            return player;
        }

        public async Task<Player> CreatePlayerAsync(Player player)
        {
            if (player == null)
                throw new ArgumentNullException(nameof(player));

            _context.Players.Add(player);
            await _context.SaveChangesAsync();

            // Load Position navigation property so the response includes position name
            if (player.PositionId.HasValue)
                await _context.Entry(player).Reference(p => p.Position).LoadAsync();

            return player;
        }

        public async Task<Player> UpdatePlayerAsync(int id, Player player)
        {
            var existingPlayer = await _context.Players.FindAsync(id);
            if (existingPlayer == null)
                return null;

            // Only update editable fields; preserve Goals/Assists/Matches (managed by match events)
            existingPlayer.FirstName = player.FirstName;
            existingPlayer.LastName = player.LastName;
            existingPlayer.PositionId = player.PositionId;
            existingPlayer.UpdatedAt = DateTime.UtcNow;

            _context.Players.Update(existingPlayer);
            await _context.SaveChangesAsync();

            // Load Position navigation property so the response includes position name
            if (existingPlayer.PositionId.HasValue)
                await _context.Entry(existingPlayer).Reference(p => p.Position).LoadAsync();

            return existingPlayer;
        }

        public async Task<bool> DeletePlayerAsync(int id)
        {
            var player = await _context.Players.FindAsync(id);
            if (player == null)
                return false;

            _context.Players.Remove(player);
            await _context.SaveChangesAsync();
            return true;
        }

        // Players are not directly assigned to teams in the SQL schema; team membership is tracked via MatchPlayers.
        public async Task<IEnumerable<Player>> GetPlayersByTeamAsync(int teamId)
        {
            // Return players that have played in matches for the given team (as Home/Away via MatchPlayers)
            var playerIds = await _context.MatchPlayers
                .AsNoTracking()
                .Where(mp => mp.TeamId == teamId)
                .Distinct()
                .Select(mp => mp.PlayerId)
                .ToListAsync();

            var players = await _context.Players
                .AsNoTracking()
                .Include(p => p.Position)
                .Where(p => playerIds.Contains(p.Id))
                .OrderBy(p => p.Id)
                .ToListAsync();

            var statsByPlayerId = await GetDynamicPlayerStatsAsync(players.Select(p => p.Id));

            foreach (var player in players)
            {
                if (statsByPlayerId.TryGetValue(player.Id, out var stats))
                {
                    player.Goals = stats.Goals;
                    player.Assists = stats.Assists;
                    player.Matches = stats.Matches;
                }
                else
                {
                    player.Goals = 0;
                    player.Assists = 0;
                    player.Matches = 0;
                }
            }

            return players;
        }

        public async Task<PlayerStatsDto> GetPlayerStatsAsync(int playerId)
        {
            // Check if player exists
            var playerExists = await _context.Players.AnyAsync(p => p.Id == playerId);
            if (!playerExists)
                return null;

            var statsByPlayerId = await GetDynamicPlayerStatsAsync(new[] { playerId });
            statsByPlayerId.TryGetValue(playerId, out var stats);

            return new PlayerStatsDto
            {
                PlayerId = playerId,
                Goals = stats?.Goals ?? 0,
                Assists = stats?.Assists ?? 0,
                Matches = stats?.Matches ?? 0
            };
        }

        public async Task<IEnumerable<PlayerStatsDto>> GetAllPlayersStatsAsync()
        {
            var playerIds = await _context.Players
                .AsNoTracking()
                .Select(p => p.Id)
                .OrderBy(id => id)
                .ToListAsync();

            var statsByPlayerId = await GetDynamicPlayerStatsAsync(playerIds);

            return playerIds.Select(playerId =>
            {
                statsByPlayerId.TryGetValue(playerId, out var stats);
                return new PlayerStatsDto
                {
                    PlayerId = playerId,
                    Goals = stats?.Goals ?? 0,
                    Assists = stats?.Assists ?? 0,
                    Matches = stats?.Matches ?? 0
                };
            });
        }

        private async Task<Dictionary<int, PlayerDynamicStats>> GetDynamicPlayerStatsAsync(IEnumerable<int> playerIds)
        {
            var playerIdList = playerIds.Distinct().ToList();

            if (!playerIdList.Any())
            {
                return new Dictionary<int, PlayerDynamicStats>();
            }

            var eventStats = await _context.MatchEvents
                .AsNoTracking()
                .Where(e => playerIdList.Contains(e.PlayerId) && (e.EventTypeId == GoalEventTypeId || e.EventTypeId == AssistEventTypeId))
                .GroupBy(e => e.PlayerId)
                .Select(g => new
                {
                    PlayerId = g.Key,
                    Goals = g.Count(e => e.EventTypeId == GoalEventTypeId),
                    Assists = g.Count(e => e.EventTypeId == AssistEventTypeId)
                })
                .ToListAsync();

            var matchStats = await _context.MatchPlayers
                .AsNoTracking()
                .Where(mp => playerIdList.Contains(mp.PlayerId))
                .GroupBy(mp => mp.PlayerId)
                .Select(g => new
                {
                    PlayerId = g.Key,
                    Matches = g.Select(mp => mp.MatchId).Distinct().Count()
                })
                .ToListAsync();

            var statsByPlayerId = playerIdList.ToDictionary(
                id => id,
                _ => new PlayerDynamicStats { Goals = 0, Assists = 0, Matches = 0 });

            foreach (var stat in eventStats)
            {
                if (statsByPlayerId.TryGetValue(stat.PlayerId, out var value))
                {
                    value.Goals = stat.Goals;
                    value.Assists = stat.Assists;
                }
            }

            foreach (var stat in matchStats)
            {
                if (statsByPlayerId.TryGetValue(stat.PlayerId, out var value))
                {
                    value.Matches = stat.Matches;
                }
            }

            return statsByPlayerId;
        }

        private sealed class PlayerDynamicStats
        {
            public int Goals { get; set; }
            public int Assists { get; set; }
            public int Matches { get; set; }
        }
    }
}

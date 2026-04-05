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
        private readonly ApplicationDbContext _context;

        public PlayerService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Player>> GetAllPlayersAsync()
        {
            return await _context.Players
                .Include(p => p.Position)
                .OrderBy(p => p.Id)
                .ToListAsync();
        }

        public async Task<Player> GetPlayerByIdAsync(int id)
        {
            return await _context.Players
                .Include(p => p.Position)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Player> CreatePlayerAsync(Player player)
        {
            if (player == null)
                throw new ArgumentNullException(nameof(player));

            _context.Players.Add(player);
            await _context.SaveChangesAsync();
            return player;
        }

        public async Task<Player> UpdatePlayerAsync(int id, Player player)
        {
            var existingPlayer = await _context.Players.FindAsync(id);
            if (existingPlayer == null)
                return null;

            existingPlayer.FirstName = player.FirstName;
            existingPlayer.LastName = player.LastName;
            existingPlayer.PositionId = player.PositionId;
            existingPlayer.Goals = player.Goals;
            existingPlayer.Assists = player.Assists;
            existingPlayer.Matches = player.Matches;
            existingPlayer.UpdatedAt = DateTime.UtcNow;

            _context.Players.Update(existingPlayer);
            await _context.SaveChangesAsync();
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
            return await _context.MatchPlayers
                .Where(mp => mp.TeamId == teamId)
                .Select(mp => mp.Player)
                .Distinct()
                .OrderBy(p => p.Id)
                .ToListAsync();
        }

        public async Task<PlayerStatsDto> GetPlayerStatsAsync(int playerId)
        {
            // Check if player exists
            var playerExists = await _context.Players.AnyAsync(p => p.Id == playerId);
            if (!playerExists)
                return null;

            // Calculate goals: count of events where eventTypeId == 1 (goal) and playerId matches
            var goals = await _context.MatchEvents
                .Where(e => e.PlayerId == playerId && e.EventTypeId == 1)
                .CountAsync();

            // Calculate assists: count of events where eventTypeId == 2 (assist) and playerId matches
            var assists = await _context.MatchEvents
                .Where(e => e.PlayerId == playerId && e.EventTypeId == 2)
                .CountAsync();

            // Calculate matches played: count distinct matches where player is assigned
            var matches = await _context.MatchPlayers
                .Where(mp => mp.PlayerId == playerId)
                .Select(mp => mp.MatchId)
                .Distinct()
                .CountAsync();

            return new PlayerStatsDto
            {
                PlayerId = playerId,
                Goals = goals,
                Assists = assists,
                Matches = matches
            };
        }

        public async Task<IEnumerable<PlayerStatsDto>> GetAllPlayersStatsAsync()
        {
            // Get all players
            var players = await _context.Players.Select(p => p.Id).ToListAsync();

            var stats = new List<PlayerStatsDto>();

            foreach (var playerId in players)
            {
                var playerStats = await GetPlayerStatsAsync(playerId);
                if (playerStats != null)
                {
                    stats.Add(playerStats);
                }
            }

            return stats.OrderBy(s => s.PlayerId);
        }
    }
}

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
                    player.GoalsPerGame = stats.GoalsPerGame;
                    player.Wins = stats.Wins;
                    player.Losses = stats.Losses;
                    player.Draws = stats.Draws;
                    player.GoalStreak = stats.GoalStreak;
                    player.NoGoalStreak = stats.NoGoalStreak;
                }
                else
                {
                    ApplyZeroStats(player);
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
                player.GoalsPerGame = stats.GoalsPerGame;
                player.Wins = stats.Wins;
                player.Losses = stats.Losses;
                player.Draws = stats.Draws;
                player.GoalStreak = stats.GoalStreak;
                player.NoGoalStreak = stats.NoGoalStreak;
            }
            else
            {
                ApplyZeroStats(player);
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
                    player.GoalsPerGame = stats.GoalsPerGame;
                    player.Wins = stats.Wins;
                    player.Losses = stats.Losses;
                    player.Draws = stats.Draws;
                    player.GoalStreak = stats.GoalStreak;
                    player.NoGoalStreak = stats.NoGoalStreak;
                }
                else
                {
                    ApplyZeroStats(player);
                }
            }

            return players;
        }

        public async Task<decimal> GetGoalsPerGame(int playerId)
        {
            var statsByPlayerId = await GetDynamicPlayerStatsAsync(new[] { playerId });
            return statsByPlayerId.TryGetValue(playerId, out var stats) ? stats.GoalsPerGame : 0m;
        }

        public async Task<PlayerMatchResultsDto> GetMatchResults(int playerId)
        {
            var statsByPlayerId = await GetDynamicPlayerStatsAsync(new[] { playerId });
            return statsByPlayerId.TryGetValue(playerId, out var stats)
                ? new PlayerMatchResultsDto
                {
                    Wins = stats.Wins,
                    Losses = stats.Losses,
                    Draws = stats.Draws
                }
                : new PlayerMatchResultsDto();
        }

        public async Task<int> GetGoalStreak(int playerId)
        {
            var statsByPlayerId = await GetDynamicPlayerStatsAsync(new[] { playerId });
            return statsByPlayerId.TryGetValue(playerId, out var stats) ? stats.GoalStreak : 0;
        }

        public async Task<int> GetNoGoalStreak(int playerId)
        {
            var statsByPlayerId = await GetDynamicPlayerStatsAsync(new[] { playerId });
            return statsByPlayerId.TryGetValue(playerId, out var stats) ? stats.NoGoalStreak : 0;
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
                Matches = stats?.Matches ?? 0,
                GoalsPerGame = stats?.GoalsPerGame ?? 0m,
                Wins = stats?.Wins ?? 0,
                Losses = stats?.Losses ?? 0,
                Draws = stats?.Draws ?? 0,
                GoalStreak = stats?.GoalStreak ?? 0,
                NoGoalStreak = stats?.NoGoalStreak ?? 0
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
                    Matches = stats?.Matches ?? 0,
                    GoalsPerGame = stats?.GoalsPerGame ?? 0m,
                    Wins = stats?.Wins ?? 0,
                    Losses = stats?.Losses ?? 0,
                    Draws = stats?.Draws ?? 0,
                    GoalStreak = stats?.GoalStreak ?? 0,
                    NoGoalStreak = stats?.NoGoalStreak ?? 0
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

            var playerMatchRows = await _context.MatchPlayers
                .AsNoTracking()
                .Where(mp => playerIdList.Contains(mp.PlayerId))
                .Select(mp => new PlayerMatchRow
                {
                    PlayerId = mp.PlayerId,
                    MatchId = mp.MatchId,
                    TeamId = mp.TeamId,
                    MatchDate = mp.Match != null ? mp.Match.MatchDate : DateTime.MinValue
                })
                .ToListAsync();

            var matchIds = playerMatchRows
                .Select(row => row.MatchId)
                .Distinct()
                .ToList();

            var goalEventsByMatchAndTeam = await _context.MatchEvents
                .AsNoTracking()
                .Where(e => matchIds.Contains(e.MatchId) && e.EventTypeId == GoalEventTypeId)
                .GroupBy(e => new { e.MatchId, e.TeamId })
                .Select(g => new
                {
                    g.Key.MatchId,
                    g.Key.TeamId,
                    Goals = g.Count()
                })
                .ToListAsync();

            var playerGoalsByMatch = await _context.MatchEvents
                .AsNoTracking()
                .Where(e => playerIdList.Contains(e.PlayerId) && matchIds.Contains(e.MatchId) && e.EventTypeId == GoalEventTypeId)
                .GroupBy(e => new { e.PlayerId, e.MatchId })
                .Select(g => new
                {
                    g.Key.PlayerId,
                    g.Key.MatchId,
                    Goals = g.Count()
                })
                .ToListAsync();

            var statsByPlayerId = playerIdList.ToDictionary(
                id => id,
                _ => new PlayerDynamicStats
                {
                    Goals = 0,
                    Assists = 0,
                    Matches = 0,
                    GoalsPerGame = 0m,
                    Wins = 0,
                    Losses = 0,
                    Draws = 0,
                    GoalStreak = 0,
                    NoGoalStreak = 0
                });

            var goalsByMatchAndTeam = goalEventsByMatchAndTeam.ToDictionary(
                item => (item.MatchId, item.TeamId),
                item => item.Goals);

            var totalGoalsByMatch = goalEventsByMatchAndTeam
                .GroupBy(item => item.MatchId)
                .ToDictionary(group => group.Key, group => group.Sum(item => item.Goals));

            var playerGoalsByMatchLookup = playerGoalsByMatch.ToDictionary(
                item => (item.PlayerId, item.MatchId),
                item => item.Goals);

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

            foreach (var playerId in playerIdList)
            {
                if (!statsByPlayerId.TryGetValue(playerId, out var stats))
                {
                    continue;
                }

                if (stats.Matches > 0)
                {
                    stats.GoalsPerGame = Math.Round((decimal)stats.Goals / stats.Matches, 2, MidpointRounding.AwayFromZero);
                }

                var distinctPlayerMatches = playerMatchRows
                    .Where(row => row.PlayerId == playerId)
                    .GroupBy(row => row.MatchId)
                    .Select(group => group
                        .OrderByDescending(row => row.MatchDate)
                        .ThenByDescending(row => row.TeamId)
                        .First())
                    .OrderByDescending(row => row.MatchDate)
                    .ThenByDescending(row => row.MatchId)
                    .ToList();

                var goalStreak = 0;
                var noGoalStreak = 0;
                var goalStreakOpen = true;
                var noGoalStreakOpen = true;

                foreach (var matchRow in distinctPlayerMatches)
                {
                    goalsByMatchAndTeam.TryGetValue((matchRow.MatchId, matchRow.TeamId), out var teamGoals);
                    totalGoalsByMatch.TryGetValue(matchRow.MatchId, out var totalMatchGoals);
                    var opponentGoals = Math.Max(0, totalMatchGoals - teamGoals);

                    if (teamGoals > opponentGoals)
                    {
                        stats.Wins++;
                    }
                    else if (teamGoals < opponentGoals)
                    {
                        stats.Losses++;
                    }
                    else
                    {
                        stats.Draws++;
                    }

                    var scoredGoalInMatch = playerGoalsByMatchLookup.TryGetValue((playerId, matchRow.MatchId), out var goalsInMatch)
                        && goalsInMatch > 0;

                    if (goalStreakOpen)
                    {
                        if (scoredGoalInMatch)
                        {
                            goalStreak++;
                        }
                        else
                        {
                            goalStreakOpen = false;
                        }
                    }

                    if (noGoalStreakOpen)
                    {
                        if (!scoredGoalInMatch)
                        {
                            noGoalStreak++;
                        }
                        else
                        {
                            noGoalStreakOpen = false;
                        }
                    }
                }

                stats.GoalStreak = goalStreak;
                stats.NoGoalStreak = noGoalStreak;
            }

            return statsByPlayerId;
        }

        private static void ApplyZeroStats(Player player)
        {
            player.Goals = 0;
            player.Assists = 0;
            player.Matches = 0;
            player.GoalsPerGame = 0m;
            player.Wins = 0;
            player.Losses = 0;
            player.Draws = 0;
            player.GoalStreak = 0;
            player.NoGoalStreak = 0;
        }

        private sealed class PlayerMatchRow
        {
            public int PlayerId { get; set; }
            public int MatchId { get; set; }
            public int TeamId { get; set; }
            public DateTime MatchDate { get; set; }
        }

        private sealed class PlayerDynamicStats
        {
            public int Goals { get; set; }
            public int Assists { get; set; }
            public int Matches { get; set; }
            public decimal GoalsPerGame { get; set; }
            public int Wins { get; set; }
            public int Losses { get; set; }
            public int Draws { get; set; }
            public int GoalStreak { get; set; }
            public int NoGoalStreak { get; set; }
        }
    }
}

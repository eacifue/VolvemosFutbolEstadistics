using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApi.DTOs;
using MyApi.Models;
using MyApi.Services;

namespace MyApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlayersController : ControllerBase
    {
        private readonly IPlayerService _playerService;

        public PlayersController(IPlayerService playerService)
        {
            _playerService = playerService;
        }

        /// <summary>
        /// Get all players
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PlayerDto>>> GetPlayers()
        {
            var players = await _playerService.GetAllPlayersAsync();
            var playerDtos = players.Select(MapToDto);
            return Ok(playerDtos);
        }

        /// <summary>
        /// Get a specific player by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<PlayerDto>> GetPlayer(int id)
        {
            var player = await _playerService.GetPlayerByIdAsync(id);
            if (player == null)
                return NotFound();

            return Ok(MapToDto(player));
        }

        /// <summary>
        /// Get all players by team
        /// </summary>
        [HttpGet("team/{teamId}")]
        public async Task<ActionResult<IEnumerable<PlayerDto>>> GetPlayersByTeam(int teamId)
        {
            var players = await _playerService.GetPlayersByTeamAsync(teamId);
            var playerDtos = players.Select(MapToDto);
            return Ok(playerDtos);
        }

        /// <summary>
        /// Create a new player
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<PlayerDto>> CreatePlayer(CreatePlayerDto dto)
        {
            var player = new Player
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                PositionId = dto.IdPosition
            };

            var createdPlayer = await _playerService.CreatePlayerAsync(player);
            return CreatedAtAction(nameof(GetPlayer), new { id = createdPlayer.Id }, MapToDto(createdPlayer));
        }

        /// <summary>
        /// Update an existing player
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<PlayerDto>> UpdatePlayer(int id, CreatePlayerDto dto)
        {
            var player = new Player
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                PositionId = dto.IdPosition
            };

            var updatedPlayer = await _playerService.UpdatePlayerAsync(id, player);
            if (updatedPlayer == null)
                return NotFound();

            return Ok(MapToDto(updatedPlayer));
        }

        /// <summary>
        /// Get statistics for a specific player
        /// </summary>
        [HttpGet("{id}/stats")]
        public async Task<ActionResult<PlayerStatsDto>> GetPlayerStats(int id)
        {
            var stats = await _playerService.GetPlayerStatsAsync(id);
            if (stats == null)
                return NotFound();

            return Ok(stats);
        }

        /// <summary>
        /// Get statistics for all players
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult<IEnumerable<PlayerStatsDto>>> GetAllPlayersStats()
        {
            var stats = await _playerService.GetAllPlayersStatsAsync();
            return Ok(stats);
        }

        /// <summary>
        /// Delete an existing player
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlayer(int id)
        {
            var deleted = await _playerService.DeletePlayerAsync(id);
            if (!deleted)
                return NotFound();

            return NoContent();
        }

        private static PlayerDto MapToDto(Player player)
        {
            return new PlayerDto
            {
                Id = player.Id,
                FirstName = player.FirstName,
                LastName = player.LastName,
                PositionId = player.PositionId,
                Position = player.Position != null ? new PositionDto
                {
                    Id = player.Position.Id,
                    Name = player.Position.Name
                } : null,
                Goals = player.Goals,
                Assists = player.Assists,
                Matches = player.Matches,
                GoalsPerGame = player.GoalsPerGame,
                Wins = player.Wins,
                Losses = player.Losses,
                Draws = player.Draws,
                GoalStreak = player.GoalStreak,
                NoGoalStreak = player.NoGoalStreak,
                CreatedAt = player.CreatedAt,
                UpdatedAt = player.UpdatedAt
            };
        }
    }
}

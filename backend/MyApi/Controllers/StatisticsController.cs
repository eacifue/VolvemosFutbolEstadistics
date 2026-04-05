using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MyApi.Models;
using MyApi.Services;

namespace MyApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatisticsController : ControllerBase
    {
        private readonly IStatisticsService _statisticsService;

        public StatisticsController(IStatisticsService statisticsService)
        {
            _statisticsService = statisticsService;
        }

        /// <summary>
        /// Get top scorers
        /// </summary>
        [HttpGet("goals")]
        public async Task<ActionResult<IEnumerable<Player>>> GetTopScorers([FromQuery] int limit = 10)
        {
            var players = await _statisticsService.GetTopScorersAsync(limit);
            return Ok(players);
        }

        /// <summary>
        /// Get top assist providers
        /// </summary>
        [HttpGet("assists")]
        public async Task<ActionResult<IEnumerable<Player>>> GetTopAssists([FromQuery] int limit = 10)
        {
            var players = await _statisticsService.GetTopAssistsAsync(limit);
            return Ok(players);
        }

        /// <summary>
        /// Get statistics for a specific player
        /// </summary>
        [HttpGet("players/{playerId}")]
        public async Task<ActionResult<Player>> GetPlayerStatistics(int playerId)
        {
            var player = await _statisticsService.GetPlayerStatisticsAsync(playerId);
            if (player == null)
                return NotFound();

            return Ok(player);
        }

        /// <summary>
        /// Get statistics for a specific team
        /// </summary>
        [HttpGet("teams/{teamId}")]
        public async Task<ActionResult<Team>> GetTeamStatistics(int teamId)
        {
            var team = await _statisticsService.GetTeamStatisticsAsync(teamId);
            if (team == null)
                return NotFound();

            return Ok(team);
        }
    }
}

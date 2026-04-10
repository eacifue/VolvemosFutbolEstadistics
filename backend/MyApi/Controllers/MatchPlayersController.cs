using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApi.Models;
using MyApi.Services;

namespace MyApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MatchPlayersController : ControllerBase
    {
        private readonly IMatchPlayerService _matchPlayerService;

        public MatchPlayersController(IMatchPlayerService matchPlayerService)
        {
            _matchPlayerService = matchPlayerService;
        }

        /// <summary>
        /// Add a player to a match team
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<MatchPlayer>> AddPlayerToMatch(MatchPlayer matchPlayer)
        {
            var added = await _matchPlayerService.AddPlayerToMatchAsync(matchPlayer.MatchId, matchPlayer.PlayerId, matchPlayer.TeamId);
            if (added == null)
                return BadRequest("Player already in match or invalid data");

            return Ok(added);
        }

        /// <summary>
        /// Remove a player from a match
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpDelete("{matchId}/{playerId}")]
        public async Task<IActionResult> RemovePlayerFromMatch(int matchId, int playerId)
        {
            var removed = await _matchPlayerService.RemovePlayerFromMatchAsync(matchId, playerId);
            if (!removed)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Get players for a match
        /// </summary>
        [HttpGet("match/{matchId}")]
        public async Task<ActionResult<IEnumerable<MatchPlayer>>> GetMatchPlayers(int matchId)
        {
            var players = await _matchPlayerService.GetMatchPlayersAsync(matchId);
            return Ok(players);
        }
    }
}
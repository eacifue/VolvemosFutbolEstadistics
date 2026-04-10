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
    public class MatchEventsController : ControllerBase
    {
        private readonly IMatchEventService _matchEventService;

        public MatchEventsController(IMatchEventService matchEventService)
        {
            _matchEventService = matchEventService;
        }

        /// <summary>
        /// Get all events for a specific match
        /// </summary>
        [HttpGet("match/{matchId}")]
        public async Task<ActionResult<IEnumerable<MatchEvent>>> GetEventsByMatch(int matchId)
        {
            var events = await _matchEventService.GetEventsByMatchIdAsync(matchId);
            return Ok(events);
        }

        /// <summary>
        /// Create a new match event (goal, assist, card, etc.)
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<MatchEvent>> CreateEvent(MatchEvent matchEvent)
        {
            var createdEvent = await _matchEventService.CreateEventAsync(matchEvent);
            return CreatedAtAction(nameof(GetEventsByMatch), new { matchId = createdEvent.MatchId }, createdEvent);
        }

        /// <summary>
        /// Update an existing match event
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<MatchEvent>> UpdateEvent(int id, MatchEvent matchEvent)
        {
            var updatedEvent = await _matchEventService.UpdateEventAsync(id, matchEvent);
            if (updatedEvent == null)
                return NotFound();

            return Ok(updatedEvent);
        }

        /// <summary>
        /// Delete a match event
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var deleted = await _matchEventService.DeleteEventAsync(id);
            if (!deleted)
                return NotFound();

            return NoContent();
        }

        /// <summary>
        /// Delete all events for a specific match
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpDelete("match/{matchId}")]
        public async Task<IActionResult> DeleteEventsByMatch(int matchId)
        {
            var deleted = await _matchEventService.DeleteEventsByMatchIdAsync(matchId);
            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}

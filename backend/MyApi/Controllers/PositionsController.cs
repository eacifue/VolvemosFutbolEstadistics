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
    public class PositionsController : ControllerBase
    {
        private readonly IPositionService _positionService;

        public PositionsController(IPositionService positionService)
        {
            _positionService = positionService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PositionDto>>> GetPositions()
        {
            var positions = await _positionService.GetAllPositionsAsync();
            var positionDtos = positions.Select(MapToDto);
            return Ok(positionDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PositionDto>> GetPosition(int id)
        {
            var position = await _positionService.GetPositionByIdAsync(id);
            if (position == null)
                return NotFound();
            return Ok(MapToDto(position));
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<PositionDto>> CreatePosition(Position position)
        {
            var created = await _positionService.CreatePositionAsync(position);
            return CreatedAtAction(nameof(GetPosition), new { id = created.Id }, MapToDto(created));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<PositionDto>> UpdatePosition(int id, Position position)
        {
            var updated = await _positionService.UpdatePositionAsync(id, position);
            if (updated == null)
                return NotFound();
            return Ok(MapToDto(updated));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePosition(int id)
        {
            var deleted = await _positionService.DeletePositionAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }

        private static PositionDto MapToDto(Position position)
        {
            return new PositionDto
            {
                Id = position.Id,
                Name = position.Name
            };
        }
    }
}

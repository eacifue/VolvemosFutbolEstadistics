using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MyApi.DTOs;
using MyApi.Models;
using MyApi.Services;

namespace MyApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventTypesController : ControllerBase
    {
        private readonly IEventTypeService _eventTypeService;

        public EventTypesController(IEventTypeService eventTypeService)
        {
            _eventTypeService = eventTypeService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventTypeDto>>> GetEventTypes()
        {
            var list = await _eventTypeService.GetAllEventTypesAsync();
            var dtos = list.Select(MapToDto);
            return Ok(dtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EventTypeDto>> GetEventType(int id)
        {
            var item = await _eventTypeService.GetEventTypeByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(MapToDto(item));
        }

        [HttpPost]
        public async Task<ActionResult<EventTypeDto>> CreateEventType(EventType eventType)
        {
            var created = await _eventTypeService.CreateEventTypeAsync(eventType);
            return CreatedAtAction(nameof(GetEventType), new { id = created.Id }, MapToDto(created));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<EventTypeDto>> UpdateEventType(int id, EventType eventType)
        {
            var updated = await _eventTypeService.UpdateEventTypeAsync(id, eventType);
            if (updated == null) return NotFound();
            return Ok(MapToDto(updated));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEventType(int id)
        {
            var deleted = await _eventTypeService.DeleteEventTypeAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        private static EventTypeDto MapToDto(EventType eventType)
        {
            return new EventTypeDto
            {
                Id = eventType.Id,
                Name = eventType.Name
            };
        }
    }
}

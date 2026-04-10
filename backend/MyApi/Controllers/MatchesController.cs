using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApi.DTOs;
using MyApi.Models;
using MyApi.Services;
using MyApi.Mappers;

namespace MyApi.Controllers
{
    // MatchesController.cs — limpio
[ApiController]
[Route("api/[controller]")]
public class MatchesController(IMatchService matchService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MatchDto>>> GetMatches()
    {
        var matches = await matchService.GetAllMatchesAsync();
        return Ok(matches.Select(MatchMapper.ToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MatchDto>> GetMatch(int id)
    {
        var match = await matchService.GetMatchByIdAsync(id);
        return match is null ? NotFound() : Ok(MatchMapper.ToDto(match));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<MatchDto>> CreateMatch(CreateMatchDto dto) // ← DTO, no entidad
    {
        var created = await matchService.CreateMatchAsync(dto);
        return CreatedAtAction(nameof(GetMatch), new { id = created.Id }, MatchMapper.ToDto(created));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<MatchDto>> UpdateMatch(int id, UpdateMatchDto dto) // ← DTO
    {
        var updated = await matchService.UpdateMatchAsync(id, dto);
        return updated is null ? NotFound() : Ok(MatchMapper.ToDto(updated));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteMatch(int id)
    {
        return await matchService.DeleteMatchAsync(id) ? NoContent() : NotFound();
    }
}
}

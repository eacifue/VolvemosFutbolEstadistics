using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.DTOs;
using MyApi.Models;

namespace MyApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeamsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TeamsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all teams
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TeamDto>>> GetTeams()
        {
            var teams = await _context.Teams
                .ToListAsync();
            var teamDtos = teams.Select(MapToDto);
            return Ok(teamDtos);
        }

        /// <summary>
        /// Get a specific team by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<TeamDto>> GetTeam(int id)
        {
            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == id);

            if (team == null)
                return NotFound();

            return Ok(MapToDto(team));
        }

        /// <summary>
        /// Get team statistics
        /// </summary>
        [HttpGet("{id}/stats")]
        public async Task<ActionResult<TeamDto>> GetTeamStats(int id)
        {
            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == id);

            if (team == null)
                return NotFound();

            return Ok(MapToDto(team));
        }

        /// <summary>
        /// Update a team
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<TeamDto>> UpdateTeam(int id, Team team)
        {
            var existingTeam = await _context.Teams.FindAsync(id);
            if (existingTeam == null)
                return NotFound();

            existingTeam.Name = team.Name;
            existingTeam.Color = team.Color;
            existingTeam.MatchesPlayed = team.MatchesPlayed;
            existingTeam.Wins = team.Wins;
            existingTeam.Draws = team.Draws;
            existingTeam.Losses = team.Losses;
            existingTeam.GoalsFor = team.GoalsFor;
            existingTeam.GoalsAgainst = team.GoalsAgainst;

            _context.Teams.Update(existingTeam);
            await _context.SaveChangesAsync();

            return Ok(MapToDto(existingTeam));
        }

        private static TeamDto MapToDto(Team team)
        {
            return new TeamDto
            {
                Id = team.Id,
                Name = team.Name,
                Color = team.Color,
                MatchesPlayed = team.MatchesPlayed,
                Wins = team.Wins,
                Draws = team.Draws,
                Losses = team.Losses,
                GoalsFor = team.GoalsFor,
                GoalsAgainst = team.GoalsAgainst,
                CreatedAt = team.CreatedAt,
                UpdatedAt = team.UpdatedAt
            };
        }
    }
}

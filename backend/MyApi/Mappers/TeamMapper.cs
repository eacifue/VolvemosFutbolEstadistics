using AutoMapper;
using MyApi.Models;
using MyApi.DTOs;


namespace MyApi.Mappers
{
    public static class TeamMapper
    {
        public static TeamDto ToDto(Team team) => new()
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
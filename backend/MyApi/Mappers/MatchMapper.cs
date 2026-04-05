using AutoMapper;
using MyApi.Models;
using MyApi.DTOs;


namespace MyApi.Mappers
{
 // MatchMapper.cs — extrae el mapeo del controller
public static class MatchMapper
{
    public static MatchDto ToDto(Match match) => new()
    {
        Id = match.Id,
        MatchDate = match.MatchDate,
        HomeTeamId = match.HomeTeamId,
        AwayTeamId = match.AwayTeamId,
        HomeTeam = match.HomeTeam != null ? TeamMapper.ToDto(match.HomeTeam) : null,
        AwayTeam = match.AwayTeam != null ? TeamMapper.ToDto(match.AwayTeam) : null,
        MatchPlayers = (match.MatchPlayers ?? []).Select(mp => new MatchPlayerDto
        {
            Id = mp.Id,
            MatchId = mp.MatchId,
            PlayerId = mp.PlayerId,
            Player = PlayerMapper.ToDto(mp.Player),
            TeamId = mp.TeamId,   // ← string/int ID, no la entidad
            CreatedAt = mp.CreatedAt
        }).ToList(),
        Events = (match.Events ?? []).Select(e => new MatchEventDto
        {
            Id = e.Id,
            MatchId = e.MatchId,
            PlayerId = e.PlayerId,
            Player = PlayerMapper.ToDto(e.Player),
            EventTypeId = e.EventTypeId,
            EventType = e.EventType != null ? new EventTypeDto
            {
                Id = e.EventType.Id,
                Name = e.EventType.Name
            } : null,
            TeamId = e.TeamId,
            CreatedAt = e.CreatedAt
        }).ToList(),
        CreatedAt = match.CreatedAt,
        UpdatedAt = match.UpdatedAt
    };
}
}
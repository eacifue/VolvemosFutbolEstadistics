using AutoMapper;
using MyApi.Models;
using MyApi.DTOs;


namespace MyApi.Mappers
{
// PlayerMapper.cs
public static class PlayerMapper
{
    public static PlayerDto ToDto(Player player) => new()
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
        CreatedAt = player.CreatedAt,
        UpdatedAt = player.UpdatedAt
    };
}
}
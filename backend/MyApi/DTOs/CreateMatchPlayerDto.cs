using System;
using System.ComponentModel.DataAnnotations;
namespace MyApi.DTOs
{
public record CreateMatchPlayerDto
{
    [Required]
    public int PlayerId { get; init; }

    [Required]
    public int TeamId { get; init; }
}
}
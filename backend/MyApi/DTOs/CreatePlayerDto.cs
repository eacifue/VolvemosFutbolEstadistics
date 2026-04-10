namespace MyApi.DTOs
{
    public class CreatePlayerDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// Id de la posición del jugador (requerido en frontend, opcional en backend para compatibilidad).
        /// JSON key: idPosition (camelCase)
        /// </summary>
        public int? IdPosition { get; set; }
    }
}

using Microsoft.EntityFrameworkCore;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MyApi.Data;
using MyApi.Services;
using Pomelo.EntityFrameworkCore.MySql;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// add controllers
builder.Services.AddControllers();

var jwtKey = builder.Configuration["Jwt:Key"] ?? "VolvemosFutbol-SuperSecretKey-ChangeInProduction-2026";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "MyApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "MyApiClient";

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

var mysqlUrl = Environment.GetEnvironmentVariable("MYSQL_URL");
var localConnection = builder.Configuration.GetConnectionString("DefaultConnection");

if (!string.IsNullOrEmpty(mysqlUrl))
{
    // Railway MySQL — parsea la URL
    var uri = new Uri(mysqlUrl);
    var userInfo = uri.UserInfo.Split(':');
    var connectionString = $"Server={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};User={userInfo[0]};Password={userInfo[1]};SslMode=Required;AllowPublicKeyRetrieval=true;";

    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 33))));
}
else if (!string.IsNullOrEmpty(localConnection))
{
    // Local MySQL desde appsettings.json
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseMySql(localConnection, new MySqlServerVersion(new Version(8, 0, 33))));
}
else
{
    // Fallback en memoria si no hay nada configurado
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseInMemoryDatabase("VolvemosFutbol"));
}


// register application services
builder.Services.AddScoped<IPlayerService, PlayerService>();
builder.Services.AddScoped<IMatchService, MatchService>();
builder.Services.AddScoped<IMatchEventService, MatchEventService>();
builder.Services.AddScoped<IMatchPlayerService, MatchPlayerService>();
builder.Services.AddScoped<IStatisticsService, StatisticsService>();
builder.Services.AddScoped<IPositionService, PositionService>();
builder.Services.AddScoped<IEventTypeService, EventTypeService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

var allowedOrigins = Environment.GetEnvironmentVariable("FRONTEND_URL"); // Agrega esta var en Railway

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else if (!string.IsNullOrEmpty(allowedOrigins))
        {
            policy.WithOrigins(allowedOrigins.Split(','))
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});
var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

// map controller endpoints
app.MapControllers();

// using (var scope = app.Services.CreateScope())
// {
//     var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
//     await AuthSeeder.EnsureAdminUserAsync(context);
// }
app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

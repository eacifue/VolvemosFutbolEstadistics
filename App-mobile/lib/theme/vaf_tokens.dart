// GENERADO desde tokens.json (Volvemos al Fútbol). No editar a mano: regenerar.
// ignore_for_file: constant_identifier_names
import 'package:flutter/material.dart';

/// Paleta cruda por tema. Usa [VafTheme.dark] / [VafTheme.light] en la app.
class VafPalette {
  const VafPalette({required this.bg, required this.surface, required this.surface2, required this.surface3, required this.line, required this.lineStrong, required this.ink, required this.inkMuted, required this.inkFaint, required this.accent, required this.onAccent, required this.accentInk, required this.accentSoft, required this.danger, required this.dangerSoft, required this.focus, required this.scrim, required this.teamWhite, required this.teamWhiteInk, required this.teamWhiteEdge, required this.teamBlack, required this.teamBlackInk, required this.teamBlackEdge, required this.teamBlackStripe, required this.eventGoal, required this.eventAssist, required this.eventOwnGoal, required this.eventYellow, required this.eventRed, required this.stateLive, required this.leader});
  /// Fondo de página y del shell. Carbón en oscuro, papel/cal en claro. Nunca azul.
  final Color bg;
  /// Tarjetas, filas de lista, hojas inferiores.
  final Color surface;
  /// Superficie elevada dentro de una tarjeta: barras, celdas de stats, inputs.
  final Color surface2;
  /// Estados hover/pressed, skeletons, chip 'E' (empate).
  final Color surface3;
  /// Hairlines decorativos: separadores de fila, líneas de cal de la cancha en tarjetas. No cumple 3:1, nunca como borde de control.
  final Color line;
  /// Bordes de inputs, botones secundarios y chip 'P' (derrota). ≥3:1 sobre bg y surface en ambos temas.
  final Color lineStrong;
  /// Texto principal y números sobre bg, surface, surface-2 y surface-3 (≥14:1).
  final Color ink;
  /// Texto secundario: fechas, etiquetas de stats, metadatos. ≥5.4:1 sobre bg, surface, surface-2 y surface-3.
  final Color inkMuted;
  /// Solo deshabilitados y placeholders (≈4:1). Nunca para información.
  final Color inkFaint;
  /// Peto fluorescente: relleno de CTA primario, tab activa, líder, 'EN VIVO', chip 'V'. Texto encima siempre en on-accent. En claro úsalo como relleno, nunca como texto.
  final Color accent;
  /// Texto e íconos sobre accent (16.8:1).
  final Color onAccent;
  /// El acento como texto o ícono sobre bg, surface y surface-2: enlaces 'ver ranking', números del líder, asistencias. ≥5.6:1 en ambos temas.
  final Color accentInk;
  /// Fondo tenue de fila destacada (el líder, 'yo' en ranking). Texto encima: accent-ink o ink.
  final Color accentSoft;
  /// Autogoles, errores, borrar. Texto sobre bg, surface y surface-2 (≥4.7:1). Nunca decorativo.
  final Color danger;
  /// Fondo de toast/estado de error y del 'Muro de la vergüenza'. Texto encima: danger.
  final Color dangerSoft;
  /// Anillo de foco de 2px + 2px de separación en todo control. ≥3:1 sobre todas las superficies.
  final Color focus;
  /// Velo detrás de hojas inferiores y diálogos.
  final Color scrim;
  /// Camiseta / chip / barra del Equipo Blanco. Siempre con team-white-edge y etiqueta 'Blanco' o 'B'.
  final Color teamWhite;
  /// Texto, dorsal e iniciales sobre team-white (17.6:1).
  final Color teamWhiteInk;
  /// Borde de 1.5px del Blanco; en claro lo separa del fondo papel (≥3.8:1 sobre bg, surface y surface-2).
  final Color teamWhiteEdge;
  /// Camiseta / chip / barra del Equipo Negro. Siempre con team-black-edge, rayas finas (team-black-stripe) y etiqueta 'Negro' o 'N'.
  final Color teamBlack;
  /// Texto, dorsal e iniciales sobre team-black (17.6:1).
  final Color teamBlackInk;
  /// Borde de 1.5px del Negro; en oscuro lo separa del fondo carbón (≥4.5:1 sobre bg, surface y surface-2).
  final Color teamBlackEdge;
  /// Rayas verticales de 2px cada 6px dentro de la camiseta/chip Negro: el patrón que lo distingue sin depender del color.
  final Color teamBlackStripe;
  /// Ícono de gol (balón) y su conteo.
  final Color eventGoal;
  /// Ícono de asistencia y 'asist. X' en la línea de tiempo.
  final Color eventAssist;
  /// Ícono de autogol (balón con aro), 'Mano de piedra'.
  final Color eventOwnGoal;
  /// Relleno de la tarjeta amarilla; en claro siempre con borde ink a 1px (el amarillo solo da 1.6:1 sobre blanco).
  final Color eventYellow;
  /// Relleno de la tarjeta roja, con borde ink a 1px en claro.
  final Color eventRed;
  /// Punto pulsante y etiqueta 'EN VIVO' (texto en on-accent).
  final Color stateLive;
  /// Corona del líder: borde del avatar #1, barra de podio #1, número del líder (como texto usa accent-ink).
  final Color leader;

  static const dark = VafPalette(
    bg: Color(0xFF0D0D0C),
    surface: Color(0xFF171716),
    surface2: Color(0xFF21211F),
    surface3: Color(0xFF2C2C29),
    line: Color(0xFF33332F),
    lineStrong: Color(0xFF6A6A63),
    ink: Color(0xFFF2F1EA),
    inkMuted: Color(0xFFA3A29A),
    inkFaint: Color(0xFF75746D),
    accent: Color(0xFFD4FF3A),
    onAccent: Color(0xFF0D0D0C),
    accentInk: Color(0xFFD4FF3A),
    accentSoft: Color(0xFF2A3310),
    danger: Color(0xFFFF5A4E),
    dangerSoft: Color(0xFF3A1512),
    focus: Color(0xFFD4FF3A),
    scrim: Color(0xA3000000),
    teamWhite: Color(0xFFF5F4EE),
    teamWhiteInk: Color(0xFF0D0D0C),
    teamWhiteEdge: Color(0xFFF5F4EE),
    teamBlack: Color(0xFF0D0D0C),
    teamBlackInk: Color(0xFFF5F4EE),
    teamBlackEdge: Color(0xFF8A8982),
    teamBlackStripe: Color(0xFF2E2E2B),
    eventGoal: Color(0xFFF2F1EA),
    eventAssist: Color(0xFFD4FF3A),
    eventOwnGoal: Color(0xFFFF5A4E),
    eventYellow: Color(0xFFF5C518),
    eventRed: Color(0xFFE0352B),
    stateLive: Color(0xFFD4FF3A),
    leader: Color(0xFFD4FF3A)
  );

  static const light = VafPalette(
    bg: Color(0xFFF4F3EE),
    surface: Color(0xFFFFFFFF),
    surface2: Color(0xFFECEBE5),
    surface3: Color(0xFFE0DFD8),
    line: Color(0xFFD6D5CD),
    lineStrong: Color(0xFF84837B),
    ink: Color(0xFF111110),
    inkMuted: Color(0xFF5C5B55),
    inkFaint: Color(0xFF7A7972),
    accent: Color(0xFFD4FF3A),
    onAccent: Color(0xFF0D0D0C),
    accentInk: Color(0xFF4D6300),
    accentSoft: Color(0xFFEEF9C4),
    danger: Color(0xFFC42B1F),
    dangerSoft: Color(0xFFFBE3E0),
    focus: Color(0xFF111110),
    scrim: Color(0x7A111110),
    teamWhite: Color(0xFFF5F4EE),
    teamWhiteInk: Color(0xFF0D0D0C),
    teamWhiteEdge: Color(0xFF77766F),
    teamBlack: Color(0xFF0D0D0C),
    teamBlackInk: Color(0xFFF5F4EE),
    teamBlackEdge: Color(0xFF0D0D0C),
    teamBlackStripe: Color(0xFF2E2E2B),
    eventGoal: Color(0xFF111110),
    eventAssist: Color(0xFF4D6300),
    eventOwnGoal: Color(0xFFC42B1F),
    eventYellow: Color(0xFFF5C518),
    eventRed: Color(0xFFE0352B),
    stateLive: Color(0xFFD4FF3A),
    leader: Color(0xFFD4FF3A)
  );
}

/// Colores de dominio (equipos, eventos, en vivo, líder) como ThemeExtension.
@immutable
class VafColors extends ThemeExtension<VafColors> {
  const VafColors({required this.teamWhite, required this.teamWhiteInk, required this.teamWhiteEdge, required this.teamBlack, required this.teamBlackInk, required this.teamBlackEdge, required this.teamBlackStripe, required this.eventGoal, required this.eventAssist, required this.eventOwnGoal, required this.eventYellow, required this.eventRed, required this.stateLive, required this.leader});
  final Color teamWhite;
  final Color teamWhiteInk;
  final Color teamWhiteEdge;
  final Color teamBlack;
  final Color teamBlackInk;
  final Color teamBlackEdge;
  final Color teamBlackStripe;
  final Color eventGoal;
  final Color eventAssist;
  final Color eventOwnGoal;
  final Color eventYellow;
  final Color eventRed;
  final Color stateLive;
  final Color leader;
  factory VafColors.from(VafPalette p) => VafColors(teamWhite: p.teamWhite, teamWhiteInk: p.teamWhiteInk, teamWhiteEdge: p.teamWhiteEdge, teamBlack: p.teamBlack, teamBlackInk: p.teamBlackInk, teamBlackEdge: p.teamBlackEdge, teamBlackStripe: p.teamBlackStripe, eventGoal: p.eventGoal, eventAssist: p.eventAssist, eventOwnGoal: p.eventOwnGoal, eventYellow: p.eventYellow, eventRed: p.eventRed, stateLive: p.stateLive, leader: p.leader);
  @override
  VafColors copyWith({Color? teamWhite, Color? teamWhiteInk, Color? teamWhiteEdge, Color? teamBlack, Color? teamBlackInk, Color? teamBlackEdge, Color? teamBlackStripe, Color? eventGoal, Color? eventAssist, Color? eventOwnGoal, Color? eventYellow, Color? eventRed, Color? stateLive, Color? leader}) => VafColors(teamWhite: teamWhite ?? this.teamWhite, teamWhiteInk: teamWhiteInk ?? this.teamWhiteInk, teamWhiteEdge: teamWhiteEdge ?? this.teamWhiteEdge, teamBlack: teamBlack ?? this.teamBlack, teamBlackInk: teamBlackInk ?? this.teamBlackInk, teamBlackEdge: teamBlackEdge ?? this.teamBlackEdge, teamBlackStripe: teamBlackStripe ?? this.teamBlackStripe, eventGoal: eventGoal ?? this.eventGoal, eventAssist: eventAssist ?? this.eventAssist, eventOwnGoal: eventOwnGoal ?? this.eventOwnGoal, eventYellow: eventYellow ?? this.eventYellow, eventRed: eventRed ?? this.eventRed, stateLive: stateLive ?? this.stateLive, leader: leader ?? this.leader);
  @override
  VafColors lerp(ThemeExtension<VafColors>? other, double t) {
    if (other is! VafColors) return this;
    return VafColors(teamWhite: Color.lerp(teamWhite, other.teamWhite, t)!, teamWhiteInk: Color.lerp(teamWhiteInk, other.teamWhiteInk, t)!, teamWhiteEdge: Color.lerp(teamWhiteEdge, other.teamWhiteEdge, t)!, teamBlack: Color.lerp(teamBlack, other.teamBlack, t)!, teamBlackInk: Color.lerp(teamBlackInk, other.teamBlackInk, t)!, teamBlackEdge: Color.lerp(teamBlackEdge, other.teamBlackEdge, t)!, teamBlackStripe: Color.lerp(teamBlackStripe, other.teamBlackStripe, t)!, eventGoal: Color.lerp(eventGoal, other.eventGoal, t)!, eventAssist: Color.lerp(eventAssist, other.eventAssist, t)!, eventOwnGoal: Color.lerp(eventOwnGoal, other.eventOwnGoal, t)!, eventYellow: Color.lerp(eventYellow, other.eventYellow, t)!, eventRed: Color.lerp(eventRed, other.eventRed, t)!, stateLive: Color.lerp(stateLive, other.stateLive, t)!, leader: Color.lerp(leader, other.leader, t)!);
  }
}

abstract final class VafSpace {
  static const double s1 = 4; // Separación ícono–conteo en badges.
  static const double s2 = 8; // Gap entre chips; padding vertical de filas compactas.
  static const double s3 = 12; // Padding de filas de lista y celdas de tabla.
  static const double s4 = 16; // Gutter lateral de pantalla y padding de tarjeta.
  static const double s5 = 20; // Padding del hero de marcador.
  static const double s6 = 24; // Separación entre módulos de una pantalla.
  static const double s8 = 32; // Separación entre bloques mayores (hero → siguiente módulo).
  static const double s12 = 48; // Márgenes de estados vacíos y plantillas compartibles.
}

abstract final class VafRadius {
  static const double rXs = 2; // Chips de equipo, chips de forma V/E/P, tarjetas amarilla/roja.
  static const double rSm = 4; // Botones, inputs, badges de evento, celdas de stats.
  static const double rMd = 8; // Tarjetas, filas destacadas, marcador mediano.
  static const double rLg = 14; // Hojas inferiores (esquinas superiores), plantillas compartibles, hero.
  static const double rPill = 999; // Avatares, punto EN VIVO, filtros tipo pastilla.
}

abstract final class VafSize {
  static const double tap = 44; // Objetivo táctil mínimo de todo control.
  static const double tapLive = 72; // Botones-avatar y botonera del modo En cancha (uso con una mano).
  static const double avatarSm = 32; // Avatar en filas de ranking y línea de tiempo.
  static const double avatarMd = 44; // Avatar en tarjetas de jugador compactas y líderes.
  static const double avatarLg = 88; // Avatar de la carta de jugador.
  static const double container = 560; // Ancho máximo del contenido móvil/web pública.
  static const double nav = 64; // Alto de la navegación inferior.
}

abstract final class VafMotion {
  static const Duration fast = Duration(milliseconds: 120);
  static const Duration base = Duration(milliseconds: 200);
  static const Duration slow = Duration(milliseconds: 320);
  static const Curve easeOut = Cubic(0.2, 0.8, 0.2, 1);
  static const Curve easeInOut = Cubic(0.6, 0, 0.2, 1);
}

abstract final class VafType {
  static const display = 'Barlow Condensed';
  static const text = 'Manrope';
  static const _tnum = [FontFeature.tabularFigures(), FontFeature.liningFigures()];

  /// Marcador de estadio del hero de Inicio y del detalle de partido.
  static const scoreHero = TextStyle(fontFamily: display, fontSize: 96, height: 0.9, fontWeight: FontWeight.w800, letterSpacing: -0.96, fontFeatures: _tnum);
  /// Marcador En cancha y plantillas compartibles 1:1.
  static const scoreLg = TextStyle(fontFamily: display, fontSize: 56, height: 0.9, fontWeight: FontWeight.w800, fontFeatures: _tnum);
  /// Marcador de la lista de partidos.
  static const scoreMd = TextStyle(fontFamily: display, fontSize: 32, height: 1.0, fontWeight: FontWeight.w700, fontFeatures: _tnum);
  /// Marcador mini (chips, línea de tiempo, notificaciones).
  static const scoreSm = TextStyle(fontFamily: display, fontSize: 20, height: 1.0, fontWeight: FontWeight.w700, fontFeatures: _tnum);
  /// Número protagonista de tarjetas de líder y carta de jugador.
  static const statXl = TextStyle(fontFamily: display, fontSize: 48, height: 0.95, fontWeight: FontWeight.w800, fontFeatures: _tnum);
  /// Celdas de stats clave en perfil y tablas compactas.
  static const statMd = TextStyle(fontFamily: display, fontSize: 24, height: 1.0, fontWeight: FontWeight.w700, fontFeatures: _tnum);
  /// Nombre del jugador en la carta, títulos de pantallas compartibles. Mayúsculas.
  static const displayLg = TextStyle(fontFamily: display, fontSize: 36, height: 0.95, fontWeight: FontWeight.w800, fontFeatures: _tnum);
  /// Título de sección en Inicio y Perfil. Mayúsculas.
  static const displayMd = TextStyle(fontFamily: display, fontSize: 24, height: 1.0, fontWeight: FontWeight.w700, fontFeatures: _tnum);
  /// Sobretítulos, cabeceras de tabla, etiquetas de equipo. Mayúsculas, ink-muted.
  static const labelCaps = TextStyle(fontFamily: display, fontSize: 13, height: 1.231, fontWeight: FontWeight.w600, letterSpacing: 1.04, fontFeatures: _tnum);
  /// Nombres de jugador en listas, títulos de hojas y diálogos.
  static const title = TextStyle(fontFamily: text, fontSize: 17, height: 1.412, fontWeight: FontWeight.w700);
  /// Texto corrido, crónicas, descripciones.
  static const body = TextStyle(fontFamily: text, fontSize: 15, height: 1.467, fontWeight: FontWeight.w500);
  /// Resultado en palabras, botones.
  static const bodyStrong = TextStyle(fontFamily: text, fontSize: 15, height: 1.467, fontWeight: FontWeight.w700);
  /// Metadatos, goleadores bajo el marcador, ayudas de formulario.
  static const small = TextStyle(fontFamily: text, fontSize: 13, height: 1.385, fontWeight: FontWeight.w500);
  /// Badges sobre avatar, etiquetas de pestañas inferiores.
  static const micro = TextStyle(fontFamily: text, fontSize: 11, height: 1.273, fontWeight: FontWeight.w700, letterSpacing: 0.44);
}

/// Construye el ThemeData de la app a partir de los tokens.
abstract final class VafTheme {
  static ThemeData get dark => build(VafPalette.dark, Brightness.dark);
  static ThemeData get light => build(VafPalette.light, Brightness.light);

  static ThemeData build(VafPalette p, Brightness b) {
    final scheme = ColorScheme(
      brightness: b,
      primary: p.accent, onPrimary: p.onAccent,
      primaryContainer: p.accentSoft, onPrimaryContainer: p.accentInk,
      secondary: p.ink, onSecondary: p.bg,
      error: p.danger, onError: p.bg,
      errorContainer: p.dangerSoft, onErrorContainer: p.danger,
      surface: p.bg, onSurface: p.ink, onSurfaceVariant: p.inkMuted,
      surfaceContainer: p.surface, surfaceContainerHigh: p.surface2, surfaceContainerHighest: p.surface3,
      outline: p.lineStrong, outlineVariant: p.line, scrim: p.scrim,
    );
    final text = TextTheme(
      displayLarge: VafType.scoreHero, displayMedium: VafType.scoreLg, displaySmall: VafType.displayLg,
      headlineMedium: VafType.displayMd, titleMedium: VafType.title, bodyLarge: VafType.bodyStrong,
      bodyMedium: VafType.body, bodySmall: VafType.small, labelMedium: VafType.labelCaps, labelSmall: VafType.micro,
    ).apply(bodyColor: p.ink, displayColor: p.ink);
    const tap = Size(VafSize.tap, VafSize.tap);
    final btnShape = RoundedRectangleBorder(borderRadius: BorderRadius.circular(VafRadius.rSm));
    return ThemeData(
      useMaterial3: true, colorScheme: scheme, scaffoldBackgroundColor: p.bg,
      fontFamily: VafType.text, textTheme: text,
      extensions: [VafColors.from(p)],
      dividerTheme: DividerThemeData(color: p.line, thickness: 1, space: 1),
      cardTheme: CardThemeData(color: p.surface, elevation: 0, margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(VafRadius.rMd), side: BorderSide(color: p.line))),
      filledButtonTheme: FilledButtonThemeData(style: FilledButton.styleFrom(
        backgroundColor: p.accent, foregroundColor: p.onAccent, minimumSize: tap, shape: btnShape, textStyle: VafType.bodyStrong)),
      outlinedButtonTheme: OutlinedButtonThemeData(style: OutlinedButton.styleFrom(
        foregroundColor: p.ink, side: BorderSide(color: p.lineStrong, width: 1.5), minimumSize: tap, shape: btnShape, textStyle: VafType.bodyStrong)),
      textButtonTheme: TextButtonThemeData(style: TextButton.styleFrom(foregroundColor: p.accentInk, minimumSize: tap)),
      inputDecorationTheme: InputDecorationTheme(
        filled: true, fillColor: p.surface2,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(VafRadius.rSm), borderSide: BorderSide(color: p.lineStrong, width: 1.5)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(VafRadius.rSm), borderSide: BorderSide(color: p.lineStrong, width: 1.5)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(VafRadius.rSm), borderSide: BorderSide(color: p.focus, width: 2)),
        errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(VafRadius.rSm), borderSide: BorderSide(color: p.danger, width: 1.5)),
        hintStyle: VafType.body.copyWith(color: p.inkFaint), errorStyle: VafType.small.copyWith(color: p.danger)),
      navigationBarTheme: NavigationBarThemeData(
        height: VafSize.nav, backgroundColor: p.bg, indicatorColor: p.accent, surfaceTintColor: Colors.transparent,
        iconTheme: WidgetStateProperty.resolveWith((s) => IconThemeData(color: s.contains(WidgetState.selected) ? p.onAccent : p.inkMuted)),
        labelTextStyle: WidgetStateProperty.resolveWith((s) => VafType.micro.copyWith(color: s.contains(WidgetState.selected) ? p.ink : p.inkMuted))),
      tabBarTheme: TabBarThemeData(labelColor: p.ink, unselectedLabelColor: p.inkMuted, indicatorColor: p.accent, dividerColor: p.line),
      chipTheme: ChipThemeData(backgroundColor: Colors.transparent, selectedColor: p.ink, side: BorderSide(color: p.lineStrong, width: 1.5),
        shape: const StadiumBorder(), labelStyle: VafType.small.copyWith(color: p.ink, fontWeight: FontWeight.w600)),
      bottomSheetTheme: BottomSheetThemeData(backgroundColor: p.surface, modalBarrierColor: p.scrim, showDragHandle: true, dragHandleColor: p.lineStrong,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(VafRadius.rLg)))),
      dialogTheme: DialogThemeData(backgroundColor: p.surface, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(VafRadius.rLg))),
      snackBarTheme: SnackBarThemeData(backgroundColor: p.ink, contentTextStyle: VafType.body.copyWith(color: p.bg, fontWeight: FontWeight.w600),
        actionTextColor: p.bg, behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(VafRadius.rMd))),
      progressIndicatorTheme: ProgressIndicatorThemeData(color: p.accentInk, linearTrackColor: p.surface3),
    );
  }
}

/// Swatch de camiseta del Negro: rayas de 2px cada 6px sobre team-black.
class VafStripesPainter extends CustomPainter {
  VafStripesPainter(this.colors);
  final VafColors colors;
  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(Offset.zero & size, Paint()..color = colors.teamBlack);
    final stripe = Paint()..color = colors.teamBlackStripe;
    for (double x = 4; x < size.width; x += 6) {
      canvas.drawRect(Rect.fromLTWH(x, 0, 2, size.height), stripe);
    }
  }
  @override
  bool shouldRepaint(VafStripesPainter old) => old.colors != colors;
}

// Uso:
// MaterialApp(theme: VafTheme.light, darkTheme: VafTheme.dark, themeMode: ThemeMode.dark, ...)
// final vaf = Theme.of(context).extension<VafColors>()!;  // vaf.teamWhite, vaf.eventOwnGoal...
// Text('4 – 5', style: VafType.scoreHero.copyWith(color: Theme.of(context).colorScheme.onSurface));

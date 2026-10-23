import 'package:flutter/material.dart';
import 'package:app_mobile/theme/vaf_tokens.dart';
import 'package:app_mobile/widgets/vaf/vaf_event_icon.dart';
import 'package:app_mobile/widgets/vaf/vaf_team_chip.dart';

enum VafScoreSize { hero, lg, md }

String vafResultText(int white, int black) => white > black ? 'Ganó Blanco' : black > white ? 'Ganó Negro' : 'Empate';

/// Marcador de estadio: Blanco a la izquierda, Negro a la derecha; el perdedor va atenuado.
/// El marcador se calcula desde los eventos (gol suma al equipo del jugador; autogol al rival) antes de llegar aquí.
class VafScoreboard extends StatelessWidget {
  const VafScoreboard({
    super.key,
    required this.white,
    required this.black,
    this.size = VafScoreSize.md,
    this.date,
    this.scorersWhite = const [],
    this.scorersBlack = const [],
    this.showResult = true,
  });

  final int white;
  final int black;
  final VafScoreSize size;
  final String? date;
  final List<String> scorersWhite;
  final List<String> scorersBlack;
  final bool showResult;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final ink = scheme.onSurface;
    final muted = scheme.onSurfaceVariant;
    final numStyle = switch (size) {
      VafScoreSize.hero => VafType.scoreHero,
      VafScoreSize.lg => VafType.scoreLg,
      VafScoreSize.md => VafType.scoreMd,
    };
    final swatch = size == VafScoreSize.hero ? 28.0 : 18.0;
    Widget team(VafTeam t) => Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            VafTeamSwatch(team: t, size: swatch),
            const SizedBox(height: VafSpace.s2),
            Text(t.label.toUpperCase(), style: VafType.labelCaps.copyWith(color: ink)),
          ],
        );

    return Semantics(
      label: 'Blanco $white, Negro $black',
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (date != null) Padding(padding: const EdgeInsets.only(bottom: VafSpace.s2), child: Text(date!, style: VafType.small.copyWith(color: muted))),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              team(VafTeam.white),
              ExcludeSemantics(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('$white', style: numStyle.copyWith(color: black > white ? muted : ink)),
                    Padding(padding: const EdgeInsets.symmetric(horizontal: VafSpace.s3), child: Text('–', style: numStyle.copyWith(color: muted, fontWeight: FontWeight.w500))),
                    Text('$black', style: numStyle.copyWith(color: white > black ? muted : ink)),
                  ],
                ),
              ),
              team(VafTeam.black),
            ],
          ),
          if (showResult) Padding(padding: const EdgeInsets.only(top: VafSpace.s2), child: Text(vafResultText(white, black), style: VafType.title.copyWith(color: ink))),
          if (scorersWhite.isNotEmpty || scorersBlack.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: VafSpace.s3),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(child: Text(scorersWhite.join('\n'), textAlign: TextAlign.right, style: VafType.small.copyWith(color: muted))),
                  const Padding(padding: EdgeInsets.symmetric(horizontal: VafSpace.s2), child: VafEventIcon(type: VafEventType.goal, size: 14)),
                  Expanded(child: Text(scorersBlack.join('\n'), style: VafType.small.copyWith(color: muted))),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

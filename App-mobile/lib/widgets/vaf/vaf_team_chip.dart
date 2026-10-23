import 'package:flutter/material.dart';
import 'package:app_mobile/theme/vaf_tokens.dart';

enum VafTeam { white, black }

extension VafTeamLabel on VafTeam {
  String get label => this == VafTeam.white ? 'Blanco' : 'Negro';
  String get short => this == VafTeam.white ? 'B' : 'N';
}

enum VafChipLabel { full, short, none }

/// Swatch de equipo: Blanco liso con borde; Negro siempre rayado (no depende solo del color).
class VafTeamSwatch extends StatelessWidget {
  const VafTeamSwatch({super.key, required this.team, this.size = 14});

  final VafTeam team;
  final double size;

  @override
  Widget build(BuildContext context) {
    final vaf = Theme.of(context).extension<VafColors>()!;
    final isWhite = team == VafTeam.white;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: isWhite ? vaf.teamWhite : null,
        borderRadius: BorderRadius.circular(size >= 24 ? VafRadius.rSm : VafRadius.rXs),
        border: Border.all(color: isWhite ? vaf.teamWhiteEdge : vaf.teamBlackEdge, width: 1.5),
      ),
      clipBehavior: Clip.antiAlias,
      child: isWhite ? null : CustomPaint(painter: VafStripesPainter(vaf)),
    );
  }
}

/// Chip de equipo con etiqueta en mayúsculas (Barlow Condensed). Orden fijo: Blanco izquierda, Negro derecha.
class VafTeamChip extends StatelessWidget {
  const VafTeamChip({super.key, required this.team, this.label = VafChipLabel.full, this.small = false});

  final VafTeam team;
  final VafChipLabel label;
  final bool small;

  @override
  Widget build(BuildContext context) {
    final ink = Theme.of(context).colorScheme.onSurface;
    final text = label == VafChipLabel.short ? team.short : team.label;
    return Semantics(
      label: team.label,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          VafTeamSwatch(team: team, size: small ? 11 : 14),
          if (label != VafChipLabel.none) ...[
            SizedBox(width: small ? VafSpace.s1 : 6),
            Text(text.toUpperCase(), style: VafType.labelCaps.copyWith(color: ink, fontSize: small ? 12 : 13)),
          ],
        ],
      ),
    );
  }
}

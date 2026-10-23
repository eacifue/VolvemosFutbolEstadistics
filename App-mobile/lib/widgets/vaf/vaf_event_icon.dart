import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:app_mobile/theme/vaf_tokens.dart';

enum VafEventType { goal, assist, ownGoal, yellow, red }

extension VafEventLabel on VafEventType {
  String get label => const {
        VafEventType.goal: 'Gol',
        VafEventType.assist: 'Asistencia',
        VafEventType.ownGoal: 'Autogol',
        VafEventType.yellow: 'Amarilla',
        VafEventType.red: 'Roja',
      }[this]!;

  /// Ids de la API: 1 gol, 2 asistencia, 3 autogol (4 y 5 aún no existen en el servidor).
  static VafEventType? fromId(int id) => const {1: VafEventType.goal, 2: VafEventType.assist, 3: VafEventType.ownGoal, 4: VafEventType.yellow, 5: VafEventType.red}[id];
}

/// Glifos propios de evento (nunca emoji): balón, pase curvo, balón tachado, tarjetas inclinadas.
class VafEventIcon extends StatelessWidget {
  const VafEventIcon({super.key, required this.type, this.size = 16});

  final VafEventType type;
  final double size;

  @override
  Widget build(BuildContext context) {
    final vaf = Theme.of(context).extension<VafColors>()!;
    final scheme = Theme.of(context).colorScheme;
    return Semantics(
      label: type.label,
      child: SizedBox.square(
        dimension: size,
        child: CustomPaint(painter: _EventPainter(type, vaf, scheme.surface, scheme.onSurface)),
      ),
    );
  }
}

class _EventPainter extends CustomPainter {
  _EventPainter(this.type, this.vaf, this.bg, this.ink);

  final VafEventType type;
  final VafColors vaf;
  final Color bg;
  final Color ink;

  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 16; // diseño en una grilla de 16
    canvas.scale(s);
    switch (type) {
      case VafEventType.yellow:
      case VafEventType.red:
        canvas.save();
        canvas.translate(8, 8);
        canvas.rotate(8 * math.pi / 180);
        canvas.translate(-8, -8);
        final card = RRect.fromRectAndRadius(const Rect.fromLTWH(4, 1.5, 8.5, 12), const Radius.circular(1.5));
        canvas.drawRRect(card, Paint()..color = type == VafEventType.yellow ? vaf.eventYellow : vaf.eventRed);
        canvas.restore();
      case VafEventType.assist:
        final c = vaf.eventAssist;
        canvas.drawCircle(const Offset(3.5, 12.5), 2, Paint()..color = c);
        final stroke = Paint()
          ..color = c
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.6
          ..strokeCap = StrokeCap.round
          ..strokeJoin = StrokeJoin.round;
        canvas.drawPath(Path()..moveTo(5.5, 10.5)..cubicTo(7, 6, 9.5, 4, 13.5, 3.5), stroke);
        canvas.drawPath(Path()..moveTo(10.5, 2)..lineTo(13.5, 3.5)..lineTo(11.9, 6.4), stroke);
      case VafEventType.goal:
      case VafEventType.ownGoal:
        final own = type == VafEventType.ownGoal;
        final color = own ? vaf.eventOwnGoal : vaf.eventGoal;
        canvas.drawCircle(const Offset(8, 8), 6.6, Paint()..color = own ? bg : color);
        canvas.drawCircle(const Offset(8, 8), 6.6, Paint()
          ..color = color
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.4);
        final pent = Path()..moveTo(8, 4.6)..lineTo(10.6, 6.5)..lineTo(9.6, 9.5)..lineTo(6.4, 9.5)..lineTo(5.4, 6.5)..close();
        canvas.drawPath(pent, Paint()..color = own ? color : bg);
        if (own) {
          canvas.drawLine(const Offset(2.5, 13.5), const Offset(13.5, 2.5), Paint()
            ..color = color
            ..strokeWidth = 1.6
            ..strokeCap = StrokeCap.round);
        }
    }
  }

  @override
  bool shouldRepaint(_EventPainter old) => old.type != type || old.vaf != vaf || old.bg != bg || old.ink != ink;
}

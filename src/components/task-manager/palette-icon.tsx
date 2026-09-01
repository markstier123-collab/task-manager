import Svg, { Circle, Line, Path, Polygon, Rect } from 'react-native-svg';

export const ICON_COUNT = 10;

interface PaletteIconProps {
  iconIdx: number;
  color: string;
  size?: number;
}

export function PaletteIcon({ iconIdx, color, size = 16 }: PaletteIconProps) {
  const ring = Math.max(1.3, size * 0.11);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - ring;

  switch (iconIdx) {
    case 0: // outline circle
      return (
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth={ring} fill="none" />
        </Svg>
      );
    case 1: // half-filled circle
      return (
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth={ring} fill="none" />
          <Path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z`} fill={color} />
        </Svg>
      );
    case 2: // dashed-ring circle
      return (
        <Svg width={size} height={size}>
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={color}
            strokeWidth={ring}
            fill="none"
            strokeDasharray={`${size * 0.22},${size * 0.16}`}
          />
        </Svg>
      );
    case 3: // dot-in-circle
      return (
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth={ring} fill="none" />
          <Circle cx={cx} cy={cy} r={size * 0.16} fill={color} />
        </Svg>
      );
    case 4: // checkmark circle
      return (
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={r} fill={color} />
          <Path
            d={`M ${size * 0.28} ${size * 0.52} L ${size * 0.44} ${size * 0.68} L ${size * 0.74} ${size * 0.32}`}
            stroke="#fff"
            strokeWidth={Math.max(1.4, size * 0.13)}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 5: // x circle
      return (
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={r} fill={color} />
          <Line
            x1={size * 0.32}
            y1={size * 0.32}
            x2={size * 0.68}
            y2={size * 0.68}
            stroke="#fff"
            strokeWidth={Math.max(1.4, size * 0.13)}
            strokeLinecap="round"
          />
          <Line
            x1={size * 0.68}
            y1={size * 0.32}
            x2={size * 0.32}
            y2={size * 0.68}
            stroke="#fff"
            strokeWidth={Math.max(1.4, size * 0.13)}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 6: // solid dot
      return (
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={r} fill={color} />
        </Svg>
      );
    case 7: // square outline
      return (
        <Svg width={size} height={size}>
          <Rect
            x={ring}
            y={ring}
            width={size - ring * 2}
            height={size - ring * 2}
            rx={2}
            stroke={color}
            strokeWidth={ring}
            fill="none"
          />
        </Svg>
      );
    case 8: // diamond outline
      return (
        <Svg width={size} height={size}>
          <Polygon
            points={`${cx},${ring} ${size - ring},${cy} ${cx},${size - ring} ${ring},${cy}`}
            stroke={color}
            strokeWidth={ring}
            fill="none"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 9: // triangle outline
      return (
        <Svg width={size} height={size}>
          <Polygon
            points={`${cx},${ring} ${size - ring},${size - ring} ${ring},${size - ring}`}
            stroke={color}
            strokeWidth={ring}
            fill="none"
            strokeLinejoin="round"
          />
        </Svg>
      );
    default:
      return null;
  }
}

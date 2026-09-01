import Svg, { Path } from 'react-native-svg';

interface ChevronDownIconProps {
  color: string;
  size?: number;
}

/** A clear line-drawn caret, used as the dropdown indicator on filter pills. */
export function ChevronDownIcon({ color, size = 10 }: ChevronDownIconProps) {
  return (
    <Svg width={size} height={size * 0.6} viewBox="0 0 10 6">
      <Path
        d="M1 1 L5 5 L9 1"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

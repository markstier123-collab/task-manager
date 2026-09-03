const OPTION_ROW_HEIGHT = 30; // option's paddingVertical (8*2) + its text lineHeight (14)
const PANEL_VERTICAL_PADDING = 8; // panel's own paddingVertical (4*2)
const GAP = 4; // gap between the trigger and the panel

/**
 * Picks a `top` for an anchored dropdown panel: below the trigger by default, but
 * flipped above it when there isn't enough room left in the window underneath.
 */
export function getDropdownTop(
  anchorY: number,
  anchorHeight: number,
  optionCount: number,
  windowHeight: number,
): number {
  const estimatedPanelHeight = optionCount * OPTION_ROW_HEIGHT + PANEL_VERTICAL_PADDING;
  const spaceBelow = windowHeight - (anchorY + anchorHeight);

  if (spaceBelow >= estimatedPanelHeight + GAP) {
    return anchorY + anchorHeight + GAP;
  }
  return Math.max(GAP, anchorY - estimatedPanelHeight - GAP);
}

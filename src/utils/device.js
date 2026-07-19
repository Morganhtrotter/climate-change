/** True for touch devices with no hover capability (phones/tablets), false for mouse-driven desktops. */
export function isTouchMobile() {
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches
}

# Mobile Responsive Design & Flexbox Text Wrapping Rules

To ensure web applications look spacious, premium, clean, and completely uncluttered across all screen sizes (especially mobile devices 360px - 410px viewports):

## 1. Avoid Narrow Flex Squeezing
- **Never** place long text blocks inside a fixed `flex items-center justify-between` container alongside buttons or icons without mobile stack breakpoints.
- Always use `flex flex-col sm:flex-row` or `flex flex-col xs:flex-row` for banners, alert boxes, and action cards.
- Ensure buttons use `w-full sm:w-auto` or `w-full xs:w-auto` on mobile viewports so they span full width below text rather than squeezing text into vertical columns.

## 2. Absolute Positioning for Close Buttons
- Close buttons (`✕` or `X`) inside notification banners, toasts, or alerts must be positioned `absolute top-2.5 right-2.5` to prevent them from stealing horizontal flex layout space from text.

## 3. Responsive Typography & Leading
- Use `leading-relaxed` or `leading-normal` on Thai and multilingual text blocks.
- Ensure font sizes scale smoothly across breakpoints: `text-xs sm:text-sm` or `text-sm sm:text-base`.
- Never force fixed narrow widths (`w-36`, `w-48`) on text containers containing dynamic multi-word sentences.

## 4. Multi-column Grids on Mobile
- Use `grid-cols-2 sm:grid-cols-3` or `grid-cols-1 sm:grid-cols-2` rather than forcing 3+ tight columns on mobile viewports.

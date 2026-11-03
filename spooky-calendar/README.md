# Spooky October Calendar

An interactive booking demo built on top of my hand-drawn, animated October calendar
(sketch → Illustrator → After Effects → code).

## Open it
1. Open this folder in VS Code (File → Open Folder…).
2. Install the **Live Server** extension, right-click `index.html` → **Open with Live Server**.
   (Double-clicking `index.html` also works in most browsers.)

## What's in here
- `index.html` — the whole page: styles, layout and booking logic in one file.
- `assets/calendar-loop.mp4` — my After Effects animation, cropped and looped forward + backward.
- `assets/poster.jpg` — still frame shown before the video starts.
- `assets/hand.png` — my hand cut out, gripping the top of the calendar.

## Things you can tweak (all in `index.html`)
- `TIMES` — the time slots offered each day.
- `FULL` — days that show as fully booked, with their message.
- `taken()` — which slots appear already taken.
- `:root` CSS variables — colors and fonts.
- `.hand` CSS — position/size of the hand; `@keyframes grip` is its subtle movement.

Bookings are a front-end demo only: they're kept in the browser (localStorage).
Use the "reset calendar" link under the artwork to clear them before recording.

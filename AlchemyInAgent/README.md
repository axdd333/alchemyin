# AlchemyInAgent (SwiftUI)

Native iOS SwiftUI app implementing an AI agent interface inspired by AlchemyIn, now refined toward a calmer, more tasteful visual style.

## What's Included

- A ready-to-open Xcode project: `AlchemyInAgent.xcodeproj`
- App target: `AlchemyInAgent`
- Unit test target: `AlchemyInAgentTests`
- SwiftUI architecture organized as:
  - `Models/`
  - `ViewModels/`
  - `Views/`
  - `Components/`

## UX Refinements

- Cleaner information hierarchy and reduced UI complexity (single vertical narrative: status → desktop → dialogue → controls).
- Museum-like palette (deep charcoal, parchment highlights, brass accents).
- Draggable desktop focus panel (drag down to prioritize desktop context).
- Ephemeral chat behavior in focus mode (recent messages emphasized, reduced visual weight).
- Optional Input Deck toggle with a minimal trackpad/keyboard surface.
- Operational refinement: message history is capped for long-session performance.
- Launch splash supports a custom logo asset named `AlchemySeal`.

## Add your logo/icon

1. Open `AlchemyInAgent.xcodeproj` in Xcode.
2. Add your logo image into `Assets.xcassets` as `AlchemySeal`.
3. Run the app again to see it in the splash screen.

## Run in Xcode

1. On macOS, open `AlchemyInAgent.xcodeproj`.
2. Select scheme **AlchemyInAgent**.
3. Select an iPhone simulator destination.
4. Press **⌘R** to run.

## Run tests

1. Keep scheme as **AlchemyInAgent**.
2. Press **⌘U** to run unit tests.

## If Run (⌘R) is disabled

- Confirm the scheme is `AlchemyInAgent` (Product → Scheme).
- Confirm a simulator is selected in the destination picker.
- Wait for indexing/package resolution to finish.
- Run Product → Clean Build Folder (`⇧⌘K`) and try again.

No external dependencies are required.

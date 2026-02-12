# AlchemyInAgent (SwiftUI)

Native iOS SwiftUI app implementing an AI agent interface inspired by the current AlchemyIn visual style.

## What's Included

- A ready-to-open Xcode project: `AlchemyInAgent.xcodeproj`
- App target: `AlchemyInAgent`
- Unit test target: `AlchemyInAgentTests`
- SwiftUI architecture organized as:
  - `Models/`
  - `ViewModels/`
  - `Views/`
  - `Components/`

## Project Structure

- `AlchemyInAgent/`
  - `AlchemyInAgentApp.swift`
  - `Models/`
  - `ViewModels/`
  - `Views/`
  - `Components/`
- `AlchemyInAgentTests/`
  - `AppViewModelTests.swift`
- `AlchemyInAgent.xcodeproj/`

## Run in Xcode (no manual file copying needed)

1. On macOS, open `AlchemyInAgent.xcodeproj`.
2. In the toolbar, select scheme **AlchemyInAgent**.
3. Select an iPhone simulator destination (e.g., iPhone 15).
4. Press **⌘R** to run.

## Run tests

1. Keep scheme as **AlchemyInAgent**.
2. Press **⌘U** to run unit tests.
3. You should see `AppViewModelTests` execute in the Test navigator.

## If Run (⌘R) is disabled

- Confirm the scheme is `AlchemyInAgent` (Product → Scheme).
- Confirm a simulator is selected in the destination picker.
- Wait for indexing/package resolution to finish.
- Run Product → Clean Build Folder (`⇧⌘K`) and try again.

## CLI testing on macOS (optional)

```bash
xcodebuild \
  -project AlchemyInAgent.xcodeproj \
  -scheme AlchemyInAgent \
  -destination 'platform=iOS Simulator,name=iPhone 15' \
  test
```

No external dependencies are required.

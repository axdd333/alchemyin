# AlchemyInAgent (SwiftUI)

Native iOS SwiftUI app implementing an AI agent interface inspired by the current AlchemyIn visual style.

## Project Structure

- `Models/`
  - `ChatMessage.swift`
  - `AgentState.swift`
- `ViewModels/`
  - `AppViewModel.swift`
- `Views/`
  - `MainAgentView.swift`
- `Components/`
  - `AnimatedStatusBadge.swift`
  - `AgentStatusHeader.swift`
  - `MessageBubbleView.swift`
  - `ToolButton.swift`
  - `CommandInputBar.swift`
- `AlchemyInAgentApp.swift`

## Build / Run (Xcode)

1. Open Xcode and create a new **iOS App** project named `AlchemyInAgent` (SwiftUI lifecycle).
2. Replace generated Swift files with the files in this folder, preserving the folder structure.
3. Ensure iOS target is `iOS 17+` (or update API usage if targeting earlier versions).
4. Select an iPhone simulator and run (`⌘R`).

No external dependencies are required.

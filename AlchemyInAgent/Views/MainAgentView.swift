import SwiftUI

/// Refined primary screen with a calmer, museum-like visual language.
struct MainAgentView: View {
    @StateObject private var viewModel = AppViewModel()

    @State private var desktopHeight: CGFloat = 190
    @State private var dragStartHeight: CGFloat?
    @State private var showInputDeck = false
    @State private var isDesktopCollapsed = true

    private let minDesktopHeight: CGFloat = 160
    private let maxDesktopHeight: CGFloat = 320

    private let tools: [(String, String, String)] = [
        ("Import Stack", "tray.and.arrow.down", "Import Stack"),
        ("Browse", "safari", "Browse Web"),
        ("Create", "doc.badge.plus", "Create File")
    ]

    private let quickActions = [
        "Summarize updates",
        "Plan next 3 steps",
        "Draft execution brief"
    ]

    private var focusProgress: CGFloat {
        let range = maxDesktopHeight - minDesktopHeight
        guard range > 0 else { return 0 }
        return max(0, min(1, (desktopHeight - minDesktopHeight) / range))
    }

    private var visibleMessages: [ChatMessage] {
        focusProgress > 0.58 ? Array(viewModel.messages.suffix(3)) : viewModel.messages
    }

    var body: some View {
        ZStack {
            background

            VStack(spacing: 12) {
                compactTopBar

                if !isDesktopCollapsed {
                    desktopPanel
                }
                if showInputDeck {
                    quickActionStrip
                }
                chatSection
                if showInputDeck {
                    controlsRow
                }

                if showInputDeck {
                    inputDeck
                }

                CommandInputBar(text: $viewModel.draftCommand, onSend: viewModel.sendCommand)
                footer
            }
            .padding(16)
        }
        .animation(.easeInOut(duration: 0.22), value: showInputDeck)
    }

    private var compactTopBar: some View {
        HStack(spacing: 12) {
            Text("Atelier")
                .font(.system(size: 18, weight: .semibold, design: .serif))
                .foregroundStyle(Color(red: 0.95, green: 0.92, blue: 0.86))

            statusPill

            Spacer()

            Button {
                withAnimation(.easeInOut(duration: 0.22)) {
                    isDesktopCollapsed.toggle()
                }
            } label: {
                HStack(spacing: 6) {
                    Image(systemName: isDesktopCollapsed ? "chevron.down" : "chevron.up")
                    Text("Desktop")
                        .lineLimit(1)
                        .minimumScaleFactor(0.9)
                        .fixedSize(horizontal: true, vertical: true)
                }
                .font(.system(size: 12, weight: .semibold, design: .rounded))
                .foregroundStyle(Color(red: 0.93, green: 0.90, blue: 0.83))
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(.ultraThinMaterial, in: Capsule())
                .overlay(Capsule().stroke(Color.white.opacity(0.18), lineWidth: 1))
            }
            .buttonStyle(.plain)

            Button {
                withAnimation(.easeInOut(duration: 0.22)) {
                    showInputDeck.toggle()
                }
            } label: {
                HStack(spacing: 6) {
                    Image(systemName: "rectangle.3.group")
                    Text("Deck")
                        .lineLimit(1)
                        .minimumScaleFactor(0.9)
                        .fixedSize(horizontal: true, vertical: true)
                }
                .font(.system(size: 12, weight: .semibold, design: .rounded))
                .foregroundStyle(Color.white.opacity(0.83))
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(.ultraThinMaterial, in: Capsule())
                .overlay(Capsule().stroke(Color.white.opacity(0.18), lineWidth: 1))
            }
            .buttonStyle(.plain)
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Color.white.opacity(0.04))
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .stroke(Color.white.opacity(0.12), lineWidth: 1)
                )
        )
    }

    private var statusPill: some View {
        let neutralStroke = Color.white.opacity(0.18)
        let readyTint = Color(red: 0.62, green: 0.76, blue: 0.90)
        let processingTint = Color(red: 0.74, green: 0.66, blue: 0.86)

        return Group {
            if !viewModel.isConnected {
                Text(viewModel.connectionMessage ?? "Operator not connected")
                    .lineLimit(1)
                    .minimumScaleFactor(0.9)
                    .fixedSize(horizontal: true, vertical: true)
                    .font(.system(size: 12, weight: .semibold, design: .rounded))
                    .foregroundStyle(Color.white.opacity(0.82))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(.ultraThinMaterial, in: Capsule())
                    .overlay(Capsule().stroke(neutralStroke, lineWidth: 1))
            } else {
                let tint = viewModel.agentState == .ready ? readyTint : processingTint
                Text(viewModel.agentState.statusText.uppercased())
                    .lineLimit(1)
                    .minimumScaleFactor(0.9)
                    .fixedSize(horizontal: true, vertical: true)
                    .font(.system(size: 12, weight: .semibold, design: .rounded))
                    .foregroundStyle(tint)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(.ultraThinMaterial, in: Capsule())
                    .overlay(Capsule().stroke(neutralStroke, lineWidth: 1))
            }
        }
    }

    private var desktopPanel: some View {
        VStack(spacing: 10) {
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color.black.opacity(0.25))
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(Color.white.opacity(0.14), lineWidth: 1)
                )
                .overlay {
                    VStack(spacing: 8) {
                        Image(systemName: "macwindow.on.rectangle")
                            .font(.system(size: 30, weight: .regular))
                            .foregroundStyle(Color.white.opacity(0.66))
                        Text("Desktop")
                            .font(.system(size: 12, weight: .medium, design: .rounded))
                            .foregroundStyle(.white.opacity(0.55))
                    }
                }
                .frame(height: max(CGFloat(78), desktopHeight - CGFloat(58)))
        }
        .padding(12)
        .frame(height: desktopHeight)
        .background(panelBackground)
        .gesture(
            DragGesture(minimumDistance: 2)
                .onChanged { value in
                    let start = dragStartHeight ?? desktopHeight
                    dragStartHeight = start
                    desktopHeight = max(minDesktopHeight, min(maxDesktopHeight, start + value.translation.height))
                }
                .onEnded { _ in dragStartHeight = nil }
        )
    }

    private var quickActionStrip: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(quickActions, id: \.self) { prompt in
                    Button {
                        viewModel.applyQuickAction(prompt)
                    } label: {
                        Text(prompt)
                            .lineLimit(1)
                            .minimumScaleFactor(0.9)
                            .fixedSize(horizontal: true, vertical: true)
                            .font(.system(size: 12, weight: .medium, design: .rounded))
                            .foregroundStyle(.white.opacity(0.82))
                            .padding(.horizontal, 11)
                            .padding(.vertical, 7)
                            .background(.ultraThinMaterial, in: Capsule())
                            .overlay(Capsule().stroke(Color.white.opacity(0.18), lineWidth: 1))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .opacity(1 - Double(focusProgress) * 0.25)
    }

    private var chatSection: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 14) {
                    ForEach(visibleMessages) { message in
                        MessageBubbleView(message: message, isEphemeral: focusProgress > 0.58, compactChrome: true)
                            .id(message.id)
                    }

                    if viewModel.agentState == .processing {
                        Label("Operator is composing…", systemImage: "ellipsis.circle")
                            .font(.system(size: 13, weight: .medium, design: .rounded))
                            .foregroundStyle(.white.opacity(0.62))
                            .padding(.leading, 2)
                    }
                }
                .padding(12)
            }
            .background(panelBackground)
            .opacity(1 - Double(focusProgress) * 0.35)
            .onChange(of: viewModel.messages) { _, newValue in
                guard let last = newValue.last else { return }
                withAnimation(.easeOut(duration: 0.22)) {
                    proxy.scrollTo(last.id, anchor: .bottom)
                }
            }
        }
    }

    private var controlsRow: some View {
        HStack(spacing: 10) {
            ForEach(tools, id: \.2) { tool in
                ToolButton(title: tool.0, systemImage: tool.1) {
                    viewModel.triggerTool(tool.2)
                }
            }

            Spacer(minLength: 0)

            Button(viewModel.messages.count > 1 ? "Reset" : "Input Deck") {
                if viewModel.messages.count > 1 {
                    viewModel.clearConversation()
                } else {
                    showInputDeck.toggle()
                }
            }
            .font(.system(size: 12, weight: .semibold, design: .rounded))
            .foregroundStyle(Color(red: 0.93, green: 0.90, blue: 0.83))
            .padding(.horizontal, 12)
            .padding(.vertical, 9)
            .background(Capsule().fill(Color.white.opacity(0.08)))
            .buttonStyle(.plain)

            if viewModel.messages.count > 1 {
                Button(showInputDeck ? "Hide Deck" : "Deck") {
                    showInputDeck.toggle()
                }
                .font(.system(size: 12, weight: .semibold, design: .rounded))
                .foregroundStyle(Color(red: 0.93, green: 0.90, blue: 0.83))
                .padding(.horizontal, 12)
                .padding(.vertical, 9)
                .background(Capsule().fill(Color.white.opacity(0.08)))
                .buttonStyle(.plain)
            }
        }
    }

    private var inputDeck: some View {
        VStack(spacing: 10) {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(Color.white.opacity(0.06))
                .frame(height: 62)
                .overlay(Text("Trackpad").foregroundStyle(.white.opacity(0.6)))

            HStack(spacing: 6) {
                ForEach(["⌘", "⌥", "⇧", "Tab", "Space", "↩"], id: \.self) { key in
                    Text(key)
                        .font(.system(size: 12, weight: .semibold, design: .rounded))
                        .foregroundStyle(.white.opacity(0.88))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(RoundedRectangle(cornerRadius: 8).fill(Color.white.opacity(0.08)))
                }
            }
        }
        .padding(12)
        .background(panelBackground)
    }

    private var footer: some View {
        HStack {
            Text(focusProgress > 0.58 ? "Desktop focus active" : "Press Enter to execute")
            Spacer()
            Label("Autonomous mode active", systemImage: "bolt.fill")
                .foregroundStyle(Color.white.opacity(0.6))
        }
        .font(.system(size: 14, weight: .regular, design: .rounded))
        .foregroundStyle(.white.opacity(0.42))
        .padding(.horizontal, 4)
    }

    private var panelBackground: some View {
        RoundedRectangle(cornerRadius: 20, style: .continuous)
            .fill(Color.white.opacity(0.04))
            .overlay(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .stroke(Color.white.opacity(0.12), lineWidth: 1)
            )
    }

    private var background: some View {
        LinearGradient(
            colors: [
                Color(red: 0.05, green: 0.06, blue: 0.12),
                Color(red: 0.08, green: 0.06, blue: 0.13),
                Color(red: 0.05, green: 0.08, blue: 0.10),
                Color(red: 0.03, green: 0.03, blue: 0.04)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .overlay(
            RadialGradient(
                colors: [Color.white.opacity(0.06), .clear],
                center: .bottom,
                startRadius: 4,
                endRadius: 430
            )
        )
        .ignoresSafeArea()
    }
}

#Preview {
    MainAgentView()
}


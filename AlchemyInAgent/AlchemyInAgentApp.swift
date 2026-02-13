import SwiftUI

@main
struct AlchemyInAgentApp: App {
    var body: some Scene {
        WindowGroup {
            RootAppView()
        }
    }
}

/// Launch wrapper with a quiet, gallery-like opening animation.
struct RootAppView: View {
    @State private var showSplash = true

    var body: some View {
        ZStack {
            MainAgentView()
                .opacity(showSplash ? 0 : 1)

            if showSplash {
                LaunchSplashView()
                    .transition(.opacity)
            }
        }
        .onAppear {
            Task { @MainActor in
                try? await Task.sleep(nanoseconds: 1_500_000_000)
                withAnimation(.easeInOut(duration: 0.32)) {
                    showSplash = false
                }
            }
        }
    }
}

private struct LaunchSplashView: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 0.05, green: 0.06, blue: 0.09),
                    Color(red: 0.06, green: 0.07, blue: 0.10),
                    Color(red: 0.03, green: 0.03, blue: 0.05)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            .overlay(LinearGradient(colors: [Color.black.opacity(0.0), Color.black.opacity(0.15)], startPoint: .center, endPoint: .bottom).ignoresSafeArea())

            VStack(spacing: 8) {
                Text("Atelier")
                    .font(.system(size: 32, weight: .semibold, design: .rounded))
                    .tracking(0.2)
                    .foregroundStyle(Color(red: 0.94, green: 0.91, blue: 0.85))

                Text("By Alchemy")
                    .font(.system(size: 11, weight: .medium, design: .rounded))
                    .foregroundStyle(.white.opacity(0.42))
            }
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Atelier by Alchemy")
        }
    }
}


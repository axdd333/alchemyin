import SwiftUI

@main
struct AlchemyInAgentApp: App {
    var body: some Scene {
        WindowGroup {
            RootAppView()
                .preferredColorScheme(.dark)
        }
    }
}

/// Wraps launch splash + main interface for a more native app opening flow.
struct RootAppView: View {
    @State private var showSplash = true

    var body: some View {
        ZStack {
            MainAgentView()
                .opacity(showSplash ? 0 : 1)

            if showSplash {
                LaunchSplashView()
                    .transition(.opacity.combined(with: .scale(scale: 1.02)))
            }
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.6) {
                withAnimation(.easeInOut(duration: 0.35)) {
                    showSplash = false
                }
            }
        }
    }
}

private struct LaunchSplashView: View {
    @State private var glow = false

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.03, green: 0.04, blue: 0.12), Color.black],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(Color.cyan.opacity(0.15))
                        .frame(width: 120, height: 120)
                        .blur(radius: glow ? 8 : 2)

                    Image(systemName: "sparkles")
                        .font(.system(size: 44, weight: .semibold))
                        .foregroundStyle(.cyan)
                }

                Text("AlchemyIn")
                    .font(.system(size: 34, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)

                Text("Agent Console")
                    .font(.system(size: 16, weight: .medium, design: .rounded))
                    .foregroundStyle(.white.opacity(0.65))
            }
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 0.9).repeatForever(autoreverses: true)) {
                glow = true
            }
        }
    }
}

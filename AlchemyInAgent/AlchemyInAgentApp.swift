import SwiftUI
import UIKit

@main
struct AlchemyInAgentApp: App {
    var body: some Scene {
        WindowGroup {
            RootAppView()
                .preferredColorScheme(.dark)
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
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                withAnimation(.easeInOut(duration: 0.32)) {
                    showSplash = false
                }
            }
        }
    }
}

private struct LaunchSplashView: View {
    @State private var breathe = false

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 0.06, green: 0.06, blue: 0.08),
                    Color(red: 0.08, green: 0.07, blue: 0.10),
                    Color(red: 0.03, green: 0.03, blue: 0.04)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(Color(red: 0.74, green: 0.63, blue: 0.43).opacity(0.16))
                        .frame(width: 122, height: 122)
                        .blur(radius: breathe ? 8 : 3)

                    Image("AlchemySeal")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 76, height: 76)
                        .opacity(0.95)
                        .overlay {
                            // fallback symbol when asset is not yet added.
                            if UIImage(named: "AlchemySeal") == nil {
                                Image(systemName: "seal")
                                    .font(.system(size: 42, weight: .light))
                                    .foregroundStyle(Color(red: 0.86, green: 0.74, blue: 0.48))
                            }
                        }
                }

                Text("AlchemyIn")
                    .font(.system(size: 34, weight: .medium, design: .serif))
                    .foregroundStyle(Color(red: 0.94, green: 0.91, blue: 0.85))

                Text("Agent Atelier")
                    .font(.system(size: 14, weight: .medium, design: .rounded))
                    .foregroundStyle(.white.opacity(0.55))
            }
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true)) {
                breathe = true
            }
        }
    }
}

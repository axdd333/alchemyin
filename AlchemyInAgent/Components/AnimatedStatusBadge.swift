import SwiftUI

struct AnimatedStatusBadge: View {
    let state: AgentState
    @State private var pulse = false

    var body: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(state.accentColor)
                .frame(width: 10, height: 10)
                .scaleEffect(pulse ? 1.2 : 0.85)
                .opacity(pulse ? 0.65 : 1.0)

            Text(state.statusText.uppercased())
                .font(.system(size: 16, weight: .medium, design: .rounded))
                .foregroundStyle(state.accentColor)
        }
        .padding(.vertical, 10)
        .padding(.horizontal, 16)
        .background(
            Capsule()
                .fill(.ultraThinMaterial)
                .overlay(
                    Capsule()
                        .stroke(state.accentColor.opacity(0.4), lineWidth: 1)
                )
        )
        .onAppear {
            withAnimation(.easeInOut(duration: 0.8).repeatForever(autoreverses: true)) {
                pulse = true
            }
        }
    }
}

#Preview {
    AnimatedStatusBadge(state: .ready)
        .padding()
        .background(.black)
}

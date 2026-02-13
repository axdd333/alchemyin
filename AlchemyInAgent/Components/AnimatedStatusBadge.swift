import SwiftUI

struct AnimatedStatusBadge: View {
    let state: AgentState
    @State private var pulse = false

    private var tint: Color {
        state == .ready ? Color(red: 0.57, green: 0.72, blue: 0.89) : Color(red: 0.79, green: 0.62, blue: 0.42)
    }

    var body: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(tint)
                .frame(width: 9, height: 9)
                .scaleEffect(pulse ? 1.15 : 0.9)
                .opacity(pulse ? 0.65 : 1)

            Text(state.statusText.uppercased())
                .font(.system(size: 15, weight: .semibold, design: .rounded))
                .foregroundStyle(tint)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 9)
        .background(
            Capsule()
                .fill(Color.white.opacity(0.06))
                .overlay(Capsule().stroke(tint.opacity(0.35), lineWidth: 1))
        )
        .onAppear {
            withAnimation(.easeInOut(duration: 0.9).repeatForever(autoreverses: true)) {
                pulse = true
            }
        }
    }
}

#Preview {
    AnimatedStatusBadge(state: .processing)
        .padding()
        .background(.black)
}

import SwiftUI

struct MessageBubbleView: View {
    let message: ChatMessage
    var isEphemeral: Bool = false
    var compactChrome: Bool = false
    private let radius: CGFloat = 14

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(message.content)
                .foregroundStyle(.white.opacity(isEphemeral ? 0.76 : 0.9))
                .font(.system(size: isEphemeral ? 14 : 15, weight: .regular, design: .rounded))
                .lineSpacing(2.5)
                .tracking(0.1)
                .padding(.horizontal, 14)
                .padding(.vertical, compactChrome ? 8 : 10)
                .background(
                    RoundedRectangle(cornerRadius: radius, style: .continuous)
                        .fill(.ultraThinMaterial)
                        .overlay(
                            RoundedRectangle(cornerRadius: radius, style: .continuous)
                                .stroke(Color.white.opacity(isEphemeral ? 0.10 : 0.14), lineWidth: 1)
                        )
                        .overlay(
                            LinearGradient(
                                colors: [Color.white.opacity(isEphemeral ? 0.12 : 0.14), .clear],
                                startPoint: .top,
                                endPoint: .center
                            )
                            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
                            .blendMode(.plusLighter)
                            .allowsHitTesting(false)
                        )
                )
                .shadow(color: Color.white.opacity(0.02), radius: 8, y: 3)
                .shadow(color: Color.black.opacity(0.20), radius: 8, y: 4)
        }
        .opacity(isEphemeral ? 0.78 : 1)
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        MessageBubbleView(message: ChatMessage(role: .agent, content: "A refined message style for preview."), isEphemeral: true, compactChrome: true)
            .padding()
    }
}


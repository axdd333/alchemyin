import SwiftUI

struct MessageBubbleView: View {
    let message: ChatMessage

    private var isAgent: Bool { message.role == .agent }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                Rectangle()
                    .fill(isAgent ? Color.cyan : Color.purple)
                    .frame(width: 32, height: 1.5)

                Text(message.role.rawValue)
                    .foregroundStyle(isAgent ? Color.cyan : Color.purple)
                    .font(.system(size: 16, weight: .semibold, design: .monospaced))

                Text(message.timestamp.formatted(date: .omitted, time: .shortened))
                    .foregroundStyle(.white.opacity(0.35))
                    .font(.system(size: 15, weight: .regular, design: .rounded))
            }

            HStack(alignment: .top, spacing: 0) {
                Rectangle()
                    .fill((isAgent ? Color.cyan : Color.purple).opacity(0.65))
                    .frame(width: 3)

                Text(message.content)
                    .foregroundStyle(.white.opacity(0.9))
                    .font(.system(size: 22, weight: .regular, design: .rounded))
                    .multilineTextAlignment(.leading)
                    .lineSpacing(4)
                    .padding(.leading, 16)
            }
        }
        .padding(.vertical, 8)
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        MessageBubbleView(message: ChatMessage(role: .agent, content: "Streaming response preview text."))
            .padding()
    }
}

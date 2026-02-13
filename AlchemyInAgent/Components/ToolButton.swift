import SwiftUI

struct ToolButton: View {
    let title: String
    let systemImage: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Label(title, systemImage: systemImage)
                .font(.system(size: 12, weight: .semibold, design: .rounded))
                .foregroundStyle(Color.white.opacity(0.86))
                .lineLimit(1)
                .padding(.vertical, 8)
                .padding(.horizontal, 10)
                .background(Capsule().fill(Color.white.opacity(0.07)))
                .overlay(
                    Capsule()
                        .stroke(Color.white.opacity(0.16), lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        ToolButton(title: "Open Browser", systemImage: "safari") {}
    }
}

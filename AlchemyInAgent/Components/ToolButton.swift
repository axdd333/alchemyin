import SwiftUI

struct ToolButton: View {
    let title: String
    let systemImage: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Label(title, systemImage: systemImage)
                .font(.system(size: 14, weight: .medium, design: .rounded))
                .foregroundStyle(Color.white.opacity(0.86))
                .imageScale(.medium)
                .labelStyle(.automatic)
                .lineLimit(1)
                .truncationMode(.tail)
                .minimumScaleFactor(0.9)
                .fixedSize(horizontal: true, vertical: true)
                .kerning(0.1)
                .padding(.vertical, 9)
                .padding(.horizontal, 12)
                .background(.ultraThinMaterial, in: Capsule())
                .overlay(
                    Capsule()
                        .stroke(Color.white.opacity(0.18), lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    ZStack {
        Color.black.ignoresSafeArea()
        ToolButton(title: "Attach", systemImage: "paperclip") {}
    }
}

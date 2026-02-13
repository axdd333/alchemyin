import SwiftUI

struct ToolButton: View {
    let title: String
    let systemImage: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Label(title, systemImage: systemImage)
                .font(.system(size: 14, weight: .medium, design: .rounded))
                .foregroundStyle(Color(red: 0.92, green: 0.89, blue: 0.82))
                .padding(.vertical, 9)
                .padding(.horizontal, 12)
                .background(
                    Capsule()
                        .fill(Color.white.opacity(0.03))
                        .overlay(
                            Capsule()
                                .stroke(Color(red: 0.58, green: 0.50, blue: 0.35).opacity(0.26), lineWidth: 1)
                        )
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

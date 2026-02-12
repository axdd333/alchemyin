import SwiftUI

@main
struct AlchemyInAgentApp: App {
    var body: some Scene {
        WindowGroup {
            MainAgentView()
                .preferredColorScheme(.dark)
        }
    }
}

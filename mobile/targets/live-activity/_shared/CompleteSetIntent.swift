// Лежит в targets/live-activity/_shared/ — @bacons/apple-targets кладёт этот файл
// ОДНОВРЕМЕННО в app-таргет и в widget-таргет. Это обязательно для LiveActivityIntent:
// iOS исполняет perform() в процессе ПРИЛОЖЕНИЯ, поэтому App Intents metadata должна быть
// в самом .app, а не только в расширении. Не перемещать отсюда.
import ActivityKit
import AppIntents
import Foundation
import OSLog
import UserNotifications

private let intentLog = Logger(subsystem: "com.gymbar.app.liveactivity", category: "intent")

private let appGroupId = "group.com.gymbar.app"
private let completeSetEventsKey = "gymbar.completeSetEvents"
private let completeSetPendingKey = "gymbar.completeSetPending"
private let completeSetNotification = "com.gymbar.app.completeSet"
private let restNotificationId = "gymbar-rest-done"
private let restNotificationIdKey = "gymbar.restNotificationId"
private let soundEnabledKey = "gymbar.soundEnabled"
private let defaultRestSeconds: TimeInterval = 90

@available(iOS 17.0, *)
struct CompleteSetIntent: LiveActivityIntent {
  static let title: LocalizedStringResource = "Завершить подход"
  static let description = IntentDescription("Засчитывает подход и запускает отдых.")
  static let isDiscoverable = false
  static let openAppWhenRun = false

  func perform() async throws -> some IntentResult {
    intentLog.log("GYMBAR perform() START pid=\(ProcessInfo.processInfo.processIdentifier) proc=\(ProcessInfo.processInfo.processName)")
    let all = Activity<GymbarActivityAttributes>.activities
    intentLog.log("GYMBAR activities.count=\(all.count)")
    guard let activity = all.first else {
      intentLog.error("GYMBAR EXIT: no activity in this process")
      return .result()
    }

    let current = activity.content.state
    intentLog.log("GYMBAR state phase=\(current.phase) canComplete=\(current.canCompleteSet) set=\(current.setCurrent)/\(current.setTotal)")
    guard current.canCompleteSet, current.phase != "paused" else {
      intentLog.error("GYMBAR EXIT: guard canCompleteSet/paused failed")
      return .result()
    }
    guard let defaults = UserDefaults(suiteName: appGroupId) else {
      intentLog.error("GYMBAR EXIT: App Group UserDefaults nil")
      return .result()
    }
    guard defaults.bool(forKey: completeSetPendingKey) == false else {
      intentLog.error("GYMBAR EXIT: pending flag stuck true")
      return .result()
    }
    defaults.set(true, forKey: completeSetPendingKey)

    let next = nextState(from: current)
    await activity.update(ActivityContent(state: next, staleDate: nil))
    intentLog.log("GYMBAR activity.update done -> phase=\(next.phase)")
    enqueueCompleteSet(defaults: defaults)
    try await syncRestNotification(for: next)
    intentLog.log("GYMBAR perform() DONE")
    return .result()
  }

  private func nextState(
    from current: GymbarActivityAttributes.ContentState
  ) -> GymbarActivityAttributes.ContentState {
    if current.setCurrent < current.setTotal {
      var next = current
      next.setCurrent += 1
      next.phase = "rest"
      next.restEndsAt = Date().addingTimeInterval(defaultRestSeconds)
      next.canCompleteSet = false
      return next
    }

    guard let nextExercise = current.upcomingExerciseNames.first else {
      var next = current
      next.phase = "active"
      next.restEndsAt = nil
      next.canCompleteSet = false
      return next
    }

    var next = current
    next.exerciseName = nextExercise
    next.setCurrent = 1
    next.setTotal = current.upcomingExerciseSetTotals.first ?? current.setTotal
    next.exerciseCurrent = min(current.exerciseTotal, current.exerciseCurrent + 1)
    next.phase = "active"
    next.restEndsAt = nil
    next.upcomingExerciseNames.removeFirst()
    if !next.upcomingExerciseSetTotals.isEmpty {
      next.upcomingExerciseSetTotals.removeFirst()
    }
    next.canCompleteSet = false
    return next
  }

  private func enqueueCompleteSet(defaults: UserDefaults) {
    var events = defaults.array(forKey: completeSetEventsKey) as? [Double] ?? []
    events.append(Date().timeIntervalSince1970 * 1_000)
    defaults.set(events, forKey: completeSetEventsKey)
    defaults.synchronize()

    CFNotificationCenterPostNotification(
      CFNotificationCenterGetDarwinNotifyCenter(),
      CFNotificationName(completeSetNotification as CFString),
      nil,
      nil,
      true
    )
  }

  private func syncRestNotification(
    for state: GymbarActivityAttributes.ContentState
  ) async throws {
    let center = UNUserNotificationCenter.current()
    let defaults = UserDefaults(suiteName: appGroupId)
    let previousId = defaults?.string(forKey: restNotificationIdKey)
    center.removePendingNotificationRequests(
      withIdentifiers: [previousId, restNotificationId].compactMap { $0 }
    )
    defaults?.removeObject(forKey: restNotificationIdKey)

    guard
      state.phase == "rest",
      defaults?.bool(forKey: soundEnabledKey) == true,
      let restEndsAt = state.restEndsAt
    else { return }

    let content = UNMutableNotificationContent()
    content.title = "Отдых окончен"
    content.body = "Пора начинать следующий подход"
    content.sound = UNNotificationSound(
      named: UNNotificationSoundName(rawValue: "rest-done.wav")
    )
    content.interruptionLevel = .timeSensitive

    let interval = max(1, restEndsAt.timeIntervalSinceNow)
    let trigger = UNTimeIntervalNotificationTrigger(timeInterval: interval, repeats: false)
    let request = UNNotificationRequest(
      identifier: restNotificationId,
      content: content,
      trigger: trigger
    )
    try await center.add(request)
    defaults?.set(restNotificationId, forKey: restNotificationIdKey)
  }
}

import ExpoModulesCore

public final class GymbarICloudKVModule: Module {
  private var externalChangeObserver: NSObjectProtocol?

  public func definition() -> ModuleDefinition {
    Name("GymbarICloudKV")
    Events("onExternalChange")

    Function("isAvailable") { () -> Bool in
      FileManager.default.ubiquityIdentityToken != nil
    }

    Function("getString") { (key: String) -> String? in
      NSUbiquitousKeyValueStore.default.string(forKey: key)
    }

    Function("setString") { (key: String, value: String) in
      NSUbiquitousKeyValueStore.default.set(value, forKey: key)
    }

    Function("synchronize") { () -> Bool in
      NSUbiquitousKeyValueStore.default.synchronize()
    }

    OnStartObserving { [weak self] in
      guard let self else { return }
      externalChangeObserver = NotificationCenter.default.addObserver(
        forName: NSUbiquitousKeyValueStore.didChangeExternallyNotification,
        object: NSUbiquitousKeyValueStore.default,
        queue: nil
      ) { [weak self] notification in
        let keys = notification.userInfo?[NSUbiquitousKeyValueStoreChangedKeysKey] as? [String] ?? []
        DispatchQueue.main.async {
          for key in keys {
            self?.sendEvent("onExternalChange", ["key": key])
          }
        }
      }
    }

    OnStopObserving { [weak self] in
      guard let self, let externalChangeObserver else { return }
      NotificationCenter.default.removeObserver(externalChangeObserver)
      self.externalChangeObserver = nil
    }
  }
}

Pod::Spec.new do |s|
  s.name           = 'GymbarICloudKVBridge'
  s.version        = '1.0.0'
  s.summary        = 'Gymbar iCloud Key-Value bridge'
  s.description    = 'Reads and writes the Gymbar iCloud key-value configuration.'
  s.author         = 'Gymbar'
  s.homepage       = 'https://expo.dev'
  s.platforms      = { :ios => '16.2' }
  s.source         = { :path => '.' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end

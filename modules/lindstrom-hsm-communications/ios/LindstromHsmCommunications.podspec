Pod::Spec.new do |s|
  s.name           = 'LindstromHsmCommunications'
  s.version        = '1.0.0'
  s.summary        = 'Expo module for HSM Communications'
  s.description    = 'A module for handling HSM Communications in Expo'
  s.author         = 'Julien Texier'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end

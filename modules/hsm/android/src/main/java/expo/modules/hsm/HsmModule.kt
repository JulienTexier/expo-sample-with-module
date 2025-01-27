package expo.modules.hsm

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL

import com.hagleitner.basetypes.qr.HsMDeviceCodeParser
import com.hagleitner.basetypes.qr.exception.qr.InvalidQrCodeFormat

class HsmModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('Hsm')` in JavaScript.
    Name("Hsm")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants(
      "PI" to Math.PI
    )

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      "Hello world! 👋"
    }

    Function("parseCode") { code: String ->
      try {
        HsMDeviceCodeParser.parseCode(code)
      } catch (e: InvalidQrCodeFormat) {
        throw Exception("Invalid QR Code Format: ${e.message}")
      }
    }

    Function("parseCodeWithResult") { code: String ->
      val result = HsMDeviceCodeParser.parseCodeWithResult(code)
      mapOf(
        "success" to result.success,
        "qrCode" to result.qrCode?.toString()
      )
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }
  }
}

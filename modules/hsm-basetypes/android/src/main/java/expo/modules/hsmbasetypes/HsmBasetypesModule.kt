package expo.modules.hsmbasetypes

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL

import com.hagleitner.basetypes.qr.HsMDeviceCodeParser
import com.hagleitner.basetypes.qr.exception.qr.InvalidQrCodeFormat

class HsmBasetypesModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('HsmBasetypes')` in JavaScript.
    Name("HsmBasetypes")

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
  }
}

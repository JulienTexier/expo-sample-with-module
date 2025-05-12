package expo.modules.lindstromhsmbasetypes

import com.hagleitner.basetypes.qr.HsMDeviceCodeParser
import com.hagleitner.basetypes.qr.exception.qr.InvalidQrCodeFormat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL

class LindstromHsmBasetypesModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("LindstromHsmBasetypes")

    Function("parseCodeWithResult") { code: String ->
      val result = HsMDeviceCodeParser.parseCodeWithResult(code)
      mapOf(
        "success" to result.success,
        "qrCode" to result.qrCode?.toString()
      )
    }
  }
}

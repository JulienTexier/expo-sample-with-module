import ExpoModulesCore
import HsMBaseTypes

public class LindstromHsmBasetypesModule: Module {
    public func definition() -> ModuleDefinition {
        Name("LindstromHsmBasetypes")
       
        Function("parseCodeWithResult") { (code: String) in
            let result = HsMDeviceCodeParser.shared.parseCodeWithResult(qrCodeString: code)
           
            return [
                "success": result.success,
                "qrCode": result.qrCode.debugDescription // This returns "Optional(HsMDeviceCodeParser.QrCodeResult)" which is not the string we want, but we do not need it in the app.
            ]
        }
    }
}

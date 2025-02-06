package expo.modules.hsmdevicecommunications

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.Base64
import com.google.gson.Gson
import com.hagleitner.hsmdevicecommunications.*
import com.hagleitner.hsmdevicecommunications.bleconnectionprotocol.builder.BleConnectionProtocolMessageBuilder
import expo.modules.kotlin.types.TypeConverter
import com.google.gson.JsonObject

// TLVConverter for converting between JavaScript and Kotlin TLV
// class TLVConverter : TypeConverter<TLV> {
//     // Implementing the 'convert' method
//     override fun convert(value: Any?, context: AppContext?): TLV? {
//         if (value == null) return null
//         val json = value as? JsonObject ?: return null
//         val tag = json.get("tag")?.asInt ?: return null
//         val valueStr = json.get("value")?.asString ?: return null
//         return TLV(tag, valueStr)
//     }

//     // Convert from Kotlin TLV to JSON
//     override fun fromSerializable(serialized: Any): TLV {
//         val json = serialized as? JsonObject ?: throw IllegalArgumentException("Expected JsonObject for TLV")
//         val tag = json.get("tag")?.asInt ?: throw IllegalArgumentException("Missing 'tag' in TLV")
//         val value = json.get("value")?.asString ?: throw IllegalArgumentException("Missing 'value' in TLV")
//         return TLV(tag, value)
//     }

//     // Convert from Kotlin TLV to JSON
//     override fun toSerializable(value: TLV): Any {
//         val json = JsonObject()
//         json.addProperty("tag", value.tag)
//         json.addProperty("value", value.value)
//         return json
//     }
// }

class HsmDeviceCommunicationsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("HsmDeviceCommunications")

    // Register TLVConverter
    // TypeConverter(TLV::class, TLVConverter()) // Remove extra parameters

    Function("parseBleAdvertisementWithoutDecryption") { characteristicValue: String ->
        try {
            val byteArray = Base64.getDecoder().decode(characteristicValue)
            val result = parseBleAdvertisementWithoutDecryption(byteArray)
            return@Function Gson().toJson(result)
        } catch (e: IllegalArgumentException) {
            println("Invalid Base64 string: ${e.message}")
            return@Function null
        }
    }

    Function("decryptResourcesValues") { encryptedResourceValuesHex: String, decryptionKey: String ->
        try {
            val result: ByteArray = decryptResourcesValues(encryptedResourceValuesHex, decryptionKey)
            return@Function Gson().toJson(result)
        } catch (e: IllegalArgumentException) {
            println("Error while decoding: ${e.message}")
            return@Function null
        }
    }

    Function("getResourcesValuesAsInt") { decryptedByteArray: String, offset: Int, length: Int ->
        try {
            val byteArray = Base64.getDecoder().decode(decryptedByteArray)
            val result = getResourcesValuesAsInt(byteArray, offset, length)
            return@Function result
        } catch (e: IllegalArgumentException) {
            println("Error in getResourcesValuesAsInt: ${e.message}")
            return@Function null
        }
    }

    // Function("buildEncryptedMessage") { tlvs: List<TLV>, key: String ->
    //     try {
    //         val message = BleConnectionProtocolMessageBuilder.buildEncryptedMessage(tlvs, key)
    //         val jsonResult = mapOf(
    //             "first" to Base64.getEncoder().encodeToString(message.first),
    //             "tlvIds" to message.second
    //         )
    //         return@Function Gson().toJson(jsonResult)
    //     } catch (e: Exception) {
    //         println("Error in buildEncryptedMessage: ${e.message}")
    //         return@Function null
    //     }
    // }
  }
}
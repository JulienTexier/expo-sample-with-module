package expo.modules.hsmdevicecommunications

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.Base64
import com.google.gson.Gson
import com.hagleitner.hsmdevicecommunications.*
import com.hagleitner.hsmdevicecommunications.bleconnectionprotocol.builder.BleConnectionProtocolMessageBuilder
import com.hagleitner.hsmdevicecommunications.bleconnectionprotocol.builder.WriteTLV
import com.hagleitner.hsmdevicecommunications.bleconnectionprotocol.parser.ResourceIdentifier

class HsmDeviceCommunicationsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("HsmDeviceCommunications")


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

    Function("writeEncrypted") { 
        resourceType: String, 
        instance: String, 
        valueBase64: String, 
        key: String ->

        try {
            val value = Base64.getDecoder().decode(valueBase64).toUByteArray()
            println(value.contentToString())
            val (encryptedWriteCommand, tlvId) =
                BleConnectionProtocolMessageBuilder.buildEncryptedWriteMessage(
                    WriteTLV(
                        resource = ResourceIdentifier(resourceType.toUShort(), instance.toUShort()),
                        value = value.toByteArray(),
                    ),
                    key
                )
            println(encryptedWriteCommand.contentToString())
            println(tlvId)
            return@Function mapOf(
                "encryptedData" to Base64.getEncoder().encodeToString(encryptedWriteCommand),
                "tlvId" to tlvId.toInt()
            )
        } catch (e: Exception) {
            println("Error in writeEncrypted: ${e.message}")
            return@Function null
        }
    }

  }
}
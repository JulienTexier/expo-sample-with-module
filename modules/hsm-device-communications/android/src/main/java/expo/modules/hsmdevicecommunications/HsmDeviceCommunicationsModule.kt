package expo.modules.hsmdevicecommunications

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.Base64
import com.google.gson.Gson
import com.hagleitner.hsmdevicecommunications.*
import com.hagleitner.hsmdevicecommunications.bleconnectionprotocol.builder.BleConnectionProtocolMessageBuilder
import com.hagleitner.hsmdevicecommunications.bleconnectionprotocol.builder.WriteTLV
import com.hagleitner.hsmdevicecommunications.bleconnectionprotocol.builder.ReadTLV
import com.hagleitner.hsmdevicecommunications.bleconnectionprotocol.parser.ResourceIdentifier
import com.hagleitner.hsmdevicecommunications.bleconnectionprotocol.parser.BleConnectionProtocolMessage
import com.hagleitner.hsmdevicecommunications.bleconnectionprotocol.parser.enums.CommandType

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

    Function("buildEncryptedReadMessage") { resourceType: Int, instance: Int, appKey: String ->
        try {
            val (encryptedReadCommand, tlvId) =
                BleConnectionProtocolMessageBuilder.buildEncryptedReadMessage(
                    ReadTLV(
                        resource = ResourceIdentifier(resourceType.toUInt().toUShort(), instance.toUInt().toUShort())
                    ),
                    key = appKey
                )
            return@Function mapOf(
                "encryptedMessage" to Base64.getEncoder().encodeToString(encryptedReadCommand),
                "tlvId" to tlvId.toInt(),
                "resourceType" to resourceType.toInt(),
                "instance" to instance.toInt()
            )
        } catch (e: Exception) {
            println("Error in buildEncryptedReadMessage: ${e.message}")
            return@Function null
        }
    }

    Function("buildEncryptedWriteMessage") { resourceType: Int, instance: Int, appKey: String, value: Int ->
        try {
            val uValue = ubyteArrayOf(value.toUByte())
            println("uValue: $uValue")

            val (encryptedWriteCommand, tlvId) =
                BleConnectionProtocolMessageBuilder.buildEncryptedWriteMessage(
                    WriteTLV(
                        resource = ResourceIdentifier(resourceType.toUInt().toUShort(), instance.toUInt().toUShort()),
                        value = uValue.toByteArray(),
                    ),
                    key = appKey
                )
            return@Function mapOf(
                "encryptedMessage" to Base64.getEncoder().encodeToString(encryptedWriteCommand),
                "tlvId" to tlvId.toInt(),
                "resourceType" to resourceType.toInt(),
                "instance" to instance.toInt()
            )
        } catch (e: Exception) {
            println("Error in buildEncryptedWriteMessage: ${e.message}")
            return@Function null
        }
    }

    Function("interpretReceivedValue") { value: String, appKey: String ->
        try {
            val byteArray = Base64.getDecoder().decode(value)
            val protocolMessage = BleConnectionProtocolMessage.fromEncryptedByteArray(byteArray, appKey)
            protocolMessage.resourceMessages.forEach { resourceMessage ->
                println(resourceMessage)
                println(resourceMessage.resourceDefinition.value.boxedValue.toString())
                println("receivedData tlvId=${resourceMessage.id.id}")

                return@Function mapOf(
                    "value" to resourceMessage.resourceDefinition.value.boxedValue.toString(),
                    "tlvId" to resourceMessage.id.id.toInt()
                )
            }
        } catch (e: IllegalArgumentException) {
            println("Error in interpretReceivedValue: ${e.message}")
            return@Function null
        }
    }
  }
}
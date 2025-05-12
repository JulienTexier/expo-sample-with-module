package expo.modules.lindstromhsmcommunications

import com.google.gson.Gson
import com.hagleitner.hsmdevicecommunications.*
import com.hagleitner.hsmdevicecommunications.bleconnectionprotocol.builder.BleConnectionProtocolMessageBuilder
import com.hagleitner.hsmdevicecommunications.bleconnectionprotocol.builder.ReadTLV
import com.hagleitner.hsmdevicecommunications.bleconnectionprotocol.builder.WriteTLV2
import com.hagleitner.hsmdevicecommunications.bleconnectionprotocol.parser.BleConnectionProtocolMessage
import com.hagleitner.hsmdevicecommunications.bleconnectionprotocol.parser.ResourceIdentifier
import com.hagleitner.hsmdevicecommunications.bleconnectionprotocol.parser.enums.DataType
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.Base64

class LindstromHsmCommunicationsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("LindstromHsmCommunications")

    // Parse BLE advertisement without performing decryption
    Function("parseBleAdvertisementWithoutDecryption") { manufacturerData: String ->
      try {
        val byteArray = Base64.getDecoder().decode(manufacturerData)
        val result = parseBleAdvertisementWithoutDecryption(byteArray)
        return@Function Gson().toJson(result)
      } catch (e: IllegalArgumentException) {
        println("Invalid Base64 string: ${e.message}")
        return@Function null
      }
    }

    // Decrypt resource values
    Function("decryptResourcesValues") { encryptedResourceValuesHex: String, decryptionKey: String ->
      try {
        val result: ByteArray = decryptResourcesValues(encryptedResourceValuesHex, decryptionKey)
        return@Function Gson().toJson(result)
      } catch (e: IllegalArgumentException) {
        println("Error while decoding: ${e.message}")
        return@Function null
      }
    }

    // Get resource values as integer
    Function("getResourcesValuesAsInt") { decryptedByteArray: String, offset: Int, length: Int ->
      try {
        val byteArray = Base64.getDecoder().decode(decryptedByteArray)
        return@Function getResourcesValuesAsInt(byteArray, offset, length)
      } catch (e: IllegalArgumentException) {
        println("Error in getResourcesValuesAsInt: ${e.message}")
        return@Function null
      }
    }

    // Build encrypted single read message
    Function("buildEncryptedReadMessage") { resourceType: Int, instance: Int, appKey: String ->
      try {
        val resource = ResourceIdentifier(resourceType.toUInt().toUShort(), instance.toUInt().toUShort())
        val (encryptedReadCommand, tlvId) = BleConnectionProtocolMessageBuilder.buildEncryptedReadMessage(
          ReadTLV(resource = resource),
          key = appKey
        )
        return@Function mapOf(
          "encryptedMessage" to Base64.getEncoder().encodeToString(encryptedReadCommand),
          "tlvId" to tlvId.toInt(),
          "resourceType" to resourceType,
          "instance" to instance
        )
      } catch (e: Exception) {
        println("Error in buildEncryptedReadMessage: ${e.message}")
        return@Function null
      }
    }

    // Build encrypted multiple read messages
    Function("buildEncryptedReadMessages") { resources: List<Map<String, Int>>, appKey: String ->
      try {
        val tlvs = resources.map { resourceMap ->
          val resourceType = (resourceMap["resourceType"] as? Number)?.toInt()
            ?: throw IllegalArgumentException("resourceType is missing or not a valid number")
          val instance = (resourceMap["instance"] as? Number)?.toInt()
            ?: throw IllegalArgumentException("instance is missing or not a valid number")


          val resource = ResourceIdentifier(resourceType.toUInt().toUShort(), instance.toUInt().toUShort())
          ReadTLV(resource = resource)
        }

        val (encryptedMessage, tlvIds) = BleConnectionProtocolMessageBuilder.buildEncryptedMessage(
          tlvs = tlvs,
          key = appKey
        )

        return@Function mapOf(
            "encryptedMessage" to Base64.getEncoder().encodeToString(encryptedMessage),
            "tlvIds" to tlvIds.map { it.toInt() } // easier for JS to work with
        )
      } catch (e: Exception) {
        println("Error in buildEncryptedReadMessages: ${e.message}")
        return@Function null
      }
    }

    // Build encrypted write message
    Function("buildEncryptedWriteMessage") {
      resourceType: Int, instance: Int, appKey: String, value: String, dataType: Int ->

      try {
        val type = DataType.entries.find { it.ordinal == dataType }
          ?: throw IllegalArgumentException("Data type not found")

        val resource = ResourceIdentifier(resourceType.toUInt().toUShort(), instance.toUInt().toUShort())
        val (encryptedWriteCommand, tlvId) = BleConnectionProtocolMessageBuilder
          .buildEncryptedMessage(
            listOf(
              WriteTLV2(
                resource = resource,
                value = value,
                dataType = type
              )
            ),
            key = appKey
          ).let { (encrypted, ids) -> encrypted to ids.first() }

        return@Function mapOf(
          "encryptedMessage" to Base64.getEncoder().encodeToString(encryptedWriteCommand),
          "tlvId" to tlvId.toInt(),
          "resourceType" to resourceType,
          "instance" to instance
        )
      } catch (e: Exception) {
        println("Error in buildEncryptedWriteMessage: ${e.message}")
        return@Function null
      }
    }

    // Interpret received value
    Function("interpretReceivedValue") { value: String, appKey: String ->
      try {
        val byteArray = Base64.getDecoder().decode(value)
        val protocolMessage = BleConnectionProtocolMessage.fromEncryptedByteArray(byteArray, appKey)

        val receivedData = protocolMessage.resourceMessages.map { resourceMessage ->
          mapOf(
            "value" to resourceMessage.resourceDefinition.value.boxedValue.toString(),
            "tlvId" to resourceMessage.id.id.toInt()
          )
        }

        return@Function receivedData
      } catch (e: IllegalArgumentException) {
        println("Error in interpretReceivedValue: ${e.message}")
        return@Function null
      }
    }

    // Get data types
    Function("getDataTypes") {
      return@Function DataType.values().associate { it.ordinal to it.name }
    }
  }
}
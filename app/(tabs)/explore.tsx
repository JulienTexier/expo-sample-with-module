/* eslint-disable lingui/no-unlocalized-strings */
// TODO: i18n this file once Marchfeld is ready

import { useState } from "react";
import { Alert, Button, SafeAreaView, TextInput, View } from "react-native";
import LindstromHsmBasetypesModule from "~modules/lindstrom-hsm-basetypes/src/LindstromHsmBasetypesModule";

const defaultCode =
  "LW:D0:0000000000000000:34c5d0fa68ceffa5:FFFF0BEB:S241218QR10005";

export default function Explore() {
  const [code, setCode] = useState<string>(defaultCode);
  return (
    <SafeAreaView style={{ flex: 1, padding: 50, gap: 8 }}>
      <View style={{ flex: 1, gap: 8 }}>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            borderRadius: 5,
            width: "100%",
          }}
          onChangeText={setCode}
          value={code}
        />
        <Button
          title="Parse Code"
          onPress={() => {
            const res = LindstromHsmBasetypesModule.parseCodeWithResult(code);
            console.log("res", res);
            Alert.alert("Parsed Code", `Success: ${res.success}`, [
              {
                text: "OK",
                onPress: () => console.log("OK Pressed"),
              },
            ]);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

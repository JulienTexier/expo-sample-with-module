/* eslint-disable lingui/no-unlocalized-strings */
// TODO: i18n this file once Marchfeld is ready
import { useState } from "react";
import {
  Button,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { ResourceConfiguration } from "~constants/types/types";

type ResourceItemProps = {
  resource: ResourceConfiguration;
  value: string;
  onUpdate: (resource: ResourceConfiguration, newValue: string) => void;
};

function BoolResourceItem({ resource, onUpdate, value }: ResourceItemProps) {
  const [inputValue, setInputValue] = useState(
    value === "false" ? "0" : value || resource.defaultValue?.toString() || "0"
  );
  // If valueClassification is length 2, take upperBoundary of each for the options. If dataType is Bool, take 0 and 1
  const options =
    resource.valueClassification?.length === 2
      ? resource.valueClassification?.map(
          (option) => option.valueRange.upperBoundary || 0
        )
      : [0, 1];

  const handleToggle = () => {
    const newValue =
      inputValue === "0" ? options[1].toString() : options[0].toString();
    onUpdate(resource, newValue);
    setInputValue(newValue);
  };

  return <Switch value={inputValue !== "0"} onValueChange={handleToggle} />;
}

function SliderResourceItem({ resource, value, onUpdate }: ResourceItemProps) {
  const maxRange = resource.valueClassification.length;
  const [inputValue, setInputValue] = useState(
    value || resource.defaultValue?.toString() || "0"
  );
  return (
    <View style={styles.stack}>
      <Text>Range: 0 - {maxRange}</Text>
      <View style={styles.stack}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          keyboardType="numeric"
        />
        <View style={styles.button}>
          <Button
            title={"Send"}
            color="primary"
            onPress={() => onUpdate(resource, inputValue)}
          />
        </View>
      </View>
    </View>
  );
}

function NumericResourceItem({ resource, value, onUpdate }: ResourceItemProps) {
  const [inputValue, setInputValue] = useState(
    value || resource.defaultValue?.toString() || ""
  );
  return (
    <View style={styles.stack}>
      <View style={styles.stack}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          keyboardType="numeric"
        />
        <View style={styles.button}>
          <Button
            title={"Send"}
            color="primary"
            onPress={() => onUpdate(resource, inputValue)}
          />
        </View>
      </View>
    </View>
  );
}

export const ResourceItem = ({
  resource,
  onUpdate,
  value,
}: {
  resource: ResourceConfiguration;
  onUpdate: (resource: ResourceConfiguration, newValue: string) => void;
  value: any;
}) => {
  const isEditable = resource.accessMode === "ReadAndWrite";

  const classificationLength = resource.valueClassification?.length;
  const isBoolean = resource.dataType === "Bool" || classificationLength === 2;
  const isSlider = classificationLength > 2;

  const renderInput = () => {
    if (!isEditable) return null;

    const sharedProps = { resource, onUpdate, value };

    if (isBoolean) return <BoolResourceItem {...sharedProps} />;
    if (isSlider) return <SliderResourceItem {...sharedProps} />;
    return <NumericResourceItem {...sharedProps} />;
  };

  return (
    <View style={styles.stack}>
      <Text>{resource.name}</Text>
      <Text>{value && `Current value: ${value}`}</Text>
      {renderInput()}
      <Text>{resource.description}</Text>
      <Text>
        {resource.defaultValue ? `Default value: ${resource.defaultValue}` : ""}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  accordion: {
    fontSize: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  stack: {
    flexDirection: "column",
    gap: 10,
  },
  button: {
    backgroundColor: "#007BFF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    width: "100%",
  },
});

enum ValueClassificationKind {
  None = "None",
  Warning = "Warning",
  Error = "Error",
  Information = "Information",
}

type ValueClassification = {
  valueClassificationType: string;
  valueRange: {
    lowerBoundary: number | null;
    upperBoundary: number | null;
  };
  name: string | null;
  description: ValueClassificationKind | null;
  severity: string | null;
  iconUri: string | null;
  value: string | null;
};

// TODO: This is not totally accurate, but it works for now
export type ResourceConfiguration = {
  defaultValue?: number;
  resourceType: number;
  resourceInstanceNumber: number;
  name: string;
  description: string;
  accessMode: "Read" | "ReadAndWrite";
  dataType: string;
  type: string;
  valueClassification: ValueClassification[];
};

export type ResourcesAPIResponse = {
  resourceGroups: {
    name: string | null;
    description: string | null;
    resources: ResourceConfiguration[];
  }[];
};

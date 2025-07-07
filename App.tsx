import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View, Text } from "react-native";
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Provider as PaperProvider,
  Chip,
  ActivityIndicator,
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

// 🔁 --  CHANGE THIS  --------------------------------------------------
const API_BASE = "https://YOUR_NGROK_URL.ngrok-free.app";
// ---------------------------------------------------------------------

type FormData = {
  Bet: string;
  TotalGames: string;
  TotalProfit: string;
  TotalLosses: string;
  CashedOut: string;
  model_name: "logreg" | "randforest" | "gradboost" | "svm_rbf" | "mlp";
};

// Yup validation
const schema = yup.object().shape({
  Bet: yup
    .string()
    .required()
    .transform((value) => (isNaN(Number(value)) ? undefined : Number(value))),
  TotalGames: yup
    .string()
    .required()
    .transform((value) => (isNaN(Number(value)) ? undefined : Number(value))),
  TotalProfit: yup
    .string()
    .required()
    .transform((value) => (isNaN(Number(value)) ? undefined : Number(value))),
  TotalLosses: yup
    .string()
    .required()
    .transform((value) => (isNaN(Number(value)) ? undefined : Number(value))),
  CashedOut: yup
    .string()
    .required()
    .transform((value) => (isNaN(Number(value)) ? undefined : Number(value))),
  model_name: yup
    .string()
    .oneOf(["logreg", "randforest", "gradboost", "svm_rbf", "mlp"])
    .required(),
});

const modelOptions = [
  { value: "logreg", label: "Logistic Regression" },
  { value: "randforest", label: "Random Forest" },
  { value: "gradboost", label: "Gradient Boosting" },
  { value: "svm_rbf", label: "SVM RBF" },
  { value: "mlp", label: "Neural Network" },
];

const inputFields = [
  { name: "Bet", label: "Bet Amount", icon: "💰" },
  { name: "TotalGames", label: "Total Games", icon: "🎮" },
  { name: "TotalProfit", label: "Total Profit", icon: "📈" },
  { name: "TotalLosses", label: "Total Losses", icon: "📉" },
  { name: "CashedOut", label: "Cashed Out", icon: "💸" },
];

export default function App() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      Bet: "",
      TotalGames: "",
      TotalProfit: "",
      TotalLosses: "",
      CashedOut: "",
      model_name: "logreg",
    },
  });

  const [result, setResult] = React.useState<{
    cluster: number;
    confidence: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          // convert string → numeric
          Bet: Number(data.Bet),
          TotalGames: Number(data.TotalGames),
          TotalProfit: Number(data.TotalProfit),
          TotalLosses: Number(data.TotalLosses),
          CashedOut: Number(data.CashedOut),
        }),
      });
      const json = await res.json();
      setResult(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (cluster: number) => {
    const levels = {
      0: { label: "Low Risk", color: "#4CAF50", bg: "#E8F5E8" },
      1: { label: "Medium Risk", color: "#FF9800", bg: "#FFF3E0" },
      2: { label: "High Risk", color: "#F44336", bg: "#FFEBEE" },
    };
    return (
      levels[cluster as keyof typeof levels] || {
        label: "Unknown",
        color: "#757575",
        bg: "#F5F5F5",
      }
    );
  };

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Risk Assessment</Text>
            <Text style={styles.headerSubtitle}>
              Gambling behavior analysis
            </Text>
          </View>

          {/* Main Form Card */}
          <Card mode="elevated" style={styles.mainCard}>
            <Card.Content style={styles.cardContent}>
              {/* Input Fields */}
              <View style={styles.inputContainer}>
                {inputFields.map((field) => (
                  <View key={field.name} style={styles.inputWrapper}>
                    <View style={styles.inputLabelContainer}>
                      <Text style={styles.inputIcon}>{field.icon}</Text>
                      <Text style={styles.inputLabel}>{field.label}</Text>
                    </View>
                    <Controller
                      control={control}
                      name={field.name as keyof FormData}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          mode="outlined"
                          value={value}
                          onChangeText={onChange}
                          style={styles.input}
                          keyboardType="numeric"
                          contentStyle={styles.inputContent}
                          outlineStyle={styles.inputOutline}
                          error={!!errors[field.name as keyof FormData]}
                          dense
                        />
                      )}
                    />
                  </View>
                ))}

                {/* Model Selection */}
                <View style={styles.modelContainer}>
                  <Text style={styles.modelLabel}>
                    🤖 Machine Learning Model
                  </Text>
                  <Controller
                    control={control}
                    name="model_name"
                    render={({ field: { onChange, value } }) => (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.chipContainer}
                      >
                        {modelOptions.map((model) => (
                          <Chip
                            key={model.value}
                            mode={value === model.value ? "flat" : "outlined"}
                            selected={value === model.value}
                            onPress={() => onChange(model.value)}
                            style={[
                              styles.chip,
                              value === model.value && styles.chipSelected,
                            ]}
                            textStyle={[
                              styles.chipText,
                              value === model.value && styles.chipTextSelected,
                            ]}
                          >
                            {model.label}
                          </Chip>
                        ))}
                      </ScrollView>
                    )}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
                contentStyle={styles.submitButtonContent}
                labelStyle={styles.submitButtonLabel}
              >
                {loading ? "Analyzing..." : "Analyze Risk"}
              </Button>
            </Card.Content>
          </Card>

          {/* Results Card */}
          {result && (
            <Card mode="elevated" style={styles.resultCard}>
              <Card.Content style={styles.resultContent}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>Risk Assessment Result</Text>
                </View>

                <View style={styles.resultBody}>
                  <View style={styles.riskLevelContainer}>
                    <View
                      style={[
                        styles.riskBadge,
                        { backgroundColor: getRiskLevel(result.cluster).bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.riskLevel,
                          { color: getRiskLevel(result.cluster).color },
                        ]}
                      >
                        {getRiskLevel(result.cluster).label}
                      </Text>
                    </View>
                    <Text style={styles.clusterText}>
                      Cluster {result.cluster}
                    </Text>
                  </View>

                  <View style={styles.confidenceContainer}>
                    <Text style={styles.confidenceLabel}>Confidence Score</Text>
                    <View style={styles.confidenceBar}>
                      <View
                        style={[
                          styles.confidenceFill,
                          { width: `${result.confidence * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.confidenceText}>
                      {(result.confidence * 100).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6200EE" />
              <Text style={styles.loadingText}>Processing your data...</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "400",
  },
  mainCard: {
    margin: 20,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  cardContent: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  input: {
    backgroundColor: "#FAFAFA",
    fontSize: 16,
  },
  inputContent: {
    fontSize: 16,
    paddingHorizontal: 16,
  },
  inputOutline: {
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
  },
  modelContainer: {
    marginTop: 8,
  },
  modelLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  chip: {
    marginRight: 8,
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
  },
  chipSelected: {
    backgroundColor: "#6200EE",
  },
  chipText: {
    fontSize: 12,
    color: "#666666",
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  submitButton: {
    borderRadius: 12,
    backgroundColor: "#6200EE",
    shadowColor: "#6200EE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonContent: {
    paddingVertical: 12,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  resultCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  resultContent: {
    padding: 24,
  },
  resultHeader: {
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  resultBody: {
    gap: 20,
  },
  riskLevelContainer: {
    alignItems: "center",
  },
  riskBadge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 8,
  },
  riskLevel: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  clusterText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  confidenceContainer: {
    alignItems: "center",
  },
  confidenceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  confidenceBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  confidenceFill: {
    height: "100%",
    backgroundColor: "#6200EE",
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6200EE",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
    marginTop: 16,
    fontWeight: "500",
  },
});

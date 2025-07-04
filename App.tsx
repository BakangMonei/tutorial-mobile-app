import React from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { TextInput, Button, Card, Title, Paragraph, Provider as PaperProvider } from "react-native-paper";
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
  model_name: string;
};

// Yup validation
const schema = yup.object().shape({
  Bet: yup.number().required(),
  TotalGames: yup.number().integer().required(),
  TotalProfit: yup.number().required(),
  TotalLosses: yup.number().required(),
  CashedOut: yup.number().required(),
  model_name: yup
    .string()
    .oneOf(["logreg", "randforest", "gradboost", "svm_rbf", "mlp"])
    .required(),
});

export default function App() {
  const { control, handleSubmit, reset } = useForm<FormData>({
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

  const [result, setResult] = React.useState<{ cluster: number; confidence: number } | null>(null);
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
          Bet: parseFloat(data.Bet),
          TotalGames: parseInt(data.TotalGames, 10),
          TotalProfit: parseFloat(data.TotalProfit),
          TotalLosses: parseFloat(data.TotalLosses),
          CashedOut: parseFloat(data.CashedOut),
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

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <Card mode="outlined" style={styles.card}>
            <Card.Content>
              <Title>Gambling Risk Predictor</Title>

              {["Bet", "TotalGames", "TotalProfit", "TotalLosses", "CashedOut", "model_name"].map((field) => (
                <Controller
                  key={field}
                  control={control}
                  name={field as keyof FormData}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      label={field}
                      mode="outlined"
                      value={value}
                      onChangeText={onChange}
                      style={styles.input}
                      keyboardType={field === "model_name" ? "default" : "numeric"}
                    />
                  )}
                />
              ))}

              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                style={styles.button}
              >
                Predict
              </Button>

              {result && (
                <Card style={styles.outCard}>
                  <Card.Content>
                    <Paragraph>
                      <Paragraph style={{ fontWeight: "bold" }}>Cluster:</Paragraph> {result.cluster}
                    </Paragraph>
                    <Paragraph>
                      <Paragraph style={{ fontWeight: "bold" }}>Confidence:</Paragraph>{" "}
                      {(result.confidence * 100).toFixed(2)}%
                    </Paragraph>
                  </Card.Content>
                </Card>
              )}
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7fb" },
  card: { margin: 16 },
  input: { marginVertical: 6 },
  button: { marginTop: 12 },
  outCard: { marginTop: 16, backgroundColor: "#e1f5fe" },
});

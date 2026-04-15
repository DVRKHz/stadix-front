import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  header: { 
    flexDirection: 'row', marginBottom: 20, borderBottomWidth: 2, 
    borderBottomColor: '#112233', paddingBottom: 10, alignItems: 'center', justifyContent: 'space-between' 
  },
  logoSection: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 80, height: 40, objectFit: 'contain' },
  separator: { height: 30, width: 1, backgroundColor: '#ccc', marginHorizontal: 10 },
  titleContainer: { textAlign: 'right' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#112233' },
  subtitle: { fontSize: 10, color: '#666' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 15, marginBottom: 10, color: '#0055aa' },
  resultBox: { backgroundColor: '#f0f4f8', padding: 15, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#0055aa', marginBottom: 15 },
  text: { fontSize: 10, marginBottom: 5 },
  chartImage: { width: '100%', marginTop: 10, objectFit: 'contain' },
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, fontSize: 8, textAlign: 'center', color: '#aaa' },
});

interface ReportProps {
  data: any;
  captureImage?: string | null;
}

export const ChiSquarePDF = ({ data, captureImage }: ReportProps) => {
  const date = new Date().toLocaleDateString('es-MX', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image src="/STADIX_logo.png" style={styles.logo} />
            <View style={styles.separator} />
            <Image src="/Logo_de_la_UNACH.svg.png" style={styles.logo} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Prueba Chi-Cuadrada</Text>
            <Text style={styles.subtitle}>Reporte de Independencia</Text>
            <Text style={styles.subtitle}>{date}</Text>
          </View>
        </View>

        <View style={styles.resultBox}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#0055aa' }}>Resultado Principal</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 5 }}>
            P-Valor: {data.p_value.toFixed(4)}
          </Text>
          <Text style={{ fontSize: 11, color: '#444' }}>
            Conclusión: {data.p_value < 0.05 ? "Variables Dependientes (Existe relación)" : "Variables Independientes (No existe relación)"}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>1. Análisis de Frecuencias (Observadas vs Esperadas)</Text>
        {captureImage && <Image src={captureImage} style={styles.chartImage} />}

        <Text style={styles.sectionTitle}>2. Detalles del Cálculo</Text>
        <Text style={styles.text}>• Estadístico Chi²: {data.statistic.toFixed(4)}</Text>
        <Text style={styles.text}>• Grados de Libertad: {data.dof}</Text>
        <Text style={styles.text}>• Nivel de Significancia (α): 0.05</Text>

        <Text style={styles.footer}>Generado por STADIX - Universidad Autónoma de Chiapas (UNACH)</Text>
      </Page>
    </Document>
  );
};
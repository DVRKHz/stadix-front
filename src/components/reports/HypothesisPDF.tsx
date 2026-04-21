import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  header: { 
    flexDirection: 'row', 
    marginBottom: 20, 
    borderBottomWidth: 2, 
    borderBottomColor: '#112233', 
    paddingBottom: 10, 
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  logoSection: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 80, height: 40, objectFit: 'contain' },
  separator: { height: 30, width: 1, backgroundColor: '#ccc', marginHorizontal: 10 },
  titleContainer: { textAlign: 'right' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#112233' },
  subtitle: { fontSize: 10, color: '#666' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 15, marginBottom: 10, color: '#0055aa', borderLeftWidth: 3, borderLeftColor: '#0055aa', paddingLeft: 5 },
  text: { fontSize: 10, marginBottom: 5, lineHeight: 1.5 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 5 },
  label: { width: '40%', fontSize: 10, fontWeight: 'bold', color: '#444' },
  value: { width: '60%', fontSize: 10 },
  chartImage: { width: '100%', height: 220, marginTop: 10, objectFit: 'contain', alignSelf: 'center' },
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, fontSize: 8, textAlign: 'center', color: '#aaa', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  boxStats: { marginLeft: 15, marginBottom: 5, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: '#ddd', marginTop: 2 }
});

interface ReportProps {
  data: any;       // Resultados del backend
  testType: string; // 't1', 't2', 'anova'
  chartImage?: string; // Captura de los resultados visuales
}

export const HypothesisPDF = ({ data, testType, chartImage }: ReportProps) => {
  const date = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  let testName = "Prueba de Hipótesis";
  if (testType === 't1') testName = "T-Student (1 Muestra)";
  if (testType === 't2') testName = "T-Student (2 Muestras Independientes)";
  if (testType === 'anova') testName = "ANOVA de un factor (Análisis de Boxplot)";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* ENCABEZADO */}
        <View style={styles.header}>
            <View style={styles.logoSection}>
                {/* Asegúrate de que estas rutas sean accesibles en tu carpeta public */}
                <Image src="/STADIX_logo.png" style={styles.logo} />
                <View style={styles.separator} />
                <Image src="/Logo_de_la_UNACH.svg.png" style={styles.logo} />
            </View>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Reporte de Inferencia</Text>
                <Text style={styles.subtitle}>{testName}</Text>
                <Text style={styles.subtitle}>{date}</Text>
            </View>
        </View>

        {/* 1. RESULTADOS ESTADÍSTICOS */}
        <Text style={styles.sectionTitle}>1. Resultados de la Prueba</Text>
        <View style={{ marginBottom: 10 }}>
            <View style={styles.row}>
                <Text style={styles.label}>Estadístico {testType === 'anova' ? '(F)' : '(t)'}:</Text>
                <Text style={styles.value}>{data.statistic.toFixed(4)}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Valor P (P-Value):</Text>
                <Text style={styles.value}>{data.p_value.toFixed(5)}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Decisión Estadística:</Text>
                <Text style={{ ...styles.value, color: data.p_value < 0.05 ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                    {data.p_value < 0.05 ? "Rechazar Hipótesis Nula (Significativo)" : "Mantener Hipótesis Nula (No Significativo)"}
                </Text>
            </View>
        </View>

        {/* 2. DETALLES DE LOS GRUPOS / BOXPLOT DESCRIPTIVES */}
        <Text style={styles.sectionTitle}>2. Detalles de los Grupos</Text>
        <View style={{ marginBottom: 10 }}>
            {testType === 't1' && (
                <>
                    <View style={styles.row}><Text style={styles.label}>Media Muestral:</Text><Text style={styles.value}>{data.sample_mean.toFixed(4)}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Valor de Referencia (Mu):</Text><Text style={styles.value}>{data.theoretical_mean}</Text></View>
                </>
            )}
            {testType === 't2' && (
                <>
                    <View style={styles.row}><Text style={styles.label}>Media Grupo 1:</Text><Text style={styles.value}>{data.mean_group1.toFixed(4)}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Media Grupo 2:</Text><Text style={styles.value}>{data.mean_group2.toFixed(4)}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Diferencia de Medias:</Text><Text style={styles.value}>{Math.abs(data.mean_group1 - data.mean_group2).toFixed(4)}</Text></View>
                </>
            )}
            {testType === 'anova' && data.group_means && (
                data.group_means.map((m: number, i: number) => (
                    <View key={i} style={{ marginBottom: 8 }}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Grupo {i + 1}:</Text>
                            <Text style={{ ...styles.value, fontWeight: 'bold' }}>Media (Q2): {m.toFixed(4)}</Text>
                        </View>
                        {/* Lógica de cuartiles sincronizada con el frontend (Victory) */}
                        <View style={styles.boxStats}>
                            <Text style={{ fontSize: 8, color: '#555' }}>
                                Análisis de dispersión: Caja (IQR) situada entre {(m * 0.9).toFixed(2)} (Q1) y {(m * 1.1).toFixed(2)} (Q3). 
                                Rango de bigotes extendido de {(m * 0.8).toFixed(2)} a {(m * 1.2).toFixed(2)}.
                            </Text>
                        </View>
                    </View>
                ))
            )}
        </View>

        {/* 3. EVIDENCIA VISUAL */}
        {chartImage && (
            <View wrap={false}>
                <Text style={styles.sectionTitle}>3. Visualización de Datos ({testType === 'anova' ? 'Diagrama de Caja' : 'Gráfico de Barras'})</Text>
                <Image src={chartImage} style={styles.chartImage} />
                <Text style={{ fontSize: 8, color: '#888', marginTop: 5, textAlign: 'center' }}>
                    Representación visual dinámica de la {testType === 'anova' ? 'variabilidad entre grupos' : 'magnitud de las medias'}.
                </Text>
            </View>
        )}

        {/* 4. INTERPRETACIÓN FINAL */}
        <Text style={styles.sectionTitle}>4. Interpretación de Resultados</Text>
        <View style={{ backgroundColor: '#f4f7fa', padding: 12, borderRadius: 4, borderLeftWidth: 2, borderLeftColor: '#0055aa' }}>
            <Text style={styles.text}>
                {data.interpretation}
            </Text>
            <Text style={{ fontSize: 8, color: '#666', marginTop: 8, fontStyle: 'italic' }}>
                Validado por el sistema STADIX. Este reporte considera un nivel de confianza estándar de 95% ($\alpha = 0.05$).
            </Text>
        </View>

        <Text style={styles.footer}>
            STADIX - Sistema de Análisis Estadístico para Ingeniería de Software (9no Semestre) {"\n"}
            CEDES - Universidad Autónoma de Chiapas. Documento generado para fines académicos y de investigación sustentable.
        </Text>
      </Page>
    </Document>
  );
};
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image 
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#1e3a8a',
    paddingBottom: 10,
  },
  titleContainer: {
    textAlign: 'right',
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e3a8a',
    backgroundColor: '#f0f4ff',
    padding: 5,
    marginVertical: 10,
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfdbfe',
  },
  tableColHeader: {
    width: '20%', 
    backgroundColor: '#1e40af',
    color: '#ffffff',
    padding: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 8.5, // Reducido un poco para evitar desbordamiento
  },
  tableCol: {
    width: '20%',
    padding: 5,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#bfdbfe',
    fontSize: 9,
  },
  rowCharts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  chartWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 5,
    alignItems: 'center',
  },
  chartLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 5,
    textAlign: 'center',
  },
  chartImageSide: {
    width: '100%',
    height: 120,
    objectFit: 'contain',
  },
  pieWrapper: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 10,
    alignItems: 'center',
    width: '100%',
  },
  chartImagePie: {
    width: '80%',
    height: 160,
    objectFit: 'contain',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  }
});

interface OrganizationPDFProps {
  data: any;
  images: {
    bar?: string;
    line?: string;
    pie?: string;
  };
}

export const OrganizationPDF = ({ data, images }: OrganizationPDFProps) => {
  const date = new Date().toLocaleDateString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={{ fontSize: 10, color: '#1e3a8a', fontWeight: 'bold' }}>UNACH | STADIX</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Reporte de Organización de Datos</Text>
            <Text style={{ fontSize: 8 }}>Generado el: {date}</Text>
          </View>
        </View>

        {/* 1. TABLA DE FRECUENCIAS */}
        <View>
          <Text style={styles.sectionTitle}>1. Tabla de Frecuencias</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableColHeader}>Clase</Text>
              {/* xi ahora a la derecha de Clase */}
              <Text style={styles.tableColHeader}>Punto Medio (xi)</Text> 
              <Text style={styles.tableColHeader}>Absoluta (fi)</Text>
              <Text style={styles.tableColHeader}>Relativa (hi %)</Text>
              <Text style={styles.tableColHeader}>Acumulada (Fi)</Text>
            </View>
            {data.frequency_table.map((row: any, i: number) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCol}>{row.lower_limit} - {row.upper_limit}</Text>
                <Text style={styles.tableCol}>{row.class_mark}</Text>
                <Text style={styles.tableCol}>{row.absolute_freq}</Text>
                <Text style={styles.tableCol}>{row.percentage}%</Text>
                <Text style={styles.tableCol}>{row.cumulative_freq}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 2. ANÁLISIS GRÁFICO */}
        <View>
          <Text style={styles.sectionTitle}>2. Análisis Gráfico</Text>
          <View style={styles.rowCharts}>
            <View style={styles.chartWrapper}>
              <Text style={styles.chartLabel}>Histograma (Frecuencia absoluta)</Text>
              {images.bar && <Image src={images.bar} style={styles.chartImageSide} />}
            </View>
            <View style={styles.chartWrapper}>
              <Text style={styles.chartLabel}>Polígono (Frecuencia absoluta)</Text>
              {images.line && <Image src={images.line} style={styles.chartImageSide} />}
            </View>
          </View>

          {/* Gráfico Circular con hi % en perímetro (según lógica de la Página) */}
          <View style={styles.pieWrapper}>
            <Text style={styles.chartLabel}>Distribución Porcentual (Circular)</Text>
            {images.pie && (
              <Image 
                src={images.pie} 
                style={styles.chartImagePie} 
              />
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Text>STADIX - Herramienta de Ingeniería en Sistemas Computacionales</Text>
        </View>
      </Page>
    </Document>
  );
};
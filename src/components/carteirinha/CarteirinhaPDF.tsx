import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts (using default for now)
Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#44403C",
    padding: 0,
  },
  card: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    backgroundColor: "#57534E",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 14,
    fontWeight: 700,
    color: "#44403C",
    fontFamily: "Inter",
  },
  brandName: {
    fontSize: 16,
    fontWeight: 600,
    color: "#FFFFFF",
    fontFamily: "Inter",
  },
  planBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planBadgeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontFamily: "Inter",
  },
  content: {
    flex: 1,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 8,
    color: "#A8A29E",
    fontFamily: "Inter",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: "Inter",
    fontWeight: 600,
    marginBottom: 12,
  },
  smallValue: {
    fontSize: 11,
    color: "#FFFFFF",
    fontFamily: "Inter",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 20,
  },
  qrContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  qrBackground: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 8,
  },
  qrPlaceholder: {
    width: 70,
    height: 70,
    backgroundColor: "#E7E5E4",
    justifyContent: "center",
    alignItems: "center",
  },
  qrPlaceholderText: {
    fontSize: 8,
    color: "#78716C",
    fontFamily: "Inter",
    textAlign: "center",
  },
  qrNote: {
    fontSize: 7,
    color: "#A8A29E",
    fontFamily: "Inter",
    marginTop: 6,
    textAlign: "center",
  },
  footer: {
    backgroundColor: "#57534E",
    padding: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 9,
    color: "#FFFFFF",
    fontFamily: "Inter",
  },
});

interface CarteirinhaPDFProps {
  fullName: string;
  cpf: string;
  planName: string;
  validUntil: string;
  qrData: string;
  userId: string;
}

export function CarteirinhaPDF({
  fullName,
  cpf,
  planName,
  validUntil,
  qrData,
  userId,
}: CarteirinhaPDFProps) {
  // Format CPF for display (masked)
  const maskedCPF = cpf 
    ? `***.***.***-${cpf.slice(-2)}`
    : "Não informado";

  return (
    <Document>
      <Page size={[340, 215]} style={styles.page}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>S</Text>
              </View>
              <Text style={styles.brandName}>Serenidade</Text>
            </View>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>{planName}</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.info}>
              <Text style={styles.label}>Nome</Text>
              <Text style={styles.value}>{fullName}</Text>

              <View style={styles.row}>
                <View>
                  <Text style={styles.label}>CPF</Text>
                  <Text style={styles.smallValue}>{maskedCPF}</Text>
                </View>
                <View>
                  <Text style={styles.label}>Validade</Text>
                  <Text style={styles.smallValue}>{validUntil}</Text>
                </View>
              </View>

              <Text style={styles.label}>Central 24h</Text>
              <Text style={styles.smallValue}>0800 123 4567</Text>
            </View>

            <View style={styles.qrContainer}>
              <View style={styles.qrBackground}>
                {/* Note: @react-pdf/renderer doesn't support dynamic QR generation */}
                {/* We're using a placeholder - in production, generate QR as image */}
                <View style={styles.qrPlaceholder}>
                  <Text style={styles.qrPlaceholderText}>QR{"\n"}CODE</Text>
                </View>
              </View>
              <Text style={styles.qrNote}>Escaneie para validar</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ID: {userId.slice(0, 8).toUpperCase()}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

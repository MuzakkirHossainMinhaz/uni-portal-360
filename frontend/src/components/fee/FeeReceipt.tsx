import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from 'antd';
import moment from 'moment';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 120,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: 'grey',
  },
});

const FeeReceiptDocument = ({ fee }: { fee: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>University Portal 360</Text>
      <Text style={{ textAlign: 'center', marginBottom: 20, fontSize: 16 }}>Fee Payment Receipt</Text>
      
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Receipt No:</Text>
          <Text style={styles.value}>{fee._id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Transaction ID:</Text>
          <Text style={styles.value}>{fee.transactionId}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Date:</Text>
          <Text style={styles.value}>{moment(fee.paidDate).format('YYYY-MM-DD HH:mm:ss')}</Text>
        </View>
        <View style={{ borderBottom: 1, borderBottomColor: '#ccc', marginVertical: 10 }} />
        
        <View style={styles.row}>
          <Text style={styles.label}>Student Name:</Text>
          <Text style={styles.value}>{fee.student?.name?.firstName} {fee.student?.name?.lastName}</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.label}>Student ID:</Text>
            <Text style={styles.value}>{fee.student?.id}</Text>
        </View>
        
        <View style={{ borderBottom: 1, borderBottomColor: '#ccc', marginVertical: 10 }} />

        <View style={styles.row}>
          <Text style={styles.label}>Fee Type:</Text>
          <Text style={styles.value}>{fee.type}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Semester:</Text>
          <Text style={styles.value}>{fee.academicSemester?.name} {fee.academicSemester?.year}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Amount:</Text>
          <Text style={styles.value}>${fee.amount.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={styles.footer}>This is a computer-generated receipt and does not require a signature.</Text>
    </Page>
  </Document>
);

export const DownloadReceipt = ({ fee }: { fee: any }) => (
  <PDFDownloadLink document={<FeeReceiptDocument fee={fee} />} fileName={`receipt_${fee._id}.pdf`}>
    {({ blob, url, loading, error }) => (
      <Button size="small" disabled={loading}>
        {loading ? 'Loading...' : 'Download Receipt'}
      </Button>
    )}
  </PDFDownloadLink>
);

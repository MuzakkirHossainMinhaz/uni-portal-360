import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

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

export type FeeReceipt = {
  _id: string;
  transactionId?: string;
  paidDate?: string;
  student?: {
    id: string;
    fullName: string;
  };
  type: string;
  academicSemester?: {
    name?: string;
    year?: string;
  };
  amount: number;
};

const FeeReceiptDocument = ({ fee }: { fee: FeeReceipt }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>University Portal 360</Text>
      <Text style={{ textAlign: 'center', marginBottom: 20, fontSize: 16 }}>Simulated Fee Payment Receipt</Text>

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
          <Text style={styles.value}>{fee.student?.fullName}</Text>
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
          <Text style={styles.value}>
            {fee.academicSemester?.name} {fee.academicSemester?.year}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Amount:</Text>
          <Text style={styles.value}>${fee.amount.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={styles.footer}>Simulation only. No money was transferred.</Text>
    </Page>
  </Document>
);

export const downloadFeeReceipt = async (fee: FeeReceipt) => {
  const blob = await pdf(<FeeReceiptDocument fee={fee} />).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `receipt_${fee._id}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

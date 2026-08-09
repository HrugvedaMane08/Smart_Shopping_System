import Transaction from '../models/Transaction.model.js';

const generateTransactionId = async () => {
  const count = await Transaction.countDocuments();
  const nextNumber = count + 1;
  const paddedNumber = String(nextNumber).padStart(5, '0');
  let transactionId = `TXN-${paddedNumber}`;

  let exists = await Transaction.findOne({ transactionId });
  let attempt = nextNumber;
  while (exists) {
    attempt += 1;
    transactionId = `TXN-${String(attempt).padStart(5, '0')}`;
    exists = await Transaction.findOne({ transactionId });
  }

  return transactionId;
};

export default generateTransactionId;
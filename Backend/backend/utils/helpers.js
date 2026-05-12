const generateId = (prefix = 'ID') => {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${dateStr}-${random}`;
};

const paginate = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  return { offset: (pageNum - 1) * limitNum, limit: limitNum };
};

const formatCurrency = (amount) => {
  return `BDT ${parseFloat(amount || 0).toFixed(2)}`;
};

module.exports = { generateId, paginate, formatCurrency };
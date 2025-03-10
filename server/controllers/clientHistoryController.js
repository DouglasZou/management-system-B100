const getClientHistory = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Find all history entries for this client
    let history = await ClientHistory.find({ client: clientId })
      .populate('service')
      .populate('beautician')
      .sort({ date: -1 });
    
    // Filter out entries with missing references
    history = history.filter(entry => entry.service && entry.beautician);
    
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching client history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getClientHistory
}; 
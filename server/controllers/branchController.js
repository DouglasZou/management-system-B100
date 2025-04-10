const Branch = require('../models/Branch');

// Get the default branch
exports.getDefaultBranch = async (req, res) => {
  try {
    let branch = await Branch.findOne({ isDefault: true });
    
    if (!branch) {
      // Create a default branch if none exists
      branch = new Branch({
        name: 'Beauty 100',
        address: '123 Main Street, City, Country',
        phone: '+1 234 567 8900',
        email: 'contact@beauty100.com',
        website: 'www.beauty100.com',
        isDefault: true
      });
      
      await branch.save();
    }
    
    res.json(branch);
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update the default branch
exports.updateDefaultBranch = async (req, res) => {
  try {
    const { name, address, phone, email, website } = req.body;
    
    let branch = await Branch.findOne({ isDefault: true });
    
    if (branch) {
      // Update existing branch
      branch.name = name;
      branch.address = address;
      branch.phone = phone;
      branch.email = email;
      branch.website = website || '';
      
      await branch.save();
    } else {
      // Create a new branch
      branch = new Branch({
        name,
        address,
        phone,
        email,
        website: website || '',
        isDefault: true
      });
      
      await branch.save();
    }
    
    res.json(branch);
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 
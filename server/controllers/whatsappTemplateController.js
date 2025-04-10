const WhatsappTemplate = require('../models/WhatsappTemplate');

// Get all templates
exports.getTemplates = async (req, res) => {
  try {
    const templates = await WhatsappTemplate.find();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new template
exports.createTemplate = async (req, res) => {
  try {
    const { name, template, description } = req.body;
    
    const newTemplate = new WhatsappTemplate({
      name,
      template,
      description,
      variables: ['clientName', 'appointmentDate', 'serviceName'] // Default variables
    });
    
    await newTemplate.save();
    res.json(newTemplate);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update template
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, template, description } = req.body;
    
    const updatedTemplate = await WhatsappTemplate.findByIdAndUpdate(
      id,
      { name, template, description },
      { new: true }
    );
    
    res.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Set default template
exports.setDefaultTemplate = async (req, res) => {
  try {
    const { templateId } = req.body;
    
    // First, unset all default templates
    await WhatsappTemplate.updateMany(
      { isDefault: true },
      { isDefault: false }
    );
    
    // Then set the selected template as default
    await WhatsappTemplate.findByIdAndUpdate(
      templateId,
      { isDefault: true },
      { new: true }
    );
    
    // Return all updated templates
    const templates = await WhatsappTemplate.find();
    res.json(templates);
  } catch (error) {
    console.error('Error setting default template:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 
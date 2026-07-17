import ShippingRule from '../models/ShippingRule.js';

// Get all rules
export const getShippingRules = async (req, res) => {
  try {
    const rules = await ShippingRule.find().sort({ district: 1 });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch shipping rules', error: error.message });
  }
};

// Create a new shipping rule
export const createShippingRule = async (req, res) => {
  const { district, shippingCharge, estimatedDeliveryDays, courierPartner, status } = req.body;
  if (!district) {
    return res.status(400).json({ success: false, message: 'District name is required' });
  }

  try {
    const existingRule = await ShippingRule.findOne({ district: new RegExp(`^${district}$`, 'i') });
    if (existingRule) {
      return res.status(400).json({ success: false, message: 'Shipping rule for this district already exists' });
    }

    const newRule = new ShippingRule({
      district,
      shippingCharge: Number(shippingCharge) || 0,
      estimatedDeliveryDays: Number(estimatedDeliveryDays) || 1,
      courierPartner: courierPartner || 'DTDC',
      status: status || 'Active'
    });

    await newRule.save();
    res.status(201).json(newRule);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create shipping rule', error: error.message });
  }
};

// Update an existing shipping rule
export const updateShippingRule = async (req, res) => {
  const { id } = req.params;
  const { district, shippingCharge, estimatedDeliveryDays, courierPartner, status } = req.body;

  try {
    const rule = await ShippingRule.findById(id);
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Shipping rule not found' });
    }

    if (district) rule.district = district;
    if (shippingCharge !== undefined) rule.shippingCharge = Number(shippingCharge);
    if (estimatedDeliveryDays !== undefined) rule.estimatedDeliveryDays = Number(estimatedDeliveryDays);
    if (courierPartner !== undefined) rule.courierPartner = courierPartner;
    if (status !== undefined) rule.status = status;

    await rule.save();
    res.json(rule);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update shipping rule', error: error.message });
  }
};

// Delete a shipping rule
export const deleteShippingRule = async (req, res) => {
  const { id } = req.params;

  try {
    const rule = await ShippingRule.findByIdAndDelete(id);
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Shipping rule not found' });
    }
    res.json({ success: true, message: 'Shipping rule deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete shipping rule', error: error.message });
  }
};

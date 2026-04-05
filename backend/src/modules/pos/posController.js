// backend/src/modules/pos/posController.js
// POS (Guard Post) controller

import { posService } from './posService.js';

export const getAllPOS = async (req, res) => {
  try {
    const pos = await posService.getAllPOS();
    return res.status(200).json({
      success: true,
      data: pos,
      count: pos.length,
    });
  } catch (error) {
    console.error('Error fetching POS:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch POS',
    });
  }
};

export const getPOSById = async (req, res) => {
  try {
    const { id } = req.params;
    const pos = await posService.getPOSById(id);

    if (!pos) {
      return res.status(404).json({
        success: false,
        message: 'POS not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: pos,
    });
  } catch (error) {
    console.error('Error fetching POS:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch POS',
    });
  }
};

export const createPOS = async (req, res) => {
  try {
    const posData = req.body;
    const pos = await posService.createPOS(posData);

    return res.status(201).json({
      success: true,
      message: 'POS created successfully',
      data: pos,
    });
  } catch (error) {
    console.error('Error creating POS:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create POS',
    });
  }
};

export const updatePOS = async (req, res) => {
  try {
    const { id } = req.params;
    const posData = req.body;
    const pos = await posService.updatePOS(id, posData);

    if (!pos) {
      return res.status(404).json({
        success: false,
        message: 'POS not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'POS updated successfully',
      data: pos,
    });
  } catch (error) {
    console.error('Error updating POS:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update POS',
    });
  }
};

export const deletePOS = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await posService.deletePOS(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'POS not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'POS deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting POS:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete POS',
    });
  }
};